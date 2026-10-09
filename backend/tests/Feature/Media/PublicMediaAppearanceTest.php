<?php

namespace Tests\Feature\Media;

use App\Models\Media;
use App\Models\MediaAppearance;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicMediaAppearanceTest extends TestCase
{
    use DatabaseTransactions;

    protected MediaAppearance $publishedApp;
    protected MediaAppearance $draftApp;
    protected MediaAppearance $privateApp;
    protected Media $dummyPdf;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $admin = User::factory()->create(['name' => 'Admin User', 'email' => 'admin_public_app@nijamuddin.com']);
        $admin->assignRole('super_admin');

        Storage::fake('public');
        $file = UploadedFile::fake()->create('appearance-notes.pdf', 180, 'application/pdf');
        $storedPath = $file->store('documents/media', 'public');

        $this->dummyPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/media',
            'filename' => basename($storedPath),
            'original_name' => 'appearance-notes.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 184320,
            'uploaded_by' => $admin->id,
        ]);

        $this->publishedApp = MediaAppearance::create([
            'title' => ['en' => 'TEST — Live Studio Discussion on Constitution', 'bn' => 'টেস্ট — সংবিধান নিয়ে সরাসরি স্টুডিও আলোচনা'],
            'slug' => 'test-live-studio-discussion-constitution',
            'broadcast_type' => 'tv',
            'channel' => 'News24',
            'program_name' => ['en' => 'Point Counterpoint', 'bn' => 'যুক্তিতর্ক'],
            'appearance_date' => '2025-07-22',
            'description' => ['en' => 'Analysis of fundamental rights adjudication.', 'bn' => 'মৌলিক অধিকার প্রয়োগ সংক্রান্ত বিশ্লেষণ।'],
            'video_url' => 'https://www.youtube.com/watch?v=1234567890',
            'document_media_id' => $this->dummyPdf->id,
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        $this->draftApp = MediaAppearance::create([
            'title' => ['en' => 'TEST — Unapproved Draft TV Episode', 'bn' => 'টেস্ট — অনুমোদনহীন খসড়া টিভি পর্ব'],
            'slug' => 'test-unapproved-draft-tv-episode',
            'broadcast_type' => 'tv',
            'channel' => 'Somoy TV',
            'program_name' => ['en' => 'Draft Program', 'bn' => 'খসড়া অনুষ্ঠান'],
            'status' => 'draft',
            'visibility' => 'public',
            'sort_order' => 2,
        ]);

        $this->privateApp = MediaAppearance::create([
            'title' => ['en' => 'TEST — Private Radio Appearance', 'bn' => 'টেস্ট — গোপন রেডিও উপস্থিতি'],
            'slug' => 'test-private-radio-appearance',
            'broadcast_type' => 'radio',
            'channel' => 'Radio Shadhin',
            'program_name' => ['en' => 'Radio Debate', 'bn' => 'রেডিও বিতর্ক'],
            'status' => 'published',
            'visibility' => 'private',
            'sort_order' => 3,
        ]);
    }

    public function test_public_can_list_only_published_and_public_appearances(): void
    {
        $res = $this->getJson('/api/v1/media/appearances');
        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        $slugs = collect($res->json('data'))->pluck('slug')->toArray();

        $this->assertContains('test-live-studio-discussion-constitution', $slugs);
        $this->assertNotContains('test-unapproved-draft-tv-episode', $slugs);
        $this->assertNotContains('test-private-radio-appearance', $slugs);
    }

    public function test_public_search_and_filters_work(): void
    {
        $res = $this->getJson('/api/v1/media/appearances?search=fundamental+rights');
        $res->assertStatus(200);
        $data = $res->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('test-live-studio-discussion-constitution', $data[0]['slug']);

        $resChannel = $this->getJson('/api/v1/media/appearances?channel=News24');
        $resChannel->assertStatus(200);
        $this->assertNotEmpty($resChannel->json('data'));

        $resType = $this->getJson('/api/v1/media/appearances?type=tv');
        $resType->assertStatus(200);
        $this->assertNotEmpty($resType->json('data'));
    }

    public function test_public_can_view_appearance_detail_by_slug(): void
    {
        $res = $this->getJson('/api/v1/media/appearances/test-live-studio-discussion-constitution');
        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-live-studio-discussion-constitution')
            ->assertJsonPath('data.channel', 'News24')
            ->assertJsonPath('data.broadcast_type', 'tv');
    }

    public function test_public_cannot_view_draft_or_private_appearance(): void
    {
        $resDraft = $this->getJson('/api/v1/media/appearances/test-unapproved-draft-tv-episode');
        $resDraft->assertStatus(404);

        $resPrivate = $this->getJson('/api/v1/media/appearances/test-private-radio-appearance');
        $resPrivate->assertStatus(404);

        $resUnknown = $this->getJson('/api/v1/media/appearances/unknown-appearance-slug');
        $resUnknown->assertStatus(404);
    }

    public function test_public_document_download_delivers_file_for_published_appearances(): void
    {
        $res = $this->get("/api/v1/media/appearances/{$this->publishedApp->id}/document");
        $res->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_public_cannot_download_document_for_draft_appearance(): void
    {
        $resDraft = $this->get("/api/v1/media/appearances/{$this->draftApp->id}/document");
        $resDraft->assertStatus(404);
    }
}

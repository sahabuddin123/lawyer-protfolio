<?php

namespace Tests\Feature\Media;

use App\Models\Category;
use App\Models\Media;
use App\Models\MediaPress;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicMediaPressTest extends TestCase
{
    use DatabaseTransactions;

    protected MediaPress $publishedPress;
    protected MediaPress $draftPress;
    protected MediaPress $privatePress;
    protected Media $dummyPdf;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $admin = User::factory()->create(['name' => 'Admin User', 'email' => 'admin_public_press@nijamuddin.com']);
        $admin->assignRole('super_admin');

        Storage::fake('public');
        $file = UploadedFile::fake()->create('press-clipping.pdf', 150, 'application/pdf');
        $storedPath = $file->store('documents/media', 'public');

        $this->dummyPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/media',
            'filename' => basename($storedPath),
            'original_name' => 'press-clipping.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 153600,
            'uploaded_by' => $admin->id,
        ]);

        $this->publishedPress = MediaPress::create([
            'title' => ['en' => 'TEST — Landmark Legal Reform Covered in National Press', 'bn' => 'টেস্ট — জাতীয় সংবাদপত্রে ঐতিহাসিক আইন সংস্কার কভারেজ'],
            'slug' => 'test-landmark-legal-reform-covered',
            'media_type' => 'newspaper',
            'source_name' => 'The Daily Star',
            'published_date' => '2025-03-20',
            'description' => ['en' => 'Comprehensive editorial piece on procedural justice.', 'bn' => 'প্রক্রিয়াগত ন্যায়বিচার সংক্রান্ত বিস্তারিত সম্পাদকীয়।'],
            'external_url' => 'https://example.com/press/landmark-reform',
            'document_media_id' => $this->dummyPdf->id,
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        $this->draftPress = MediaPress::create([
            'title' => ['en' => 'TEST — Unapproved Draft Press Article', 'bn' => 'টেস্ট — অনুমোদনহীন খসড়া প্রেস প্রতিবেদন'],
            'slug' => 'test-unapproved-draft-press-article',
            'media_type' => 'online',
            'source_name' => 'Online News',
            'status' => 'draft',
            'visibility' => 'public',
            'sort_order' => 2,
        ]);

        $this->privatePress = MediaPress::create([
            'title' => ['en' => 'TEST — Confidential Private Press Record', 'bn' => 'টেস্ট — গোপনীয় ব্যক্তিগত প্রেস রেকর্ড'],
            'slug' => 'test-confidential-private-press-record',
            'media_type' => 'magazine',
            'source_name' => 'Internal Digest',
            'status' => 'published',
            'visibility' => 'private',
            'sort_order' => 3,
        ]);
    }

    public function test_public_can_list_only_published_and_public_press_items(): void
    {
        $res = $this->getJson('/api/v1/media/press');
        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        $slugs = collect($res->json('data'))->pluck('slug')->toArray();

        $this->assertContains('test-landmark-legal-reform-covered', $slugs);
        $this->assertNotContains('test-unapproved-draft-press-article', $slugs);
        $this->assertNotContains('test-confidential-private-press-record', $slugs);
    }

    public function test_public_search_and_filters_work_as_expected(): void
    {
        $res = $this->getJson('/api/v1/media/press?search=procedural+justice');
        $res->assertStatus(200);
        $data = $res->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('test-landmark-legal-reform-covered', $data[0]['slug']);

        $resEmpty = $this->getJson('/api/v1/media/press?search=nonexistenttermxyz');
        $resEmpty->assertStatus(200);
        $this->assertEmpty($resEmpty->json('data'));

        $resType = $this->getJson('/api/v1/media/press?type=newspaper');
        $resType->assertStatus(200);
        $this->assertNotEmpty($resType->json('data'));

        $resYear = $this->getJson('/api/v1/media/press?year=2025');
        $resYear->assertStatus(200);
        $this->assertNotEmpty($resYear->json('data'));
    }

    public function test_public_can_view_published_press_detail_by_slug(): void
    {
        $res = $this->getJson('/api/v1/media/press/test-landmark-legal-reform-covered');
        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-landmark-legal-reform-covered')
            ->assertJsonPath('data.source_name', 'The Daily Star')
            ->assertJsonPath('data.has_document', true);
    }

    public function test_public_cannot_view_draft_or_private_press_detail(): void
    {
        $resDraft = $this->getJson('/api/v1/media/press/test-unapproved-draft-press-article');
        $resDraft->assertStatus(404);

        $resPrivate = $this->getJson('/api/v1/media/press/test-confidential-private-press-record');
        $resPrivate->assertStatus(404);

        $resNotFound = $this->getJson('/api/v1/media/press/completely-unknown-slug');
        $resNotFound->assertStatus(404);
    }

    public function test_public_document_download_delivers_file_for_published_items(): void
    {
        $res = $this->get("/api/v1/media/press/{$this->publishedPress->id}/document");
        $res->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_public_cannot_download_document_for_draft_or_private_items(): void
    {
        $resDraft = $this->get("/api/v1/media/press/{$this->draftPress->id}/document");
        $resDraft->assertStatus(404);

        $resPrivate = $this->get("/api/v1/media/press/{$this->privatePress->id}/document");
        $resPrivate->assertStatus(404);
    }
}

<?php

namespace Tests\Feature\Media;

use App\Models\Category;
use App\Models\Media;
use App\Models\MediaAppearance;
use App\Models\Redirect;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminMediaAppearanceTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $mediaManager;
    protected User $plainUser;
    protected Category $category;
    protected Tag $tag;
    protected Media $dummyPdf;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin', 'email' => 'superadmin_app_test@nijamuddin.com']);
        $this->superAdmin->assignRole('super_admin');

        $this->mediaManager = User::factory()->create(['name' => 'Media Manager', 'email' => 'mediamgr_app_test@nijamuddin.com']);
        $this->mediaManager->assignRole('media_manager');

        $this->plainUser = User::factory()->create(['name' => 'Plain User', 'email' => 'plain_app_test@nijamuddin.com']);

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Electronic Appearances', 'bn' => 'টেস্ট — ইলেকট্রনিক উপস্থিতি'],
            'slug' => 'test-electronic-appearances',
            'type' => 'appearances',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->tag = Tag::create([
            'name' => ['en' => 'TEST — Constitutional Debates', 'bn' => 'টেস্ট — সাংবিধানিক বিতর্ক'],
            'slug' => 'test-constitutional-debates',
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('test-brief.pdf', 300, 'application/pdf');
        $storedPath = $file->store('documents/media', 'public');

        $this->dummyPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/media',
            'filename' => basename($storedPath),
            'original_name' => 'test-brief.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 307200,
            'uploaded_by' => $this->superAdmin->id,
        ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $res = $this->getJson('/api/v1/admin/media/appearances');
        $res->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        Sanctum::actingAs($this->plainUser);

        $res = $this->getJson('/api/v1/admin/media/appearances');
        $res->assertStatus(403);
    }

    public function test_admin_can_list_appearances_with_filters(): void
    {
        Sanctum::actingAs($this->mediaManager);

        MediaAppearance::create([
            'title' => ['en' => 'TEST — Prime Time Jurisprudence Debate', 'bn' => 'টেস্ট — প্রাইম টাইম বিচারিক বিতর্ক'],
            'slug' => 'test-prime-time-jurisprudence-debate',
            'broadcast_type' => 'tv',
            'channel' => 'Channel 24',
            'program_name' => ['en' => 'Law and Order Special', 'bn' => 'আইন ও শৃঙ্খলা বিশেষ'],
            'appearance_date' => '2025-04-12',
            'status' => 'published',
            'visibility' => 'public',
            'sort_order' => 1,
        ]);

        MediaAppearance::create([
            'title' => ['en' => 'TEST — Radio Discussion on Legal Rights', 'bn' => 'টেস্ট — আইনি অধিকার বিষয়ক রেডিও আলোচনা'],
            'slug' => 'test-radio-discussion-legal-rights',
            'broadcast_type' => 'radio',
            'channel' => 'Radio Today',
            'program_name' => ['en' => 'Voice of Law', 'bn' => 'আইনের কণ্ঠ'],
            'status' => 'draft',
            'visibility' => 'private',
            'sort_order' => 2,
        ]);

        $res = $this->getJson('/api/v1/admin/media/appearances?type=tv');
        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $res->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('test-prime-time-jurisprudence-debate', $data[0]['slug']);

        $resDraft = $this->getJson('/api/v1/admin/media/appearances?status=draft');
        $resDraft->assertStatus(200);
        $draftData = $resDraft->json('data');
        $this->assertCount(1, $draftData);
        $this->assertEquals('test-radio-discussion-legal-rights', $draftData[0]['slug']);
    }

    public function test_admin_can_create_appearance_record(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $payload = [
            'title' => [
                'en' => 'TEST — Constitutional Dialogue on Television',
                'bn' => 'টেস্ট — টেলিভিশনে সাংবিধানিক সংলাপ',
            ],
            'slug' => 'test-constitutional-dialogue-on-television',
            'broadcast_type' => 'tv',
            'channel' => 'ATN News',
            'program_name' => [
                'en' => 'Constitutional Dialogues',
                'bn' => 'সাংবিধানিক সংলাপমালা',
            ],
            'appearance_date' => '2025-06-15',
            'description' => [
                'en' => 'Live televised discourse analyzing separation of powers doctrine.',
                'bn' => 'ক্ষমতার পৃথকীকরণ নীতির ওপর সরাসরি সম্প্রচারিত টেলিভিশন বিতর্ক।',
            ],
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'category_id' => $this->category->id,
            'tag_ids' => [$this->tag->id],
            'document_media_id' => $this->dummyPdf->id,
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
        ];

        $res = $this->postJson('/api/v1/admin/media/appearances', $payload);
        $res->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-constitutional-dialogue-on-television')
            ->assertJsonPath('data.channel', 'ATN News')
            ->assertJsonPath('data.is_featured', true);

        $this->assertDatabaseHas('media_appearances', [
            'slug' => 'test-constitutional-dialogue-on-television',
            'media_type' => 'tv',
            'status' => 'published',
            'visibility' => 'public',
        ]);
    }

    public function test_appearance_creation_validates_fields_and_types(): void
    {
        Sanctum::actingAs($this->mediaManager);

        // Missing fields
        $res = $this->postJson('/api/v1/admin/media/appearances', []);
        $res->assertStatus(422)
            ->assertJsonValidationErrors(['title.en', 'title.bn', 'channel', 'status', 'visibility']);

        // Invalid broadcast type
        $resType = $this->postJson('/api/v1/admin/media/appearances', [
            'title' => ['en' => 'Test', 'bn' => 'টেস্ট'],
            'channel' => 'Test Channel',
            'broadcast_type' => 'satellite_telecast',
            'status' => 'published',
            'visibility' => 'public',
        ]);
        $resType->assertStatus(422)
            ->assertJsonValidationErrors(['broadcast_type']);

        // Invalid video url
        $resVideo = $this->postJson('/api/v1/admin/media/appearances', [
            'title' => ['en' => 'Test', 'bn' => 'টেস্ট'],
            'channel' => 'Test Channel',
            'broadcast_type' => 'tv',
            'status' => 'published',
            'visibility' => 'public',
            'video_url' => 'not-a-valid-url',
        ]);
        $resVideo->assertStatus(422)
            ->assertJsonValidationErrors(['video_url']);
    }

    public function test_admin_can_update_appearance_and_slug_change_creates_redirect(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $appearance = MediaAppearance::create([
            'title' => ['en' => 'TEST — Original Broadcast', 'bn' => 'টেস্ট — মূল সম্প্রচার'],
            'slug' => 'test-original-broadcast',
            'broadcast_type' => 'tv',
            'channel' => 'Channel i',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $updatePayload = [
            'title' => ['en' => 'TEST — Updated Broadcast', 'bn' => 'টেস্ট — হালনাগাদকৃত সম্প্রচার'],
            'slug' => 'test-updated-broadcast',
            'broadcast_type' => 'digital',
            'channel' => 'Prothom Alo Digital',
            'status' => 'published',
            'visibility' => 'public',
        ];

        $res = $this->putJson("/api/v1/admin/media/appearances/{$appearance->id}", $updatePayload);
        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-updated-broadcast')
            ->assertJsonPath('data.channel', 'Prothom Alo Digital');

        $this->assertDatabaseHas('redirects', [
            'source_url' => '/media/appearances/test-original-broadcast',
            'target_url' => '/media/appearances/test-updated-broadcast',
            'status_code' => 301,
        ]);
    }

    public function test_admin_preview_endpoint_allows_viewing_draft_appearance(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $draft = MediaAppearance::create([
            'title' => ['en' => 'TEST — Draft TV Special', 'bn' => 'টেস্ট — খসড়া টিভি স্পেশাল'],
            'slug' => 'test-draft-tv-special',
            'broadcast_type' => 'tv',
            'channel' => 'Somoy TV',
            'status' => 'draft',
            'visibility' => 'private',
        ]);

        $res = $this->getJson("/api/v1/admin/media/appearances/{$draft->id}/preview");
        $res->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertJsonPath('data.slug', 'test-draft-tv-special');
    }

    public function test_admin_can_reorder_appearances(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $a1 = MediaAppearance::create([
            'title' => ['en' => 'TEST — App 1', 'bn' => 'টেস্ট — ১'],
            'slug' => 'test-app-1',
            'broadcast_type' => 'tv',
            'channel' => 'Channel A',
            'sort_order' => 1,
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $a2 = MediaAppearance::create([
            'title' => ['en' => 'TEST — App 2', 'bn' => 'টেস্ট — ২'],
            'slug' => 'test-app-2',
            'broadcast_type' => 'tv',
            'channel' => 'Channel B',
            'sort_order' => 2,
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $res = $this->postJson('/api/v1/admin/media/appearances/reorder', [
            'order' => [
                ['id' => $a1->id, 'sort_order' => 10],
                ['id' => $a2->id, 'sort_order' => 20],
            ],
        ]);

        $res->assertStatus(200);
        $this->assertEquals(10, $a1->fresh()->sort_order);
        $this->assertEquals(20, $a2->fresh()->sort_order);
    }

    public function test_admin_can_delete_appearance(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $appearance = MediaAppearance::create([
            'title' => ['en' => 'TEST — Appearance to Delete', 'bn' => 'টেস্ট — মুছে ফেলার উপস্থিতি'],
            'slug' => 'test-appearance-to-delete',
            'broadcast_type' => 'tv',
            'channel' => 'Channel Del',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $res = $this->deleteJson("/api/v1/admin/media/appearances/{$appearance->id}");
        $res->assertStatus(200);

        $this->assertSoftDeleted('media_appearances', ['id' => $appearance->id]);
    }
}

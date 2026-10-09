<?php

namespace Tests\Feature\Media;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Media;
use App\Models\MediaPress;
use App\Models\Redirect;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminMediaPressTest extends TestCase
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

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin', 'email' => 'superadmin_press_test@nijamuddin.com']);
        $this->superAdmin->assignRole('super_admin');

        $this->mediaManager = User::factory()->create(['name' => 'Media Manager', 'email' => 'mediamgr_press_test@nijamuddin.com']);
        $this->mediaManager->assignRole('media_manager');

        $this->plainUser = User::factory()->create(['name' => 'Plain User', 'email' => 'plain_press_test@nijamuddin.com']);

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Press Coverage', 'bn' => 'টেস্ট — প্রেস কভারেজ'],
            'slug' => 'test-press-coverage',
            'type' => 'press',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->tag = Tag::create([
            'name' => ['en' => 'TEST — Supreme Court', 'bn' => 'টেস্ট — সুপ্রিম কোর্ট'],
            'slug' => 'test-supreme-court',
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('test-clipping.pdf', 250, 'application/pdf');
        $storedPath = $file->store('documents/media', 'public');

        $this->dummyPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/media',
            'filename' => basename($storedPath),
            'original_name' => 'test-clipping.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 256000,
            'uploaded_by' => $this->superAdmin->id,
        ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/media/press');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        Sanctum::actingAs($this->plainUser);

        $response = $this->getJson('/api/v1/admin/media/press');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_press_media_with_filters(): void
    {
        Sanctum::actingAs($this->mediaManager);

        MediaPress::create([
            'title' => ['en' => 'TEST — Constitutional Analysis Daily', 'bn' => 'টেস্ট — সাংবিধানিক বিশ্লেষণ দৈনিক'],
            'slug' => 'test-constitutional-analysis-daily',
            'media_type' => 'newspaper',
            'source_name' => 'The Daily Star',
            'published_date' => '2025-02-10',
            'status' => 'published',
            'visibility' => 'public',
            'sort_order' => 1,
        ]);

        MediaPress::create([
            'title' => ['en' => 'TEST — Draft Press Feature', 'bn' => 'টেস্ট — খসড়া প্রেস ফিচার'],
            'slug' => 'test-draft-press-feature',
            'media_type' => 'magazine',
            'source_name' => 'Law Weekly',
            'status' => 'draft',
            'visibility' => 'private',
            'sort_order' => 2,
        ]);

        $res = $this->getJson('/api/v1/admin/media/press?type=newspaper');
        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $res->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('test-constitutional-analysis-daily', $data[0]['slug']);

        $resDraft = $this->getJson('/api/v1/admin/media/press?status=draft');
        $resDraft->assertStatus(200);
        $draftData = $resDraft->json('data');
        $this->assertCount(1, $draftData);
        $this->assertEquals('test-draft-press-feature', $draftData[0]['slug']);
    }

    public function test_admin_can_create_press_record_with_bilingual_fields(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $payload = [
            'title' => [
                'en' => 'TEST — National Daily Legal Coverage',
                'bn' => 'টেস্ট — জাতীয় দৈনিক আইনি সংবাদ',
            ],
            'slug' => 'test-national-daily-legal-coverage',
            'media_type' => 'newspaper',
            'source_name' => 'Daily Observer',
            'published_date' => '2025-05-18',
            'description' => [
                'en' => 'A detailed report on appellate division jurisprudence.',
                'bn' => 'আপিল বিভাগের বিচারিক সিদ্ধান্তের বিস্তারিত প্রতিবেদন।',
            ],
            'external_url' => 'https://example.com/press/report-123',
            'category_id' => $this->category->id,
            'tag_ids' => [$this->tag->id],
            'document_media_id' => $this->dummyPdf->id,
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 5,
        ];

        $res = $this->postJson('/api/v1/admin/media/press', $payload);
        $res->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-national-daily-legal-coverage')
            ->assertJsonPath('data.source_name', 'Daily Observer')
            ->assertJsonPath('data.is_featured', true);

        $this->assertDatabaseHas('media_press', [
            'slug' => 'test-national-daily-legal-coverage',
            'media_type' => 'newspaper',
            'status' => 'published',
            'visibility' => 'public',
        ]);
    }

    public function test_press_creation_validates_required_fields_and_formats(): void
    {
        Sanctum::actingAs($this->mediaManager);

        // Missing required fields
        $res = $this->postJson('/api/v1/admin/media/press', []);
        $res->assertStatus(422)
            ->assertJsonValidationErrors(['title.en', 'title.bn', 'media_type', 'source_name', 'status', 'visibility']);

        // Invalid media type
        $resType = $this->postJson('/api/v1/admin/media/press', [
            'title' => ['en' => 'Test', 'bn' => 'টেস্ট'],
            'media_type' => 'invalid_type',
            'source_name' => 'Source',
            'status' => 'published',
            'visibility' => 'public',
        ]);
        $resType->assertStatus(422)
            ->assertJsonValidationErrors(['media_type']);

        // Unsafe javascript: url
        $resUrl = $this->postJson('/api/v1/admin/media/press', [
            'title' => ['en' => 'Test', 'bn' => 'টেস্ট'],
            'media_type' => 'newspaper',
            'source_name' => 'Source',
            'status' => 'published',
            'visibility' => 'public',
            'external_url' => 'javascript:alert(1)',
        ]);
        $resUrl->assertStatus(422)
            ->assertJsonValidationErrors(['external_url']);
    }

    public function test_admin_can_update_press_and_slug_change_creates_redirect(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $press = MediaPress::create([
            'title' => ['en' => 'TEST — Original Title', 'bn' => 'টেস্ট — মূল শিরোনাম'],
            'slug' => 'test-original-slug',
            'media_type' => 'newspaper',
            'source_name' => 'Daily Sun',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $updatePayload = [
            'title' => ['en' => 'TEST — Updated Title', 'bn' => 'টেস্ট — হালনাগাদকৃত শিরোনাম'],
            'slug' => 'test-updated-slug',
            'media_type' => 'magazine',
            'source_name' => 'Law Review Journal',
            'status' => 'published',
            'visibility' => 'public',
        ];

        $res = $this->putJson("/api/v1/admin/media/press/{$press->id}", $updatePayload);
        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-updated-slug')
            ->assertJsonPath('data.source_name', 'Law Review Journal');

        // Verify redirect was created
        $this->assertDatabaseHas('redirects', [
            'source_url' => '/media/press/test-original-slug',
            'target_url' => '/media/press/test-updated-slug',
            'status_code' => 301,
        ]);
    }

    public function test_admin_preview_endpoint_allows_viewing_draft_with_noindex(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $draft = MediaPress::create([
            'title' => ['en' => 'TEST — Private Press Draft', 'bn' => 'টেস্ট — গোপন প্রেস খসড়া'],
            'slug' => 'test-private-press-draft',
            'media_type' => 'online',
            'source_name' => 'Legal Portal',
            'status' => 'draft',
            'visibility' => 'private',
        ]);

        $res = $this->getJson("/api/v1/admin/media/press/{$draft->id}/preview");
        $res->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertJsonPath('data.slug', 'test-private-press-draft');
    }

    public function test_admin_can_reorder_press_items(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $p1 = MediaPress::create([
            'title' => ['en' => 'TEST — P1', 'bn' => 'টেস্ট — ১'],
            'slug' => 'test-p1',
            'media_type' => 'newspaper',
            'source_name' => 'Source 1',
            'sort_order' => 1,
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $p2 = MediaPress::create([
            'title' => ['en' => 'TEST — P2', 'bn' => 'টেস্ট — ২'],
            'slug' => 'test-p2',
            'media_type' => 'newspaper',
            'source_name' => 'Source 2',
            'sort_order' => 2,
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $res = $this->postJson('/api/v1/admin/media/press/reorder', [
            'order' => [
                ['id' => $p1->id, 'sort_order' => 10],
                ['id' => $p2->id, 'sort_order' => 20],
            ],
        ]);

        $res->assertStatus(200);
        $this->assertEquals(10, $p1->fresh()->sort_order);
        $this->assertEquals(20, $p2->fresh()->sort_order);
    }

    public function test_admin_can_delete_press_item(): void
    {
        Sanctum::actingAs($this->mediaManager);

        $press = MediaPress::create([
            'title' => ['en' => 'TEST — To Be Deleted', 'bn' => 'টেস্ট — মুছে ফেলার জন্য'],
            'slug' => 'test-to-be-deleted',
            'media_type' => 'newspaper',
            'source_name' => 'Old Paper',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $res = $this->deleteJson("/api/v1/admin/media/press/{$press->id}");
        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('media_press', ['id' => $press->id]);
    }
}

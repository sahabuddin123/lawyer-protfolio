<?php

namespace Tests\Feature\Gallery;

use App\Models\Category;
use App\Models\GalleryAlbum;
use App\Models\GalleryImage;
use App\Models\Media;
use App\Models\Redirect;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class AdminGalleryTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected User $unauthorizedUser;
    protected Category $category;
    protected Media $media1;
    protected Media $media2;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::findOrCreate('manage_gallery', 'web');

        $this->adminUser = User::factory()->create();
        $this->adminUser->givePermissionTo('manage_gallery');

        $this->unauthorizedUser = User::factory()->create();

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Conferences', 'bn' => 'সম্মেলন'],
            'slug' => 'test-conferences-' . uniqid(),
            'type' => 'gallery',
            'is_active' => true,
        ]);

        $this->media1 = Media::create([
            'disk' => 'public',
            'directory' => 'media/test',
            'filename' => 'photo1.jpg',
            'original_name' => 'photo1.jpg',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'size_bytes' => 102400,
            'width' => 1920,
            'height' => 1080,
        ]);

        $this->media2 = Media::create([
            'disk' => 'public',
            'directory' => 'media/test',
            'filename' => 'photo2.jpg',
            'original_name' => 'photo2.jpg',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'size_bytes' => 102400,
            'width' => 1920,
            'height' => 1080,
        ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/gallery');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        $response = $this->actingAs($this->unauthorizedUser, 'sanctum')
            ->getJson('/api/v1/admin/gallery');

        $response->assertStatus(403);
    }

    public function test_admin_can_list_gallery_albums_with_filters(): void
    {
        GalleryAlbum::create([
            'title' => ['en' => 'TEST — Supreme Court Conference', 'bn' => 'সুপ্রিম কোর্ট সম্মেলন'],
            'slug' => 'test-sc-conf-' . uniqid(),
            'category_id' => $this->category->id,
            'cover_image_id' => $this->media1->id,
            'event_date' => '2026-05-15',
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
        ]);

        GalleryAlbum::create([
            'title' => ['en' => 'TEST — Chamber Meeting Draft', 'bn' => 'চেম্বার বৈঠক'],
            'slug' => 'test-chamber-draft-' . uniqid(),
            'status' => 'draft',
            'visibility' => 'private',
            'is_featured' => false,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/gallery?status=published');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $items = $response->json('data');
        $this->assertNotEmpty($items);
        foreach ($items as $item) {
            $this->assertEquals('published', $item['status']);
        }
    }

    public function test_admin_can_create_gallery_album_with_bilingual_fields_and_seo(): void
    {
        $slug = 'test-bar-association-' . uniqid();
        $payload = [
            'title' => [
                'en' => 'TEST — Bar Association Centenary',
                'bn' => 'বার অ্যাসোসিয়েশন শতবর্ষ',
            ],
            'slug' => $slug,
            'description' => [
                'en' => 'Historic legal gathering at Dhaka.',
                'bn' => 'ঢাকায় ঐতিহাসিক সমাবেশ।',
            ],
            'category_id' => $this->category->id,
            'cover_image_id' => $this->media1->id,
            'event_date' => '2026-06-20',
            'status' => 'draft',
            'visibility' => 'public',
            'is_featured' => true,
            'seo' => [
                'meta_title' => ['en' => 'Centenary Celebration SEO', 'bn' => 'শতবর্ষ উদযাপন'],
                'meta_description' => ['en' => 'Centenary legal gathering details.', 'bn' => 'বিবরণ'],
            ],
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/gallery', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', $slug)
            ->assertJsonPath('data.title.en', 'TEST — Bar Association Centenary')
            ->assertJsonPath('data.is_featured', true);

        $this->assertDatabaseHas('gallery_albums', ['slug' => $slug]);
    }

    public function test_slug_uniqueness_is_enforced(): void
    {
        $slug = 'test-duplicate-album-' . uniqid();
        GalleryAlbum::create([
            'title' => ['en' => 'TEST — Album 1', 'bn' => 'অ্যালবাম ১'],
            'slug' => $slug,
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $payload = [
            'title' => ['en' => 'TEST — Album 2', 'bn' => 'অ্যালবাম ২'],
            'slug' => $slug,
            'status' => 'draft',
            'visibility' => 'public',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/gallery', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_published_slug_change_creates_301_redirect(): void
    {
        $oldSlug = 'test-old-slug-' . uniqid();
        $newSlug = 'test-new-slug-' . uniqid();

        $album = GalleryAlbum::create([
            'title' => ['en' => 'TEST — Published Album', 'bn' => 'প্রকাশিত অ্যালবাম'],
            'slug' => $oldSlug,
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/admin/gallery/{$album->id}", [
                'title' => ['en' => 'TEST — Published Album Updated', 'bn' => 'প্রকাশিত অ্যালবাম'],
                'slug' => $newSlug,
                'status' => 'published',
                'visibility' => 'public',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.slug', $newSlug);

        $this->assertDatabaseHas('redirects', [
            'source_url' => "/gallery/{$oldSlug}",
            'target_url' => "/gallery/{$newSlug}",
            'status_code' => 301,
        ]);
    }

    public function test_admin_preview_endpoint_returns_noindex_header(): void
    {
        $album = GalleryAlbum::create([
            'title' => ['en' => 'TEST — Draft Preview Album', 'bn' => 'খসড়া অ্যালবাম'],
            'slug' => 'test-draft-album-' . uniqid(),
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/admin/gallery/{$album->id}/preview");

        $response->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
            ->assertJsonPath('meta.preview_mode', true);
    }

    public function test_admin_can_attach_and_detach_images_without_deleting_media(): void
    {
        $album = GalleryAlbum::create([
            'title' => ['en' => 'TEST — Photo Album', 'bn' => 'ছবি অ্যালবাম'],
            'slug' => 'test-photo-album-' . uniqid(),
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        // Attach image
        $attachResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/gallery/{$album->id}/images", [
                'media_id' => $this->media1->id,
                'caption' => ['en' => 'Opening address', 'bn' => 'উদ্বোধনী বক্তব্য'],
                'alt_text' => ['en' => 'Advocate delivering speech', 'bn' => 'বক্তব্য প্রদান'],
                'sort_order' => 1,
            ]);

        $attachResponse->assertStatus(201)
            ->assertJsonPath('data.media_id', $this->media1->id)
            ->assertJsonPath('data.caption.en', 'Opening address');

        $imageId = $attachResponse->json('data.id');
        $this->assertDatabaseHas('gallery_images', ['id' => $imageId, 'album_id' => $album->id]);

        // Detach image
        $detachResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/gallery/{$album->id}/images/{$imageId}");

        $detachResponse->assertStatus(200);
        $this->assertDatabaseMissing('gallery_images', ['id' => $imageId]);

        // Underlying Media asset MUST still exist!
        $this->assertDatabaseHas('media', ['id' => $this->media1->id]);
    }

    public function test_admin_can_reorder_images_and_set_cover(): void
    {
        $album = GalleryAlbum::create([
            'title' => ['en' => 'TEST — Reorder Album', 'bn' => 'পুনর্বিন্যাস অ্যালবাম'],
            'slug' => 'test-reorder-album-' . uniqid(),
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $img1 = $album->images()->create([
            'media_id' => $this->media1->id,
            'sort_order' => 1,
            'visibility' => 'public',
        ]);

        $img2 = $album->images()->create([
            'media_id' => $this->media2->id,
            'sort_order' => 2,
            'visibility' => 'public',
        ]);

        // Reorder
        $reorderResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/gallery/{$album->id}/images/reorder", [
                'items' => [
                    ['id' => $img1->id, 'sort_order' => 10],
                    ['id' => $img2->id, 'sort_order' => 5],
                ],
            ]);

        $reorderResponse->assertStatus(200);
        $this->assertEquals(10, $img1->fresh()->sort_order);
        $this->assertEquals(5, $img2->fresh()->sort_order);

        // Set Cover
        $coverResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/gallery/{$album->id}/images/{$img2->id}/set-cover");

        $coverResponse->assertStatus(200);
        $this->assertEquals($this->media2->id, $album->fresh()->cover_image_id);
    }

    public function test_idor_protection_rejects_modifying_image_from_another_album(): void
    {
        $albumA = GalleryAlbum::create([
            'title' => ['en' => 'Album A', 'bn' => 'অ্যালবাম এ'],
            'slug' => 'album-a-' . uniqid(),
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $albumB = GalleryAlbum::create([
            'title' => ['en' => 'Album B', 'bn' => 'অ্যালবাম বি'],
            'slug' => 'album-b-' . uniqid(),
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $imageInA = $albumA->images()->create([
            'media_id' => $this->media1->id,
            'sort_order' => 1,
            'visibility' => 'public',
        ]);

        // Attempt to update imageInA via albumB endpoint
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/admin/gallery/{$albumB->id}/images/{$imageInA->id}", [
                'caption' => ['en' => 'Hacked caption'],
            ]);

        $response->assertStatus(404);
    }

    public function test_admin_can_delete_album_without_deleting_shared_media(): void
    {
        $album = GalleryAlbum::create([
            'title' => ['en' => 'TEST — Delete Album', 'bn' => 'মুছুন অ্যালবাম'],
            'slug' => 'test-delete-album-' . uniqid(),
            'cover_image_id' => $this->media1->id,
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $album->images()->create([
            'media_id' => $this->media1->id,
            'sort_order' => 1,
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/gallery/{$album->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('gallery_albums', ['id' => $album->id]);

        // Media asset MUST remain intact!
        $this->assertDatabaseHas('media', ['id' => $this->media1->id]);
    }
}

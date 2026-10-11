<?php

namespace Tests\Feature\Gallery;

use App\Models\Category;
use App\Models\GalleryAlbum;
use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class GalleryE2ELifecycleTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected Category $category;
    protected Media $media1;
    protected Media $media2;
    protected Media $media3;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::findOrCreate('manage_gallery', 'web');

        $this->adminUser = User::factory()->create();
        $this->adminUser->givePermissionTo('manage_gallery');

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Judicial Seminars', 'bn' => 'বিচার বিভাগীয় সেমিনার'],
            'slug' => 'test-judicial-seminars-' . uniqid(),
            'type' => 'gallery',
            'is_active' => true,
        ]);

        $this->media1 = Media::create([
            'disk' => 'public',
            'directory' => 'media/test',
            'filename' => 'e2e_photo1.jpg',
            'original_name' => 'e2e_photo1.jpg',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'size_bytes' => 204800,
            'width' => 1920,
            'height' => 1080,
        ]);

        $this->media2 = Media::create([
            'disk' => 'public',
            'directory' => 'media/test',
            'filename' => 'e2e_photo2.jpg',
            'original_name' => 'e2e_photo2.jpg',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'size_bytes' => 204800,
            'width' => 1920,
            'height' => 1080,
        ]);

        $this->media3 = Media::create([
            'disk' => 'public',
            'directory' => 'media/test',
            'filename' => 'e2e_photo3.jpg',
            'original_name' => 'e2e_photo3.jpg',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'size_bytes' => 204800,
            'width' => 1920,
            'height' => 1080,
        ]);
    }

    public function test_complete_gallery_editorial_lifecycle_e2e(): void
    {
        $initialSlug = 'test-e2e-seminar-' . uniqid();
        $updatedSlug = 'test-e2e-seminar-updated-' . uniqid();

        // 1. Admin creates draft album
        $createResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/gallery', [
                'title' => [
                    'en' => 'TEST — National Judicial Seminar 2026',
                    'bn' => 'জাতীয় বিচার বিভাগীয় সেমিনার ২০২৬',
                ],
                'slug' => $initialSlug,
                'description' => [
                    'en' => 'Keynote address on constitutional remedies.',
                    'bn' => 'সাংবিধানিক প্রতিকার বিষয়ক বক্তব্য।',
                ],
                'category_id' => $this->category->id,
                'event_date' => '2026-09-01',
                'status' => 'draft',
                'visibility' => 'public',
                'is_featured' => true,
            ]);

        $createResponse->assertStatus(201);
        $albumId = $createResponse->json('data.id');

        // 2. Attach images
        $img1Response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/gallery/{$albumId}/images", [
                'media_id' => $this->media1->id,
                'caption' => ['en' => 'Arrival of delegates', 'bn' => 'প্রতিনিধিদের আগমন'],
                'alt_text' => ['en' => 'Delegates arriving at hall', 'bn' => 'হলকক্ষে আগমন'],
                'sort_order' => 1,
                'visibility' => 'public',
            ]);
        $img1Response->assertStatus(201);
        $image1Id = $img1Response->json('data.id');

        $img2Response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/gallery/{$albumId}/images", [
                'media_id' => $this->media2->id,
                'caption' => ['en' => 'Keynote presentation', 'bn' => 'মূল প্রবন্ধ উপস্থাপন'],
                'alt_text' => ['en' => 'Advocate at podium', 'bn' => 'পোডিয়ামে বক্তব্য'],
                'sort_order' => 2,
                'visibility' => 'public',
            ]);
        $img2Response->assertStatus(201);
        $image2Id = $img2Response->json('data.id');

        // 3. Set cover and reorder
        $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/gallery/{$albumId}/images/{$image2Id}/set-cover")
            ->assertStatus(200);

        $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/gallery/{$albumId}/images/reorder", [
                'items' => [
                    ['id' => $image2Id, 'sort_order' => 1],
                    ['id' => $image1Id, 'sort_order' => 2],
                ],
            ])
            ->assertStatus(200);

        // 4. Verify NOT publicly visible as draft
        $this->getJson("/api/v1/gallery/{$initialSlug}")
            ->assertStatus(404);

        // 5. Preview draft album
        $previewResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/admin/gallery/{$albumId}/preview");

        $previewResponse->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

        // 6. Publish album
        $publishResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/admin/gallery/{$albumId}", [
                'title' => [
                    'en' => 'TEST — National Judicial Seminar 2026',
                    'bn' => 'জাতীয় বিচার বিভাগীয় সেমিনার ২০২৬',
                ],
                'slug' => $initialSlug,
                'status' => 'published',
                'visibility' => 'public',
                'category_id' => $this->category->id,
            ]);
        $publishResponse->assertStatus(200);

        // 7. Verify public listing
        $listResponse = $this->getJson('/api/v1/gallery');
        $listResponse->assertStatus(200);
        $slugs = collect($listResponse->json('data'))->pluck('slug')->all();
        $this->assertContains($initialSlug, $slugs);

        // 8. Open public detail
        $detailResponse = $this->getJson("/api/v1/gallery/{$initialSlug}");
        $detailResponse->assertStatus(200)
            ->assertJsonPath('data.title', 'TEST — National Judicial Seminar 2026')
            ->assertJsonPath('data.image_count', 2);

        // 9. Update slug -> verify 301 redirect
        $slugUpdateResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/admin/gallery/{$albumId}", [
                'title' => [
                    'en' => 'TEST — National Judicial Seminar 2026 Published',
                    'bn' => 'জাতীয় বিচার বিভাগীয় সেমিনার ২০২৬',
                ],
                'slug' => $updatedSlug,
                'status' => 'published',
                'visibility' => 'public',
                'category_id' => $this->category->id,
            ]);
        $slugUpdateResponse->assertStatus(200);

        // Verify legacy slug returns 301
        $this->getJson("/api/v1/gallery/{$initialSlug}")
            ->assertStatus(301)
            ->assertHeader('Location', "/gallery/{$updatedSlug}");

        // Verify new slug works
        $this->getJson("/api/v1/gallery/{$updatedSlug}")
            ->assertStatus(200);

        // 10. Update image visibility to private -> verify omitted from public
        $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/admin/gallery/{$albumId}/images/{$image1Id}", [
                'visibility' => 'private',
            ])
            ->assertStatus(200);

        $detailAfterPrivate = $this->getJson("/api/v1/gallery/{$updatedSlug}");
        $detailAfterPrivate->assertStatus(200)
            ->assertJsonPath('data.image_count', 1);

        // 11. Unpublish album -> verify public 404
        $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/admin/gallery/{$albumId}", [
                'title' => [
                    'en' => 'TEST — National Judicial Seminar 2026',
                    'bn' => 'জাতীয় বিচার বিভাগীয় সেমিনার ২০২৬',
                ],
                'slug' => $updatedSlug,
                'status' => 'draft',
                'visibility' => 'public',
                'category_id' => $this->category->id,
            ])
            ->assertStatus(200);

        $this->getJson("/api/v1/gallery/{$updatedSlug}")
            ->assertStatus(404);

        // 12. Delete album -> verify relationships deleted, media preserved
        $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/gallery/{$albumId}")
            ->assertStatus(200);

        $this->assertSoftDeleted('gallery_albums', ['id' => $albumId]);
        $this->assertDatabaseHas('media', ['id' => $this->media1->id]);
        $this->assertDatabaseHas('media', ['id' => $this->media2->id]);
    }
}

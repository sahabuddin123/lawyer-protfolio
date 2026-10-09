<?php

namespace Tests\Feature\Gallery;

use App\Models\Category;
use App\Models\GalleryAlbum;
use App\Models\GalleryImage;
use App\Models\Media;
use App\Models\Redirect;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicGalleryTest extends TestCase
{
    use DatabaseTransactions;

    protected Category $category;
    protected Media $media1;
    protected Media $media2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Supreme Court', 'bn' => 'সুপ্রিম কোর্ট'],
            'slug' => 'test-supreme-court-' . uniqid(),
            'type' => 'gallery',
            'is_active' => true,
        ]);

        $this->media1 = Media::create([
            'disk' => 'public',
            'directory' => 'media/test',
            'filename' => 'public_photo1.jpg',
            'original_name' => 'public_photo1.jpg',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'size_bytes' => 102400,
            'width' => 1920,
            'height' => 1080,
        ]);

        $this->media2 = Media::create([
            'disk' => 'public',
            'directory' => 'media/test',
            'filename' => 'public_photo2.jpg',
            'original_name' => 'public_photo2.jpg',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'size_bytes' => 102400,
            'width' => 1920,
            'height' => 1080,
        ]);
    }

    public function test_public_can_list_only_published_and_public_albums(): void
    {
        $publishedSlug = 'test-published-pub-' . uniqid();
        $draftSlug = 'test-draft-pub-' . uniqid();
        $privateSlug = 'test-private-pub-' . uniqid();

        GalleryAlbum::create([
            'title' => ['en' => 'TEST — Published Album', 'bn' => 'প্রকাশিত অ্যালবাম'],
            'slug' => $publishedSlug,
            'category_id' => $this->category->id,
            'cover_image_id' => $this->media1->id,
            'event_date' => '2026-06-01',
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        GalleryAlbum::create([
            'title' => ['en' => 'TEST — Draft Album', 'bn' => 'খসড়া অ্যালবাম'],
            'slug' => $draftSlug,
            'category_id' => $this->category->id,
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        GalleryAlbum::create([
            'title' => ['en' => 'TEST — Private Album', 'bn' => 'ব্যক্তিগত অ্যালবাম'],
            'slug' => $privateSlug,
            'category_id' => $this->category->id,
            'status' => 'published',
            'visibility' => 'private',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/gallery');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $slugs = collect($response->json('data'))->pluck('slug')->all();

        $this->assertContains($publishedSlug, $slugs);
        $this->assertNotContains($draftSlug, $slugs);
        $this->assertNotContains($privateSlug, $slugs);
    }

    public function test_public_search_and_category_filters_work(): void
    {
        $uniqueWord = 'UniqueJudicialTerm' . rand(100, 999);

        $matchingAlbum = GalleryAlbum::create([
            'title' => ['en' => "TEST — {$uniqueWord} Session", 'bn' => 'বিশেষ অধিবেশন'],
            'slug' => 'test-unique-session-' . uniqid(),
            'category_id' => $this->category->id,
            'event_date' => '2026-07-01',
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        GalleryAlbum::create([
            'title' => ['en' => 'TEST — Routine Gathering', 'bn' => 'নিয়মিত সমাবেশ'],
            'slug' => 'test-routine-gathering-' . uniqid(),
            'event_date' => '2026-07-02',
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        // Search test
        $searchResponse = $this->getJson("/api/v1/gallery?search={$uniqueWord}");
        $searchResponse->assertStatus(200);

        $slugs = collect($searchResponse->json('data'))->pluck('slug')->all();
        $this->assertContains($matchingAlbum->slug, $slugs);
        $this->assertCount(1, $slugs);

        // Category filter test
        $categoryResponse = $this->getJson("/api/v1/gallery?category={$this->category->slug}");
        $categoryResponse->assertStatus(200);
        $catSlugs = collect($categoryResponse->json('data'))->pluck('slug')->all();
        $this->assertContains($matchingAlbum->slug, $catSlugs);
    }

    public function test_public_can_view_album_detail_by_slug_with_public_images_and_related_albums(): void
    {
        $albumSlug = 'test-appellate-hearing-' . uniqid();

        $album = GalleryAlbum::create([
            'title' => ['en' => 'TEST — Appellate Hearing Gallery', 'bn' => 'আপিল শুনানি গ্যালারি'],
            'slug' => $albumSlug,
            'description' => ['en' => 'Photographs from the historic hearing.', 'bn' => 'ঐতিহাসিক শুনানির আলোকচিত্র।'],
            'category_id' => $this->category->id,
            'cover_image_id' => $this->media1->id,
            'event_date' => '2026-08-10',
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $album->images()->create([
            'media_id' => $this->media1->id,
            'caption' => ['en' => 'Advocate addressing bench', 'bn' => 'বক্তব্য উপস্থাপন'],
            'alt_text' => ['en' => 'Courtroom address', 'bn' => 'আদালতে বক্তব্য'],
            'sort_order' => 1,
            'visibility' => 'public',
        ]);

        // Related album in same category
        $related = GalleryAlbum::create([
            'title' => ['en' => 'TEST — Related Hearing', 'bn' => 'সম্পর্কিত শুনানি'],
            'slug' => 'test-related-hearing-' . uniqid(),
            'category_id' => $this->category->id,
            'event_date' => '2026-08-12',
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $response = $this->getJson("/api/v1/gallery/{$albumSlug}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', $albumSlug)
            ->assertJsonPath('data.title', 'TEST — Appellate Hearing Gallery')
            ->assertJsonPath('data.image_count', 1);

        $images = $response->json('data.images');
        $this->assertCount(1, $images);
        $this->assertEquals('Advocate addressing bench', $images[0]['caption']);

        $relatedItems = $response->json('data.related_albums');
        $this->assertNotEmpty($relatedItems);
        $this->assertEquals($related->slug, $relatedItems[0]['slug']);
    }

    public function test_public_cannot_view_draft_or_private_album(): void
    {
        $draft = GalleryAlbum::create([
            'title' => ['en' => 'Draft Album', 'bn' => 'খসড়া'],
            'slug' => 'test-draft-album-' . uniqid(),
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $private = GalleryAlbum::create([
            'title' => ['en' => 'Private Album', 'bn' => 'ব্যক্তিগত'],
            'slug' => 'test-private-album-' . uniqid(),
            'status' => 'published',
            'visibility' => 'private',
            'published_at' => now(),
        ]);

        $this->getJson("/api/v1/gallery/{$draft->slug}")
            ->assertStatus(404);

        $this->getJson("/api/v1/gallery/{$private->slug}")
            ->assertStatus(404);
    }

    public function test_public_album_detail_handles_301_redirect(): void
    {
        $oldSlug = 'test-old-album-' . uniqid();
        $targetUrl = '/gallery/test-new-album-url';

        Redirect::create([
            'source_url' => "/gallery/{$oldSlug}",
            'target_url' => $targetUrl,
            'status_code' => 301,
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/v1/gallery/{$oldSlug}");

        $response->assertStatus(301)
            ->assertHeader('Location', $targetUrl)
            ->assertJsonPath('redirect_url', $targetUrl);
    }

    public function test_private_images_within_public_album_are_not_exposed_to_public(): void
    {
        $albumSlug = 'test-mixed-album-' . uniqid();

        $album = GalleryAlbum::create([
            'title' => ['en' => 'TEST — Mixed Visibility Album', 'bn' => 'মিশ্র অ্যালবাম'],
            'slug' => $albumSlug,
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $publicImage = $album->images()->create([
            'media_id' => $this->media1->id,
            'caption' => ['en' => 'Public Chamber photo', 'bn' => 'পাবলিক ছবি'],
            'visibility' => 'public',
            'sort_order' => 1,
        ]);

        $privateImage = $album->images()->create([
            'media_id' => $this->media2->id,
            'caption' => ['en' => 'Confidential Internal photo', 'bn' => 'গোপনীয় ছবি'],
            'visibility' => 'private',
            'sort_order' => 2,
        ]);

        $response = $this->getJson("/api/v1/gallery/{$albumSlug}");

        $response->assertStatus(200)
            ->assertJsonPath('data.image_count', 1);

        $captions = collect($response->json('data.images'))->pluck('caption')->all();

        $this->assertContains('Public Chamber photo', $captions);
        $this->assertNotContains('Confidential Internal photo', $captions);
    }
}

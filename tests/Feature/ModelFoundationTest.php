<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\PracticeArea;
use App\Models\SeoMeta;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelFoundationTest extends TestCase
{
    /**
     * Test Media model creation and auto UUID assignment.
     */
    public function test_media_model_creates_with_uuid(): void
    {
        $media = Media::create([
            'disk' => 'public',
            'directory' => 'media/2026/10',
            'filename' => 'test-photo.webp',
            'original_name' => 'IMG_9684.JPG',
            'mime_type' => 'image/webp',
            'extension' => 'webp',
            'size_bytes' => 125000,
            'alt_text' => ['en' => 'Advocate in chambers', 'bn' => 'চেম্বারে এডভোকেট'],
        ]);

        $this->assertNotNull($media->uuid);
        $this->assertEquals(36, strlen($media->uuid));
        $this->assertEquals('image/webp', $media->mime_type);

        // Clean up
        $media->delete();
    }

    /**
     * Test PracticeArea status scopes.
     */
    public function test_practice_area_status_scopes(): void
    {
        $published = PracticeArea::create([
            'title' => ['en' => 'Criminal Law', 'bn' => 'ফৌজদারি আইন'],
            'slug' => 'criminal-law-test',
            'short_description' => ['en' => 'Short', 'bn' => 'সংক্ষিপ্ত'],
            'full_description' => ['en' => 'Full', 'bn' => 'বিস্তারিত'],
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        $draft = PracticeArea::create([
            'title' => ['en' => 'Draft Law', 'bn' => 'খসড়া আইন'],
            'slug' => 'draft-law-test',
            'short_description' => ['en' => 'Short', 'bn' => 'সংক্ষিপ্ত'],
            'full_description' => ['en' => 'Full', 'bn' => 'বিস্তারিত'],
            'status' => 'draft',
        ]);

        $this->assertTrue(PracticeArea::published()->where('id', $published->id)->exists());
        $this->assertFalse(PracticeArea::published()->where('id', $draft->id)->exists());
        $this->assertTrue(PracticeArea::draft()->where('id', $draft->id)->exists());

        // Clean up
        $published->forceDelete();
        $draft->forceDelete();
    }

    /**
     * Test polymorphic SEO relationship on models.
     */
    public function test_polymorphic_seo_relation(): void
    {
        $area = PracticeArea::create([
            'title' => ['en' => 'Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
            'slug' => 'constitutional-law-test',
            'short_description' => ['en' => 'Short', 'bn' => 'সংক্ষিপ্ত'],
            'full_description' => ['en' => 'Full', 'bn' => 'বিস্তারিত'],
            'status' => 'published',
        ]);

        $seo = SeoMeta::create([
            'seotable_type' => PracticeArea::class,
            'seotable_id' => $area->id,
            'seo_title' => ['en' => 'Top Constitutional Lawyer in Dhaka'],
            'meta_description' => ['en' => 'Supreme Court of Bangladesh expert constitutional counsel.'],
            'robots' => 'index, follow',
        ]);

        $this->assertNotNull($area->seo);
        $this->assertEquals('Top Constitutional Lawyer in Dhaka', $area->seo->getTranslated('seo_title'));

        // Clean up
        $seo->delete();
        $area->forceDelete();
    }
}

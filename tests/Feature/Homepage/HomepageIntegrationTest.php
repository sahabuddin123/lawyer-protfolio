<?php

namespace Tests\Feature\Homepage;

use App\Models\CourtroomExperience;
use App\Models\Credential;
use App\Models\GalleryAlbum;
use App\Models\HomepageSection;
use App\Models\JudgmentReview;
use App\Models\LegalResearch;
use App\Models\MediaAppearance;
use App\Models\MediaPress;
use App\Models\PracticeArea;
use App\Models\Profile;
use App\Models\Publication;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\Video;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class HomepageIntegrationTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;
    protected User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_hp_' . uniqid() . '@nijamuddin.com',
            'password' => bcrypt('Password123!#'),
            'is_active' => true,
        ]);
        \Spatie\Permission\Models\Role::findOrCreate('admin', 'web');
        $this->admin->assignRole('admin');

        $this->unauthorizedUser = User::create([
            'name' => 'Regular User',
            'email' => 'user_hp_' . uniqid() . '@nijamuddin.com',
            'password' => bcrypt('Password123!#'),
            'is_active' => true,
        ]);

        if (HomepageSection::count() === 0) {
            $this->seed(\Database\Seeders\CmsAndSettingsSeeder::class);
        }
    }

    public function test_homepage_api_returns_complete_hydrated_envelope(): void
    {
        $response = $this->getJson('/api/v1/home');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Homepage data retrieved successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'sections',
                    'site_settings',
                    'profile',
                    'featured_credentials',
                    'featured_practice_areas',
                    'featured_courtroom',
                    'featured_judgments',
                    'featured_research',
                    'featured_publications',
                    'featured_videos',
                    'featured_media',
                    'featured_gallery',
                    'seo' => [
                        'meta_title',
                        'meta_description',
                        'canonical_url',
                        'schema',
                    ],
                    // CamelCase aliases
                    'settings',
                    'hero',
                    'credentials',
                    'about',
                    'practiceAreas',
                    'courtroom',
                    'judgmentReviews',
                    'research',
                    'publications',
                    'videos',
                    'media',
                    'gallery',
                    'consultationCta',
                ],
            ]);
    }

    public function test_sections_are_returned_in_strict_admin_configured_order(): void
    {
        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $sections = $response->json('data.sections');
        $this->assertNotEmpty($sections);

        $previousOrder = -1;
        foreach ($sections as $section) {
            $this->assertGreaterThanOrEqual($previousOrder, $section['sort_order']);
            $this->assertTrue($section['is_enabled']);
            $previousOrder = $section['sort_order'];
        }
    }

    public function test_disabled_sections_are_excluded_from_homepage(): void
    {
        $section = HomepageSection::where('section_key', 'gallery')->first();
        if ($section) {
            $section->update(['is_enabled' => false]);
            CmsCacheService::forgetHome();

            $response = $this->getJson('/api/v1/home');
            $response->assertStatus(200);

            $sectionKeys = array_column($response->json('data.sections'), 'section_key');
            $this->assertNotContains('gallery', $sectionKeys);
        }
    }

    public function test_featured_and_published_practice_areas_are_integrated(): void
    {
        $publishedFeatured = PracticeArea::create([
            'title' => ['en' => 'Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
            'slug' => 'test-const-law-' . uniqid(),
            'short_description' => ['en' => 'High Court writs', 'bn' => 'হাইকোর্ট রিট'],
            'full_description' => ['en' => 'Full details', 'bn' => 'সম্পূর্ণ বিবরণ'],
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        $draft = PracticeArea::create([
            'title' => ['en' => 'Draft Area', 'bn' => 'ড্রাফট'],
            'slug' => 'test-draft-area-' . uniqid(),
            'short_description' => ['en' => 'Draft', 'bn' => 'ড্রাফট'],
            'full_description' => ['en' => 'Draft', 'bn' => 'ড্রাফট'],
            'status' => 'draft',
            'is_featured' => true,
            'sort_order' => 2,
        ]);

        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $slugs = array_column($response->json('data.featured_practice_areas'), 'slug');
        $this->assertContains($publishedFeatured->slug, $slugs);
        $this->assertNotContains($draft->slug, $slugs);
    }

    public function test_featured_and_public_courtroom_experiences_are_integrated(): void
    {
        $publishedPublic = CourtroomExperience::create([
            'title' => ['en' => 'State vs Landmark', 'bn' => 'রাষ্ট্র বনাম ল্যান্ডমার্ক'],
            'slug' => 'state-vs-landmark-' . uniqid(),
            'case_number' => 'Writ 101/2026',
            'court' => 'High Court Division',
            'case_type' => 'Constitutional Writ',
            'legal_area' => ['en' => 'Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
            'role' => ['en' => 'Lead Counsel', 'bn' => 'প্রধান আইনজীবী'],
            'summary' => ['en' => 'Landmark constitutional precedent', 'bn' => 'সাংবিধানিক নজির'],
            'description' => ['en' => 'Full trial background', 'bn' => 'সম্পূর্ণ বিচারিক পটভূমি'],
            'year' => 2026,
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        $privateCase = CourtroomExperience::create([
            'title' => ['en' => 'Confidential Case', 'bn' => 'গোপনীয় মামলা'],
            'slug' => 'confidential-case-' . uniqid(),
            'case_number' => 'Writ 999/2026',
            'court' => 'High Court Division',
            'case_type' => 'Commercial',
            'legal_area' => ['en' => 'Commercial Law', 'bn' => 'বাণিজ্যিক আইন'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Confidential dispute', 'bn' => 'গোপনীয় বিরোধ'],
            'description' => ['en' => 'Confidential trial background', 'bn' => 'গোপনীয় পটভূমি'],
            'year' => 2026,
            'status' => 'published',
            'visibility' => 'private',
            'is_featured' => true,
            'sort_order' => 2,
            'published_at' => now()->subDay(),
        ]);

        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $slugs = array_column($response->json('data.featured_courtroom'), 'slug');
        $this->assertContains($publishedPublic->slug, $slugs);
        $this->assertNotContains($privateCase->slug, $slugs);
    }

    public function test_featured_and_public_judgment_reviews_are_integrated(): void
    {
        $publishedReview = JudgmentReview::create([
            'case_name' => ['en' => 'ABC vs State', 'bn' => 'এবিসি বনাম রাষ্ট্র'],
            'citation' => '25 BLD (AD) 100',
            'slug' => 'abc-vs-state-' . uniqid(),
            'court' => 'Appellate Division',
            'judgment_date' => '2025-05-12',
            'summary' => ['en' => 'Detailed precedent overview', 'bn' => 'নজির বিবরণ'],
            'court_decision' => ['en' => 'Rule discharged', 'bn' => 'রুল খারিজ'],
            'author_analysis' => ['en' => 'Critical precedent set', 'bn' => 'গুরুত্বপূর্ণ নজির'],
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        $draftReview = JudgmentReview::create([
            'case_name' => ['en' => 'Draft Case', 'bn' => 'ড্রাফট মামলা'],
            'citation' => 'Draft Citation',
            'slug' => 'draft-review-' . uniqid(),
            'court' => 'High Court Division',
            'summary' => ['en' => 'Draft summary', 'bn' => 'ড্রাফট বিবরণ'],
            'court_decision' => ['en' => 'Draft decision', 'bn' => 'ড্রাফট রায়'],
            'author_analysis' => ['en' => 'Draft analysis', 'bn' => 'ড্রাফট বিশ্লেষণ'],
            'status' => 'draft',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 2,
        ]);

        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $slugs = array_column($response->json('data.featured_judgments'), 'slug');
        $this->assertContains($publishedReview->slug, $slugs);
        $this->assertNotContains($draftReview->slug, $slugs);
    }

    public function test_featured_and_public_legal_research_are_integrated(): void
    {
        $publishedResearch = LegalResearch::create([
            'title' => ['en' => 'Constitutional Supremacy Monograph', 'bn' => 'সাংবিধানিক শ্রেষ্ঠত্ব'],
            'slug' => 'const-supremacy-' . uniqid(),
            'research_type' => 'constitutional_analysis',
            'author' => ['en' => 'Advocate Nijam Uddin', 'bn' => 'এডভোকেট নিজাম উদ্দিন'],
            'excerpt' => ['en' => 'A treatise on constitutional review', 'bn' => 'সংবিধান পর্যালোচনা'],
            'content' => ['en' => 'Full constitutional treatise content', 'bn' => 'পূর্ণাঙ্গ গবেষণা প্রবন্ধ'],
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        $privateResearch = LegalResearch::create([
            'title' => ['en' => 'Internal Research Memo', 'bn' => 'অভ্যন্তরীণ মেমো'],
            'slug' => 'internal-memo-' . uniqid(),
            'research_type' => 'constitutional_analysis',
            'author' => ['en' => 'Internal Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'Internal memo', 'bn' => 'মেমো'],
            'content' => ['en' => 'Private internal contents', 'bn' => 'গোপনীয় বিষয়'],
            'status' => 'published',
            'visibility' => 'private',
            'is_featured' => true,
            'sort_order' => 2,
            'published_at' => now()->subDay(),
        ]);

        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $slugs = array_column($response->json('data.featured_research'), 'slug');
        $this->assertContains($publishedResearch->slug, $slugs);
        $this->assertNotContains($privateResearch->slug, $slugs);
    }

    public function test_featured_and_public_publications_are_integrated(): void
    {
        $publication = Publication::create([
            'title' => ['en' => 'Appellate Practice Handbook', 'bn' => 'আপিল প্র্যাকটিস হ্যান্ডবুক'],
            'slug' => 'appellate-handbook-' . uniqid(),
            'publication_type' => 'Book',
            'publication_name' => ['en' => 'Dhaka Law Publishing', 'bn' => 'ঢাকা ল পাবলিশিং'],
            'author' => ['en' => 'Advocate Nijam Uddin (Haq)', 'bn' => 'এডভোকেট নিজাম উদ্দিন (হক)'],
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $slugs = array_column($response->json('data.featured_publications'), 'slug');
        $this->assertContains($publication->slug, $slugs);
    }

    public function test_featured_and_public_videos_are_integrated(): void
    {
        $video = Video::create([
            'title' => ['en' => 'Constitutional Rights on TV', 'bn' => 'সংবিধান বিষয়ক আলোচনা'],
            'slug' => 'const-rights-tv-' . uniqid(),
            'platform' => 'youtube',
            'video_id' => 'dQw4w9WgXcQ',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'duration' => '14:20',
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $slugs = array_column($response->json('data.featured_videos'), 'slug');
        $this->assertContains($video->slug, $slugs);
    }

    public function test_featured_and_public_gallery_albums_are_integrated(): void
    {
        $album = GalleryAlbum::create([
            'title' => ['en' => 'Supreme Court Bar Ceremony', 'bn' => 'সুপ্রিম কোর্ট বার অনুষ্ঠান'],
            'slug' => 'scba-ceremony-' . uniqid(),
            'description' => ['en' => 'Ceremonial gathering', 'bn' => 'আনুষ্ঠানিক সমাবেশ'],
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $slugs = array_column($response->json('data.featured_gallery'), 'slug');
        $this->assertContains($album->slug, $slugs);
    }

    public function test_locale_switching_resolves_translations_on_homepage(): void
    {
        $responseEn = $this->withHeader('Accept-Language', 'en')->getJson('/api/v1/home');
        $responseEn->assertStatus(200);

        $responseBn = $this->withHeader('Accept-Language', 'bn')->getJson('/api/v1/home');
        $responseBn->assertStatus(200);

        $seoTitleEn = $responseEn->json('data.seo.meta_title');
        $seoTitleBn = $responseBn->json('data.seo.meta_title');

        $this->assertNotEquals($seoTitleEn, $seoTitleBn);
        $this->assertStringContainsString('Advocate', $seoTitleEn);
        $this->assertStringContainsString('এডভোকেট', $seoTitleBn);
    }

    public function test_homepage_caching_and_invalidation(): void
    {
        // 1. Initial request populates cache
        $this->getJson('/api/v1/home');
        $this->assertTrue(Cache::has(CmsCacheService::homeKey('en')));

        // 2. Cache purge on invalidation call
        CmsCacheService::forgetHome();
        $this->assertFalse(Cache::has(CmsCacheService::homeKey('en')));
    }

    public function test_unauthorized_user_cannot_reorder_or_update_homepage_sections(): void
    {
        $section = HomepageSection::first() ?? HomepageSection::create([
            'section_key' => 'hero',
            'title' => ['en' => 'Hero', 'bn' => 'হিরো'],
            'subtitle' => ['en' => 'Sub', 'bn' => 'সাব'],
            'sort_order' => 1,
            'is_enabled' => true,
        ]);

        $updateResponse = $this->actingAs($this->unauthorizedUser, 'sanctum')
            ->putJson("/api/v1/admin/homepage/sections/{$section->id}", [
                'title' => ['en' => 'Hacked', 'bn' => 'হ্যাকড'],
                'is_enabled' => false,
            ]);

        $updateResponse->assertStatus(403);
    }
}

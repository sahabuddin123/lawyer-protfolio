<?php

namespace Tests\Feature\PracticeArea;

use App\Models\PracticeArea;
use App\Services\CmsCacheService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicPracticeAreaTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        CmsCacheService::flushAll();
    }

    public function test_public_practice_areas_empty_state(): void
    {
        $response = $this->getJson('/api/v1/practice-areas?q=nonexistent-domain-xyz');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', [])
            ->assertJsonPath('meta.total', 0);
    }

    public function test_public_practice_areas_returns_published_items_only(): void
    {
        // 1. Published item
        $published = PracticeArea::create([
            'title' => ['en' => 'Constitutional & Writ Practice', 'bn' => 'সাংবিধানিক ও রিট প্র্যাকটিস'],
            'slug' => 'constitutional-writ-practice',
            'short_description' => ['en' => 'High Court Division writ petitions.', 'bn' => 'হাইকোর্ট বিভাগের রিট পিটিশন।'],
            'full_description' => ['en' => '<p>Detailed constitutional representation.</p>', 'bn' => '<p>সাংবিধানিক উপস্থাপনা।</p>'],
            'icon_name' => 'scale',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now(),
        ]);

        // 2. Draft item
        PracticeArea::create([
            'title' => ['en' => 'Draft Practice Area', 'bn' => 'খসড়া প্র্যাকটিস এরিয়া'],
            'slug' => 'draft-practice-area',
            'short_description' => ['en' => 'Draft description', 'bn' => 'খসড়া বিবরণ'],
            'full_description' => ['en' => '<p>Draft</p>', 'bn' => '<p>খসড়া</p>'],
            'status' => 'draft',
            'sort_order' => 2,
        ]);

        // 3. Archived item
        PracticeArea::create([
            'title' => ['en' => 'Archived Practice Area', 'bn' => 'সংরক্ষিত প্র্যাকটিস এরিয়া'],
            'slug' => 'archived-practice-area',
            'short_description' => ['en' => 'Archived description', 'bn' => 'সংরক্ষিত বিবরণ'],
            'full_description' => ['en' => '<p>Archived</p>', 'bn' => '<p>সংরক্ষিত</p>'],
            'status' => 'archived',
            'sort_order' => 3,
        ]);

        $response = $this->getJson('/api/v1/practice-areas?q=Constitutional+%26+Writ+Practice');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.slug', 'constitutional-writ-practice')
            ->assertJsonPath('data.0.title', 'Constitutional & Writ Practice')
            ->assertJsonPath('data.0.icon_name', 'scale')
            ->assertJsonPath('data.0.is_featured', true);

        // Verify draft and archived items are not accessible publicly
        $draftResponse = $this->getJson('/api/v1/practice-areas/draft-practice-area');
        $draftResponse->assertStatus(404);

        $archivedResponse = $this->getJson('/api/v1/practice-areas/archived-practice-area');
        $archivedResponse->assertStatus(404);
    }

    public function test_public_practice_areas_respects_locale_switching(): void
    {
        PracticeArea::create([
            'title' => ['en' => 'Maritime Litigation Domain', 'bn' => 'নৌ মোকদ্দমা ক্ষেত্র'],
            'slug' => 'maritime-litigation-domain',
            'short_description' => ['en' => 'Appellate maritime advocacy.', 'bn' => 'নৌ আপিল আইনি সহায়তা।'],
            'full_description' => ['en' => '<p>Maritime law.</p>', 'bn' => '<p>নৌ আইন।</p>'],
            'icon_name' => 'landmark',
            'status' => 'published',
            'sort_order' => 1,
            'published_at' => now(),
        ]);

        // English request
        $responseEn = $this->getJson('/api/v1/practice-areas?q=Maritime+Litigation+Domain', ['Accept-Language' => 'en']);
        $responseEn->assertStatus(200)
            ->assertJsonPath('data.0.title', 'Maritime Litigation Domain')
            ->assertJsonPath('data.0.short_description', 'Appellate maritime advocacy.');

        // Bangla request
        $responseBn = $this->getJson('/api/v1/practice-areas?q=Maritime+Litigation+Domain', ['Accept-Language' => 'bn']);
        $responseBn->assertStatus(200)
            ->assertJsonPath('data.0.title', 'নৌ মোকদ্দমা ক্ষেত্র')
            ->assertJsonPath('data.0.short_description', 'নৌ আপিল আইনি সহায়তা।');
    }

    public function test_public_practice_areas_search_and_featured_filtering(): void
    {
        PracticeArea::create([
            'title' => ['en' => 'Banking & Financial Law', 'bn' => 'ব্যাংকিং ও অর্থঋণ আইন'],
            'slug' => 'banking-financial-law',
            'short_description' => ['en' => 'Artha Rin Adalat proceedings.', 'bn' => 'অর্থঋণ আদালত সংক্রান্ত।'],
            'full_description' => ['en' => '<p>Banking.</p>', 'bn' => '<p>ব্যাংকিং।</p>'],
            'icon_name' => 'building',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now(),
        ]);

        PracticeArea::create([
            'title' => ['en' => 'Corporate Advisory Structuring', 'bn' => 'কর্পোরেট পরামর্শ কাঠামো'],
            'slug' => 'corporate-advisory-structuring',
            'short_description' => ['en' => 'Company legal structuring.', 'bn' => 'কোম্পানি আইনি কাঠামো।'],
            'full_description' => ['en' => '<p>Corporate.</p>', 'bn' => '<p>কর্পোরেট।</p>'],
            'icon_name' => 'briefcase',
            'status' => 'published',
            'is_featured' => false,
            'sort_order' => 2,
            'published_at' => now(),
        ]);

        // Search test
        $searchResponse = $this->getJson('/api/v1/practice-areas?q=Banking');
        $searchResponse->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.slug', 'banking-financial-law');

        // Search Bangla test
        $searchBnResponse = $this->getJson('/api/v1/practice-areas?q=অর্থঋণ');
        $searchBnResponse->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.slug', 'banking-financial-law');

        // Featured filter test with specific query
        $featuredResponse = $this->getJson('/api/v1/practice-areas?featured=1&q=Banking');
        $featuredResponse->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.slug', 'banking-financial-law');
    }

    public function test_public_detail_endpoint_returns_published_practice_area(): void
    {
        $area = PracticeArea::create([
            'title' => ['en' => 'Criminal Revision & Appeals', 'bn' => 'ফৌজদারি রিভিশন ও আপিল'],
            'slug' => 'criminal-revision-appeals',
            'short_description' => ['en' => 'High Court criminal petitions.', 'bn' => 'হাইকোর্ট ফৌজদারি পিটিশন।'],
            'full_description' => ['en' => '<h2>Legal Scope</h2><p>Bail applications and quashment.</p>', 'bn' => '<h2>আইনি পরিধি</h2><p>জামিন ও মামলা বাতিল।</p>'],
            'icon_name' => 'shield',
            'status' => 'published',
            'sort_order' => 1,
            'published_at' => now(),
        ]);

        $area->seo()->create([
            'seo_title' => ['en' => 'Criminal Appeals | Supreme Court of Bangladesh', 'bn' => 'ফৌজদারি আপিল | বাংলাদেশ সুপ্রিম কোর্ট'],
            'meta_description' => ['en' => 'Advocate Nijam Uddin criminal litigation.', 'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন ফৌজদারি মামলা।'],
        ]);

        $response = $this->getJson('/api/v1/practice-areas/criminal-revision-appeals');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'criminal-revision-appeals')
            ->assertJsonPath('data.title', 'Criminal Revision & Appeals')
            ->assertJsonPath('data.full_description', '<h2>Legal Scope</h2><p>Bail applications and quashment.</p>')
            ->assertJsonPath('data.seo.seo_title', 'Criminal Appeals | Supreme Court of Bangladesh');
    }

    public function test_public_detail_returns_404_for_draft_or_missing(): void
    {
        PracticeArea::create([
            'title' => ['en' => 'Private Domain', 'bn' => 'ব্যক্তিগত কার্যক্ষেত্র'],
            'slug' => 'private-domain',
            'short_description' => ['en' => 'Draft', 'bn' => 'খসড়া'],
            'full_description' => ['en' => '<p>Draft</p>', 'bn' => '<p>খসড়া</p>'],
            'status' => 'draft',
            'sort_order' => 1,
        ]);

        // Draft returns 404
        $draftResponse = $this->getJson('/api/v1/practice-areas/private-domain');
        $draftResponse->assertStatus(404);

        // Missing returns 404
        $missingResponse = $this->getJson('/api/v1/practice-areas/non-existent-area');
        $missingResponse->assertStatus(404);
    }
}

<?php

namespace Tests\Feature\Homepage;

use App\Models\HomepageSection;
use App\Models\PracticeArea;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsCacheService;
use Database\Seeders\HomepageSectionSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class HomepageSectionArchitectureTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        CmsCacheService::flushAll();

        Permission::findOrCreate('manage_homepage', 'web');
        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->givePermissionTo('manage_homepage');

        $this->adminUser = User::factory()->create([
            'is_active' => true,
        ]);
        $this->adminUser->assignRole($adminRole);

        $this->regularUser = User::factory()->create([
            'is_active' => true,
        ]);

        // Seed homepage sections if not already seeded
        if (HomepageSection::count() === 0) {
            $this->seed(HomepageSectionSeeder::class);
        }
    }

    /**
     * Test that canonical section key about_preview is present and supported.
     */
    public function test_homepage_contains_canonical_about_preview_section_with_bilingual_data(): void
    {
        CmsCacheService::forgetHome();

        // 1. Public API resolves translation for current locale
        $responseEn = $this->withHeader('Accept-Language', 'en')->getJson('/api/v1/home');
        $responseEn->assertStatus(200)
            ->assertJsonPath('success', true);

        $sectionsEn = $responseEn->json('data.sections');
        $this->assertIsArray($sectionsEn);

        $aboutPreviewEn = collect($sectionsEn)->firstWhere('section_key', 'about_preview');
        $this->assertNotNull($aboutPreviewEn, 'The canonical about_preview section key must be present in homepage sections.');
        $this->assertTrue($aboutPreviewEn['is_enabled']);
        $this->assertIsString($aboutPreviewEn['title']);
        $this->assertNotEmpty($aboutPreviewEn['title']);

        // 2. Bangla locale returns Bangla translation
        $responseBn = $this->withHeader('Accept-Language', 'bn')->getJson('/api/v1/home');
        $sectionsBn = $responseBn->json('data.sections');
        $aboutPreviewBn = collect($sectionsBn)->firstWhere('section_key', 'about_preview');
        $this->assertNotNull($aboutPreviewBn);
        $this->assertIsString($aboutPreviewBn['title']);
        $this->assertNotEmpty($aboutPreviewBn['title']);
        $this->assertNotEquals($aboutPreviewEn['title'], $aboutPreviewBn['title']);

        // 3. Admin API returns full bilingual array
        $adminRes = $this->actingAs($this->adminUser)->getJson('/api/v1/admin/homepage/sections');
        $adminRes->assertStatus(200);
        $adminSections = $adminRes->json('data');
        $adminAbout = collect($adminSections)->firstWhere('section_key', 'about_preview');
        $this->assertNotNull($adminAbout);
        $this->assertIsArray($adminAbout['title']);
        $this->assertArrayHasKey('en', $adminAbout['title']);
        $this->assertArrayHasKey('bn', $adminAbout['title']);
    }

    /**
     * Test that HomepageSectionSeeder is idempotent and never overwrites admin changes.
     */
    public function test_homepage_seeder_is_strictly_idempotent_and_preserves_admin_edits(): void
    {
        $hero = HomepageSection::firstOrCreate(
            ['section_key' => 'hero'],
            [
                'title' => ['en' => 'Default Hero', 'bn' => 'ডিফল্ট হিরো'],
                'subtitle' => ['en' => 'Default Sub', 'bn' => 'ডিফল্ট সাব'],
                'sort_order' => 1,
                'is_enabled' => true,
            ]
        );

        // Simulate an administrator updating the title
        $customTitleEn = 'Custom Admin Law Chamber ' . uniqid();
        $hero->update([
            'title' => [
                'en' => $customTitleEn,
                'bn' => 'কাস্টম এডমিন ল চেম্বার',
            ],
            'sort_order' => 99,
        ]);

        $initialCount = HomepageSection::count();

        // Re-run the seeder
        $seeder = new HomepageSectionSeeder();
        $seeder->run();

        // 1. Row count should NOT change (no duplicates)
        $this->assertEquals($initialCount, HomepageSection::count());

        // 2. Admin's custom edits must remain intact (no overwrite)
        $hero->refresh();
        $this->assertEquals($customTitleEn, $hero->title['en'] ?? null);
        $this->assertEquals(99, $hero->sort_order);
    }

    /**
     * Test that updating consultation_cta synchronizes to site_settings.global_cta and clears cache.
     */
    public function test_admin_consultation_cta_mutation_synchronizes_with_site_settings_global_cta(): void
    {
        $ctaSection = HomepageSection::firstOrCreate(
            ['section_key' => 'consultation_cta'],
            [
                'title' => ['en' => 'Need Legal Advice?', 'bn' => 'আইনি পরামর্শ প্রয়োজন?'],
                'subtitle' => ['en' => 'Contact the Chamber', 'bn' => 'চেম্বারে যোগাযোগ করুন'],
                'sort_order' => 12,
                'is_enabled' => true,
            ]
        );

        $newHeadingEn = 'Book High Court Consultation ' . uniqid();
        $payload = [
            'title' => [
                'en' => $newHeadingEn,
                'bn' => 'হাইকোর্ট পরামর্শ নির্ধারণ করুন',
            ],
            'subtitle' => [
                'en' => 'Direct guidance from Supreme Court Advocate',
                'bn' => 'সুপ্রিম কোর্ট আইনজীবীর সরাসরি দিকনির্দেশনা',
            ],
            'settings' => [
                'cta_button_text' => [
                    'en' => 'Schedule Now',
                    'bn' => 'শিডিউল করুন',
                ],
                'cta_url' => '/contact',
                'phone' => '+880 1712-345678',
            ],
            'sort_order' => 12,
            'is_enabled' => true,
        ];

        $res = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/admin/homepage/sections/{$ctaSection->id}", $payload);

        $res->assertStatus(200);

        // Verify the synchronization to SiteSetting
        $syncedSetting = SiteSetting::where('key', 'global_cta')->first();
        $this->assertNotNull($syncedSetting, 'SiteSetting global_cta must be synchronized when consultation_cta is saved.');
        $this->assertEquals($newHeadingEn, $syncedSetting->value['heading']['en'] ?? null);
        $this->assertEquals('Schedule Now', $syncedSetting->value['button_text']['en'] ?? null);
    }

    /**
     * Test that empty content modules return empty arrays without breaking envelope or crashing.
     */
    public function test_empty_modules_return_empty_collections_without_breaking_envelope(): void
    {
        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verify that even if tables are empty, the array contract is fulfilled cleanly
        $this->assertIsArray($data['featured_courtroom'] ?? []);
        $this->assertIsArray($data['featured_judgments'] ?? []);
        $this->assertIsArray($data['featured_research'] ?? []);
        $this->assertIsArray($data['featured_publications'] ?? []);
        $this->assertIsArray($data['featured_videos'] ?? []);
        $this->assertIsArray($data['featured_media'] ?? []);
        $this->assertIsArray($data['featured_gallery'] ?? []);
    }

    /**
     * Test that published practice areas are integrated and drafts are excluded.
     */
    public function test_dynamic_services_integration_on_homepage(): void
    {
        $publishedService = PracticeArea::create([
            'title' => ['en' => 'High Court Constitutional Writ', 'bn' => 'হাইকোর্ট সংবিধান রিট'],
            'slug' => 'test-writ-' . uniqid(),
            'short_description' => ['en' => 'Writ jurisdiction assistance', 'bn' => 'রিট এখতিয়ার সহায়তা'],
            'full_description' => ['en' => 'Full representation', 'bn' => 'সম্পূর্ণ উপস্থাপনা'],
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        $draftService = PracticeArea::create([
            'title' => ['en' => 'Draft Unverified Service', 'bn' => 'ড্রাফট সেবা'],
            'slug' => 'draft-service-' . uniqid(),
            'short_description' => ['en' => 'Draft only', 'bn' => 'ড্রাফট'],
            'full_description' => ['en' => 'Draft only', 'bn' => 'ড্রাফট'],
            'status' => 'draft',
            'is_featured' => true,
            'sort_order' => 2,
        ]);

        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $featuredServices = $response->json('data.featured_practice_areas');
        $slugs = array_column($featuredServices, 'slug');

        $this->assertContains($publishedService->slug, $slugs);
        $this->assertNotContains($draftService->slug, $slugs);
    }

    /**
     * Test that unauthorized users cannot mutate homepage sections.
     */
    public function test_unauthorized_user_cannot_mutate_homepage_sections(): void
    {
        $section = HomepageSection::first();

        // 1. Guest request
        $guestRes = $this->putJson("/api/v1/admin/homepage/sections/{$section->id}", [
            'title' => ['en' => 'Hacked', 'bn' => 'হ্যাকড'],
        ]);
        $guestRes->assertStatus(401);

        // 2. Regular user without permissions
        $userRes = $this->actingAs($this->regularUser)
            ->putJson("/api/v1/admin/homepage/sections/{$section->id}", [
                'title' => ['en' => 'Hacked', 'bn' => 'হ্যাকড'],
            ]);
        $userRes->assertStatus(403);
    }
}

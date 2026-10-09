<?php

namespace Tests\Feature\Homepage;

use App\Models\CourtroomExperience;
use App\Models\HomepageSection;
use App\Models\PracticeArea;
use App\Models\Publication;
use App\Models\User;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class HomepageE2ELifecycleTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::findOrCreate('manage_homepage', 'web');
        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->givePermissionTo('manage_homepage');

        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole($adminRole);
    }

    public function test_complete_homepage_e2e_lifecycle(): void
    {
        // -------------------------------------------------------------
        // FLOW 1: Open Initial Homepage & Verify Envelope
        // -------------------------------------------------------------
        $initialRes = $this->getJson('/api/v1/home');
        $initialRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'settings',
                    'sections',
                    'hero',
                    'credentials',
                    'about',
                    'practice_areas',
                    'courtroom',
                    'judgment_reviews',
                    'research',
                    'publications',
                    'videos',
                    'media',
                    'gallery',
                    'consultation_cta',
                    'seo',
                    'structured_data',
                ],
            ]);

        // -------------------------------------------------------------
        // FLOW 2: Admin Changes Section Order via CMS Admin API
        // -------------------------------------------------------------
        $sections = HomepageSection::all();
        $this->assertNotEmpty($sections);

        $reorderPayload = [
            'sections' => [
                ['id' => $sections->where('section_key', 'practice_areas')->first()?->id ?? 1, 'sort_order' => 1],
                ['id' => $sections->where('section_key', 'hero')->first()?->id ?? 2, 'sort_order' => 2],
            ],
        ];

        $reorderRes = $this->actingAs($this->adminUser)->postJson('/api/v1/admin/homepage/sections/reorder', $reorderPayload);
        $reorderRes->assertStatus(200);

        // Verify public home reflects updated order
        $afterReorderRes = $this->getJson('/api/v1/home');
        $afterReorderRes->assertStatus(200);

        $orderedKeys = array_column($afterReorderRes->json('data.sections'), 'section_key');
        $paIndex = array_search('practice_areas', $orderedKeys);
        $heroIndex = array_search('hero', $orderedKeys);
        if ($paIndex !== false && $heroIndex !== false) {
            $this->assertLessThan($heroIndex, $paIndex);
        }

        // -------------------------------------------------------------
        // FLOW 3: Admin Disables a Section
        // -------------------------------------------------------------
        $videosSection = HomepageSection::where('section_key', 'videos')->first();
        if ($videosSection) {
            $disableRes = $this->actingAs($this->adminUser)->putJson("/api/v1/admin/homepage/sections/{$videosSection->id}", [
                'title' => $videosSection->getTranslations('title'),
                'is_enabled' => false,
            ]);
            $disableRes->assertStatus(200);

            // Public home MUST exclude disabled section
            $afterDisableRes = $this->getJson('/api/v1/home');
            $afterDisableRes->assertStatus(200);
            $disabledKeys = array_column($afterDisableRes->json('data.sections'), 'section_key');
            $this->assertNotContains('videos', $disabledKeys);
        }

        // -------------------------------------------------------------
        // FLOW 4: Admin Marks Content Featured & Published -> Appears
        // -------------------------------------------------------------
        $testArea = PracticeArea::create([
            'title' => ['en' => 'E2E Constitutional Writ Practice', 'bn' => 'ই২ই সাংবিধানিক রিট'],
            'slug' => 'e2e-constitutional-writ-' . uniqid(),
            'short_description' => ['en' => 'Top tier appellate writ advocacy', 'bn' => 'শীর্ষ রিট আইনি সহায়তা'],
            'full_description' => ['en' => 'Full details', 'bn' => 'সম্পূর্ণ বিবরণ'],
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subMinute(),
        ]);

        CmsCacheService::forgetHome();

        $withFeaturedRes = $this->getJson('/api/v1/home');
        $withFeaturedRes->assertStatus(200);
        $featuredSlugs = array_column($withFeaturedRes->json('data.featured_practice_areas'), 'slug');
        $this->assertContains($testArea->slug, $featuredSlugs);

        // -------------------------------------------------------------
        // FLOW 5: Admin Unpublishes Content -> Disappears Instantly
        // -------------------------------------------------------------
        $testArea->update(['status' => 'draft']);
        CmsCacheService::forgetHome();

        $afterDraftRes = $this->getJson('/api/v1/home');
        $afterDraftRes->assertStatus(200);
        $draftSlugs = array_column($afterDraftRes->json('data.featured_practice_areas'), 'slug');
        $this->assertNotContains($testArea->slug, $draftSlugs);

        // -------------------------------------------------------------
        // FLOW 6: Switch English -> Bangla Translation
        // -------------------------------------------------------------
        $bnRes = $this->withHeaders(['Accept-Language' => 'bn'])->getJson('/api/v1/home');
        $bnRes->assertStatus(200);
        $bnProfileName = $bnRes->json('data.profile.name') ?? $bnRes->json('data.about.name');
        $this->assertNotEmpty($bnProfileName);
        $this->assertNotEmpty($bnRes->json('data.hero.title'));

        // -------------------------------------------------------------
        // FLOW 7: Strict Privacy & Draft Content Safety
        // -------------------------------------------------------------
        $privateCase = CourtroomExperience::create([
            'title' => ['en' => 'Top Secret Case', 'bn' => 'অতি গোপনীয় মামলা'],
            'slug' => 'top-secret-case-' . uniqid(),
            'case_number' => 'Priv 007/2026',
            'court' => 'In Camera Chamber',
            'case_type' => 'Classified',
            'legal_area' => ['en' => 'Special', 'bn' => 'বিশেষ'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Strictly private case summary', 'bn' => 'গোপনীয় বিবরণ'],
            'description' => ['en' => 'Private case background', 'bn' => 'গোপনীয় পটভূমি'],
            'year' => 2026,
            'status' => 'published',
            'visibility' => 'private',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        $draftPublication = Publication::create([
            'title' => ['en' => 'Unreleased Treatise On Torts', 'bn' => 'অপ্রকাশিত গ্রন্থ'],
            'slug' => 'unreleased-treatise-' . uniqid(),
            'publication_type' => 'book',
            'author' => ['en' => 'Advocate Nijam Uddin', 'bn' => 'এডভোকেট নিজাম উদ্দিন'],
            'publication_name' => ['en' => 'Law Press', 'bn' => 'ল প্রেস'],
            'excerpt' => ['en' => 'Draft unreleased publication', 'bn' => 'অপ্রকাশিত খসড়া'],
            'status' => 'draft',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        CmsCacheService::forgetHome();

        $safetyRes = $this->getJson('/api/v1/home');
        $safetyRes->assertStatus(200);

        $courtroomSlugs = array_column($safetyRes->json('data.featured_courtroom'), 'slug');
        $this->assertNotContains($privateCase->slug, $courtroomSlugs);

        $pubSlugs = array_column($safetyRes->json('data.featured_publications'), 'slug');
        $this->assertNotContains($draftPublication->slug, $pubSlugs);

        // -------------------------------------------------------------
        // FLOW 8: Schema.org JSON-LD Structured Data Graph
        // -------------------------------------------------------------
        $schemaGraph = $safetyRes->json('data.structured_data.@graph');
        $this->assertIsArray($schemaGraph);
        $types = array_column($schemaGraph, '@type');
        $this->assertContains('Person', $types);
        $this->assertContains('LegalService', $types);
    }
}

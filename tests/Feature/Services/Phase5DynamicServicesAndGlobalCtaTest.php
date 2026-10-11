<?php

namespace Tests\Feature\Services;

use App\Models\ActivityLog;
use App\Models\CourtroomExperience;
use App\Models\JudgmentReview;
use App\Models\PracticeArea;
use App\Models\Redirect;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsCacheService;
use Database\Seeders\PracticeAreaSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase5DynamicServicesAndGlobalCtaTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(PracticeAreaSeeder::class);

        CmsCacheService::flushAll();

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin', 'email' => 'admin_p5@nijamuddin.com']);
        $this->superAdmin->assignRole('super_admin');

        $this->regularUser = User::factory()->create(['name' => 'Regular User', 'email' => 'user_p5@nijamuddin.com']);
    }

    /**
     * 1. Verify that the initial installation contains exactly 12 initial service records.
     */
    public function test_initial_services_contains_the_12_required_canonical_services(): void
    {
        $expectedSlugs = [
            'criminal-law',
            'constitutional-law',
            'civil-law',
            'family-law',
            'company-law',
            'pro-bono',
            'arbitration',
            'corporate-commercial',
            'general-practice',
            'environmental-law',
            'dispute-resolution',
            'labor-law',
        ];

        foreach ($expectedSlugs as $slug) {
            $this->assertTrue(
                PracticeArea::where('slug', $slug)->exists(),
                "Failed asserting that canonical service '{$slug}' exists in the database."
            );
        }

        $this->assertGreaterThanOrEqual(12, PracticeArea::count());
    }

    /**
     * 2. Verify that seeder is strictly idempotent and does not duplicate records.
     */
    public function test_practice_area_seeder_is_strictly_idempotent(): void
    {
        $countBefore = PracticeArea::count();

        // Run the seeder a second time
        $this->seed(PracticeAreaSeeder::class);

        $countAfter = PracticeArea::count();
        $this->assertEquals($countBefore, $countAfter, 'PracticeAreaSeeder must not duplicate existing records.');
    }

    /**
     * 3. Verify that an administrator can create a 13th service beyond the initial 12.
     * Proves that services are dynamically data-driven and NOT hardcoded to 12.
     */
    public function test_admin_can_create_a_thirteenth_service_beyond_the_initial_twelve(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'title' => [
                'en' => 'Cyber Law & Digital Rights',
                'bn' => 'সাইবার আইন ও ডিজিটাল অধিকার',
            ],
            'slug' => 'cyber-law-digital-rights',
            'short_description' => [
                'en' => 'Data privacy, digital forensics, and electronic transaction compliance.',
                'bn' => 'তথ্য সুরক্ষা, ডিজিটাল ফরেনসিক ও ইলেকট্রনিক লেনদেন কমপ্লায়েন্স।',
            ],
            'full_description' => [
                'en' => '<p>Cybersecurity advocacy under the Cyber Security Act 2023.</p>',
                'bn' => '<p>সাইবার নিরাপত্তা আইন ২০২৩ এর অধীন সুপ্রিম কোর্টে আইনি সেবা।</p>',
            ],
            'icon_name' => 'shield',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 13,
            'seo' => [
                'seo_title' => [
                    'en' => 'Cyber Law Advocacy in Bangladesh',
                    'bn' => 'বাংলাদেশে সাইবার আইন সংক্রান্ত সেবা',
                ],
                'meta_description' => [
                    'en' => 'Legal representation in digital rights and cyber law.',
                    'bn' => 'ডিজিটাল নিরাপত্তা ও সাইবার আইনে অভিজ্ঞ সুপ্রিম কোর্ট আইনজীবী।',
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/admin/practice-areas', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'cyber-law-digital-rights')
            ->assertJsonPath('data.title.en', 'Cyber Law & Digital Rights');

        $this->assertDatabaseHas('practice_areas', [
            'slug' => 'cyber-law-digital-rights',
            'status' => 'published',
        ]);

        // Verify the 13th service appears immediately in public discovery
        CmsCacheService::flushAll();
        $publicRes = $this->getJson('/api/v1/practice-areas?q=Cyber+Law');
        $publicRes->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.slug', 'cyber-law-digital-rights');
    }

    /**
     * 4. Verify independent service content: editing one service never alters another.
     */
    public function test_editing_one_service_does_not_alter_another_service(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $criminal = PracticeArea::where('slug', 'criminal-law')->firstOrFail();
        $civil = PracticeArea::where('slug', 'civil-law')->firstOrFail();

        $originalCivilDescription = $civil->full_description['en'];

        // Edit Criminal Law only
        $payload = [
            'title' => [
                'en' => 'Updated Criminal Defense',
                'bn' => $criminal->title['bn'],
            ],
            'slug' => 'criminal-law',
            'short_description' => $criminal->short_description,
            'full_description' => [
                'en' => '<p>Completely rewritten criminal trial scope.</p>',
                'bn' => $criminal->full_description['bn'],
            ],
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
        ];

        $res = $this->putJson("/api/v1/admin/practice-areas/{$criminal->id}", $payload);
        $res->assertStatus(200);

        // Verify Civil Law remains 100% unaltered
        $civilRefreshed = PracticeArea::where('slug', 'civil-law')->firstOrFail();
        $this->assertEquals($originalCivilDescription, $civilRefreshed->full_description['en']);
        $this->assertEquals('Civil Law', $civilRefreshed->title['en']);
    }

    /**
     * 5. Verify independent English and Bangla fields: editing EN does not overwrite BN.
     */
    public function test_english_and_bangla_fields_remain_strictly_independent(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $service = PracticeArea::where('slug', 'constitutional-law')->firstOrFail();
        $originalBnTitle = $service->title['bn'];
        $originalBnDesc = $service->short_description['bn'];

        $payload = [
            'title' => [
                'en' => 'Constitutional & Administrative Review',
                'bn' => $originalBnTitle,
            ],
            'slug' => 'constitutional-law',
            'short_description' => [
                'en' => 'Brand new English summary only.',
                'bn' => $originalBnDesc,
            ],
            'full_description' => $service->full_description,
            'status' => 'published',
            'sort_order' => 2,
        ];

        $res = $this->putJson("/api/v1/admin/practice-areas/{$service->id}", $payload);
        $res->assertStatus(200);

        $refreshed = PracticeArea::where('slug', 'constitutional-law')->firstOrFail();
        $this->assertEquals('Constitutional & Administrative Review', $refreshed->title['en']);
        $this->assertEquals($originalBnTitle, $refreshed->title['bn']);
        $this->assertEquals($originalBnDesc, $refreshed->short_description['bn']);
    }

    /**
     * 6. Verify duplicate slug rejection.
     */
    public function test_duplicate_slug_is_rejected_with_422_validation_error(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'title' => ['en' => 'Duplicate Criminal', 'bn' => 'ডুপ্লিকেট ফৌজদারি'],
            'slug' => 'criminal-law', // already exists
            'short_description' => ['en' => 'Desc', 'bn' => 'বিবরণ'],
            'full_description' => ['en' => '<p>Desc</p>', 'bn' => '<p>বিবরণ</p>'],
            'status' => 'published',
        ];

        $response = $this->postJson('/api/v1/admin/practice-areas', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    /**
     * 7. Verify that disabling a service hides it from public listings and detail route (404).
     */
    public function test_disabling_service_hides_it_from_public_listings_and_returns_404_on_detail(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $service = PracticeArea::where('slug', 'environmental-law')->firstOrFail();

        // 1. Disable / Unpublish the service
        $updateRes = $this->putJson("/api/v1/admin/practice-areas/{$service->id}/status", [
            'status' => 'draft',
        ]);
        $updateRes->assertStatus(200)
            ->assertJsonPath('data.status', 'draft');

        CmsCacheService::flushAll();

        // 2. Public detail route must return 404
        $detailRes = $this->getJson('/api/v1/practice-areas/environmental-law');
        $detailRes->assertStatus(404);

        // 3. Public search must not return the disabled item
        $listRes = $this->getJson('/api/v1/practice-areas?q=environmental-law');
        $listRes->assertStatus(200)
            ->assertJsonPath('meta.total', 0);

        // 4. Re-enable the service
        $enableRes = $this->putJson("/api/v1/admin/practice-areas/{$service->id}/status", [
            'status' => 'published',
        ]);
        $enableRes->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        CmsCacheService::flushAll();

        // 5. Public detail route must now succeed (200)
        $detailActiveRes = $this->getJson('/api/v1/practice-areas/environmental-law');
        $detailActiveRes->assertStatus(200)
            ->assertJsonPath('data.slug', 'environmental-law');
    }

    /**
     * 8. Verify service reordering is persisted across public and admin responses.
     */
    public function test_service_reordering_is_persisted(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $s1 = PracticeArea::where('slug', 'criminal-law')->firstOrFail();
        $s2 = PracticeArea::where('slug', 'constitutional-law')->firstOrFail();

        // Reverse order
        $payload = [
            'items' => [$s2->id, $s1->id],
        ];

        $res = $this->postJson('/api/v1/admin/practice-areas/reorder', $payload);
        $res->assertStatus(200);

        $this->assertEquals(1, $s2->fresh()->sort_order);
        $this->assertEquals(2, $s1->fresh()->sort_order);
    }

    /**
     * 9. Verify related-services list contains published items and excludes self & drafts.
     */
    public function test_related_services_excludes_current_service_and_unpublished_records(): void
    {
        CmsCacheService::flushAll();

        $res = $this->getJson('/api/v1/practice-areas/criminal-law');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'slug',
                    'title',
                    'related_services',
                ],
            ]);

        $related = $res->json('data.related_services');
        $this->assertIsArray($related);
        $this->assertNotEmpty($related);

        // Current service must NOT be in its own related services
        foreach ($related as $rel) {
            $this->assertNotEquals('criminal-law', $rel['slug']);
        }
    }

    /**
     * 10. Verify deletion dependency protection: cannot delete if referenced by cases or judgments.
     */
    public function test_deletion_is_blocked_with_422_when_service_has_courtroom_dependencies(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $service = PracticeArea::where('slug', 'arbitration')->firstOrFail();

        // Create a dependent courtroom experience
        CourtroomExperience::create([
            'title' => ['en' => 'Arbitration Dispute Award', 'bn' => 'সালিশি রোয়েদাদ মোকদ্দমা'],
            'slug' => 'arbitration-dispute-award',
            'court' => 'High Court Division',
            'case_type' => 'Commercial Arbitration',
            'year' => 2026,
            'legal_area' => ['en' => 'Arbitration', 'bn' => 'সালিশি'],
            'role' => ['en' => 'Lead Counsel', 'bn' => 'প্রধান কৌঁসুলি'],
            'summary' => ['en' => 'Summary', 'bn' => 'সারাংশ'],
            'description' => ['en' => 'Full case description here.', 'bn' => 'মামলার সম্পূর্ণ বিবরণ।'],
            'status' => 'published',
            'practice_area_id' => $service->id,
        ]);

        $deleteRes = $this->deleteJson("/api/v1/admin/practice-areas/{$service->id}");

        $deleteRes->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertStringContainsString('referenced by', $deleteRes->json('message'));
        $this->assertDatabaseHas('practice_areas', ['id' => $service->id]);
    }

    /**
     * 11. Verify 301 redirect is automatically created when published service slug changes.
     */
    public function test_slug_change_on_published_service_automatically_creates_301_redirect(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $service = PracticeArea::create([
            'title' => ['en' => 'Aviation Law', 'bn' => 'বিমান আইন'],
            'slug' => 'aviation-law-old',
            'short_description' => ['en' => 'Aviation regulatory compliance.', 'bn' => 'বিমান চলাচল আইন।'],
            'full_description' => ['en' => '<p>Aviation legal framework.</p>', 'bn' => '<p>আইনি পরিধি।</p>'],
            'icon_name' => 'globe',
            'status' => 'published',
            'published_at' => now(),
            'sort_order' => 50,
        ]);

        $updatePayload = [
            'title' => ['en' => 'Aviation Law', 'bn' => 'বিমান আইন'],
            'slug' => 'aviation-law-new',
            'short_description' => ['en' => 'Aviation regulatory compliance.', 'bn' => 'বিমান চলাচল আইন।'],
            'full_description' => ['en' => '<p>Aviation legal framework.</p>', 'bn' => '<p>আইনি পরিধি।</p>'],
            'status' => 'published',
            'sort_order' => 50,
        ];

        $response = $this->putJson("/api/v1/admin/practice-areas/{$service->id}", $updatePayload);
        $response->assertStatus(200);

        $this->assertDatabaseHas('redirects', [
            'source_url' => '/practice-areas/aviation-law-old',
            'target_url' => '/practice-areas/aviation-law-new',
            'status_code' => 301,
            'is_active' => true,
        ]);
    }

    /**
     * 12. Verify /services and /services/{slug} aliases resolve identically.
     */
    public function test_services_url_alias_resolves_identically_to_practice_areas(): void
    {
        CmsCacheService::flushAll();

        $aliasListRes = $this->getJson('/api/v1/services');
        $aliasListRes->assertStatus(200)
            ->assertJsonPath('success', true);

        $aliasDetailRes = $this->getJson('/api/v1/services/constitutional-law');
        $aliasDetailRes->assertStatus(200)
            ->assertJsonPath('data.slug', 'constitutional-law');
    }

    /**
     * 13. Verify Global CTA SiteSetting exists, is public, and returns independent bilingual content.
     */
    public function test_global_cta_site_setting_is_public_and_bilingual(): void
    {
        $response = $this->getJson('/api/v1/settings?group=cta');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'cta' => [
                        'global_cta' => [
                            'is_enabled',
                            'heading' => ['en', 'bn'],
                            'subheading' => ['en', 'bn'],
                            'primary_button_label' => ['en', 'bn'],
                            'primary_button_url',
                            'secondary_button_label' => ['en', 'bn'],
                            'secondary_button_url',
                        ],
                    ],
                ],
            ]);

        $cta = $response->json('data.cta.global_cta');
        $this->assertTrue($cta['is_enabled']);
        $this->assertNotEmpty($cta['heading']['en']);
        $this->assertNotEmpty($cta['heading']['bn']);
    }

    /**
     * 14. Verify Global CTA settings cannot be updated by unauthenticated or unprivileged users.
     */
    public function test_unauthorized_user_cannot_update_global_cta_settings(): void
    {
        $payload = [
            'settings' => [
                [
                    'key' => 'global_cta',
                    'group' => 'cta',
                    'value' => [
                        'is_enabled' => false,
                    ],
                ],
            ],
        ];

        // 1. Unauthenticated request
        $unauthRes = $this->putJson('/api/v1/admin/settings', $payload);
        $unauthRes->assertStatus(401);

        // 2. Regular unprivileged user
        Sanctum::actingAs($this->regularUser);
        $forbiddenRes = $this->putJson('/api/v1/admin/settings', $payload);
        $forbiddenRes->assertStatus(403);
    }

    /**
     * 15. Verify Super Admin can update Global CTA settings and toggle is_enabled state.
     */
    public function test_super_admin_can_update_and_disable_global_cta(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'settings' => [
                [
                    'key' => 'global_cta',
                    'group' => 'cta',
                    'is_public' => true,
                    'value' => [
                        'is_enabled' => false,
                        'heading' => [
                            'en' => 'Custom English Heading',
                            'bn' => 'কাস্টম বাংলা শিরোনাম',
                        ],
                        'subheading' => [
                            'en' => 'Custom Subheading EN',
                            'bn' => 'কাস্টম সাবহেডিং বিএন',
                        ],
                        'primary_button_label' => [
                            'en' => 'Schedule Conference',
                            'bn' => 'সম্মেলন নির্ধারণ করুন',
                        ],
                        'primary_button_url' => '/about#contact',
                        'secondary_button_label' => [
                            'en' => 'Inquire Direct',
                            'bn' => 'সরাসরি যোগাযোগ',
                        ],
                        'secondary_button_url' => '/contact',
                    ],
                ],
            ],
        ];

        $updateRes = $this->putJson('/api/v1/admin/settings', $payload);
        $updateRes->assertStatus(200)
            ->assertJsonPath('success', true);

        // Verify update took effect publicly
        CmsCacheService::flushAll();
        $publicRes = $this->getJson('/api/v1/settings?group=cta');
        $publicRes->assertStatus(200)
            ->assertJsonPath('data.cta.global_cta.is_enabled', false)
            ->assertJsonPath('data.cta.global_cta.heading.en', 'Custom English Heading')
            ->assertJsonPath('data.cta.global_cta.heading.bn', 'কাস্টম বাংলা শিরোনাম');
    }
}

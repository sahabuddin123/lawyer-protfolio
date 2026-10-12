<?php

namespace Tests\Feature\Cms;

use App\Models\FooterRevision;
use App\Models\FooterTemplate;
use App\Models\User;
use App\Services\CmsCacheService;
use App\Services\FooterBuilderService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class FooterBuilderTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();
        $this->seedRolesAndPermissions();

        // Create an admin user with manage_settings
        $this->adminUser = User::create([
            'name' => 'Admin Officer',
            'email' => 'admin_footer_' . uniqid() . '@nijamuddin.com',
            'password' => bcrypt('AdminPassword123!#'),
            'is_active' => true,
        ]);
        $this->adminUser->assignRole('super_admin');

        // Create regular user without permissions
        $this->regularUser = User::create([
            'name' => 'Normal User',
            'email' => 'regular_' . uniqid() . '@nijamuddin.com',
            'password' => bcrypt('UserPassword123!#'),
            'is_active' => true,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_footer_builder_api(): void
    {
        $response = $this->getJson('/api/v1/admin/footer-builder/templates');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        $response = $this->actingAs($this->regularUser, 'sanctum')
            ->getJson('/api/v1/admin/footer-builder/templates');
        $response->assertStatus(403);
    }

    public function test_authorized_admin_can_list_templates(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/footer-builder/templates');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_authorized_admin_can_create_template(): void
    {
        $payload = [
            'name' => 'Corporate Legal Footer',
            'slug' => 'corporate-legal-' . uniqid(),
            'display_conditions' => ['type' => 'all_pages'],
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/footer-builder/templates', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Corporate Legal Footer')
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('footer_templates', [
            'name' => 'Corporate Legal Footer',
            'status' => 'draft',
        ]);
    }

    public function test_authorized_admin_can_save_draft_without_affecting_published_footer(): void
    {
        $footerService = app(FooterBuilderService::class);
        $defaultLayout = $footerService->getDefaultInstitutionalLayout();

        FooterTemplate::query()->update(['is_active' => false]);

        // Create published active template
        $activeTemplate = FooterTemplate::create([
            'name' => 'Active Footer',
            'slug' => 'active-footer-' . uniqid(),
            'status' => 'published',
            'is_active' => true,
            'layout_data' => $defaultLayout,
        ]);

        // Create draft template
        $draftTemplate = FooterTemplate::create([
            'name' => 'New Redesign',
            'slug' => 'redesign-' . uniqid(),
            'status' => 'draft',
            'is_active' => false,
            'layout_data' => $defaultLayout,
        ]);

        // Update draft with changed content
        $modifiedLayout = $defaultLayout;
        $modifiedLayout['rows'][0]['columns'][0]['elements'][0]['content']['lawyer_name']['en'] = 'DRAFT MODIFICATION LAWYER';

        $updateResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/admin/footer-builder/templates/{$draftTemplate->id}", [
                'layout_data' => $modifiedLayout,
            ]);

        $updateResponse->assertStatus(200);

        // Verify draft template is updated in DB
        $draftTemplate->refresh();
        $this->assertEquals(
            'DRAFT MODIFICATION LAWYER',
            $draftTemplate->layout_data['rows'][0]['columns'][0]['elements'][0]['content']['lawyer_name']['en']
        );

        // Check public endpoint — it MUST still return the active template without draft changes
        $publicResponse = $this->getJson('/api/v1/footer');
        $publicResponse->assertStatus(200);
        $publicData = $publicResponse->json('data');

        $this->assertEquals($activeTemplate->slug, $publicData['slug']);
        $this->assertNotEquals(
            'DRAFT MODIFICATION LAWYER',
            $publicData['layout']['rows'][0]['columns'][0]['elements'][0]['content']['lawyer_name']['en'] ?? null
        );
    }

    public function test_authorized_admin_can_publish_template_atomically(): void
    {
        $footerService = app(FooterBuilderService::class);
        $defaultLayout = $footerService->getDefaultInstitutionalLayout();

        $oldActive = FooterTemplate::create([
            'name' => 'Old Active',
            'slug' => 'old-active-' . uniqid(),
            'status' => 'published',
            'is_active' => true,
            'layout_data' => $defaultLayout,
        ]);

        $newCandidate = FooterTemplate::create([
            'name' => 'New Candidate',
            'slug' => 'new-candidate-' . uniqid(),
            'status' => 'draft',
            'is_active' => false,
            'layout_data' => $defaultLayout,
        ]);

        $publishResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/footer-builder/templates/{$newCandidate->id}/publish", [
                'change_summary' => 'Launched modern redesign v2',
            ]);

        $publishResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.is_active', true);

        // Verify atomicity: old active is now inactive
        $oldActive->refresh();
        $this->assertFalse($oldActive->is_active);

        // Verify revision was created
        $this->assertDatabaseHas('footer_revisions', [
            'footer_template_id' => $newCandidate->id,
            'version' => 1,
            'change_summary' => 'Launched modern redesign v2',
        ]);
    }

    public function test_authorized_admin_can_restore_revision(): void
    {
        $footerService = app(FooterBuilderService::class);
        $defaultLayout = $footerService->getDefaultInstitutionalLayout();

        $template = FooterTemplate::create([
            'name' => 'Versioned Template',
            'slug' => 'versioned-' . uniqid(),
            'status' => 'published',
            'is_active' => true,
            'layout_data' => $defaultLayout,
        ]);

        // Create revision 1 with original name
        $rev1 = FooterRevision::create([
            'footer_template_id' => $template->id,
            'version' => 1,
            'layout_data' => $defaultLayout,
            'change_summary' => 'Original layout',
            'created_at' => now(),
        ]);

        // Mutate template layout
        $mutatedLayout = $defaultLayout;
        $mutatedLayout['rows'][0]['columns'][0]['elements'][0]['content']['lawyer_name']['en'] = 'MUTATED NAME';
        $template->update(['layout_data' => $mutatedLayout]);

        // Restore revision 1
        $restoreResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/footer-builder/templates/{$template->id}/revisions/{$rev1->id}/restore");

        $restoreResponse->assertStatus(200);

        $template->refresh();
        $this->assertEquals(
            'Nijam Uddin (Haq)',
            $template->layout_data['rows'][0]['columns'][0]['elements'][0]['content']['lawyer_name']['en']
        );
    }

    public function test_cannot_delete_active_template(): void
    {
        $template = FooterTemplate::create([
            'name' => 'Protected Active',
            'slug' => 'protected-active-' . uniqid(),
            'status' => 'published',
            'is_active' => true,
            'layout_data' => ['rows' => []],
        ]);

        $deleteResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/footer-builder/templates/{$template->id}");

        $deleteResponse->assertStatus(422);
    }

    public function test_dangerous_script_and_javascript_urls_are_sanitized(): void
    {
        $maliciousLayout = [
            'rows' => [
                [
                    'id' => 'row_hack',
                    'columns' => [
                        [
                            'id' => 'col_hack',
                            'span' => 12,
                            'elements' => [
                                [
                                    'id' => 'el_hack',
                                    'type' => 'paragraph',
                                    'content' => [
                                        'text' => [
                                            'en' => 'Normal text <script>alert("xss")</script>',
                                            'bn' => 'বাংলা <img src="x" onerror="alert(1)">',
                                        ],
                                        'url' => 'javascript:alert("pwned")',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $template = FooterTemplate::create([
            'name' => 'Sanitize Test',
            'slug' => 'sanitize-test-' . uniqid(),
            'status' => 'draft',
            'is_active' => false,
            'layout_data' => ['rows' => []],
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/admin/footer-builder/templates/{$template->id}", [
                'layout_data' => $maliciousLayout,
            ]);

        $response->assertStatus(200);

        $template->refresh();
        $savedContent = $template->layout_data['rows'][0]['columns'][0]['elements'][0]['content'];

        $this->assertStringNotContainsString('<script>', $savedContent['text']['en']);
        $this->assertStringNotContainsString('onerror', $savedContent['text']['bn']);
        $this->assertEquals('#', $savedContent['url']);
    }

    public function test_canonical_data_sources_endpoint_flags_placeholder_phone(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/footer-builder/canonical-data');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'identity',
                    'chambers',
                    'contacts' => ['phone', 'email', 'is_phone_placeholder'],
                    'social_profiles',
                    'menus',
                    'pages',
                    'practice_areas',
                ],
            ]);

        // Verifies Supreme Court Chamber & Chattogram Chamber are present
        $chambers = $response->json('data.chambers');
        $this->assertCount(2, $chambers);
        $this->assertEquals('Supreme Court Chamber', $chambers[0]['name']['en']);
        $this->assertEquals('Chattogram Chamber', $chambers[1]['name']['en']);
    }
}

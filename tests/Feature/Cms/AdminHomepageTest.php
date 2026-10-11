<?php

namespace Tests\Feature\Cms;

use App\Models\HomepageSection;
use App\Models\User;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminHomepageTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();
        $this->seedRolesAndPermissions();
        $this->seedCmsFixtures();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_home@nijamuddin.com',
            'password' => bcrypt('Password123!#'),
            'is_active' => true,
        ]);
        $this->admin->assignRole('admin');
    }

    public function test_admin_can_update_homepage_section(): void
    {
        $section = HomepageSection::where('section_key', 'hero')->first();

        $updatePayload = [
            'title' => [
                'en' => 'Advocate Nijam Uddin (Haq) — Senior Advocate',
                'bn' => 'এডভোকেট নিজাম উদ্দিন (হক) — সিনিয়র আইনজীবী',
            ],
            'subtitle' => [
                'en' => 'Supreme Court of Bangladesh',
                'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট',
            ],
            'content' => [
                'en' => 'Updated hero content.',
                'bn' => 'হিরো কনটেন্ট হালনাগাদ।',
            ],
            'settings' => [
                'show_cta' => true,
                'cta_label' => ['en' => 'Schedule Today', 'bn' => 'আজই বুক করুন'],
            ],
            'is_enabled' => true,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/admin/homepage/sections/{$section->id}", $updatePayload);
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'section_key' => 'hero',
                ],
            ]);

        $this->assertEquals('Advocate Nijam Uddin (Haq) — Senior Advocate', $section->fresh()->title['en']);
    }

    public function test_admin_can_reorder_homepage_sections(): void
    {
        $sections = HomepageSection::take(2)->get();

        $reorderPayload = [
            'sections' => [
                ['id' => $sections[0]->id, 'sort_order' => 20],
                ['id' => $sections[1]->id, 'sort_order' => 10],
            ],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/homepage/sections/reorder', $reorderPayload);
        $response->assertStatus(200);

        $this->assertEquals(20, $sections[0]->fresh()->sort_order);
        $this->assertEquals(10, $sections[1]->fresh()->sort_order);
    }

    public function test_admin_can_create_homepage_section(): void
    {
        $payload = [
            'section_key' => 'new_preview_section',
            'title' => [
                'en' => 'Chamber Accolades',
                'bn' => 'চেম্বার সম্মাননা',
            ],
            'subtitle' => [
                'en' => 'National Recognitions',
                'bn' => 'জাতীয় স্বীকৃতি',
            ],
            'content' => [
                'en' => '<p>Chamber accolades summary.</p>',
                'bn' => '<p>চেম্বার সম্মাননার বিবরণ।</p>',
            ],
            'is_enabled' => true,
            'settings' => [
                'cta_url' => '/about',
            ],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/homepage/sections', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'section_key' => 'new_preview_section',
                ],
            ]);

        $this->assertDatabaseHas('homepage_sections', ['section_key' => 'new_preview_section']);
    }

    public function test_admin_can_delete_homepage_section(): void
    {
        $section = HomepageSection::create([
            'section_key' => 'temporary_section',
            'title' => ['en' => 'Temporary', 'bn' => 'সাময়িক'],
            'settings' => [],
            'is_enabled' => false,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/admin/homepage/sections/{$section->id}");
        $response->assertStatus(200);

        $this->assertDatabaseMissing('homepage_sections', ['id' => $section->id]);
    }
}

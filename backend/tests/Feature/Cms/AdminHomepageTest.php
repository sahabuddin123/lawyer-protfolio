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
}

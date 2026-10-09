<?php

namespace Tests\Feature\Cms;

use App\Models\HomepageSection;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicHomeTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();
    }

    public function test_public_home_returns_enabled_sections_in_order(): void
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
                ],
            ]);

        $sections = $response->json('data.sections');
        $this->assertNotEmpty($sections);

        // Verify sorted by sort_order
        $previousOrder = -1;
        foreach ($sections as $section) {
            $this->assertGreaterThanOrEqual($previousOrder, $section['sort_order']);
            $this->assertTrue($section['is_enabled']);
            $previousOrder = $section['sort_order'];
        }
    }

    public function test_disabled_sections_are_excluded_from_home(): void
    {
        $disabled = HomepageSection::create([
            'section_key' => 'hidden_test_section',
            'title' => ['en' => 'Hidden Section', 'bn' => 'লুকানো সেকশন'],
            'settings' => [],
            'sort_order' => 999,
            'is_enabled' => false,
        ]);

        CmsCacheService::forgetHome();

        $response = $this->getJson('/api/v1/home');
        $response->assertStatus(200);

        $keys = array_column($response->json('data.sections'), 'section_key');
        $this->assertNotContains('hidden_test_section', $keys);
    }
}

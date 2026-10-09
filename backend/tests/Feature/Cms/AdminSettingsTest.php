<?php

namespace Tests\Feature\Cms;

use App\Models\ActivityLog;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminSettingsTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/settings');
        $response->assertStatus(401);

        $putResponse = $this->putJson('/api/v1/admin/settings', ['settings' => []]);
        $putResponse->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        $editor = User::create([
            'name' => 'Editor User',
            'email' => 'editor@nijamuddin.com',
            'password' => bcrypt('Password123!#'),
            'is_active' => true,
        ]);
        $editor->assignRole('editor');

        $response = $this->actingAs($editor, 'sanctum')->getJson('/api/v1/admin/settings');
        $response->assertStatus(403);
    }

    public function test_user_with_manage_settings_can_update_settings(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_test@nijamuddin.com',
            'password' => bcrypt('Password123!#'),
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        $payload = [
            'settings' => [
                [
                    'key' => 'site_name',
                    'value' => [
                        'en' => 'Advocate Nijam Uddin Chamber',
                        'bn' => 'এডভোকেট নিজাম উদ্দিন চেম্বার',
                    ],
                ],
                [
                    'key' => 'phone',
                    'value' => '+8801811111111',
                ],
            ],
        ];

        $response = $this->actingAs($admin, 'sanctum')->putJson('/api/v1/admin/settings', $payload);
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Site settings successfully updated.',
            ]);

        $this->assertEquals('Advocate Nijam Uddin Chamber', SiteSetting::getValue('site_name')['en']);

        // Verify audit log
        $log = ActivityLog::where('action', 'settings_updated')->latest()->first();
        $this->assertNotNull($log);
        $this->assertEquals($admin->id, $log->user_id);
    }

    public function test_unsafe_urls_in_settings_are_rejected(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_url_test@nijamuddin.com',
            'password' => bcrypt('Password123!#'),
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        $payload = [
            'settings' => [
                [
                    'key' => 'facebook',
                    'value' => 'javascript:alert(1)',
                ],
            ],
        ];

        $response = $this->actingAs($admin, 'sanctum')->putJson('/api/v1/admin/settings', $payload);
        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'error_code' => 'VALIDATION_FAILED',
            ]);
    }
}

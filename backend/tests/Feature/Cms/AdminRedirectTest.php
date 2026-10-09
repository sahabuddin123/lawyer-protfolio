<?php

namespace Tests\Feature\Cms;

use App\Models\Redirect;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminRedirectTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_redirect@nijamuddin.com',
            'password' => bcrypt('Password123!#'),
            'is_active' => true,
        ]);
        $this->admin->assignRole('admin');
    }

    public function test_admin_can_create_redirect(): void
    {
        $payload = [
            'source_url' => '/old-contact-us',
            'target_url' => '/contact',
            'status_code' => 301,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/redirects', $payload);
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'source_url' => '/old-contact-us',
                    'target_url' => '/contact',
                    'status_code' => 301,
                ],
            ]);

        $this->assertDatabaseHas('redirects', ['source_url' => '/old-contact-us']);
    }

    public function test_redirect_loop_is_prevented(): void
    {
        $payload = [
            'source_url' => '/infinite-loop',
            'target_url' => '/infinite-loop',
            'status_code' => 301,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/redirects', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['target_url']);
    }

    public function test_unsafe_target_url_is_rejected(): void
    {
        $payload = [
            'source_url' => '/unsafe-redirect',
            'target_url' => 'javascript:stealCredentials()',
            'status_code' => 302,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/redirects', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['target_url']);
    }
}

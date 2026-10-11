<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Database\Seeders\ProfileAndCredentialsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileAuthorizationTest extends TestCase
{
    use DatabaseTransactions;

    protected User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ProfileAndCredentialsSeeder::class);

        $this->unauthorizedUser = User::factory()->create(['is_active' => true]);
    }

    public function test_unauthenticated_requests_return_401(): void
    {
        $endpoints = [
            ['method' => 'getJson', 'url' => '/api/v1/admin/profile'],
            ['method' => 'putJson', 'url' => '/api/v1/admin/profile'],
            ['method' => 'getJson', 'url' => '/api/v1/admin/credentials'],
            ['method' => 'postJson', 'url' => '/api/v1/admin/credentials'],
            ['method' => 'getJson', 'url' => '/api/v1/admin/educations'],
            ['method' => 'postJson', 'url' => '/api/v1/admin/educations'],
            ['method' => 'getJson', 'url' => '/api/v1/admin/timeline'],
            ['method' => 'postJson', 'url' => '/api/v1/admin/timeline'],
            ['method' => 'getJson', 'url' => '/api/v1/admin/memberships'],
            ['method' => 'postJson', 'url' => '/api/v1/admin/memberships'],
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->{$endpoint['method']}($endpoint['url']);
            $response->assertStatus(401);
        }
    }

    public function test_unauthorized_users_return_403(): void
    {
        Sanctum::actingAs($this->unauthorizedUser);

        $endpoints = [
            ['method' => 'getJson', 'url' => '/api/v1/admin/profile'],
            ['method' => 'putJson', 'url' => '/api/v1/admin/profile'],
            ['method' => 'getJson', 'url' => '/api/v1/admin/credentials'],
            ['method' => 'postJson', 'url' => '/api/v1/admin/credentials'],
            ['method' => 'getJson', 'url' => '/api/v1/admin/educations'],
            ['method' => 'postJson', 'url' => '/api/v1/admin/educations'],
            ['method' => 'getJson', 'url' => '/api/v1/admin/timeline'],
            ['method' => 'postJson', 'url' => '/api/v1/admin/timeline'],
            ['method' => 'getJson', 'url' => '/api/v1/admin/memberships'],
            ['method' => 'postJson', 'url' => '/api/v1/admin/memberships'],
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->{$endpoint['method']}($endpoint['url']);
            $response->assertStatus(403);
        }
    }
}

<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CurrentUserTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * Test current user endpoint requires authentication.
     */
    public function test_auth_me_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error_code' => 'UNAUTHENTICATED',
            ]);
    }

    /**
     * Test current user endpoint returns safe user profile and never leaks sensitive fields.
     */
    public function test_auth_me_returns_safe_user_data_with_roles(): void
    {
        $user = User::create([
            'name' => 'Chamber Executive',
            'email' => 'executive@nijamuddin.com',
            'password' => Hash::make('ChamberSecure2026!#'),
            'is_active' => true,
        ]);
        $user->assignRole('admin');

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'roles',
                    'permissions',
                    'is_active',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'executive@nijamuddin.com',
                    'roles' => ['admin'],
                ],
            ]);

        // Security check: ensure passwords and internal tokens are NOT leaked
        $json = $response->json('data');
        $this->assertArrayNotHasKey('password', $json);
        $this->assertArrayNotHasKey('password_hash', $json);
        $this->assertArrayNotHasKey('remember_token', $json);

        // Clean up
        $user->forceDelete();
    }
}

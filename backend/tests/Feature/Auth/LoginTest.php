<?php

namespace Tests\Feature\Auth;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * Test successful login returns token and user payload.
     */
    public function test_login_succeeds_with_valid_credentials(): void
    {
        $user = User::create([
            'name' => 'Valid Advocate',
            'email' => 'valid.advocate@nijamuddin.com',
            'password' => Hash::make('Haq@Judicial2026!#'),
            'is_active' => true,
        ]);
        $user->assignRole('admin');

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'valid.advocate@nijamuddin.com',
            'password' => 'Haq@Judicial2026!#',
            'device_name' => 'Test-Browser',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'token',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'roles',
                        'permissions',
                        'is_active',
                    ],
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'valid.advocate@nijamuddin.com',
                        'roles' => ['admin'],
                    ],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));

        // Clean up
        $user->tokens()->delete();
        $user->forceDelete();
    }

    /**
     * Test login fails with invalid password without revealing details.
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        $user = User::create([
            'name' => 'Test Subject',
            'email' => 'subject@nijamuddin.com',
            'password' => Hash::make('CorrectPassword123!#'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'subject@nijamuddin.com',
            'password' => 'WrongPassword999!#',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials provided.',
                'error_code' => 'INVALID_CREDENTIALS',
            ]);

        // Clean up
        $user->forceDelete();
    }

    /**
     * Test login for non-existent email returns generic 401 response preventing user enumeration.
     */
    public function test_login_does_not_reveal_non_existent_account(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent.user@nijamuddin.com',
            'password' => 'AnyPassword123!',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials provided.',
                'error_code' => 'INVALID_CREDENTIALS',
            ]);
    }

    /**
     * Test inactive user cannot authenticate and receives 403 status.
     */
    public function test_inactive_user_cannot_authenticate(): void
    {
        $user = User::create([
            'name' => 'Suspended Staff',
            'email' => 'suspended@nijamuddin.com',
            'password' => Hash::make('StaffPassword123!#'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'suspended@nijamuddin.com',
            'password' => 'StaffPassword123!#',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error_code' => 'ACCOUNT_INACTIVE',
            ]);

        // Clean up
        $user->forceDelete();
    }
}

<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    public function test_inactive_user_cannot_authenticate(): void
    {
        $inactiveUser = User::factory()->create([
            'email' => 'inactive@nijamuddin.com',
            'password' => Hash::make('SecretPassword123!'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'inactive@nijamuddin.com',
            'password' => 'SecretPassword123!',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error_code' => 'ACCOUNT_INACTIVE',
            ]);

        $this->assertEmpty($inactiveUser->tokens);
    }

    public function test_logout_invalidates_sanctum_token(): void
    {
        $user = User::factory()->create([
            'email' => 'active@nijamuddin.com',
            'password' => Hash::make('SecretPassword123!'),
            'is_active' => true,
        ]);
        $user->assignRole('admin');

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'active@nijamuddin.com',
            'password' => 'SecretPassword123!',
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('data.token');
        $this->assertNotEmpty($token);

        // Verify token works
        $probeResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');
        $probeResponse->assertStatus(200);

        // Logout
        $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout');
        $logoutResponse->assertStatus(200);

        // Reset memory guard state so subsequent request authenticates fresh against database
        $this->app['auth']->forgetGuards();

        // Token must now be rejected
        $revokedProbeResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');
        $revokedProbeResponse->assertStatus(401);
    }

    public function test_forgot_password_does_not_enumerate_users(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'existing@nijamuddin.com',
            'is_active' => true,
        ]);

        $resExisting = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'existing@nijamuddin.com',
        ]);

        $resNonExisting = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nonexistent@nijamuddin.com',
        ]);

        // Responses must be completely identical to prevent account enumeration
        $resExisting->assertStatus(200);
        $resNonExisting->assertStatus(200);
        $this->assertEquals($resExisting->json('message'), $resNonExisting->json('message'));
    }

    public function test_password_reset_tokens_are_hashed_and_single_use(): void
    {
        $user = User::factory()->create([
            'email' => 'target@nijamuddin.com',
            'password' => Hash::make('OldPassword123!'),
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'target@nijamuddin.com',
        ]);

        $tokenRecord = DB::table('password_reset_tokens')
            ->where('email', 'target@nijamuddin.com')
            ->first();

        $this->assertNotNull($tokenRecord);
        // Ensure token is stored hashed, never plaintext
        $this->assertTrue(str_starts_with($tokenRecord->token, '$2y$'));

        // Manually generate a known token for verification
        $plainToken = 'test-security-token-64-characters-long-aaaaaaaaaaaaaaaaaaaaaaaaaa';
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => 'target@nijamuddin.com'],
            ['token' => Hash::make($plainToken), 'created_at' => now()]
        );

        // First reset attempt must succeed
        $resetResponse = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'target@nijamuddin.com',
            'token' => $plainToken,
            'password' => 'NewSecurePassword123!',
            'password_confirmation' => 'NewSecurePassword123!',
        ]);

        $resetResponse->assertStatus(200);

        // Second reset attempt with same token must be rejected (single-use enforcement)
        $replayResponse = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'target@nijamuddin.com',
            'token' => $plainToken,
            'password' => 'AnotherPassword123!',
            'password_confirmation' => 'AnotherPassword123!',
        ]);

        $replayResponse->assertStatus(400);
    }

    public function test_password_hash_never_exposed_in_api_responses(): void
    {
        $user = User::factory()->create([
            'email' => 'hashcheck@nijamuddin.com',
            'password' => Hash::make('TopSecret123!'),
            'is_active' => true,
        ]);
        $user->assignRole('super_admin');

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'hashcheck@nijamuddin.com',
            'password' => 'TopSecret123!',
        ]);

        $token = $loginResponse->json('data.token');

        // Check login response
        $this->assertArrayNotHasKey('password', $loginResponse->json('data.user'));
        $this->assertArrayNotHasKey('remember_token', $loginResponse->json('data.user'));

        // Check /me response
        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200);
        $this->assertArrayNotHasKey('password', $meResponse->json('data'));
        $this->assertArrayNotHasKey('remember_token', $meResponse->json('data'));

        // Check admin users list response
        $usersResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/users');

        $usersResponse->assertStatus(200);
        foreach ($usersResponse->json('data') as $u) {
            $this->assertArrayNotHasKey('password', $u);
            $this->assertArrayNotHasKey('remember_token', $u);
        }
    }
}

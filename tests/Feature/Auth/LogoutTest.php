<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * Test authenticated user can log out and revoke token.
     */
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::create([
            'name' => 'Logout User',
            'email' => 'logout.user@nijamuddin.com',
            'password' => Hash::make('Secret123456!#'),
            'is_active' => true,
        ]);

        $token = $user->createToken('test-session')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Successfully logged out.',
            ]);

        // Verify token is deleted
        $this->assertEquals(0, $user->tokens()->count());

        // Subsequent call with same token must be rejected with 401
        auth()->forgetGuards();
        $subsequentResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $subsequentResponse->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error_code' => 'UNAUTHENTICATED',
            ]);

        // Clean up
        $user->forceDelete();
    }

    /**
     * Test unauthenticated logout request is rejected.
     */
    public function test_unauthenticated_logout_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error_code' => 'UNAUTHENTICATED',
            ]);
    }
}

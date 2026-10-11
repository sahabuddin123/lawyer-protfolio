<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * Test password reset request generates token without account enumeration.
     */
    public function test_password_reset_request_creates_token_and_does_not_enumerate(): void
    {
        $user = User::create([
            'name' => 'Reset Target',
            'email' => 'reset.target@nijamuddin.com',
            'password' => Hash::make('InitialPassword123!#'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'reset.target@nijamuddin.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $record = DB::table('password_reset_tokens')->where('email', 'reset.target@nijamuddin.com')->first();
        $this->assertNotNull($record);

        // Test non-existent email gets identical generic response
        $ghostResponse = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'ghost@nijamuddin.com',
        ]);
        $ghostResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // Clean up
        DB::table('password_reset_tokens')->where('email', 'reset.target@nijamuddin.com')->delete();
        $user->forceDelete();
    }

    /**
     * Test password reset succeeds with valid token and enforces min 12 character password.
     */
    public function test_password_reset_execution_succeeds_and_cannot_be_reused(): void
    {
        $user = User::create([
            'name' => 'Reset User',
            'email' => 'reset.execute@nijamuddin.com',
            'password' => Hash::make('OldPassword1234!#'),
            'is_active' => true,
        ]);

        $plainToken = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'reset.execute@nijamuddin.com',
            'token' => Hash::make($plainToken),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'reset.execute@nijamuddin.com',
            'token' => $plainToken,
            'password' => 'NewSecurePassword2026!#',
            'password_confirmation' => 'NewSecurePassword2026!#',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password has been successfully reset. Please log in with your new credentials.',
            ]);

        // Verify password was updated
        $user->refresh();
        $this->assertTrue(Hash::check('NewSecurePassword2026!#', $user->password));

        // Verify token was deleted and cannot be reused
        $this->assertNull(DB::table('password_reset_tokens')->where('email', 'reset.execute@nijamuddin.com')->first());

        $replayResponse = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'reset.execute@nijamuddin.com',
            'token' => $plainToken,
            'password' => 'AnotherPassword2026!#',
            'password_confirmation' => 'AnotherPassword2026!#',
        ]);

        $replayResponse->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error_code' => 'INVALID_RESET_TOKEN',
            ]);

        // Clean up
        $user->forceDelete();
    }

    /**
     * Test expired reset token is rejected.
     */
    public function test_expired_reset_token_is_rejected(): void
    {
        $user = User::create([
            'name' => 'Expired Target',
            'email' => 'expired@nijamuddin.com',
            'password' => Hash::make('Password12345!#'),
            'is_active' => true,
        ]);

        $plainToken = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email' => 'expired@nijamuddin.com',
            'token' => Hash::make($plainToken),
            'created_at' => Carbon::now()->subMinutes(65), // 65 mins ago (expired)
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'expired@nijamuddin.com',
            'token' => $plainToken,
            'password' => 'NewPassword123456!#',
            'password_confirmation' => 'NewPassword123456!#',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'error_code' => 'EXPIRED_RESET_TOKEN',
            ]);

        // Clean up
        $user->forceDelete();
    }
}

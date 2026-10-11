<?php

namespace Tests\Feature\Auth;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityAuditTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * Test security audit log captures login success and failure events without passwords.
     */
    public function test_auth_events_recorded_in_activity_log_without_credentials(): void
    {
        $user = User::create([
            'name' => 'Audit Subject',
            'email' => 'audit.subject@nijamuddin.com',
            'password' => Hash::make('AuditSecret2026!#'),
            'is_active' => true,
        ]);

        // 1. Failed login
        $this->postJson('/api/v1/auth/login', [
            'email' => 'audit.subject@nijamuddin.com',
            'password' => 'WrongPassword!',
        ]);

        $failedLog = ActivityLog::where('action', 'login_failed')
            ->where('description', 'like', '%audit.subject@nijamuddin.com%')
            ->latest('id')
            ->first();

        $this->assertNotNull($failedLog);
        $this->assertStringNotContainsString('WrongPassword!', $failedLog->description);

        // 2. Successful login
        $this->postJson('/api/v1/auth/login', [
            'email' => 'audit.subject@nijamuddin.com',
            'password' => 'AuditSecret2026!#',
        ]);

        $successLog = ActivityLog::where('action', 'login_success')
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($successLog);
        $this->assertStringNotContainsString('AuditSecret2026!#', $successLog->description);

        // Clean up
        $user->tokens()->delete();
        $user->forceDelete();
    }

    /**
     * Test password hashing algorithm is Bcrypt with valid hash structure.
     */
    public function test_passwords_are_securely_hashed(): void
    {
        $user = User::create([
            'name' => 'Hash Test',
            'email' => 'hash.test@nijamuddin.com',
            'password' => Hash::make('MySecurePassword123!#'),
            'is_active' => true,
        ]);

        $this->assertNotEquals('MySecurePassword123!#', $user->password);
        $this->assertTrue(str_starts_with($user->password, '$2y$'));
        $this->assertTrue(Hash::check('MySecurePassword123!#', $user->password));

        // Clean up
        $user->forceDelete();
    }
}

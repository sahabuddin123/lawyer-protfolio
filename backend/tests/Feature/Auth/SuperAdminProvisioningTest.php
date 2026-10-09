<?php

namespace Tests\Feature\Auth;

use App\Models\ActivityLog;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\SuperAdminSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SuperAdminProvisioningTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        // Ensure roles & permissions exist in test DB
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    protected function tearDown(): void
    {
        $this->app['env'] = 'testing';
        parent::tearDown();
    }

    /**
     * Test SuperAdminSeeder provisions the account and assigns super_admin role.
     */
    public function test_super_admin_seeder_creates_account_and_assigns_super_admin_role(): void
    {
        $testEmail = 'seeder.test.' . uniqid() . '@nijamuddin.com';
        Config::set('auth.admin.email', $testEmail);
        Config::set('auth.admin.password', 'SecurePassphrase2026!#');
        Config::set('auth.admin.name', 'Initial Provisioned Super Admin');

        $this->seed(SuperAdminSeeder::class);

        $user = User::where('email', $testEmail)->first();
        $this->assertNotNull($user);
        $this->assertEquals('Initial Provisioned Super Admin', $user->name);
        $this->assertTrue($user->isActive());
        $this->assertTrue($user->hasRole('super_admin'));
        $this->assertTrue(Hash::check('SecurePassphrase2026!#', $user->password));
    }

    /**
     * Test SuperAdminSeeder is idempotent and never resets an existing administrator's password.
     */
    public function test_super_admin_seeder_is_idempotent_and_does_not_reset_password(): void
    {
        $testEmail = 'idempotent.' . uniqid() . '@nijamuddin.com';
        Config::set('auth.admin.email', $testEmail);
        Config::set('auth.admin.password', 'OriginalPassword2026!#');

        // First run: Creates admin
        $this->seed(SuperAdminSeeder::class);

        $user = User::where('email', $testEmail)->first();
        $this->assertNotNull($user);
        $originalPasswordHash = $user->password;

        // Change the config password simulating a different env value
        Config::set('auth.admin.password', 'AttemptedNewPassword2026!#');

        // Second run: Should detect existing user and preserve original password
        $this->seed(SuperAdminSeeder::class);

        $user->refresh();
        $this->assertEquals($originalPasswordHash, $user->password);
        $this->assertTrue(Hash::check('OriginalPassword2026!#', $user->password));
        $this->assertFalse(Hash::check('AttemptedNewPassword2026!#', $user->password));
        $this->assertEquals(1, User::where('email', $testEmail)->count());
    }

    /**
     * Test SuperAdminSeeder refuses to create account in production if credentials are missing.
     */
    public function test_super_admin_seeder_refuses_when_credentials_missing_in_production(): void
    {
        $this->app['env'] = 'production';
        Config::set('auth.admin.email', null);
        Config::set('auth.admin.password', null);
        putenv('INITIAL_ADMIN_EMAIL');
        putenv('INITIAL_ADMIN_PASSWORD');

        $initialUserCount = User::count();
        $this->artisan('db:seed', [
            '--class' => SuperAdminSeeder::class,
            '--force' => true,
        ]);

        $this->assertEquals($initialUserCount, User::count());
    }

    /**
     * Test SuperAdminSeeder refuses short passwords (<12 chars) in production.
     */
    public function test_super_admin_seeder_refuses_short_password_in_production(): void
    {
        $this->app['env'] = 'production';
        $testEmail = 'prod.short.' . uniqid() . '@nijamuddin.com';
        Config::set('auth.admin.email', $testEmail);
        Config::set('auth.admin.password', 'ShortPass99'); // 11 characters

        $this->artisan('db:seed', [
            '--class' => SuperAdminSeeder::class,
            '--force' => true,
        ]);

        $this->assertNull(User::where('email', $testEmail)->first());
    }

    /**
     * Test Artisan CLI command provisions Super Admin account.
     */
    public function test_artisan_command_creates_super_admin_via_cli_options(): void
    {
        $email = 'cli.admin.' . uniqid() . '@nijamuddin.com';
        $password = 'CliProvisionPass2026!#';

        $exitCode = $this->artisan('admin:create-super-admin', [
            '--name' => 'CLI Provisioned Admin',
            '--email' => $email,
            '--password' => $password,
            '--no-interaction' => true,
        ])->run();

        $this->assertEquals(0, $exitCode);

        $user = User::where('email', $email)->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('super_admin'));
        $this->assertTrue(Hash::check($password, $user->password));

        // Verify audit log entry
        $auditLog = ActivityLog::where('action', 'super_admin_provisioned')
            ->where('user_id', $user->id)
            ->first();
        $this->assertNotNull($auditLog);
    }

    /**
     * Test Artisan CLI command rejects password shorter than 12 characters.
     */
    public function test_artisan_command_rejects_password_shorter_than_12_chars(): void
    {
        $exitCode = $this->artisan('admin:create-super-admin', [
            '--name' => 'Too Short Admin',
            '--email' => 'short.' . uniqid() . '@nijamuddin.com',
            '--password' => 'UnderTwelve',
            '--no-interaction' => true,
        ])->run();

        $this->assertEquals(1, $exitCode);
    }

    /**
     * Test Artisan CLI command refuses to overwrite existing user.
     */
    public function test_artisan_command_refuses_to_overwrite_existing_user(): void
    {
        $email = 'existing.' . uniqid() . '@nijamuddin.com';
        $originalPassword = 'OriginalPass2026!#';

        // Create initial user
        $this->artisan('admin:create-super-admin', [
            '--name' => 'First Run Admin',
            '--email' => $email,
            '--password' => $originalPassword,
            '--no-interaction' => true,
        ])->assertExitCode(0);

        // Attempt second run with new password
        $this->artisan('admin:create-super-admin', [
            '--name' => 'Second Run Attempt',
            '--email' => $email,
            '--password' => 'NewDifferentPassword2026!#',
            '--no-interaction' => true,
        ])->assertExitCode(1);

        $user = User::where('email', $email)->first();
        $this->assertTrue(Hash::check($originalPassword, $user->password));
        $this->assertFalse(Hash::check('NewDifferentPassword2026!#', $user->password));
    }

    /**
     * Test provisioned admin can log in via API endpoint.
     */
    public function test_provisioned_super_admin_can_log_in_via_api(): void
    {
        $email = 'api.login.' . uniqid() . '@nijamuddin.com';
        $password = 'ApiAuthTokenTest2026!#';

        $this->artisan('admin:create-super-admin', [
            '--name' => 'API Authenticated Admin',
            '--email' => $email,
            '--password' => $password,
            '--no-interaction' => true,
        ])->assertExitCode(0);

        // 1. Rejection of invalid credentials
        $badResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => 'WrongPassword2026!#',
        ]);
        $badResponse->assertStatus(401)
            ->assertJson(['success' => false, 'error_code' => 'INVALID_CREDENTIALS']);

        // 2. Successful login
        $goodResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => $password,
            'device_name' => 'Judicial Admin Workstation',
        ]);

        $goodResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => $email,
                        'roles' => ['super_admin'],
                    ],
                ],
            ]);

        $token = $goodResponse->json('data.token');
        $this->assertNotEmpty($token);

        // 3. Access protected admin endpoint
        $authResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $authResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => $email,
                ],
            ]);

        // 4. Access admin settings
        $settingsResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/settings');

        $settingsResponse->assertStatus(200);

        // 5. Logout
        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $logoutResponse->assertStatus(200);

        // 6. Token revocation confirmed
        auth()->forgetGuards();
        $revokedResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $revokedResponse->assertStatus(401);
    }

    /**
     * Test public visitors without authentication cannot access protected admin endpoints.
     */
    public function test_unauthenticated_public_user_cannot_access_admin_endpoints(): void
    {
        $response = $this->getJson('/api/v1/admin/settings');
        $response->assertStatus(401);

        $authMeResponse = $this->getJson('/api/v1/auth/me');
        $authMeResponse->assertStatus(401);
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seed to safely create the initial Super Admin account.
     * 
     * Idempotent: Never overwrites an existing administrator's password.
     * Environment-aware: Requires explicit credentials in production.
     */
    public function run(): void
    {
        // 1. Ensure the roles and permissions exist
        if (!Role::where('name', 'super_admin')->exists()) {
            $this->call(RolesAndPermissionsSeeder::class);
        }

        // 2. Resolve credentials from environment & config
        $name = config('auth.admin.name') ?: env('INITIAL_ADMIN_NAME', 'Advocate Nijam Uddin');
        $email = config('auth.admin.email') ?: env('INITIAL_ADMIN_EMAIL');
        $password = config('auth.admin.password') ?: env('INITIAL_ADMIN_PASSWORD');
        $phone = config('auth.admin.phone') ?: env('INITIAL_ADMIN_PHONE', '+8801700000000');

        // 3. Environment-specific validation
        if (app()->environment('production')) {
            if (empty($email) || empty($password)) {
                $this->command?->warn(
                    '[SECURITY NOTICE] Production environment detected: INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be configured in .env. Skipping initial admin seeding.'
                );
                return;
            }

            if (strlen($password) < 12) {
                $this->command?->error(
                    '[SECURITY ERROR] INITIAL_ADMIN_PASSWORD must be at least 12 characters in production. Aborting.'
                );
                return;
            }
        } else {
            // Development and Testing fallback
            $email = $email ?: 'admin@nijamuddin.com';
            $password = $password ?: 'Haq@Judicial2026!#';
        }

        // 4. Idempotency Check: Do not overwrite if user already exists
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            if (!$existingUser->hasRole('super_admin')) {
                $existingUser->assignRole('super_admin');
                $this->command?->info("Assigned 'super_admin' role to existing user: {$email}. Password untouched.");
            } else {
                $this->command?->info("Super Admin account already exists: {$email}. Existing credentials preserved.");
            }
            return;
        }

        // 5. Create the initial Super Admin
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'phone' => $phone,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $user->assignRole('super_admin');

        $this->command?->info("Initial Super Admin account provisioned successfully: {$email}");
    }
}

<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class CreateSuperAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-super-admin
                            {--name= : Full name of the initial Super Admin}
                            {--email= : Email address of the initial Super Admin}
                            {--password= : Password for the initial Super Admin}
                            {--from-env : Read credentials from INITIAL_ADMIN_* environment variables}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Safely provision the initial Super Admin account without exposing credentials';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('==================================================================');
        $this->info('Advocate Nijam Uddin Platform — Super Admin Provisioning');
        $this->info('==================================================================');

        // 1. Verify Database Connectivity Safely
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $this->error('Database connection failed. Cannot provision administrator.');
            return Command::FAILURE;
        }

        // 2. Ensure Roles and Permissions Exist
        if (!Role::where('name', 'super_admin')->exists()) {
            $this->info('Initializing roles and permissions matrix...');
            $this->call(RolesAndPermissionsSeeder::class);
        }

        // 3. Resolve Inputs (CLI Options, Environment, or Interactive Prompts)
        $name = $this->option('name');
        $email = $this->option('email');
        $password = $this->option('password');

        if ($this->option('from-env')) {
            $name = $name ?: env('INITIAL_ADMIN_NAME', 'Site Administrator');
            $email = $email ?: env('INITIAL_ADMIN_EMAIL');
            $password = $password ?: env('INITIAL_ADMIN_PASSWORD');
        }

        // If interactive and values missing, prompt securely
        if ($this->input->isInteractive()) {
            if (empty($name)) {
                $name = $this->ask('Enter Administrator Full Name', env('INITIAL_ADMIN_NAME', 'Site Administrator'));
            }

            if (empty($email)) {
                $email = $this->ask('Enter Administrator Email Address', env('INITIAL_ADMIN_EMAIL'));
            }

            if (empty($password)) {
                $password = $this->secret('Enter Strong Password (minimum 12 characters)');
                $confirmPassword = $this->secret('Confirm Password');

                if ($password !== $confirmPassword) {
                    $this->error('Passwords do not match. Aborting.');
                    return Command::FAILURE;
                }
            }
        }

        // 4. Validate Inputs
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:12'],
        ]);

        if ($validator->fails()) {
            $this->error('Validation errors:');
            foreach ($validator->errors()->all() as $error) {
                $this->error(" - {$error}");
            }
            return Command::FAILURE;
        }

        // 5. Idempotency & Safety Check: Never overwrite existing administrator
        $existing = User::where('email', $email)->first();
        if ($existing) {
            $this->error("A user account with email '{$email}' already exists.");
            $this->warn('Existing credentials are never overwritten or reset by this command.');
            
            if (!$existing->hasRole('super_admin')) {
                if ($this->confirm("Would you like to assign the 'super_admin' role to this existing user?", false)) {
                    $existing->assignRole('super_admin');
                    $this->info("Assigned 'super_admin' role to {$email}.");
                    return Command::SUCCESS;
                }
            }
            return Command::FAILURE;
        }

        // 6. Create the Administrator Account Safely
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $user->assignRole('super_admin');

        // Audit Log Entry
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'super_admin_provisioned',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'description' => "Initial Super Admin account provisioned for {$email} via CLI command",
            'ip_address' => '127.0.0.1',
            'user_agent' => 'CLI-Artisan',
            'created_at' => now(),
        ]);

        $this->info('==================================================================');
        $this->info("[SUCCESS] Super Admin account created successfully for: {$email}");
        $this->info("Role assigned: 'super_admin' (Full unrestricted permissions)");
        $this->info('You may now log in via the admin panel at: /admin/login');
        $this->info('==================================================================');

        return Command::SUCCESS;
    }
}

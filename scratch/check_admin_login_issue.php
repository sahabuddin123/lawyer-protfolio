<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== USERS IN DATABASE ===\n";
$users = User::all();
foreach ($users as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | Active: " . ($u->is_active ? 'YES' : 'NO') . " | Roles: " . $u->roles->pluck('name')->implode(', ') . "\n";
}

echo "\n=== CHECK PASSWORD FOR admin@nijamuddin.com ===\n";
$target = User::where('email', 'admin@nijamuddin.com')->first();
if (!$target) {
    echo "User admin@nijamuddin.com does NOT exist in database!\n";
} else {
    $testPw = 'Haq@Judicial2026!#';
    $matches = Hash::check($testPw, $target->password);
    echo "Password check for '$testPw': " . ($matches ? "MATCHES!" : "DOES NOT MATCH!") . "\n";
    echo "Email verified at: " . ($target->email_verified_at ? $target->email_verified_at : 'NULL') . "\n";
    echo "Is active: " . ($target->is_active ? 'TRUE' : 'FALSE') . "\n";
}

echo "\n=== ENV & CONFIG VALUES ===\n";
echo "INITIAL_ADMIN_EMAIL: " . env('INITIAL_ADMIN_EMAIL') . "\n";
echo "INITIAL_ADMIN_PASSWORD: " . (env('INITIAL_ADMIN_PASSWORD') ? 'SET' : 'NOT SET') . "\n";
echo "config('auth.admin.email'): " . config('auth.admin.email') . "\n";

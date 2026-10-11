<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

echo "Roles count: " . Role::count() . "\n";
foreach (Role::all() as $r) {
    echo " - Role: {$r->name} (guard: {$r->guard_name})\n";
}

echo "Permissions count: " . Permission::count() . "\n";

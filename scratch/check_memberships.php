<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (class_exists(\App\Models\ProfessionalMembership::class)) {
    echo json_encode(\App\Models\ProfessionalMembership::all()->toArray(), JSON_PRETTY_PRINT);
} else {
    echo "No model";
}

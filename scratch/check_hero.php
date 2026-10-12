<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = app(\App\Services\HomepageDataService::class);
$data = $service->getHomepageData();
echo json_encode([
    'bar_council_enrollment' => $data['hero']['bar_council_enrollment'] ?? null,
    'hero' => $data['hero'] ?? []
], JSON_PRETTY_PRINT);

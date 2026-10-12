<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$response = app()->handle(Illuminate\Http\Request::create('/api/v1/home', 'GET'));
$data = json_decode($response->getContent(), true);
echo "Hero JSON: " . json_encode($data['data']['hero'] ?? null, JSON_PRETTY_PRINT) . PHP_EOL;

// Also check sections[hero] settings
foreach ($data['data']['sections'] ?? [] as $sec) {
    if ($sec['section_key'] === 'hero') {
        echo "Section hero settings: " . json_encode($sec['settings'] ?? null, JSON_PRETTY_PRINT) . PHP_EOL;
    }
}

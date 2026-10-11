<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$response = app()->handle(Illuminate\Http\Request::create('/api/v1/gallery/supreme-court-bangladesh-legal-heritage', 'GET'));
echo 'Status: ' . $response->getStatusCode() . PHP_EOL;
$data = json_decode($response->getContent(), true);
echo 'Images count: ' . count($data['data']['images'] ?? []) . PHP_EOL;
foreach ($data['data']['images'] ?? [] as $img) {
    echo ' - ID ' . $img['id'] . ': ' . ($img['url'] ?? '') . ' | ' . ($img['caption'] ?? '') . PHP_EOL;
}

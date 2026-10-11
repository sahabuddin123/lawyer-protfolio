<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$profile = App\Models\Profile::with(['profilePhoto', 'courtRobesPhoto'])->first();
echo "Profile ID: " . $profile?->id . PHP_EOL;
echo "Profile Photo ID: " . $profile?->profile_photo_id . PHP_EOL;
echo "Profile Photo Model: " . json_encode($profile?->profilePhoto) . PHP_EOL;
echo "Court Robes Photo ID: " . $profile?->court_robes_photo_id . PHP_EOL;
echo "Court Robes Photo Model: " . json_encode($profile?->courtRobesPhoto) . PHP_EOL;

// Also test the API response
$response = app()->handle(Illuminate\Http\Request::create('/api/v1/profile', 'GET'));
echo "API status: " . $response->getStatusCode() . PHP_EOL;
$data = json_decode($response->getContent(), true);
echo "API profile_photo: " . json_encode($data['data']['profile_photo'] ?? null) . PHP_EOL;

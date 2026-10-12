<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$sec = \App\Models\HomepageSection::where('section_key', 'hero')->first();
if ($sec) {
    echo json_encode($sec->toArray(), JSON_PRETTY_PRINT);
} else {
    echo "No hero section";
}

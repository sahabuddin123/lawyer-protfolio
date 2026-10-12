<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = \App\Models\Profile::first();
if ($p) {
    echo json_encode([
        'bar_council_enrollment' => $p->bar_council_enrollment,
        'high_court_enrollment' => $p->high_court_enrollment,
        'attributes' => $p->toArray(),
    ], JSON_PRETTY_PRINT);
} else {
    echo "No profile found";
}

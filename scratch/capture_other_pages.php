<?php
$chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if (!file_exists($chromePath)) {
    $chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
}

$screens = [
    'about_screenshot.png' => 'http://127.0.0.1:8000/about',
    'album_screenshot.png' => 'http://127.0.0.1:8000/gallery/supreme-court-bangladesh-legal-heritage',
];

foreach ($screens as $file => $url) {
    $outPath = __DIR__ . '/' . $file;
    $cmd = "\"{$chromePath}\" --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=6000 --window-size=1440,1200 --screenshot=\"{$outPath}\" \"{$url}\" 2>&1";
    exec($cmd);
    echo "Captured {$file}" . PHP_EOL;
}

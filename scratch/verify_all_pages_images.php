<?php

$pages = [
    'Home' => 'http://127.0.0.1:8000/',
    'About' => 'http://127.0.0.1:8000/about',
    'Gallery' => 'http://127.0.0.1:8000/gallery',
    'AlbumDetail' => 'http://127.0.0.1:8000/gallery/supreme-court-bangladesh-legal-heritage',
];

$chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if (!file_exists($chromePath)) {
    $chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
}

foreach ($pages as $name => $url) {
    $outHtml = __DIR__ . "/page_{$name}.html";
    $cmd = "\"{$chromePath}\" --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=6000 --dump-dom \"{$url}\" > \"{$outHtml}\" 2>&1";
    exec($cmd);
    
    if (file_exists($outHtml)) {
        $html = file_get_contents($outHtml);
        preg_match_all('/<img[^>]+src=[\'"]([^\'"]+)[\'"][^>]*>/i', $html, $matches);
        echo "=== {$name} ({$url}) ===" . PHP_EOL;
        echo "Total images: " . count($matches[1]) . PHP_EOL;
        foreach ($matches[1] as $src) {
            echo " - {$src}" . PHP_EOL;
        }
    } else {
        echo "=== {$name} FAILED TO FETCH ===" . PHP_EOL;
    }
}

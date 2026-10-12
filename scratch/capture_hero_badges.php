<?php
$url = 'http://127.0.0.1:8000/';
$chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
$screenshotOut = 'C:\\Users\\DFIT\\.gemini\\antigravity-ide\\brain\\744b720c-6453-4e3c-ab4b-1d82685b9c38\\scratch\\hero_badges_screenshot.png';

$cmd = "\"{$chromePath}\" --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=10000 --window-size=1440,900 --screenshot=\"{$screenshotOut}\" \"{$url}\" 2>&1";
exec($cmd, $output, $returnVar);

echo "Hero screenshot result: " . $returnVar . PHP_EOL;

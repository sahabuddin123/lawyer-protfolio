<?php

$filePath = __DIR__ . '/../deploy.sh';
$content = file_get_contents($filePath);

$hasCR = strpos($content, "\r") !== false;
echo "deploy.sh has Windows CR (\\r): " . ($hasCR ? "YES" : "NO") . "\n";

if ($hasCR) {
    $cleanContent = str_replace("\r", "", $content);
    file_put_contents($filePath, $cleanContent);
    echo "Cleaned deploy.sh to strict Unix LF line endings!\n";
} else {
    echo "deploy.sh already has clean Unix LF line endings.\n";
}

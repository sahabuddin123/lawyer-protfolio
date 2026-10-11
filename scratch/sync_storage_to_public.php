<?php
$srcDir = __DIR__ . '/../storage/app/public/lawyer';
$dstDir = __DIR__ . '/../public/storage/lawyer';

if (!is_dir($dstDir)) {
    mkdir($dstDir, 0777, true);
}

$files = scandir($srcDir);
foreach ($files as $f) {
    if ($f !== '.' && $f !== '..') {
        copy($srcDir . '/' . $f, $dstDir . '/' . $f);
        echo "Copied {$f} to public/storage/lawyer/\n";
    }
}

// Also check webp variants in public/images
$imgDir = __DIR__ . '/../public/images';
foreach (scandir($imgDir) as $f) {
    if (str_ends_with($f, '.webp') && str_starts_with($f, 'lawyer-')) {
        copy($imgDir . '/' . $f, $dstDir . '/' . $f);
        echo "Copied {$f} to public/storage/lawyer/\n";
    }
}

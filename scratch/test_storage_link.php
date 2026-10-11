<?php
$path = 'public/storage';
echo 'is_dir: ' . (is_dir($path) ? 'yes' : 'no') . PHP_EOL;
echo 'is_link: ' . (is_link($path) ? 'yes' : 'no') . PHP_EOL;
echo 'real: ' . realpath($path) . PHP_EOL;
echo 'file exists: ' . (file_exists('public/storage/lawyer/lawyer-court-robes.jpg') ? 'yes' : 'no') . PHP_EOL;

<?php
$h1 = @get_headers('http://127.0.0.1:8000/storage/lawyer/lawyer-executive.jpg');
echo "storage lawyer-executive.jpg: " . ($h1[0] ?? 'FAILED') . PHP_EOL;

$h2 = @get_headers('http://127.0.0.1:8000/images/portrait-nijamuddin.jpg');
echo "images portrait-nijamuddin.jpg: " . ($h2[0] ?? 'FAILED') . PHP_EOL;

$h3 = @get_headers('http://127.0.0.1:8000/images/lawyer-chamber-library.jpg');
echo "images lawyer-chamber-library.jpg: " . ($h3[0] ?? 'FAILED') . PHP_EOL;

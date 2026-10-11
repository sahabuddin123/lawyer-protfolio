<?php
echo 'Testing 127.0.0.1: ';
$c1 = @file_get_contents('http://127.0.0.1:8000/images/portrait-nijamuddin.jpg');
echo ($c1 !== false ? 'OK (' . strlen($c1) . ' bytes)' : 'FAILED') . PHP_EOL;

echo 'Testing localhost: ';
$c2 = @file_get_contents('http://localhost:8000/images/portrait-nijamuddin.jpg');
echo ($c2 !== false ? 'OK (' . strlen($c2) . ' bytes)' : 'FAILED') . PHP_EOL;

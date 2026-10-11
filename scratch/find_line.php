<?php
$lines = file(__DIR__ . '/../database/seeders/HomepageContentPopulationSeeder.php');
foreach ($lines as $i => $line) {
    if (strpos($line, 'seedInstitutional') !== false) {
        echo ($i + 1) . ': ' . $line;
    }
}

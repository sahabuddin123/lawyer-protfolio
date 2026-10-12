<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
foreach ($tables as $t) {
    $table = array_values((array)$t)[0];
    try {
        $rows = \Illuminate\Support\Facades\DB::table($table)->get();
        foreach ($rows as $row) {
            $json = json_encode($row);
            if (stripos($json, 'ACADEMIC RIGOR') !== false || stripos($json, 'ETHICS, DUE DILIGENCE') !== false || stripos($json, 'COMPREHENSIVE LEGAL') !== false || stripos($json, 'PROCEDURAL GUIDANCE') !== false) {
                echo "Found in table: {$table}\n";
                echo substr($json, 0, 500) . "\n\n";
            }
        }
    } catch (\Throwable $e) {}
}

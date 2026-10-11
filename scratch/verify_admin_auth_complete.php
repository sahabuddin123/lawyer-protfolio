<?php

$scratchDir = 'C:\\Users\\DFIT\\.gemini\\antigravity-ide\\brain\\744b720c-6453-4e3c-ab4b-1d82685b9c38\\scratch';
$chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// 1. First verify login API returns 200 with valid token
$ch = curl_init('http://127.0.0.1:8000/api/v1/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'admin@nijamuddin.com',
    'password' => 'Haq@Judicial2026!#'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$data = json_decode($res, true);

echo "API Login Code: $code\n";
echo "API Login Message: " . ($data['message'] ?? 'None') . "\n";
echo "User Name: " . ($data['data']['user']['name'] ?? 'None') . "\n";
echo "User Role: " . implode(', ', $data['data']['user']['roles'] ?? []) . "\n";
$token = $data['data']['token'] ?? null;
echo "Token Acquired: " . ($token ? 'YES' : 'NO') . "\n";

// 2. Test accessing /api/v1/admin/homepage/sections with this token
$chAdmin = curl_init('http://127.0.0.1:8000/api/v1/admin/homepage/sections');
curl_setopt($chAdmin, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAdmin, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);
$adminRes = curl_exec($chAdmin);
$adminCode = curl_getinfo($chAdmin, CURLINFO_HTTP_CODE);
$adminData = json_decode($adminRes, true);

echo "Admin Homepage Sections API Code: $adminCode\n";
echo "Admin Homepage Sections Count: " . count($adminData['data'] ?? []) . "\n";

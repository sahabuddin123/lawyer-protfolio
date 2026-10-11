<?php

/**
 * Phase 4 Live HTTP Integration Verification Harness
 * Tests live Authentication, RBAC, Privilege Escalation Defenses, and Session Lifecycle.
 */

$baseUrl = 'http://127.0.0.1:8000';

function httpReq(string $method, string $url, ?array $body = null, ?string $token = null): array
{
    $ch = curl_init($url);
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
    ];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }

    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status' => $status,
        'body' => json_decode((string) $response, true),
        'raw' => $response,
    ];
}

$results = [];
$total = 0;
$passed = 0;

function check(string $name, bool $condition, string $details = ''): void
{
    global $results, $total, $passed;
    $total++;
    if ($condition) {
        $passed++;
        $results[] = "[PASS] {$name}";
        echo "[PASS] {$name}\n";
    } else {
        $results[] = "[FAIL] {$name} - Details: {$details}";
        echo "[FAIL] {$name} - Details: {$details}\n";
    }
}

echo "=== PHASE 4 LIVE HTTP INTEGRATION VERIFICATION ===\n\n";

// 1. Public endpoint accessible anonymously
$res = httpReq('GET', "{$baseUrl}/api/v1/home");
check('1. Anonymous visitor can access public home API', $res['status'] === 200 && ($res['body']['success'] ?? false) === true);

// 2. Anonymous visitor blocked from Admin APIs
$res = httpReq('GET', "{$baseUrl}/api/v1/admin/dashboard/stats");
check('2. Anonymous visitor blocked from Admin stats (401)', $res['status'] === 401 && ($res['body']['error_code'] ?? '') === 'UNAUTHENTICATED');

$res = httpReq('GET', "{$baseUrl}/api/v1/admin/users");
check('3. Anonymous visitor blocked from Admin users (401)', $res['status'] === 401 && ($res['body']['error_code'] ?? '') === 'UNAUTHENTICATED');

// 3. Invalid credentials test (safe generic message, no enumeration)
$res = httpReq('POST', "{$baseUrl}/api/v1/auth/login", [
    'email' => 'nonexistent.lawyer@nijamuddin.com',
    'password' => 'WrongPassword123!',
]);
check('4. Invalid credentials returns 401 without user enumeration', $res['status'] === 401 && ($res['body']['error_code'] ?? '') === 'INVALID_CREDENTIALS');

// 4. Authenticate as Super Admin using bootstrapped test credentials
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

(new \Database\Seeders\RolesAndPermissionsSeeder())->run();
(new \Database\Seeders\CmsAndSettingsSeeder())->run();


$testSuper = \App\Models\User::firstOrCreate(
    ['email' => 'phase4_test_super@nijamuddin.com'],
    [
        'name' => 'Phase 4 Verification Super',
        'password' => \Illuminate\Support\Facades\Hash::make('SuperJudicial2026!#'),
        'is_active' => true,
    ]
);
$testSuper->assignRole('super_admin');

$res = httpReq('POST', "{$baseUrl}/api/v1/auth/login", [
    'email' => 'phase4_test_super@nijamuddin.com',
    'password' => 'SuperJudicial2026!#',
]);
$superToken = $res['body']['data']['token'] ?? null;
check('5. Super Admin login succeeds and returns Sanctum token', $res['status'] === 200 && !empty($superToken));

// 5. Verify Super Admin access to dashboard stats
$res = httpReq('GET', "{$baseUrl}/api/v1/admin/dashboard/stats", null, $superToken);
check('6. Super Admin can access dashboard stats', $res['status'] === 200 && ($res['body']['success'] ?? false) === true);

// 6. Verify Super Admin access to users list
$res = httpReq('GET', "{$baseUrl}/api/v1/admin/users?per_page=5", null, $superToken);
check('7. Super Admin can list administrators with pagination', $res['status'] === 200 && is_array($res['body']['data'] ?? null));

// 7. Verify Super Admin access to roles list
$res = httpReq('GET', "{$baseUrl}/api/v1/admin/roles", null, $superToken);
$rolesList = collect($res['body']['data'] ?? [])->pluck('name')->toArray();
check('8. Roles list endpoint returns all system roles', $res['status'] === 200 && in_array('super_admin', $rolesList) && in_array('admin', $rolesList));

// 8. Create a Content Manager user and test authorization boundary
$cmUser = \App\Models\User::firstOrCreate(
    ['email' => 'phase4_test_cm@nijamuddin.com'],
    [
        'name' => 'Phase 4 Content Manager',
        'password' => \Illuminate\Support\Facades\Hash::make('CmJudicial2026!#'),
        'is_active' => true,
    ]
);
$cmUser->syncRoles(['content_manager']);

$res = httpReq('POST', "{$baseUrl}/api/v1/auth/login", [
    'email' => 'phase4_test_cm@nijamuddin.com',
    'password' => 'CmJudicial2026!#',
]);
$cmToken = $res['body']['data']['token'] ?? null;
check('9. Content Manager user authenticates successfully', $res['status'] === 200 && !empty($cmToken));

// 9. Content Manager can access pages CMS
$res = httpReq('GET', "{$baseUrl}/api/v1/admin/pages", null, $cmToken);
check('10. Content Manager can access CMS Pages (authorized)', $res['status'] === 200 && ($res['body']['success'] ?? false) === true);

// 10. Content Manager blocked from User Management
$res = httpReq('GET', "{$baseUrl}/api/v1/admin/users", null, $cmToken);
check('11. Content Manager blocked from User Management (403 Forbidden)', $res['status'] === 403 && ($res['body']['error_code'] ?? '') === 'FORBIDDEN');

// 11. Privilege escalation defense: Content Manager cannot update user roles
$res = httpReq('PUT', "{$baseUrl}/api/v1/admin/users/{$cmUser->id}/roles", ['roles' => ['super_admin']], $cmToken);
check('12. Privilege escalation attempt by non-super-admin returns 403 Forbidden', $res['status'] === 403);

// 12. Super Admin anti-lockout: cannot revoke own super_admin role
$res = httpReq('PUT', "{$baseUrl}/api/v1/admin/users/{$testSuper->id}/roles", ['roles' => ['admin']], $superToken);
check('13. Super Admin anti-lockout prevents revoking own super_admin role (422)', $res['status'] === 422);

// 13. Super Admin anti-lockout: cannot deactivate own account
$res = httpReq('PATCH', "{$baseUrl}/api/v1/admin/users/{$testSuper->id}/status", ['is_active' => false], $superToken);
check('14. Super Admin anti-lockout prevents self-deactivation (422)', $res['status'] === 422);

// 14. Menu item self-parenting prevention
$menu = \App\Models\Menu::where('location', 'header')->first();
$menuItem = \App\Models\MenuItem::where('menu_id', $menu->id)->first();
$res = httpReq('PUT', "{$baseUrl}/api/v1/admin/menu-items/{$menuItem->id}", [
    'menu_id' => $menu->id,
    'parent_id' => $menuItem->id,
    'title' => ['en' => 'Loop Prevention Test'],
    'url' => '/loop-test',
    'target' => '_self',
], $superToken);
check('15. Menu item self-parenting loop is prevented by FormRequest (422)', $res['status'] === 422);

// 15. Token revocation on logout
$res = httpReq('POST', "{$baseUrl}/api/v1/auth/logout", null, $cmToken);
check('16. Logout invalidates active Sanctum session token', $res['status'] === 200 && ($res['body']['success'] ?? false) === true);

$res = httpReq('GET', "{$baseUrl}/api/v1/admin/pages", null, $cmToken);
check('17. Subsequent request with invalidated token returns 401', $res['status'] === 401 && ($res['body']['error_code'] ?? '') === 'UNAUTHENTICATED');

// Clean up test verification users
$testSuper->tokens()->delete();
$testSuper->forceDelete();
$cmUser->tokens()->delete();
$cmUser->forceDelete();

echo "\n=== SUMMARY: {$passed}/{$total} CHECKS PASSED ===\n";
exit($passed === $total ? 0 : 1);

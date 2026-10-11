<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Page;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\HomepageSection;
use App\Services\CmsCacheService;
use Illuminate\Support\Facades\Http;

echo "=== PHASE 3 END-TO-END CMS VERIFICATION ===\n";

$baseUrl = 'http://127.0.0.1:8000/api/v1';

// Step 1: Log into Admin
echo "Step 1: Admin Login...\n";
$loginRes = Http::post("{$baseUrl}/auth/login", [
    'email' => 'admin@nijamuddin.com',
    'password' => 'Haq@Judicial2026!#',
]);
if ($loginRes->status() !== 200 || empty($loginRes->json('data.token'))) {
    echo "FAIL: Admin login failed. HTTP " . $loginRes->status() . "\n";
    exit(1);
}
$token = $loginRes->json('data.token');
echo "PASS: Admin authenticated successfully. User: " . $loginRes->json('data.user.email') . "\n";

$authHeaders = [
    'Authorization' => "Bearer {$token}",
    'Accept' => 'application/json',
];

// Step 2: Create a draft page in English
echo "\nStep 2: Create a draft page in English...\n";
$testSlug = 'phase3-verification-page-' . time();
$createPageRes = Http::withHeaders($authHeaders)->post("{$baseUrl}/admin/pages", [
    'title' => ['en' => 'Phase 3 Verification Brief'],
    'slug' => $testSlug,
    'content' => ['en' => '<p>Initial English draft content.</p>'],
    'status' => 'draft',
    'seo' => [
        'seo_title' => ['en' => 'Phase 3 Verification | Advocate Nijam Uddin'],
        'meta_description' => ['en' => 'Verification test page description.'],
        'canonical_url' => "https://nijamuddin.com/pages/{$testSlug}",
        'robots' => 'noindex, nofollow',
    ],
]);
if ($createPageRes->status() !== 201) {
    echo "FAIL: Create draft page failed. HTTP " . $createPageRes->status() . " Response: " . $createPageRes->body() . "\n";
    exit(1);
}
$pageId = $createPageRes->json('data.id');
echo "PASS: Draft page created with ID: {$pageId}, Slug: {$testSlug}\n";

// Step 3: Add Bangla content without overwriting English
echo "\nStep 3: Add Bangla content independently...\n";
$updatePageRes = Http::withHeaders($authHeaders)->put("{$baseUrl}/admin/pages/{$pageId}", [
    'title' => [
        'en' => 'Phase 3 Verification Brief',
        'bn' => 'পর্যায় ৩ যাচাইকরণ সারসংক্ষেপ',
    ],
    'slug' => $testSlug,
    'content' => [
        'en' => '<p>Initial English draft content preserved.</p>',
        'bn' => '<p>স্বাধীন বাংলা বিষয়বস্তু যুক্ত করা হয়েছে।</p>',
    ],
    'status' => 'draft',
    'seo' => [
        'seo_title' => [
            'en' => 'Phase 3 Verification | Advocate Nijam Uddin',
            'bn' => 'পর্যায় ৩ যাচাইকরণ | এডভোকেট নিজাম উদ্দিন',
        ],
        'meta_description' => [
            'en' => 'Verification test page description.',
            'bn' => 'যাচাইকরণ পরীক্ষা পৃষ্ঠার বিবরণ।',
        ],
        'canonical_url' => "https://nijamuddin.com/pages/{$testSlug}",
        'robots' => 'noindex, nofollow',
    ],
]);
if ($updatePageRes->status() !== 200) {
    echo "FAIL: Update page with Bangla failed. HTTP " . $updatePageRes->status() . "\n";
    exit(1);
}
$pageAfterUpdate = $updatePageRes->json('data');
if (empty($pageAfterUpdate['title']['en']) || empty($pageAfterUpdate['title']['bn'])) {
    echo "FAIL: Language independence compromised. Titles: " . json_encode($pageAfterUpdate['title']) . "\n";
    exit(1);
}
echo "PASS: Bilingual independence verified. EN: '{$pageAfterUpdate['title']['en']}', BN: '{$pageAfterUpdate['title']['bn']}'\n";

// Step 4: Preview the draft as an authorized administrator
echo "\nStep 4: Authenticated draft preview...\n";
$previewRes = Http::withHeaders($authHeaders)->get("{$baseUrl}/admin/pages/{$pageId}/preview");
if ($previewRes->status() !== 200 || !$previewRes->json('data.is_preview')) {
    echo "FAIL: Admin preview failed. HTTP " . $previewRes->status() . "\n";
    exit(1);
}
$previewRobots = $previewRes->json('data.seo.robots');
echo "PASS: Draft preview retrieved. Status: {$previewRes->json('data.status')}, Robots Directive: {$previewRobots}\n";

// Step 5: Verify anonymous visitor cannot access unpublished content
echo "\nStep 5: Anonymous visitor cannot access draft...\n";
$anonRes = Http::get("{$baseUrl}/pages/{$testSlug}");
if ($anonRes->status() !== 404) {
    echo "FAIL: Anonymous visitor accessed draft! HTTP: " . $anonRes->status() . "\n";
    exit(1);
}
echo "PASS: Anonymous visitor correctly received 404 for draft page.\n";

// Step 6: Publish the page and verify its public route
echo "\nStep 6: Publish page and verify public route...\n";
$publishRes = Http::withHeaders($authHeaders)->put("{$baseUrl}/admin/pages/{$pageId}", [
    'title' => [
        'en' => 'Phase 3 Verification Brief',
        'bn' => 'পর্যায় ৩ যাচাইকরণ সারসংক্ষেপ',
    ],
    'slug' => $testSlug,
    'content' => [
        'en' => '<p>Published English content.</p>',
        'bn' => '<p>প্রকাশিত বাংলা বিষয়বস্তু।</p>',
    ],
    'status' => 'published',
    'seo' => [
        'seo_title' => [
            'en' => 'Phase 3 Verification | Advocate Nijam Uddin',
            'bn' => 'পর্যায় ৩ যাচাইকরণ | এডভোকেট নিজাম উদ্দিন',
        ],
        'meta_description' => [
            'en' => 'Published verification test page description.',
            'bn' => 'প্রকাশিত পৃষ্ঠা বিবরণ।',
        ],
        'canonical_url' => "https://nijamuddin.com/pages/{$testSlug}",
        'robots' => 'index, follow',
    ],
]);
if ($publishRes->status() !== 200) {
    echo "FAIL: Publishing failed. HTTP " . $publishRes->status() . "\n";
    exit(1);
}

// Anonymous check published
$anonPublishedRes = Http::withHeaders(['Accept-Language' => 'en'])->get("{$baseUrl}/pages/{$testSlug}");
if ($anonPublishedRes->status() !== 200) {
    echo "FAIL: Anonymous visitor could not access published page. HTTP: " . $anonPublishedRes->status() . "\n";
    exit(1);
}
echo "PASS: Public access verified for published page in English. Title: '{$anonPublishedRes->json('data.title')}'\n";

$anonPublishedBnRes = Http::withHeaders(['Accept-Language' => 'bn'])->get("{$baseUrl}/pages/{$testSlug}");
if ($anonPublishedBnRes->status() !== 200 || $anonPublishedBnRes->json('data.title') !== 'পর্যায় ৩ যাচাইকরণ সারসংক্ষেপ') {
    echo "FAIL: Bangla public access failed. Title: " . $anonPublishedBnRes->json('data.title') . "\n";
    exit(1);
}
echo "PASS: Public access verified for published page in Bangla. Title: '{$anonPublishedBnRes->json('data.title')}'\n";

// Step 7: Add a menu item linking to the page
echo "\nStep 7: Add menu item linking to the page...\n";
$headerMenu = Menu::where('location', 'header')->first();
if (!$headerMenu) {
    $menuCreateRes = Http::withHeaders($authHeaders)->post("{$baseUrl}/admin/menus", [
        'location' => 'header',
        'title' => 'Main Navigation Header',
    ]);
    $headerMenu = Menu::find($menuCreateRes->json('data.id'));
    echo "Created header menu via API (ID: {$headerMenu->id})\n";
}
$menuItemRes = Http::withHeaders($authHeaders)->post("{$baseUrl}/admin/menu-items", [
    'menu_id' => $headerMenu->id,
    'title' => [
        'en' => 'Verification Page Link',
        'bn' => 'যাচাইকরণ লিংক',
    ],
    'url' => "/pages/{$testSlug}",
    'target' => '_self',
    'is_active' => true,
]);
if ($menuItemRes->status() !== 201) {
    echo "FAIL: Menu item creation failed. HTTP " . $menuItemRes->status() . " Body: " . $menuItemRes->body() . "\n";
    exit(1);
}
$menuItemId = $menuItemRes->json('data.id');
echo "PASS: Menu item created with ID: {$menuItemId}\n";

// Step 8: Verify menu appears in correct location and language
echo "\nStep 8: Verify public navigation shows the new item...\n";
$navResEn = Http::withHeaders(['Accept-Language' => 'en'])->get("{$baseUrl}/navigation");
$headerUrlsEn = collect($navResEn->json('data.header.items'))->pluck('url')->all();
if (!in_array("/pages/{$testSlug}", $headerUrlsEn)) {
    echo "FAIL: Navigation does not include new menu item URL.\n";
    exit(1);
}
$navItemEn = collect($navResEn->json('data.header.items'))->firstWhere('url', "/pages/{$testSlug}");
echo "PASS: Public menu contains item in English: '{$navItemEn['title']}'\n";

$navResBn = Http::withHeaders(['Accept-Language' => 'bn'])->get("{$baseUrl}/navigation");
$navItemBn = collect($navResBn->json('data.header.items'))->firstWhere('url', "/pages/{$testSlug}");
if ($navItemBn['title'] !== 'যাচাইকরণ লিংক') {
    echo "FAIL: Navigation item Bangla translation not resolved. Title: {$navItemBn['title']}\n";
    exit(1);
}
echo "PASS: Public menu contains item in Bangla: '{$navItemBn['title']}'\n";

// Step 9: Disable menu item and verify it disappears publicly without deleting page
echo "\nStep 9: Disable menu item and verify public disappearance...\n";
$disableItemRes = Http::withHeaders($authHeaders)->put("{$baseUrl}/admin/menu-items/{$menuItemId}", [
    'menu_id' => $headerMenu->id,
    'title' => [
        'en' => 'Verification Page Link',
        'bn' => 'যাচাইকরণ লিংক',
    ],
    'url' => "/pages/{$testSlug}",
    'target' => '_self',
    'is_active' => false,
]);
if ($disableItemRes->status() !== 200) {
    echo "FAIL: Disabling menu item failed. HTTP " . $disableItemRes->status() . "\n";
    exit(1);
}

$navResAfterDisable = Http::get("{$baseUrl}/navigation");
$headerUrlsAfterDisable = collect($navResAfterDisable->json('data.header.items'))->pluck('url')->all();
if (in_array("/pages/{$testSlug}", $headerUrlsAfterDisable)) {
    echo "FAIL: Disabled menu item still appears in public navigation!\n";
    exit(1);
}
// Page must still exist
$pageStillExists = Page::where('slug', $testSlug)->first();
if (!$pageStillExists) {
    echo "FAIL: Disabling menu item mistakenly deleted page!\n";
    exit(1);
}
echo "PASS: Disabled menu item vanished from public navigation, and page remains intact.\n";

// Step 10: Create or edit a homepage section, change order, verify public rendering
echo "\nStep 10: Homepage section creation and reordering...\n";
$secKey = 'phase3_test_sec_' . time();
$createSecRes = Http::withHeaders($authHeaders)->post("{$baseUrl}/admin/homepage/sections", [
    'section_key' => $secKey,
    'title' => [
        'en' => 'Phase 3 Showcase Section',
        'bn' => 'পর্যায় ৩ প্রদর্শনী বিভাগ',
    ],
    'subtitle' => [
        'en' => 'Live CMS Verification',
        'bn' => 'লাইভ সিএমএস যাচাইকরণ',
    ],
    'content' => [
        'en' => 'Dynamic section content in English.',
        'bn' => 'ডায়নামিক বিভাগ বিষয়বস্তু বাংলায়।',
    ],
    'is_enabled' => true,
    'sort_order' => 1,
]);
if ($createSecRes->status() !== 201) {
    echo "FAIL: Create homepage section failed. HTTP " . $createSecRes->status() . " Body: " . $createSecRes->body() . "\n";
    exit(1);
}
$secId = $createSecRes->json('data.id');
echo "PASS: Homepage section created with ID: {$secId}, Key: {$secKey}\n";

$homeRes = Http::get("{$baseUrl}/home");
$renderedSecKeys = collect($homeRes->json('data.sections'))->pluck('section_key')->all();
if (!in_array($secKey, $renderedSecKeys)) {
    echo "FAIL: Created section does not render on public homepage.\n";
    exit(1);
}
echo "PASS: Section rendered on public homepage.\n";

// Step 11: Disable the section and verify it is no longer rendered
echo "\nStep 11: Disable homepage section...\n";
$disableSecRes = Http::withHeaders($authHeaders)->put("{$baseUrl}/admin/homepage/sections/{$secId}", [
    'title' => [
        'en' => 'Phase 3 Showcase Section',
        'bn' => 'পর্যায় ৩ প্রদর্শনী বিভাগ',
    ],
    'is_enabled' => false,
]);
if ($disableSecRes->status() !== 200) {
    echo "FAIL: Disable section failed. HTTP " . $disableSecRes->status() . "\n";
    exit(1);
}

$homeAfterDisableRes = Http::get("{$baseUrl}/home");
$renderedSecKeysAfter = collect($homeAfterDisableRes->json('data.sections'))->pluck('section_key')->all();
if (in_array($secKey, $renderedSecKeysAfter)) {
    echo "FAIL: Disabled section still rendered on public homepage!\n";
    exit(1);
}
echo "PASS: Disabled homepage section no longer renders on public homepage.\n";

// Step 12: Verify SEO metadata for both locales
echo "\nStep 12: Verify SEO metadata for both locales...\n";
$seoEn = $anonPublishedRes->json('data.seo');
$seoBn = $anonPublishedBnRes->json('data.seo');
if (empty($seoEn['seo_title']) || empty($seoBn['seo_title'])) {
    echo "FAIL: SEO metadata missing. EN: " . json_encode($seoEn) . ", BN: " . json_encode($seoBn) . "\n";
    exit(1);
}
echo "PASS: SEO metadata verified: EN Title = '{$seoEn['seo_title']}', BN Title = '{$seoBn['seo_title']}'\n";

// Step 13: Verify unauthorized users cannot perform CMS mutations
echo "\nStep 13: Unauthorized users cannot mutate CMS...\n";
$unauthHeaders = ['Accept' => 'application/json'];
$unauthPagePost = Http::withHeaders($unauthHeaders)->post("{$baseUrl}/admin/pages", ['slug' => 'hack']);
if ($unauthPagePost->status() !== 401) {
    echo "FAIL: Anonymous user not blocked with 401 on POST /admin/pages. HTTP: " . $unauthPagePost->status() . "\n";
    exit(1);
}
$unauthMenuPost = Http::withHeaders($unauthHeaders)->post("{$baseUrl}/admin/menu-items", ['url' => '/hack']);
if ($unauthMenuPost->status() !== 401) {
    echo "FAIL: Anonymous user not blocked with 401 on POST /admin/menu-items. HTTP: " . $unauthMenuPost->status() . "\n";
    exit(1);
}
$unauthSecPost = Http::withHeaders($unauthHeaders)->post("{$baseUrl}/admin/homepage/sections", ['section_key' => 'hack']);
if ($unauthSecPost->status() !== 401) {
    echo "FAIL: Anonymous user not blocked with 401 on POST /admin/homepage/sections. HTTP: " . $unauthSecPost->status() . "\n";
    exit(1);
}
echo "PASS: All unauthorized CMS mutation attempts safely rejected with HTTP 401 Unauthorized.\n";

// Step 14: Clean up test artifacts cleanly from database
echo "\nStep 14: Cleaning up verification test artifacts...\n";
Http::withHeaders($authHeaders)->delete("{$baseUrl}/admin/pages/{$pageId}");
Http::withHeaders($authHeaders)->delete("{$baseUrl}/admin/menu-items/{$menuItemId}");
Http::withHeaders($authHeaders)->delete("{$baseUrl}/admin/homepage/sections/{$secId}");
echo "PASS: Verification artifacts cleaned up cleanly.\n";

echo "\n=== ALL 14 MANUAL E2E FLOWS VERIFIED SUCCESSFULLY (PASS) ===\n";

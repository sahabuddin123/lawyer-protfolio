<?php

namespace Tests\Feature\Security;

use App\Models\PracticeArea;
use App\Models\User;
use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InjectionAndDefenseSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    public function test_xss_payloads_in_rich_text_are_sanitized(): void
    {
        $payload = '<script>alert("XSS")</script><p>Safe text</p><img src="x" onerror="alert(1)" /><svg onload="alert(2)"></svg><a href="javascript:alert(3)">Click</a>';

        $cleaned = HtmlSanitizer::clean($payload);

        $this->assertStringNotContainsString('<script>', $cleaned);
        $this->assertStringNotContainsString('onerror', $cleaned);
        $this->assertStringNotContainsString('<svg', $cleaned);
        $this->assertStringNotContainsString('javascript:', $cleaned);
        $this->assertStringContainsString('<p>Safe text</p>', $cleaned);
    }

    public function test_open_redirect_protocol_relative_urls_are_rejected(): void
    {
        $unsafeUrls = [
            '//evil.com',
            '//phishing-site.org/login',
            '/\\evil.com',
            '\\/evil.com',
            'javascript:alert(1)',
            'data:text/html,<script>alert(1)</script>',
            'about:blank',
            "https://evil.com\r\nSet-Cookie: x=1",
        ];

        foreach ($unsafeUrls as $url) {
            $isSafe = HtmlSanitizer::isSafeUrl($url);
            $this->assertFalse($isSafe, "Failed to reject unsafe/open-redirect URL: {$url}");
        }

        $safeUrls = [
            '/courtroom',
            '/research/banking-law',
            '#overview',
            '?locale=bn',
            'https://www.supremecourt.gov.bd',
            'https://youtube.com/watch?v=123',
            'mailto:chambers@nijamuddin.com',
            'tel:+8801700000000',
        ];

        foreach ($safeUrls as $url) {
            $isSafe = HtmlSanitizer::isSafeUrl($url);
            $this->assertTrue($isSafe, "Falsely rejected legitimate safe URL: {$url}");
        }
    }

    public function test_sql_injection_in_search_and_filter_parameters_is_neutralized(): void
    {
        PracticeArea::create([
            'title' => ['en' => 'Corporate Law', 'bn' => 'কর্পোরেট আইন'],
            'slug' => 'corporate-law',
            'icon_name' => 'briefcase',
            'short_description' => ['en' => 'Corporate advisory', 'bn' => 'পরামর্শ'],
            'full_description' => ['en' => 'Full text', 'bn' => 'সম্পূর্ণ বিবরণ'],
            'status' => 'published',
        ]);

        $sqlPayloads = [
            "' OR '1'='1",
            "1' UNION SELECT 1,2,3,4,5,6,7,8,9,10--",
            "'; DROP TABLE users; --",
            "admin'--",
            "benchmark(5000000,MD5(1))",
        ];

        foreach ($sqlPayloads as $payload) {
            $response = $this->getJson('/api/v1/practice-areas?q=' . urlencode($payload));
            $response->assertStatus(200);
            // Must not return all records via ' OR 1=1 bypass
            $this->assertCount(0, $response->json('data'));
        }
    }

    public function test_sorting_injection_falls_back_to_safe_columns(): void
    {
        $admin = User::factory()->create(['is_active' => true]);
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        // Attacker attempts SQL injection via sort_by parameter
        $maliciousSorts = [
            'sleep(5)',
            '(SELECT 1 FROM users WHERE id=1)',
            'id; DROP TABLE users; --',
            'invalid_column_name',
        ];

        foreach ($maliciousSorts as $sort) {
            $response = $this->getJson('/api/v1/admin/videos?sort_by=' . urlencode($sort) . '&sort_dir=desc');
            $response->assertStatus(200);
        }
    }

    public function test_pagination_abuse_is_strictly_bounded(): void
    {
        $admin = User::factory()->create(['is_active' => true]);
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        // Request unbounded page size
        $response = $this->getJson('/api/v1/admin/courtroom?per_page=999999');
        $response->assertStatus(200);

        // Max per page must be clamped to 100
        $this->assertLessThanOrEqual(100, $response->json('meta.per_page'));

        // Public endpoint clamped to 50
        $publicRes = $this->getJson('/api/v1/practice-areas?per_page=999999');
        $publicRes->assertStatus(200);
        $this->assertLessThanOrEqual(50, $publicRes->json('meta.per_page'));
    }
}

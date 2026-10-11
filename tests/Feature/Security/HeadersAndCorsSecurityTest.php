<?php

namespace Tests\Feature\Security;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HeadersAndCorsSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_responses_include_complete_owasp_security_headers(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200);

        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

        $csp = $response->headers->get('Content-Security-Policy');
        $this->assertNotNull($csp);
        $this->assertStringContainsString("frame-ancestors 'self'", $csp);
        $this->assertStringContainsString("default-src 'self'", $csp);
        $this->assertStringContainsString("youtube-nocookie.com", $csp);
        $this->assertStringContainsString("player.vimeo.com", $csp);
    }

    public function test_web_crawl_routes_include_security_headers(): void
    {
        $sitemapRes = $this->get('/sitemap.xml');
        $sitemapRes->assertStatus(200);
        $sitemapRes->assertHeader('X-Content-Type-Options', 'nosniff');
        $sitemapRes->assertHeader('X-Frame-Options', 'SAMEORIGIN');

        $robotsRes = $this->get('/robots.txt');
        $robotsRes->assertStatus(200);
        $robotsRes->assertHeader('X-Content-Type-Options', 'nosniff');
        $robotsRes->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    }

    public function test_cors_does_not_reflect_arbitrary_unauthorized_origins(): void
    {
        $maliciousOrigin = 'http://attacker-evil-website.com';

        $response = $this->withHeaders([
            'Origin' => $maliciousOrigin,
            'Access-Control-Request-Method' => 'POST',
        ])->json('OPTIONS', '/api/v1/auth/login');

        // Access-Control-Allow-Origin must NOT reflect the malicious origin
        $allowOrigin = $response->headers->get('Access-Control-Allow-Origin');
        $this->assertNotEquals($maliciousOrigin, $allowOrigin);
    }

    public function test_production_error_handling_masks_sensitive_details(): void
    {
        // Temporarily configure app.debug = false
        config(['app.debug' => false]);

        // Attempt requesting invalid route or causing 404/error
        $response = $this->getJson('/api/v1/invalid-route-probe-9999');

        $response->assertStatus(404);
        $content = $response->json();

        // Must not expose stack traces, database schema, or internal server paths
        $this->assertArrayNotHasKey('trace', $content);
        $this->assertStringNotContainsString('c:\\wamp64', json_encode($content));
        $this->assertStringNotContainsString('SQLSTATE', json_encode($content));
    }
}

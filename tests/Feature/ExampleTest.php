<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('id="root"', false);
    }

    public function test_spa_client_routes_render_app_blade(): void
    {
        $response = $this->get('/about');
        $response->assertStatus(200);
        $response->assertSee('id="root"', false);

        $adminResponse = $this->get('/admin');
        $adminResponse->assertStatus(200);
        $adminResponse->assertSee('id="root"', false);
    }

    public function test_sitemap_xml_returns_xml(): void
    {
        $response = $this->get('/sitemap.xml');
        $response->assertStatus(200);
        $this->assertStringContainsString('xml', $response->headers->get('Content-Type'));
    }

    public function test_unknown_api_endpoint_returns_json_404(): void
    {
        $response = $this->getJson('/api/v1/unknown-endpoint-probe');
        $response->assertStatus(404);
        $response->assertHeader('Content-Type', 'application/json');
        $response->assertJson([
            'success' => false,
            'error_code' => 'NOT_FOUND',
        ]);
    }
}

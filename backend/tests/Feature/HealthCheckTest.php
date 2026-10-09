<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test health check endpoint returns 200 and standard envelope.
     */
    public function test_health_check_returns_success_envelope(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'status',
                    'application',
                    'environment',
                    'database',
                    'locale',
                    'timestamp',
                ],
                'meta' => [
                    'timestamp',
                    'locale',
                ],
            ])
            ->assertJson([
                'success' => true,
                'message' => 'API is healthy',
                'data' => [
                    'status' => 'ok',
                    'database' => 'connected',
                ],
            ]);
    }

    /**
     * Test health check responds with requested locale.
     */
    public function test_health_check_honors_locale(): void
    {
        $response = $this->getJson('/api/v1/health?lang=bn');

        $response->assertStatus(200)
            ->assertJsonPath('data.locale', 'bn')
            ->assertJsonPath('meta.locale', 'bn');
    }
}

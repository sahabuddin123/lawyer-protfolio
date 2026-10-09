<?php

namespace Tests\Feature;

use App\Http\Responses\ApiResponse;
use Tests\TestCase;

class ApiResponseTest extends TestCase
{
    /**
     * Test 404 endpoint returns standardized JSON error envelope.
     */
    public function test_not_found_returns_standard_error_envelope(): void
    {
        $response = $this->getJson('/api/v1/non-existent-endpoint');

        $response->assertStatus(404)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'error_code',
            ])
            ->assertJson([
                'success' => false,
                'error_code' => 'NOT_FOUND',
            ]);
    }

    /**
     * Test ApiResponse::error helper produces expected structure.
     */
    public function test_api_response_error_format(): void
    {
        $jsonResponse = ApiResponse::error(
            'The given data was invalid.',
            422,
            ['phone' => ['Invalid phone number format.']],
            'VALIDATION_FAILED'
        );

        $this->assertEquals(422, $jsonResponse->getStatusCode());

        $data = json_decode($jsonResponse->getContent(), true);
        $this->assertFalse($data['success']);
        $this->assertEquals('The given data was invalid.', $data['message']);
        $this->assertEquals('VALIDATION_FAILED', $data['error_code']);
        $this->assertArrayHasKey('phone', $data['errors']);
    }

    /**
     * Test Accept-Language header sets the application locale.
     */
    public function test_accept_language_header_sets_locale(): void
    {
        $response = $this->withHeaders([
            'Accept-Language' => 'bn',
        ])->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonPath('meta.locale', 'bn');
    }
}

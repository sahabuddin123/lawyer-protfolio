<?php

namespace Tests\Feature\Cms;

use App\Models\SiteSetting;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicSettingsTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();
    }

    public function test_public_settings_endpoint_returns_success_envelope(): void
    {
        $response = $this->getJson('/api/v1/settings');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Site settings retrieved successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'general',
                    'contact',
                    'social',
                    'seo',
                ],
                'meta' => ['timestamp', 'locale'],
            ]);
    }

    public function test_public_settings_respects_locale_switching(): void
    {
        // Request in English
        $responseEn = $this->withHeaders(['Accept-Language' => 'en'])->getJson('/api/v1/settings');
        $responseEn->assertStatus(200);
        $this->assertEquals('Advocate Nijam Uddin', $responseEn->json('data.general.site_name'));

        // Request in Bangla
        $responseBn = $this->withHeaders(['Accept-Language' => 'bn'])->getJson('/api/v1/settings');
        $responseBn->assertStatus(200);
        $this->assertEquals('এডভোকেট নিজাম উদ্দিন', $responseBn->json('data.general.site_name'));
    }

    public function test_private_settings_are_hidden_from_public_api(): void
    {
        SiteSetting::updateOrCreate(
            ['key' => 'secret_internal_key'],
            [
                'group' => 'system',
                'value' => ['value' => 'top_secret_value'],
                'is_public' => false,
            ]
        );

        $response = $this->getJson('/api/v1/settings');
        $response->assertStatus(200);
        $systemSettings = $response->json('data.system') ?? [];
        $this->assertArrayNotHasKey('secret_internal_key', $systemSettings);
    }
}

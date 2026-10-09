<?php

namespace Tests\Feature\Cms;

use App\Models\SiteSetting;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;
use Throwable;

class RedisCacheIntegrationTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();

        if (\App\Models\SiteSetting::count() === 0) {
            $this->seed(\Database\Seeders\CmsAndSettingsSeeder::class);
        }
    }

    /**
     * Test versioned cache key generation, parameter hashing, and locale separation.
     */
    public function test_versioned_cache_key_generation_and_locale_separation(): void
    {
        $keyEnPage1 = CmsCacheService::listKey('practice_areas', 'en', ['page' => 1]);
        $keyBnPage1 = CmsCacheService::listKey('practice_areas', 'bn', ['page' => 1]);
        $keyEnPage2 = CmsCacheService::listKey('practice_areas', 'en', ['page' => 2]);

        // Assert keys are distinct strings
        $this->assertNotEmpty($keyEnPage1);
        $this->assertNotEmpty($keyBnPage1);
        $this->assertNotEmpty($keyEnPage2);

        // Language separation: EN key must not match BN key
        $this->assertNotEquals($keyEnPage1, $keyBnPage1, 'English and Bangla cache keys must be separated');

        // Pagination separation: Page 1 key must not match Page 2 key
        $this->assertNotEquals($keyEnPage1, $keyEnPage2, 'Different pagination parameters must produce different cache keys');

        // Key structure inspection
        $this->assertStringContainsString('cms:practice_areas:list:v', $keyEnPage1);
        $this->assertStringContainsString(':en:', $keyEnPage1);
        $this->assertStringContainsString(':bn:', $keyBnPage1);
    }

    /**
     * Test atomic version bump invalidation logic.
     */
    public function test_cache_invalidation_via_version_bump(): void
    {
        $initialKey = CmsCacheService::listKey('research', 'en', ['category' => 'constitutional']);

        // Simulate caching data under the initial key
        Cache::put($initialKey, ['title' => 'Constitutional Law Insights v1'], 300);
        $this->assertTrue(Cache::has($initialKey));
        $this->assertEquals('Constitutional Law Insights v1', Cache::get($initialKey)['title']);

        // Invalidate via version bump
        $newVersion = CmsCacheService::bumpVersion('research');
        $this->assertGreaterThan(1, $newVersion);

        // Generating list key again should now return a new key with incremented version
        $updatedKey = CmsCacheService::listKey('research', 'en', ['category' => 'constitutional']);
        $this->assertNotEquals($initialKey, $updatedKey);

        // The updated key must be empty (cache invalidated/miss)
        $this->assertFalse(Cache::has($updatedKey));
    }

    /**
     * Test single detail key generation and explicit invalidation.
     */
    public function test_detail_cache_key_generation_and_invalidation(): void
    {
        $detailKey = CmsCacheService::detailKey('practice_areas', 'corporate-advisory', 'en');
        $this->assertEquals('cms:practice_areas:detail:corporate-advisory:en', $detailKey);

        // Cache detail item
        Cache::put($detailKey, ['slug' => 'corporate-advisory', 'title' => 'Corporate Advisory'], 300);
        $this->assertTrue(Cache::has($detailKey));

        // Invalidate specific detail
        CmsCacheService::forgetDetail('practice_areas', 'corporate-advisory', 'en');
        $this->assertFalse(Cache::has($detailKey), 'Detail cache must be cleared after forgetDetail');
    }

    /**
     * Test TTL constant policies align with project requirements.
     */
    public function test_cache_ttl_policies_match_specifications(): void
    {
        // Site settings & Navigation: 30 minutes (1800s)
        $this->assertEquals(1800, CmsCacheService::TTL_SETTINGS);
        $this->assertEquals(1800, CmsCacheService::TTL_NAVIGATION);

        // Lawyer profile & Practice areas: 15 minutes (900s)
        $this->assertEquals(900, CmsCacheService::TTL_PROFILE);
        $this->assertEquals(900, CmsCacheService::TTL_PRACTICE_AREAS);

        // Content listings: 10 minutes (600s)
        $this->assertEquals(600, CmsCacheService::TTL_HOME);
        $this->assertEquals(600, CmsCacheService::TTL_RESEARCH);
        $this->assertEquals(600, CmsCacheService::TTL_JUDGMENTS);
        $this->assertEquals(600, CmsCacheService::TTL_PUBLICATIONS);
        $this->assertEquals(600, CmsCacheService::TTL_MEDIA);
        $this->assertEquals(600, CmsCacheService::TTL_VIDEOS);
        $this->assertEquals(600, CmsCacheService::TTL_GALLERY);

        // Sitemap: 24 hours (86400s)
        $this->assertEquals(86400, CmsCacheService::TTL_SITEMAP);
    }

    /**
     * Test safe execution of redis:verify Artisan diagnostic command.
     */
    public function test_redis_verify_command_runs_safely(): void
    {
        $exitCode = Artisan::call('redis:verify');
        $output = Artisan::output();

        // Must display the diagnostic header
        $this->assertStringContainsString('Advocate Nijam Uddin CMS — Redis Diagnostic', $output);
        $this->assertStringContainsString('Configuration Item', $output);

        // On machines without phpredis installed, exitCode is 1 with helpful guidance.
        // On machines with Redis running, exitCode is 0.
        // In neither case should it throw an uncaught exception or fatal crash.
        $this->assertContains($exitCode, [0, 1]);
    }

    /**
     * Test end-to-end cache invalidation flow for public settings API.
     */
    public function test_public_settings_cache_invalidation_flow(): void
    {
        // First request to prime cache
        $res1 = $this->withHeaders(['Accept-Language' => 'en'])->getJson('/api/v1/settings');
        $res1->assertStatus(200);

        // Modify a setting in DB
        $setting = SiteSetting::where('key', 'site_name')->first();
        $this->assertNotNull($setting, 'SiteSetting site_name must exist');

        $originalVal = $setting->value;
        $updatedVal = $originalVal;
        $updatedVal['en'] = 'Advocate Nijam Uddin & Partners';
        $setting->update(['value' => $updatedVal]);

        // Invalidate cache
        CmsCacheService::bumpVersion('settings');

        // Second request must reflect the updated setting
        $res2 = $this->withHeaders(['Accept-Language' => 'en'])->getJson('/api/v1/settings');
        $res2->assertStatus(200);
        $this->assertEquals('Advocate Nijam Uddin & Partners', $res2->json('data.general.site_name'));
    }

    /**
     * Integration test with real Redis if available, or gracefully skipped.
     */
    public function test_real_redis_integration_when_service_available(): void
    {
        if (!extension_loaded('redis')) {
            $this->markTestSkipped('Real Redis integration test skipped: phpredis extension is not installed in local PHP runtime.');
        }

        try {
            $redis = Redis::connection('cache');
            $ping = $redis->ping();
            if (!$ping) {
                $this->markTestSkipped('Real Redis server at 127.0.0.1:6379 is not running.');
            }
        } catch (Throwable $e) {
            $this->markTestSkipped('Real Redis server unreachable: ' . $e->getMessage());
        }

        // Only executed if Redis daemon is truly alive
        $testKey = 'test_redis_integration_' . time();
        $testVal = 'nijam_test_val';

        $redis->setex($testKey, 10, $testVal);
        $this->assertEquals($testVal, $redis->get($testKey));
        $redis->del($testKey);
        $this->assertNull($redis->get($testKey));
    }
}

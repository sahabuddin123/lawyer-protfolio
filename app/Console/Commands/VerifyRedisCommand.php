<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Throwable;

class VerifyRedisCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'redis:verify
                            {--connection=cache : The Redis database connection to test (cache or default)}
                            {--store : Also verify the Cache facade using the redis store}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Safely and non-destructively verify Redis connectivity, credentials, and cache functionality';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('==================================================================');
        $this->info('Advocate Nijam Uddin CMS — Redis Diagnostic & Connectivity Check');
        $this->info('==================================================================');

        $connection = (string) $this->option('connection');
        $checkCacheStore = (bool) $this->option('store') || config('cache.default') === 'redis';

        // 1. Inspect Environment & Configuration
        $configuredStore = config('cache.default');
        $configuredClient = config('database.redis.client', 'phpredis');
        $redisHost = config("database.redis.{$connection}.host", '127.0.0.1');
        $redisPort = config("database.redis.{$connection}.port", 6379);
        $redisDb = config("database.redis.{$connection}.database", 0);
        $hasPassword = !empty(config("database.redis.{$connection}.password"));
        $cachePrefix = config('cache.prefix', '');

        $this->table(
            ['Configuration Item', 'Configured Value'],
            [
                ['Active CACHE_STORE', $configuredStore],
                ['Target Redis Connection', $connection],
                ['Redis Client Driver', $configuredClient],
                ['Redis Host:Port', "{$redisHost}:{$redisPort}"],
                ['Redis Database Index', $redisDb],
                ['Password Configured', $hasPassword ? 'Yes (protected)' : 'No (none)'],
                ['Cache Key Prefix', $cachePrefix ?: '(none)'],
            ]
        );

        // 2. Check Client Extension Availability
        $this->newLine();
        $this->info('[1/4] Checking PHP Redis Client Extension...');

        if ($configuredClient === 'phpredis') {
            if (!extension_loaded('redis')) {
                $this->error('FAIL: The "phpredis" PHP extension is NOT loaded in this PHP runtime.');
                $this->line('  -> Current PHP binary: ' . PHP_BINARY);
                $this->line('  -> PHP Version: ' . PHP_VERSION);
                $this->line('  -> Resolution:');
                $this->line('     - On Linux/aaPanel: Install the "redis" extension for PHP in aaPanel App Store or run "pecl install redis".');
                $this->line('     - On Windows/WAMP: Add php_redis.dll to php.ini or switch REDIS_CLIENT=predis.');
                return Command::FAILURE;
            }
            $phpredisVersion = phpversion('redis') ?: 'unknown';
            $this->line("  PASS: phpredis extension is active (v{$phpredisVersion}).");
        } elseif ($configuredClient === 'predis') {
            if (!class_exists(\Predis\Client::class)) {
                $this->error('FAIL: The "predis/predis" Composer package is not installed.');
                $this->line('  -> Resolution: Run "composer require predis/predis" or switch to phpredis.');
                return Command::FAILURE;
            }
            $this->line('  PASS: predis/predis package is available.');
        } else {
            $this->warn("  NOTICE: Unknown REDIS_CLIENT '{$configuredClient}'. Testing connection regardless...");
        }

        // 3. Test Ping on Connection
        $this->newLine();
        $this->info("[2/4] Testing Redis Ping on connection '{$connection}'...");

        try {
            $redis = Redis::connection($connection);
            $pingResult = $redis->ping();
            $pingStr = is_string($pingResult) ? $pingResult : (is_bool($pingResult) && $pingResult ? 'PONG' : json_encode($pingResult));

            $this->line("  PASS: Ping response received: {$pingStr}");
        } catch (Throwable $e) {
            $this->error("FAIL: Could not ping Redis server on connection '{$connection}'.");
            $this->line('  -> Error: ' . $e->getMessage());
            $this->line('  -> Troubleshooting:');
            $this->line("     - Verify that the Redis service is running: `systemctl status redis-server`");
            $this->line("     - Verify port accessibility: `nc -zv {$redisHost} {$redisPort}` or `telnet {$redisHost} {$redisPort}`");
            $this->line("     - Verify REDIS_PASSWORD matches the requirepass setting in redis.conf.");
            return Command::FAILURE;
        }

        // 4. Test Safe Read/Write/Delete on Connection
        $this->newLine();
        $this->info('[3/4] Performing Non-Destructive Key Write/Read/Delete...');

        $testKey = 'diag_verify_' . Str::random(12);
        $testPayload = 'payload_' . Str::random(16);

        try {
            // Write with 60 second safety expiration
            $redis->setex($testKey, 60, $testPayload);

            // Read back
            $readBack = $redis->get($testKey);

            if ($readBack !== $testPayload) {
                $this->error("FAIL: Value read back ('{$readBack}') does not match written value ('{$testPayload}').");
                $redis->del($testKey);
                return Command::FAILURE;
            }

            // Clean up immediately
            $redis->del($testKey);

            // Confirm deleted
            $postDelete = $redis->get($testKey);
            if (!empty($postDelete)) {
                $this->warn("WARN: Test key '{$testKey}' still exists after deletion.");
            } else {
                $this->line('  PASS: Test key successfully written, verified, and cleaned up.');
            }
        } catch (Throwable $e) {
            $this->error('FAIL: Error during read/write/delete test: ' . $e->getMessage());
            return Command::FAILURE;
        }

        // 5. Test Laravel Cache Facade Integration
        $this->newLine();
        $this->info('[4/4] Verifying Laravel Cache Facade integration...');

        if ($checkCacheStore) {
            $cacheKey = 'diag_cache_' . Str::random(12);
            $cacheValue = 'cache_val_' . Str::random(16);

            try {
                $storeInstance = Cache::store('redis');
                $storeInstance->put($cacheKey, $cacheValue, 60);

                $retrieved = $storeInstance->get($cacheKey);
                if ($retrieved !== $cacheValue) {
                    $this->error("FAIL: Cache store 'redis' returned unexpected value.");
                    $storeInstance->forget($cacheKey);
                    return Command::FAILURE;
                }

                $storeInstance->forget($cacheKey);
                $this->line("  PASS: Cache::store('redis') successfully stored, retrieved, and invalidated items.");
            } catch (Throwable $e) {
                $this->error("FAIL: Cache facade test failed with store 'redis': " . $e->getMessage());
                return Command::FAILURE;
            }
        } else {
            $this->line("  INFO: Active CACHE_STORE is '{$configuredStore}'. Skipped Cache::store('redis') test.");
            $this->line("        To test Cache facade specifically, run: `php artisan redis:verify --store`");
        }

        $this->newLine();
        $this->info('==================================================================');
        $this->info('STATUS: Redis connectivity & operations verified successfully!');
        $this->info('==================================================================');

        return Command::SUCCESS;
    }
}

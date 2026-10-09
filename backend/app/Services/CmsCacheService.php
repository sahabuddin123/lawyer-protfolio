<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CmsCacheService
{
    /**
     * Cache Time-To-Live Policies (in seconds)
     * 
     * - Site Settings & Navigation: 30 minutes
     * - Lawyer Profile & Practice Areas: 15 minutes
     * - Public Content Listings & Details: 10 minutes
     * - Homepage Aggregates: 10 minutes
     * - Static CMS Pages: 30 minutes
     * - Technical Sitemap: 24 hours
     */
    public const TTL_SETTINGS = 1800;       // 30 minutes
    public const TTL_NAVIGATION = 1800;     // 30 minutes
    public const TTL_HOME = 600;            // 10 minutes
    public const TTL_PAGE = 1800;           // 30 minutes
    public const TTL_PROFILE = 900;         // 15 minutes
    public const TTL_PRACTICE_AREAS = 900;  // 15 minutes
    public const TTL_COURTROOM = 600;       // 10 minutes
    public const TTL_RESEARCH = 600;        // 10 minutes
    public const TTL_JUDGMENTS = 600;       // 10 minutes
    public const TTL_PUBLICATIONS = 600;    // 10 minutes
    public const TTL_MEDIA = 600;           // 10 minutes
    public const TTL_VIDEOS = 600;          // 10 minutes
    public const TTL_GALLERY = 600;         // 10 minutes
    public const TTL_CONTACT = 1800;        // 30 minutes
    public const TTL_SITEMAP = 86400;       // 24 hours

    /**
     * Get the current cache generation version for a given module namespace.
     * Works across all cache stores (Redis, database, file, array).
     */
    public static function version(string $module): int
    {
        return (int) Cache::get("cms:version:{$module}", 1);
    }

    /**
     * Increment the generation version for a module namespace.
     * This instantly and atomically invalidates all associated list query permutations.
     */
    public static function bumpVersion(string $module): int
    {
        $current = static::version($module);
        $next = $current + 1;
        Cache::forever("cms:version:{$module}", $next);
        return $next;
    }

    /**
     * Generic versioned list key generator.
     */
    public static function listKey(string $module, string $locale, array $params = []): string
    {
        $v = static::version($module);
        ksort($params);
        $paramHash = empty($params) ? 'default' : md5((string) json_encode($params));
        return "cms:{$module}:list:v{$v}:{$locale}:{$paramHash}";
    }

    /**
     * Generic detail key generator.
     */
    public static function detailKey(string $module, string $slug, string $locale): string
    {
        return "cms:{$module}:detail:{$slug}:{$locale}";
    }

    /**
     * Generic detail cache invalidator.
     */
    public static function forgetDetail(string $module, string $slug, ?string $locale = null): void
    {
        $locales = $locale ? [$locale] : (array) config('app.supported_locales', ['en', 'bn']);
        foreach ($locales as $loc) {
            Cache::forget(static::detailKey($module, $slug, $loc));
        }
    }

    /**
     * Cache key generators
     */
    public static function settingsKey(string $locale): string
    {
        $v = static::version('settings');
        return "cms:settings:public:v{$v}:{$locale}";
    }

    public static function navigationKey(string $locale): string
    {
        $v = static::version('navigation');
        return "cms:navigation:public:v{$v}:{$locale}";
    }

    public static function homeKey(string $locale): string
    {
        $v = static::version('home');
        return "cms:home:public:v{$v}:{$locale}";
    }

    public static function pageKey(string $slug, string $locale): string
    {
        return "cms:page:public:{$slug}:{$locale}";
    }

    public static function profileKey(string $locale): string
    {
        $v = static::version('profile');
        return "cms:profile:public:v{$v}:{$locale}";
    }

    public static function credentialsKey(string $locale): string
    {
        return "cms:credentials:public:{$locale}";
    }

    public static function timelineKey(string $locale): string
    {
        return "cms:timeline:public:{$locale}";
    }

    public static function practiceAreasListKey(string $locale, int $page = 1, ?string $search = null, ?bool $featured = null): string
    {
        $v = static::version('practice_areas');
        $searchHash = $search ? md5(trim($search)) : 'all';
        $featStr = $featured === null ? 'all' : ($featured ? '1' : '0');
        return "cms:practice_areas:list:v{$v}:{$locale}:p{$page}:s{$searchHash}:f{$featStr}";
    }

    public static function practiceAreaDetailKey(string $slug, string $locale): string
    {
        return "cms:practice_area:detail:{$slug}:{$locale}";
    }

    public static function courtroomListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $v = static::version('courtroom');
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:courtroom:list:v{$v}:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function courtroomDetailKey(string $slug, string $locale): string
    {
        return "cms:courtroom:detail:{$slug}:{$locale}";
    }

    public static function researchListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $v = static::version('research');
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:research:list:v{$v}:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function researchDetailKey(string $slug, string $locale): string
    {
        return "cms:research:detail:{$slug}:{$locale}";
    }

    public static function judgmentListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $v = static::version('judgments');
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:judgments:list:v{$v}:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function judgmentDetailKey(string $slug, string $locale): string
    {
        return "cms:judgments:detail:{$slug}:{$locale}";
    }

    public static function publicationListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $v = static::version('publications');
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:publications:list:v{$v}:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function publicationDetailKey(string $slug, string $locale): string
    {
        return "cms:publications:detail:{$slug}:{$locale}";
    }

    public static function mediaPressListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $v = static::version('media_press');
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:media_press:list:v{$v}:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function mediaPressDetailKey(string $slug, string $locale): string
    {
        return "cms:media_press:detail:{$slug}:{$locale}";
    }

    public static function mediaAppearancesListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $v = static::version('media_appearances');
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:media_appearances:list:v{$v}:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function mediaAppearancesDetailKey(string $slug, string $locale): string
    {
        return "cms:media_appearances:detail:{$slug}:{$locale}";
    }

    public static function videoListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $v = static::version('videos');
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:videos:list:v{$v}:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function videoDetailKey(string $slug, string $locale): string
    {
        return "cms:videos:detail:{$slug}:{$locale}";
    }

    public static function galleryListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $v = static::version('gallery');
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:gallery:list:v{$v}:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function galleryDetailKey(string $slug, string $locale): string
    {
        return "cms:gallery:detail:{$slug}:{$locale}";
    }

    public static function contactConfigKey(string $locale): string
    {
        return "cms:contact:config:{$locale}";
    }

    public static function sitemapKey(): string
    {
        return 'cms:sitemap:xml';
    }

    /**
     * Invalidation methods
     */
    public static function forgetSettings(): void
    {
        Cache::forget(static::settingsKey('en'));
        Cache::forget(static::settingsKey('bn'));
        static::bumpVersion('settings');
        static::forgetHome();
    }

    public static function forgetNavigation(): void
    {
        Cache::forget(static::navigationKey('en'));
        Cache::forget(static::navigationKey('bn'));
        static::bumpVersion('navigation');
    }

    public static function forgetHome(): void
    {
        Cache::forget(static::homeKey('en'));
        Cache::forget(static::homeKey('bn'));
    }

    public static function forgetPage(string $slug): void
    {
        Cache::forget(static::pageKey($slug, 'en'));
        Cache::forget(static::pageKey($slug, 'bn'));
        static::bumpVersion('pages');
    }

    public static function forgetProfile(): void
    {
        Cache::forget(static::profileKey('en'));
        Cache::forget(static::profileKey('bn'));
        Cache::forget(static::credentialsKey('en'));
        Cache::forget(static::credentialsKey('bn'));
        Cache::forget(static::timelineKey('en'));
        Cache::forget(static::timelineKey('bn'));
        static::bumpVersion('profile');
        static::forgetHome();
    }

    public static function forgetPracticeAreas(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::practiceAreaDetailKey($slug, 'en'));
            Cache::forget(static::practiceAreaDetailKey($slug, 'bn'));
        }

        static::bumpVersion('practice_areas');
        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            foreach (['all', '1', '0'] as $f) {
                Cache::forget("cms:practice_areas:list:en:p{$p}:sall:f{$f}");
                Cache::forget("cms:practice_areas:list:bn:p{$p}:sall:f{$f}");
            }
        }
    }

    public static function forgetCourtroom(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::courtroomDetailKey($slug, 'en'));
            Cache::forget(static::courtroomDetailKey($slug, 'bn'));
        }

        static::bumpVersion('courtroom');
        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:courtroom:list:en:p{$p}:fdefault");
            Cache::forget("cms:courtroom:list:bn:p{$p}:fdefault");
        }
    }

    public static function forgetResearch(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::researchDetailKey($slug, 'en'));
            Cache::forget(static::researchDetailKey($slug, 'bn'));
        }

        static::bumpVersion('research');
        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:research:list:en:p{$p}:fdefault");
            Cache::forget("cms:research:list:bn:p{$p}:fdefault");
        }
    }

    public static function forgetJudgments(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::judgmentDetailKey($slug, 'en'));
            Cache::forget(static::judgmentDetailKey($slug, 'bn'));
        }

        static::bumpVersion('judgments');
        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:judgments:list:en:p{$p}:fdefault");
            Cache::forget("cms:judgments:list:bn:p{$p}:fdefault");
        }
    }

    public static function forgetPublications(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::publicationDetailKey($slug, 'en'));
            Cache::forget(static::publicationDetailKey($slug, 'bn'));
        }

        static::bumpVersion('publications');
        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:publications:list:en:p{$p}:fdefault");
            Cache::forget("cms:publications:list:bn:p{$p}:fdefault");
        }
    }

    public static function forgetMediaPress(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::mediaPressDetailKey($slug, 'en'));
            Cache::forget(static::mediaPressDetailKey($slug, 'bn'));
        }

        static::bumpVersion('media_press');
        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:media_press:list:en:p{$p}:fdefault");
            Cache::forget("cms:media_press:list:bn:p{$p}:fdefault");
        }
    }

    public static function forgetMediaAppearances(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::mediaAppearancesDetailKey($slug, 'en'));
            Cache::forget(static::mediaAppearancesDetailKey($slug, 'bn'));
        }

        static::bumpVersion('media_appearances');
        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:media_appearances:list:en:p{$p}:fdefault");
            Cache::forget("cms:media_appearances:list:bn:p{$p}:fdefault");
        }
    }

    public static function forgetMedia(?string $slug = null): void
    {
        static::forgetMediaPress($slug);
        static::forgetMediaAppearances($slug);
    }

    public static function forgetVideos(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::videoDetailKey($slug, 'en'));
            Cache::forget(static::videoDetailKey($slug, 'bn'));
        }

        static::bumpVersion('videos');
        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:videos:list:en:p{$p}:fdefault");
            Cache::forget("cms:videos:list:bn:p{$p}:fdefault");
        }
    }

    public static function forgetGallery(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::galleryDetailKey($slug, 'en'));
            Cache::forget(static::galleryDetailKey($slug, 'bn'));
        }

        static::bumpVersion('gallery');
        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:gallery:list:en:p{$p}:fdefault");
            Cache::forget("cms:gallery:list:bn:p{$p}:fdefault");
        }
    }

    public static function forgetContactConfig(): void
    {
        Cache::forget(static::contactConfigKey('en'));
        Cache::forget(static::contactConfigKey('bn'));
        static::bumpVersion('contact');
    }

    public static function forgetSitemap(): void
    {
        Cache::forget(static::sitemapKey());
    }

    public static function flushAll(): void
    {
        static::forgetSettings();
        static::forgetNavigation();
        static::forgetHome();
        static::forgetProfile();
        static::forgetPracticeAreas();
        static::forgetCourtroom();
        static::forgetResearch();
        static::forgetJudgments();
        static::forgetPublications();
        static::forgetMedia();
        static::forgetVideos();
        static::forgetGallery();
        static::forgetContactConfig();
        static::forgetSitemap();
    }
}

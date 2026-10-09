<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CmsCacheService
{
    public const TTL_SETTINGS = 86400; // 24 hours
    public const TTL_NAVIGATION = 86400;
    public const TTL_HOME = 3600; // 1 hour
    public const TTL_PAGE = 86400;
    public const TTL_PROFILE = 86400;
    public const TTL_PRACTICE_AREAS = 86400;
    public const TTL_COURTROOM = 86400;
    public const TTL_RESEARCH = 86400;
    public const TTL_JUDGMENTS = 86400;
    public const TTL_PUBLICATIONS = 86400;
    public const TTL_MEDIA = 86400;
    public const TTL_VIDEOS = 86400;
    public const TTL_GALLERY = 86400;
    public const TTL_CONTACT = 86400;

    /**
     * Cache key generators
     */
    public static function settingsKey(string $locale): string
    {
        return "cms:settings:public:{$locale}";
    }

    public static function navigationKey(string $locale): string
    {
        return "cms:navigation:public:{$locale}";
    }

    public static function homeKey(string $locale): string
    {
        return "cms:home:public:{$locale}";
    }

    public static function pageKey(string $slug, string $locale): string
    {
        return "cms:page:public:{$slug}:{$locale}";
    }

    public static function profileKey(string $locale): string
    {
        return "cms:profile:public:{$locale}";
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
        $searchHash = $search ? md5(trim($search)) : 'all';
        $featStr = $featured === null ? 'all' : ($featured ? '1' : '0');
        return "cms:practice_areas:list:{$locale}:p{$page}:s{$searchHash}:f{$featStr}";
    }

    public static function practiceAreaDetailKey(string $slug, string $locale): string
    {
        return "cms:practice_area:detail:{$slug}:{$locale}";
    }

    public static function courtroomListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:courtroom:list:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function courtroomDetailKey(string $slug, string $locale): string
    {
        return "cms:courtroom:detail:{$slug}:{$locale}";
    }

    public static function researchListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:research:list:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function researchDetailKey(string $slug, string $locale): string
    {
        return "cms:research:detail:{$slug}:{$locale}";
    }

    public static function judgmentListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:judgments:list:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function judgmentDetailKey(string $slug, string $locale): string
    {
        return "cms:judgments:detail:{$slug}:{$locale}";
    }

    public static function publicationListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:publications:list:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function publicationDetailKey(string $slug, string $locale): string
    {
        return "cms:publications:detail:{$slug}:{$locale}";
    }

    public static function mediaPressListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:media_press:list:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function mediaPressDetailKey(string $slug, string $locale): string
    {
        return "cms:media_press:detail:{$slug}:{$locale}";
    }

    public static function mediaAppearancesListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:media_appearances:list:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function mediaAppearancesDetailKey(string $slug, string $locale): string
    {
        return "cms:media_appearances:detail:{$slug}:{$locale}";
    }

    /**
     * Invalidation methods
     */
    public static function forgetSettings(): void
    {
        Cache::forget(static::settingsKey('en'));
        Cache::forget(static::settingsKey('bn'));
        Cache::forget(static::homeKey('en'));
        Cache::forget(static::homeKey('bn'));
    }

    public static function forgetNavigation(): void
    {
        Cache::forget(static::navigationKey('en'));
        Cache::forget(static::navigationKey('bn'));
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
    }

    public static function forgetProfile(): void
    {
        Cache::forget(static::profileKey('en'));
        Cache::forget(static::profileKey('bn'));
        Cache::forget(static::credentialsKey('en'));
        Cache::forget(static::credentialsKey('bn'));
        Cache::forget(static::timelineKey('en'));
        Cache::forget(static::timelineKey('bn'));
    }

    public static function forgetPracticeAreas(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::practiceAreaDetailKey($slug, 'en'));
            Cache::forget(static::practiceAreaDetailKey($slug, 'bn'));
        }

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

        static::forgetHome();

        // Invalidate common courtroom pages
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

        static::forgetHome();

        // Invalidate common research pages
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

        static::forgetHome();

        // Invalidate common judgments pages
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

        static::forgetHome();

        // Invalidate common publications pages
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

    public static function videoListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:videos:list:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function videoDetailKey(string $slug, string $locale): string
    {
        return "cms:videos:detail:{$slug}:{$locale}";
    }

    public static function forgetVideos(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::videoDetailKey($slug, 'en'));
            Cache::forget(static::videoDetailKey($slug, 'bn'));
        }

        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:videos:list:en:p{$p}:fdefault");
            Cache::forget("cms:videos:list:bn:p{$p}:fdefault");
        }
    }

    public static function galleryListKey(string $locale, int $page = 1, array $filters = []): string
    {
        ksort($filters);
        $filterHash = !empty($filters) ? md5(http_build_query($filters)) : 'default';
        return "cms:gallery:list:{$locale}:p{$page}:f{$filterHash}";
    }

    public static function galleryDetailKey(string $slug, string $locale): string
    {
        return "cms:gallery:detail:{$slug}:{$locale}";
    }

    public static function forgetGallery(?string $slug = null): void
    {
        if ($slug) {
            Cache::forget(static::galleryDetailKey($slug, 'en'));
            Cache::forget(static::galleryDetailKey($slug, 'bn'));
        }

        static::forgetHome();

        for ($p = 1; $p <= 10; $p++) {
            Cache::forget("cms:gallery:list:en:p{$p}:fdefault");
            Cache::forget("cms:gallery:list:bn:p{$p}:fdefault");
        }
    }

    public static function contactConfigKey(string $locale): string
    {
        return "cms:contact:config:{$locale}";
    }

    public static function forgetContactConfig(): void
    {
        Cache::forget(static::contactConfigKey('en'));
        Cache::forget(static::contactConfigKey('bn'));
    }

    public static function sitemapKey(): string
    {
        return 'cms:sitemap:xml';
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



<?php

namespace App\Services;

use App\Models\CourtroomExperience;
use App\Models\GalleryAlbum;
use App\Models\JudgmentReview;
use App\Models\LegalResearch;
use App\Models\MediaAppearance;
use App\Models\MediaPress;
use App\Models\Page;
use App\Models\PracticeArea;
use App\Models\Publication;
use App\Models\Video;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class SitemapService
{
    /**
     * Get or generate the cached XML sitemap.
     */
    public function getXml(): string
    {
        return Cache::remember(CmsCacheService::sitemapKey(), 86400, function () {
            return $this->generateXml();
        });
    }

    /**
     * Generate the complete standards-compliant XML sitemap.
     */
    public function generateXml(): string
    {
        $baseUrl = rtrim(config('app.url', 'https://nijamuddin.com'), '/');
        if (!str_starts_with($baseUrl, 'http://') && !str_starts_with($baseUrl, 'https://')) {
            $baseUrl = 'https://' . $baseUrl;
        }

        $items = $this->collectAllPublicItems();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

        foreach ($items as $item) {
            $loc = htmlspecialchars($baseUrl . $item['path'], ENT_XML1);
            $lastmod = $item['lastmod'];
            $changefreq = $item['changefreq'];
            $priority = number_format($item['priority'], 1, '.', '');

            $enHref = htmlspecialchars($baseUrl . $item['path'], ENT_XML1);
            $separator = str_contains($item['path'], '?') ? '&amp;' : '?';
            $bnHref = htmlspecialchars($baseUrl . $item['path'] . $separator . 'lang=bn', ENT_XML1);
            $defaultHref = $enHref;

            $xml .= "  <url>\n";
            $xml .= "    <loc>{$loc}</loc>\n";
            if ($lastmod) {
                $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
            }
            $xml .= "    <changefreq>{$changefreq}</changefreq>\n";
            $xml .= "    <priority>{$priority}</priority>\n";
            $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"{$enHref}\"/>\n";
            $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"bn\" href=\"{$bnHref}\"/>\n";
            $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{$defaultHref}\"/>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Collect all public, published, indexable entries.
     * Real timestamps are used; never fabricated.
     */
    public function collectAllPublicItems(): array
    {
        $items = [];

        // 1. Static Core Public Pages
        $staticPages = [
            ['path' => '/', 'priority' => 1.0, 'changefreq' => 'weekly'],
            ['path' => '/about', 'priority' => 0.9, 'changefreq' => 'monthly'],
            ['path' => '/practice-areas', 'priority' => 0.9, 'changefreq' => 'monthly'],
            ['path' => '/courtroom', 'priority' => 0.85, 'changefreq' => 'monthly'],
            ['path' => '/judgments', 'priority' => 0.85, 'changefreq' => 'weekly'],
            ['path' => '/research', 'priority' => 0.85, 'changefreq' => 'weekly'],
            ['path' => '/publications', 'priority' => 0.8, 'changefreq' => 'monthly'],
            ['path' => '/media', 'priority' => 0.8, 'changefreq' => 'monthly'],
            ['path' => '/videos', 'priority' => 0.8, 'changefreq' => 'monthly'],
            ['path' => '/gallery', 'priority' => 0.75, 'changefreq' => 'monthly'],
            ['path' => '/contact', 'priority' => 0.85, 'changefreq' => 'monthly'],
        ];

        foreach ($staticPages as $sp) {
            $items[] = [
                'type' => 'static',
                'path' => $sp['path'],
                'priority' => $sp['priority'],
                'changefreq' => $sp['changefreq'],
                'lastmod' => Carbon::now()->startOfWeek()->toIso8601String(),
            ];
        }

        // 2. Published Practice Areas
        $practiceAreas = PracticeArea::published()->select('slug', 'updated_at')->get();
        foreach ($practiceAreas as $pa) {
            $items[] = [
                'type' => 'practice_area',
                'path' => '/practice-areas/' . $pa->slug,
                'priority' => 0.85,
                'changefreq' => 'monthly',
                'lastmod' => $pa->updated_at?->toIso8601String(),
            ];
        }

        // 3. Published + Public Courtroom Experiences
        $cases = CourtroomExperience::published()
            ->where('visibility', 'public')
            ->select('slug', 'updated_at')
            ->get();
        foreach ($cases as $c) {
            $items[] = [
                'type' => 'courtroom',
                'path' => '/courtroom/' . $c->slug,
                'priority' => 0.8,
                'changefreq' => 'monthly',
                'lastmod' => $c->updated_at?->toIso8601String(),
            ];
        }

        // 4. Published + Public Judgment Reviews
        $judgments = JudgmentReview::published()
            ->where('visibility', 'public')
            ->select('slug', 'updated_at')
            ->get();
        foreach ($judgments as $j) {
            $items[] = [
                'type' => 'judgment',
                'path' => '/judgments/' . $j->slug,
                'priority' => 0.8,
                'changefreq' => 'monthly',
                'lastmod' => $j->updated_at?->toIso8601String(),
            ];
        }

        // 5. Published + Public Legal Research
        $research = LegalResearch::published()
            ->where('visibility', 'public')
            ->select('slug', 'updated_at')
            ->get();
        foreach ($research as $r) {
            $items[] = [
                'type' => 'research',
                'path' => '/research/' . $r->slug,
                'priority' => 0.8,
                'changefreq' => 'monthly',
                'lastmod' => $r->updated_at?->toIso8601String(),
            ];
        }

        // 6. Published + Public Publications
        $publications = Publication::published()
            ->where('visibility', 'public')
            ->select('slug', 'updated_at')
            ->get();
        foreach ($publications as $pub) {
            $items[] = [
                'type' => 'publication',
                'path' => '/publications/' . $pub->slug,
                'priority' => 0.75,
                'changefreq' => 'monthly',
                'lastmod' => $pub->updated_at?->toIso8601String(),
            ];
        }

        // 7. Published + Public Videos
        $videos = Video::published()
            ->where('visibility', 'public')
            ->select('slug', 'updated_at')
            ->get();
        foreach ($videos as $v) {
            $items[] = [
                'type' => 'video',
                'path' => '/videos/' . $v->slug,
                'priority' => 0.75,
                'changefreq' => 'monthly',
                'lastmod' => $v->updated_at?->toIso8601String(),
            ];
        }

        // 8. Published + Public Media (Press & Appearances)
        $press = MediaPress::published()
            ->where('visibility', 'public')
            ->select('slug', 'updated_at')
            ->get();
        foreach ($press as $m) {
            $items[] = [
                'type' => 'media_press',
                'path' => '/media/press/' . $m->slug,
                'priority' => 0.75,
                'changefreq' => 'monthly',
                'lastmod' => $m->updated_at?->toIso8601String(),
            ];
        }

        $appearances = MediaAppearance::published()
            ->where('visibility', 'public')
            ->select('slug', 'updated_at')
            ->get();
        foreach ($appearances as $app) {
            $items[] = [
                'type' => 'media_appearance',
                'path' => '/media/appearances/' . $app->slug,
                'priority' => 0.75,
                'changefreq' => 'monthly',
                'lastmod' => $app->updated_at?->toIso8601String(),
            ];
        }

        // 9. Published + Public Gallery Albums
        $albums = GalleryAlbum::published()
            ->where('visibility', 'public')
            ->select('slug', 'updated_at')
            ->get();
        foreach ($albums as $alb) {
            $items[] = [
                'type' => 'gallery',
                'path' => '/gallery/' . $alb->slug,
                'priority' => 0.7,
                'changefreq' => 'monthly',
                'lastmod' => $alb->updated_at?->toIso8601String(),
            ];
        }

        // 10. Published Custom CMS Pages
        $pages = Page::where('status', 'published')->select('slug', 'updated_at')->get();
        foreach ($pages as $p) {
            $items[] = [
                'type' => 'page',
                'path' => '/pages/' . $p->slug,
                'priority' => 0.7,
                'changefreq' => 'monthly',
                'lastmod' => $p->updated_at?->toIso8601String(),
            ];
        }

        return $items;
    }
}

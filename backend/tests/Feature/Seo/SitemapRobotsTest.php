<?php

namespace Tests\Feature\Seo;

use App\Models\CourtroomExperience;
use App\Models\PracticeArea;
use App\Models\Publication;
use App\Services\CmsCacheService;
use App\Services\SitemapService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SitemapRobotsTest extends TestCase
{
    use DatabaseTransactions;

    public function test_sitemap_xml_returns_valid_structure_and_headers(): void
    {
        $response = $this->get('/sitemap.xml');
        $response->assertStatus(200);
        $this->assertStringContainsString('application/xml', $response->headers->get('Content-Type'));
        $this->assertEquals('noindex, follow', $response->headers->get('X-Robots-Tag'));

        $content = $response->getContent();
        $this->assertStringContainsString('<?xml version="1.0" encoding="UTF-8"?>', $content);
        $this->assertStringContainsString('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', $content);
        $this->assertStringContainsString('<loc>', $content);
        $this->assertStringContainsString('<changefreq>', $content);
        $this->assertStringContainsString('<priority>', $content);
        $this->assertStringContainsString('hreflang="en"', $content);
        $this->assertStringContainsString('hreflang="bn"', $content);
        $this->assertStringContainsString('hreflang="x-default"', $content);
    }

    public function test_sitemap_includes_published_content_and_excludes_draft_and_private(): void
    {
        $publishedArea = PracticeArea::create([
            'title' => ['en' => 'Test Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
            'slug' => 'test-sitemap-area-' . uniqid(),
            'short_description' => ['en' => 'Short desc', 'bn' => 'বিবরণ'],
            'full_description' => ['en' => 'Full desc', 'bn' => 'সম্পূর্ণ বিবরণ'],
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        $draftArea = PracticeArea::create([
            'title' => ['en' => 'Draft Area', 'bn' => 'ড্রাফট'],
            'slug' => 'draft-sitemap-area-' . uniqid(),
            'short_description' => ['en' => 'Draft', 'bn' => 'ড্রাফট'],
            'full_description' => ['en' => 'Draft', 'bn' => 'ড্রাফট'],
            'status' => 'draft',
            'is_featured' => false,
            'sort_order' => 2,
        ]);

        $privateCase = CourtroomExperience::create([
            'title' => ['en' => 'Private Case', 'bn' => 'গোপনীয়'],
            'slug' => 'private-sitemap-case-' . uniqid(),
            'case_number' => 'Priv 001/2026',
            'court' => 'Chamber',
            'case_type' => 'In Camera',
            'legal_area' => ['en' => 'Private', 'bn' => 'গোপনীয়'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Confidential', 'bn' => 'গোপনীয়'],
            'description' => ['en' => 'Confidential background', 'bn' => 'পটভূমি'],
            'year' => 2026,
            'status' => 'published',
            'visibility' => 'private',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now()->subDay(),
        ]);

        CmsCacheService::forgetSitemap();

        $response = $this->get('/sitemap.xml');
        $response->assertStatus(200);

        $content = $response->getContent();
        $this->assertStringContainsString('/practice-areas/' . $publishedArea->slug, $content);
        $this->assertStringNotContainsString('/practice-areas/' . $draftArea->slug, $content);
        $this->assertStringNotContainsString('/courtroom/' . $privateCase->slug, $content);
    }

    public function test_sitemap_json_summary_endpoint(): void
    {
        $response = $this->getJson('/api/v1/sitemap');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'total_urls',
                    'urls' => [
                        '*' => [
                            'type',
                            'path',
                            'priority',
                            'changefreq',
                            'lastmod',
                        ],
                    ],
                ],
            ]);

        $this->assertGreaterThan(0, $response->json('data.total_urls'));
    }

    public function test_robots_txt_returns_proper_crawl_directives(): void
    {
        $response = $this->get('/robots.txt');
        $response->assertStatus(200);
        $this->assertStringContainsString('text/plain', $response->headers->get('Content-Type'));

        $content = $response->getContent();
        $this->assertStringContainsString('User-agent: *', $content);
        $this->assertStringContainsString('Allow: /', $content);
        $this->assertStringContainsString('Disallow: /admin/', $content);
        $this->assertStringContainsString('Disallow: /api/', $content);
        $this->assertStringContainsString('Disallow: /storage/secure/', $content);
        $this->assertStringContainsString('Sitemap: ', $content);
        $this->assertStringContainsString('/sitemap.xml', $content);
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\SitemapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __construct(
        protected SitemapService $sitemapService
    ) {}

    /**
     * Return the standard XML sitemap for search crawlers.
     */
    public function index(): Response
    {
        $xml = $this->sitemapService->getXml();

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'X-Robots-Tag' => 'noindex, follow', // Sitemaps themselves do not need indexation in search results
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Return JSON summary of indexable public items for audit and client tooling.
     */
    public function jsonSummary(): JsonResponse
    {
        $items = $this->sitemapService->collectAllPublicItems();

        return ApiResponse::success([
            'total_urls' => count($items),
            'urls' => $items,
        ], 'Sitemap summary retrieved successfully.');
    }
}

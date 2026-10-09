<?php

namespace App\Http\Controllers\Api\v1\Public;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\PageResource;
use App\Models\Page;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PageController extends Controller
{
    /**
     * Retrieve a published page by slug with SEO metadata.
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::pageKey($slug, $locale);

        $pageData = Cache::remember($cacheKey, CmsCacheService::TTL_PAGE, function () use ($slug, $request) {
            $page = Page::published()
                ->where('slug', $slug)
                ->with('seo')
                ->first();

            if (!$page) {
                return null;
            }

            return (new PageResource($page))->toArray($request);
        });

        if (!$pageData) {
            return ApiResponse::notFound('Page not found or is not published.');
        }

        return ApiResponse::success($pageData, 'Page retrieved successfully.');
    }
}

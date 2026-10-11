<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\MediaAppearanceDetailResource;
use App\Http\Resources\V1\MediaAppearanceResource;
use App\Http\Resources\V1\MediaPressDetailResource;
use App\Http\Resources\V1\MediaPressResource;
use App\Http\Responses\ApiResponse;
use App\Models\MediaAppearance;
use App\Models\MediaPress;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MediaController extends Controller
{
    /**
     * Unified public media index endpoint supporting tabs (all, press, appearances),
     * featured highlights, search, and type filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $kind = $request->input('kind', 'all');

        if ($kind === 'press') {
            return app(MediaPressController::class)->index($request);
        }

        if ($kind === 'appearances' || $kind === 'electronic') {
            return app(MediaAppearanceController::class)->index($request);
        }

        // Aggregate view for /media (Featured highlights + Latest Press + Latest Appearances)
        $locale = app()->getLocale();
        $cacheKey = "cms:media:unified:{$locale}:" . md5(json_encode($request->all()));

        $data = Cache::remember($cacheKey, CmsCacheService::TTL_MEDIA, function () use ($request) {
            $pressQuery = MediaPress::query()
                ->published()
                ->publicVisibility()
                ->with(['category', 'tags', 'featuredImage', 'documentMedia'])
                ->orderBy('sort_order', 'asc')
                ->orderBy('published_date', 'desc')
                ->limit(6);

            $appearancesQuery = MediaAppearance::query()
                ->published()
                ->publicVisibility()
                ->with(['category', 'tags', 'thumbnail', 'documentMedia'])
                ->orderBy('sort_order', 'asc')
                ->orderBy('broadcast_date', 'desc')
                ->limit(6);

            $search = $request->input('search') ?: $request->input('q');
            if ($search) {
                $pressQuery->search($search);
                $appearancesQuery->search($search);
            }

            $featuredPress = MediaPress::query()
                ->published()
                ->publicVisibility()
                ->featured()
                ->with(['category', 'featuredImage'])
                ->orderBy('sort_order', 'asc')
                ->limit(2)
                ->get();

            $featuredAppearances = MediaAppearance::query()
                ->published()
                ->publicVisibility()
                ->featured()
                ->with(['category', 'thumbnail'])
                ->orderBy('sort_order', 'asc')
                ->limit(2)
                ->get();

            return [
                'featured_press' => MediaPressResource::collection($featuredPress)->toArray($request),
                'featured_appearances' => MediaAppearanceResource::collection($featuredAppearances)->toArray($request),
                'latest_press' => MediaPressResource::collection($pressQuery->get())->toArray($request),
                'latest_appearances' => MediaAppearanceResource::collection($appearancesQuery->get())->toArray($request),
            ];
        });

        return ApiResponse::success($data, 'Unified media overview retrieved successfully.');
    }

    /**
     * Unified show endpoint looking up either press article or appearance by slug.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        // 1. Check Press
        $press = MediaPress::query()
            ->where('slug', $slug)
            ->published()
            ->publicVisibility()
            ->with(['category', 'tags', 'featuredImage', 'documentMedia', 'seo.ogImage'])
            ->first();

        if ($press) {
            return app(MediaPressController::class)->show($slug, $request);
        }

        // 2. Check Appearances
        $appearance = MediaAppearance::query()
            ->where('slug', $slug)
            ->published()
            ->publicVisibility()
            ->with(['category', 'tags', 'thumbnail', 'documentMedia', 'seo.ogImage'])
            ->first();

        if ($appearance) {
            return app(MediaAppearanceController::class)->show($slug, $request);
        }

        return ApiResponse::notFound('Media item not found or unavailable.');
    }
}

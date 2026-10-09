<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\PracticeAreaDetailResource;
use App\Http\Resources\V1\PracticeAreaResource;
use App\Http\Responses\ApiResponse;
use App\Models\PracticeArea;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PracticeAreaController extends Controller
{
    /**
     * Retrieve a paginated list of published practice areas.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $page = (int) $request->input('page', 1);
        $search = $request->input('search') ?: $request->input('q');
        $featured = null;
        if ($request->has('featured')) {
            $featured = $request->boolean('featured');
        } elseif ($request->has('is_featured')) {
            $featured = $request->boolean('is_featured');
        }
        $perPage = min(max((int) $request->input('per_page', 12), 1), 50);

        $cacheKey = CmsCacheService::practiceAreasListKey($locale, $page, $search, $featured);

        $cachedResponse = Cache::remember($cacheKey, CmsCacheService::TTL_PRACTICE_AREAS, function () use ($request, $search, $featured, $perPage) {
            $query = PracticeArea::published()
                ->with(['featuredImage'])
                ->search($search);

            if ($featured !== null) {
                $query->where('is_featured', $featured);
            }

            $paginator = $query->orderBy('sort_order', 'asc')
                ->orderBy('published_at', 'desc')
                ->orderBy('id', 'asc')
                ->paginate($perPage);

            $transformedData = PracticeAreaResource::collection($paginator->getCollection())->toArray($request);

            return [
                'data' => $transformedData,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                    'locale' => app()->getLocale(),
                    'timestamp' => now()->toIso8601String(),
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Practice areas retrieved successfully.',
            'data' => $cachedResponse['data'],
            'meta' => $cachedResponse['meta'],
        ]);
    }

    /**
     * Retrieve full details of a published practice area by slug.
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::practiceAreaDetailKey($slug, $locale);

        $cachedData = Cache::remember($cacheKey, CmsCacheService::TTL_PRACTICE_AREAS, function () use ($slug, $request) {
            $practiceArea = PracticeArea::published()
                ->where('slug', $slug)
                ->with(['featuredImage', 'seo'])
                ->first();

            if (!$practiceArea) {
                return null;
            }

            return (new PracticeAreaDetailResource($practiceArea))->toArray($request);
        });

        if (!$cachedData) {
            return ApiResponse::notFound('Practice area not found or is not published.');
        }

        return ApiResponse::success($cachedData, 'Practice area retrieved successfully.');
    }
}

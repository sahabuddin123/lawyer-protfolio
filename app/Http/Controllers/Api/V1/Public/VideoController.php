<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\VideoDetailResource;
use App\Http\Resources\V1\VideoResource;
use App\Http\Responses\ApiResponse;
use App\Models\Redirect;
use App\Models\Video;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class VideoController extends Controller
{
    /**
     * List published videos for the public video library.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $page = (int) $request->input('page', 1);

        $filters = array_filter([
            'search' => $request->input('search') ?: $request->input('q'),
            'platform' => $request->input('platform'),
            'category' => $request->input('category_id') ?: $request->input('category'),
            'tag' => $request->input('tag'),
            'year' => $request->input('year'),
            'featured' => $request->has('featured') ? $request->boolean('featured') : null,
            'per_page' => $request->input('per_page'),
        ], fn ($val) => $val !== null && $val !== '');

        $cacheKey = CmsCacheService::videoListKey($locale, $page, $filters);

        $payload = Cache::remember($cacheKey, CmsCacheService::TTL_VIDEOS ?? 86400, function () use ($request, $filters) {
            $query = Video::query()
                ->published()
                ->public()
                ->with([
                    'category',
                    'tags',
                    'thumbnail',
                ]);

            if (!empty($filters['search'])) {
                $query->search($filters['search']);
            }

            if (!empty($filters['platform'])) {
                $query->platform($filters['platform']);
            }

            if (!empty($filters['category'])) {
                if (is_numeric($filters['category'])) {
                    $query->where('category_id', (int) $filters['category']);
                } else {
                    $query->categorySlug($filters['category']);
                }
            }

            if (!empty($filters['tag'])) {
                $tag = $filters['tag'];
                $query->whereHas('tags', function ($q) use ($tag) {
                    if (is_numeric($tag)) {
                        $q->where('tags.id', (int) $tag);
                    } else {
                        $q->where('tags.slug', $tag);
                    }
                });
            }

            if (!empty($filters['year'])) {
                $year = (int) $filters['year'];
                $query->whereYear('published_date', $year);
            }

            if (isset($filters['featured'])) {
                $query->where('is_featured', $filters['featured']);
            }

            $query->orderBy('is_featured', 'desc')
                ->orderBy('sort_order', 'asc')
                ->orderBy('published_date', 'desc')
                ->orderBy('created_at', 'desc');

            $perPage = min(max((int) ($filters['per_page'] ?? 12), 1), 50);
            $paginator = $query->paginate($perPage);

            return [
                'items' => VideoResource::collection($paginator->getCollection())->toArray($request),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Videos retrieved successfully.',
            'data' => $payload['items'],
            'meta' => [
                'pagination' => $payload['pagination'],
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Show a published video by slug.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::videoDetailKey($slug, $locale);

        $data = Cache::remember($cacheKey, CmsCacheService::TTL_VIDEOS ?? 86400, function () use ($slug, $request) {
            $video = Video::query()
                ->where('slug', $slug)
                ->published()
                ->public()
                ->with([
                    'category',
                    'tags',
                    'thumbnail',
                    'seo.ogImage',
                ])
                ->first();

            if (!$video) {
                return null;
            }

            return (new VideoDetailResource($video))->toArray($request);
        });

        if (!$data) {
            // Check for 301 redirect
            $redirect = Redirect::where('source_url', "/videos/{$slug}")
                ->where('is_active', true)
                ->first();

            if ($redirect) {
                return response()->json([
                    'success' => false,
                    'message' => 'Video has moved.',
                    'redirect_url' => $redirect->target_url,
                    'status_code' => 301,
                ], 301)->header('Location', $redirect->target_url);
            }

            return ApiResponse::notFound('Video not found or unavailable.');
        }

        return ApiResponse::success($data, 'Video retrieved successfully.');
    }
}

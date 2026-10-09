<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\GalleryAlbumDetailResource;
use App\Http\Resources\V1\GalleryAlbumResource;
use App\Http\Responses\ApiResponse;
use App\Models\GalleryAlbum;
use App\Models\Redirect;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicGalleryController extends Controller
{
    /**
     * Display a paginated, cached list of published gallery albums.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $page = (int) $request->input('page', 1);
        $search = $request->input('search') ?: $request->input('q');
        $category = $request->input('category');
        $featured = $request->input('featured');

        $filters = array_filter([
            's' => $search,
            'cat' => $category,
            'feat' => $featured,
        ]);

        $cacheKey = CmsCacheService::galleryListKey($locale, $page, $filters);

        $data = Cache::remember($cacheKey, CmsCacheService::TTL_GALLERY, function () use ($request, $search, $category, $featured) {
            $query = GalleryAlbum::query()
                ->published()
                ->public()
                ->with([
                    'category',
                    'coverImage',
                ]);

            if ($search) {
                $query->search($search);
            }

            if ($category) {
                if (is_numeric($category)) {
                    $query->where('category_id', (int) $category);
                } else {
                    $query->categorySlug($category);
                }
            }

            if ($featured !== null && $featured !== '') {
                $query->where('is_featured', filter_var($featured, FILTER_VALIDATE_BOOLEAN));
            }

            $query->orderBy('is_featured', 'desc')
                ->orderBy('sort_order', 'asc')
                ->orderBy('event_date', 'desc')
                ->orderBy('id', 'desc');

            $perPage = min((int) $request->input('per_page', 12), 36);
            $paginator = $query->paginate($perPage);

            return [
                'items' => GalleryAlbumResource::collection($paginator->getCollection())->resolve(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'has_more_pages' => $paginator->hasMorePages(),
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Gallery albums retrieved successfully.',
            'data' => $data['items'],
            'meta' => array_merge($data['pagination'], [
                'locale' => $locale,
                'timestamp' => now()->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Display a specific published gallery album with public images and related albums.
     */
    public function show(string $slug): JsonResponse
    {
        $locale = app()->getLocale();

        // 1. Try finding published & public album
        $album = GalleryAlbum::query()
            ->published()
            ->public()
            ->where('slug', $slug)
            ->with([
                'category',
                'coverImage',
                'seo',
                'publicImages.media',
            ])
            ->first();

        // 2. If not found, check 301 redirects table
        if (!$album) {
            $redirect = Redirect::where('source_url', "/gallery/{$slug}")
                ->where('is_active', true)
                ->first();

            if ($redirect) {
                return response()->json([
                    'success' => true,
                    'message' => 'Album permanently moved.',
                    'redirect_url' => $redirect->target_url,
                    'status_code' => 301,
                ], 301)->header('Location', $redirect->target_url);
            }

            // Return 404 for drafts, private, or nonexistent albums
            return ApiResponse::notFound('Gallery album not found or not currently available.');
        }

        $cacheKey = CmsCacheService::galleryDetailKey($slug, $locale);

        $payload = Cache::remember($cacheKey, CmsCacheService::TTL_GALLERY, function () use ($album) {
            return (new GalleryAlbumDetailResource($album))->resolve();
        });

        return ApiResponse::success($payload, 'Gallery album details retrieved.');
    }
}

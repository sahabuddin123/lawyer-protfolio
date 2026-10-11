<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\MediaAppearanceDetailResource;
use App\Http\Resources\V1\MediaAppearanceResource;
use App\Http\Responses\ApiResponse;
use App\Models\MediaAppearance;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MediaAppearanceController extends Controller
{
    /**
     * List published electronic media appearances.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $page = (int) $request->input('page', 1);

        $filters = array_filter([
            'search' => $request->input('search') ?: $request->input('q'),
            'type' => $request->input('type') ?: $request->input('media_type'),
            'category' => $request->input('category_id') ?: $request->input('category'),
            'tag' => $request->input('tag'),
            'channel' => $request->input('channel'),
            'year' => $request->input('year'),
            'featured' => $request->has('featured') ? $request->boolean('featured') : null,
            'per_page' => $request->input('per_page'),
        ], fn ($val) => $val !== null && $val !== '');

        $cacheKey = CmsCacheService::mediaAppearancesListKey($locale, $page, $filters);

        $payload = Cache::remember($cacheKey, CmsCacheService::TTL_MEDIA, function () use ($request, $filters) {
            $query = MediaAppearance::query()
                ->published()
                ->publicVisibility()
                ->with([
                    'category',
                    'tags',
                    'thumbnail',
                    'documentMedia',
                ]);

            if (!empty($filters['search'])) {
                $query->search($filters['search']);
            }

            if (!empty($filters['type'])) {
                $query->filterType($filters['type']);
            }

            if (!empty($filters['category'])) {
                $query->filterCategory($filters['category']);
            }

            if (!empty($filters['tag'])) {
                $query->filterTag($filters['tag']);
            }

            if (!empty($filters['channel'])) {
                $query->filterChannel($filters['channel']);
            }

            if (!empty($filters['year'])) {
                $query->filterYear((int) $filters['year']);
            }

            if (isset($filters['featured'])) {
                $query->where('is_featured', $filters['featured']);
            }

            $query->orderBy('sort_order', 'asc')
                ->orderBy('broadcast_date', 'desc')
                ->orderBy('created_at', 'desc');

            $perPage = min(max((int) ($filters['per_page'] ?? 12), 1), 50);
            $paginator = $query->paginate($perPage);

            return [
                'items' => MediaAppearanceResource::collection($paginator->getCollection())->toArray($request),
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
            'message' => 'Electronic media appearances retrieved successfully.',
            'data' => $payload['items'],
            'meta' => [
                'pagination' => $payload['pagination'],
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Show a published electronic media appearance by slug.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::mediaAppearancesDetailKey($slug, $locale);

        $data = Cache::remember($cacheKey, CmsCacheService::TTL_MEDIA, function () use ($slug, $request) {
            $appearance = MediaAppearance::query()
                ->where('slug', $slug)
                ->published()
                ->publicVisibility()
                ->with([
                    'category',
                    'tags',
                    'thumbnail',
                    'documentMedia',
                    'seo.ogImage',
                ])
                ->first();

            if (!$appearance) {
                return null;
            }

            // Retrieve related items (same media_type, published and public)
            $related = MediaAppearance::query()
                ->where('id', '!=', $appearance->id)
                ->where('media_type', $appearance->media_type)
                ->published()
                ->publicVisibility()
                ->with(['thumbnail'])
                ->orderBy('broadcast_date', 'desc')
                ->limit(3)
                ->get();

            $relatedFormatted = MediaAppearanceResource::collection($related)->toArray($request);

            return (new MediaAppearanceDetailResource($appearance))
                ->withRelated($relatedFormatted)
                ->toArray($request);
        });

        if (!$data) {
            return ApiResponse::notFound('Electronic media appearance not found or unavailable.');
        }

        return ApiResponse::success($data, 'Electronic media appearance retrieved successfully.');
    }

    /**
     * Download attached document for published & public appearance.
     */
    public function downloadDocument(string $slug): BinaryFileResponse|JsonResponse
    {
        $appearance = MediaAppearance::query()
            ->where(function ($q) use ($slug) {
                if (is_numeric($slug)) {
                    $q->where('id', (int) $slug);
                } else {
                    $q->where('slug', $slug);
                }
            })
            ->published()
            ->publicVisibility()
            ->with(['documentMedia'])
            ->first();

        if (!$appearance || empty($appearance->document_media_id) || !$appearance->documentMedia) {
            return ApiResponse::notFound('Document not found or inaccessible.');
        }

        $document = $appearance->documentMedia;
        $disk = $document->disk ?? 'public';
        $filePath = $document->file_path;

        if (!Storage::disk($disk)->exists($filePath)) {
            return ApiResponse::notFound('Physical document file not found.');
        }

        $absolutePath = Storage::disk($disk)->path($filePath);
        $downloadName = $document->original_name ?: basename($filePath);

        return response()->download($absolutePath, $downloadName, [
            'Content-Type' => $document->mime_type ?: 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

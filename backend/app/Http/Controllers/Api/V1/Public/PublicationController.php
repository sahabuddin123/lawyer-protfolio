<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\PublicationDetailResource;
use App\Http\Resources\V1\PublicationResource;
use App\Http\Responses\ApiResponse;
use App\Models\Publication;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicationController extends Controller
{
    /**
     * Retrieve a paginated list of published and public publications.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $page = max((int) $request->input('page', 1), 1);
        $perPage = min(max((int) $request->input('per_page', 12), 1), 50);

        $search = $request->input('search') ?: $request->input('q');
        $type = $request->input('type') ?: $request->input('filter.type');
        $category = $request->input('category') ?: $request->input('filter.category');
        $tag = $request->input('tag') ?: $request->input('filter.tag');
        $author = $request->input('author') ?: $request->input('filter.author');
        $year = $request->input('year') ?: $request->input('filter.year');
        $featured = $request->has('featured') ? $request->boolean('featured') : ($request->has('is_featured') ? $request->boolean('is_featured') : null);

        $filterParams = array_filter([
            'type' => $type,
            'category' => $category,
            'tag' => $tag,
            'author' => $author,
            'year' => $year,
            'featured' => $featured,
        ], fn ($v) => $v !== null && $v !== '');

        $cacheKey = CmsCacheService::publicationListKey($locale, $page, $filterParams);

        // Serve cached listing if no active text search
        if (empty($search) && Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            return ApiResponse::paginated($cached['paginator_meta'], $cached['data'], 'Publications retrieved successfully.');
        }

        $query = Publication::query()
            ->published()
            ->publicVisibility()
            ->with(['category', 'tags', 'coverImage', 'pdfMedia']);

        if (!empty($search)) {
            $query->search($search);
        }

        if (!empty($type)) {
            $query->filterType($type);
        }

        if (!empty($category)) {
            $query->filterCategory($category);
        }

        if (!empty($tag)) {
            $query->filterTag($tag);
        }

        if (!empty($author)) {
            $query->filterAuthor($author);
        }

        if (!empty($year)) {
            $query->filterYear((int) $year);
        }

        if ($featured !== null) {
            $query->where('is_featured', $featured);
        }

        // Default sort: sort_order asc, then publication_date desc, published_at desc
        $query->orderBy('sort_order', 'asc')
            ->orderBy('publication_date', 'desc')
            ->orderBy('published_at', 'desc');

        $paginator = $query->paginate($perPage);

        $data = PublicationResource::collection($paginator->getCollection())->toArray($request);

        // Cache for 24h when no active search
        if (empty($search)) {
            Cache::put($cacheKey, [
                'paginator_meta' => $paginator,
                'data' => $data,
            ], CmsCacheService::TTL_PUBLICATIONS);
        }

        return ApiResponse::paginated($paginator, $data, 'Publications retrieved successfully.');
    }

    /**
     * Retrieve a single published publication by slug.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::publicationDetailKey($slug, $locale);

        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            return ApiResponse::success($cached, 'Publication details retrieved successfully.');
        }

        $publication = Publication::query()
            ->published()
            ->publicVisibility()
            ->where('slug', $slug)
            ->with(['category', 'tags', 'coverImage', 'pdfMedia', 'seo'])
            ->first();

        if (!$publication) {
            return ApiResponse::error('Publication not found or not published.', 404);
        }

        // Fetch related publications: deterministic matching, strictly published + public
        $relatedQuery = Publication::query()
            ->published()
            ->publicVisibility()
            ->where('id', '!=', $publication->id);

        if ($publication->category_id) {
            $relatedQuery->where('category_id', $publication->category_id);
        } elseif ($publication->publication_type) {
            $relatedQuery->where('publication_type', $publication->publication_type);
        }

        $related = $relatedQuery->orderBy('sort_order', 'asc')
            ->orderBy('publication_date', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->getTranslation('title', app()->getLocale()),
                    'slug' => $item->slug,
                    'publication_type' => $item->publication_type,
                    'publication_name' => $item->getTranslation('publication_name', app()->getLocale()),
                    'publication_date' => $item->publication_date?->format('Y-m-d'),
                    'author' => $item->getTranslation('author', app()->getLocale()),
                    'excerpt' => $item->getTranslation('excerpt', app()->getLocale()),
                    'cover_image' => $item->coverImage ? [
                        'id' => $item->coverImage->id,
                        'url' => $item->coverImage->url,
                        'alt_text' => $item->coverImage->alt_text,
                    ] : null,
                ];
            })
            ->all();

        $detailResource = (new PublicationDetailResource($publication))->withRelated($related);
        $payload = $detailResource->toArray($request);

        Cache::put($cacheKey, $payload, CmsCacheService::TTL_PUBLICATIONS);

        return ApiResponse::success($payload, 'Publication details retrieved successfully.');
    }

    /**
     * Direct streaming download of the attached publication PDF.
     */
    public function downloadPdf(string $slug, Request $request): BinaryFileResponse|JsonResponse
    {
        $publication = Publication::query()
            ->published()
            ->publicVisibility()
            ->where('slug', $slug)
            ->with('pdfMedia')
            ->first();

        if (!$publication || !$publication->pdfMedia) {
            return ApiResponse::notFound('Publication document not found or access denied.');
        }

        $media = $publication->pdfMedia;
        $disk = Storage::disk($media->disk ?: 'public');
        $path = $media->directory . '/' . $media->filename;

        if (!$disk->exists($path)) {
            return ApiResponse::notFound('Physical PDF document file not found on disk.');
        }

        $downloadName = $media->original_name ?: $media->filename;

        return response()->download($disk->path($path), $downloadName, [
            'Content-Type' => $media->mime_type ?: 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

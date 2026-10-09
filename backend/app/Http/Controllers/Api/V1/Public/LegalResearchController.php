<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\LegalResearchDetailResource;
use App\Http\Resources\V1\LegalResearchResource;
use App\Http\Responses\ApiResponse;
use App\Models\LegalResearch;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LegalResearchController extends Controller
{
    /**
     * Retrieve a paginated list of published and public legal research monographs.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $page = max((int) $request->input('page', 1), 1);
        $perPage = min(max((int) $request->input('per_page', 12), 1), 50);

        $search = $request->input('search') ?: $request->input('q');
        $category = $request->input('category') ?: $request->input('filter.category');
        $tag = $request->input('tag') ?: $request->input('filter.tag');
        $type = $request->input('type') ?: $request->input('research_type') ?: $request->input('filter.research_type');
        $featured = $request->has('featured') ? $request->boolean('featured') : ($request->has('is_featured') ? $request->boolean('is_featured') : null);

        $filterParams = array_filter([
            'category' => $category,
            'tag' => $tag,
            'type' => $type,
            'featured' => $featured,
        ], fn ($v) => $v !== null && $v !== '');

        $cacheKey = CmsCacheService::researchListKey($locale, $page, $filterParams);

        // Serve cached listing if no active text search
        if (empty($search) && Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            return ApiResponse::paginated($cached['paginator_meta'], $cached['data'], 'Legal research monographs retrieved successfully.');
        }

        $query = LegalResearch::query()
            ->published()
            ->publicVisibility()
            ->with(['category', 'tags', 'featuredImage', 'pdfMedia']);

        if (!empty($search)) {
            $query->search($search);
        }

        if (!empty($category)) {
            $query->filterCategory($category);
        }

        if (!empty($tag)) {
            $query->filterTag($tag);
        }

        if (!empty($type)) {
            $query->filterType($type);
        }

        if ($featured !== null) {
            $query->where('is_featured', $featured);
        }

        // Default sort: sort_order asc, then published_at desc
        $query->orderBy('sort_order', 'asc')
            ->orderBy('published_at', 'desc');

        $paginator = $query->paginate($perPage);

        $data = LegalResearchResource::collection($paginator->getCollection())->toArray($request);

        // Cache for 24h when no active search
        if (empty($search)) {
            Cache::put($cacheKey, [
                'paginator_meta' => $paginator,
                'data' => $data,
            ], CmsCacheService::TTL_RESEARCH);
        }

        return ApiResponse::paginated($paginator, $data, 'Legal research monographs retrieved successfully.');
    }

    /**
     * Retrieve a single published legal research monograph by slug.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::researchDetailKey($slug, $locale);

        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            return ApiResponse::success($cached, 'Legal research details retrieved successfully.');
        }

        $research = LegalResearch::query()
            ->published()
            ->publicVisibility()
            ->where('slug', $slug)
            ->with(['category', 'tags', 'featuredImage', 'pdfMedia', 'seo'])
            ->first();

        if (!$research) {
            return ApiResponse::error('Legal research monograph not found or not published.', 404);
        }

        // Fetch related research: deterministic ranking, strictly published + public
        $relatedQuery = LegalResearch::query()
            ->published()
            ->publicVisibility()
            ->where('id', '!=', $research->id)
            ->with(['category', 'tags', 'featuredImage'])
            ->limit(3);

        if ($research->category_id) {
            $relatedQuery->where('category_id', $research->category_id);
        } elseif ($research->research_type) {
            $relatedQuery->where('research_type', $research->research_type);
        }

        $related = LegalResearchResource::collection($relatedQuery->get())->toArray($request);

        // Increment view counter
        $research->increment('view_count');

        $resource = (new LegalResearchDetailResource($research))->withRelated($related);
        $data = $resource->toArray($request);

        Cache::put($cacheKey, $data, CmsCacheService::TTL_RESEARCH);

        return ApiResponse::success($data, 'Legal research details retrieved successfully.');
    }

    /**
     * Download public PDF document attached to legal research monograph.
     */
    public function downloadPdf(string $slug): BinaryFileResponse|JsonResponse
    {
        $research = LegalResearch::query()
            ->published()
            ->publicVisibility()
            ->where('slug', $slug)
            ->with('pdfMedia')
            ->first();

        if (!$research) {
            return ApiResponse::error('Legal research monograph not found or not available.', 404);
        }

        $media = $research->pdfMedia;
        if (!$media) {
            return ApiResponse::error('No attached PDF document found for this research monograph.', 404);
        }

        $disk = Storage::disk($media->disk ?: 'public');
        $path = $media->directory . '/' . $media->filename;

        if (!$disk->exists($path)) {
            return ApiResponse::error('Attached document file is not present on storage disk.', 404);
        }

        $downloadName = $media->original_name ?: $media->filename;

        return response()->download($disk->path($path), $downloadName, [
            'Content-Type' => $media->mime_type ?: 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

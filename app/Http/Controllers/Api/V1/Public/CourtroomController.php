<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\CourtroomExperienceDetailResource;
use App\Http\Resources\V1\CourtroomExperienceResource;
use App\Http\Responses\ApiResponse;
use App\Models\CaseDocument;
use App\Models\CourtroomExperience;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CourtroomController extends Controller
{
    /**
     * List all published, public courtroom experiences with filtering and search.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $page = (int) $request->input('page', 1);

        // Normalize filters from query string (support filter[key] and plain key)
        $filters = [];
        foreach (['court', 'case_type', 'year', 'practice_area_id', 'is_featured'] as $key) {
            $val = $request->input("filter.{$key}") ?? $request->input($key);
            if ($val !== null && $val !== '' && $val !== 'all') {
                $filters[$key] = $val;
            }
        }

        $search = trim($request->input('q') ?? $request->input('search') ?? '');
        if ($search !== '') {
            $filters['q'] = $search;
        }

        $cacheKey = CmsCacheService::courtroomListKey($locale, $page, $filters);
        $perPage = min(max((int) $request->input('per_page', 12), 1), 50);

        // If not authenticated admin, attempt cache retrieval
        if (empty($search) && Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            return ApiResponse::paginated(
                $cached['paginator_meta'],
                $cached['data'],
                'Courtroom experiences retrieved successfully.'
            );
        }

        $query = CourtroomExperience::query()
            ->published()
            ->publicVisibility()
            ->with(['practiceArea', 'featuredImage']);

        if (!empty($search)) {
            $query->search($search);
        }

        if (!empty($filters['court'])) {
            $query->where('court', $filters['court']);
        }

        if (!empty($filters['case_type'])) {
            $query->where('case_type', $filters['case_type']);
        }

        if (!empty($filters['year'])) {
            $query->where('year', (int) $filters['year']);
        }

        if (!empty($filters['practice_area_id'])) {
            $query->where('practice_area_id', (int) $filters['practice_area_id']);
        }

        if (isset($filters['is_featured'])) {
            $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN));
        }

        // Ordering: featured first, then sort_order asc, then year desc
        $query->orderBy('is_featured', 'desc')
              ->orderBy('sort_order', 'asc')
              ->orderBy('year', 'desc');

        $paginator = $query->paginate($perPage);
        $data = CourtroomExperienceResource::collection($paginator->getCollection())->toArray($request);

        // Cache response for 24h if no active text search
        if (empty($search)) {
            Cache::put($cacheKey, [
                'paginator_meta' => $paginator,
                'data' => $data,
            ], CmsCacheService::TTL_COURTROOM);
        }

        return ApiResponse::paginated($paginator, $data, 'Courtroom experiences retrieved successfully.');
    }

    /**
     * Retrieve a single courtroom experience by slug.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::courtroomDetailKey($slug, $locale);

        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            return ApiResponse::success($cached, 'Courtroom experience details retrieved successfully.');
        }

        $experience = CourtroomExperience::query()
            ->published()
            ->publicVisibility()
            ->where('slug', $slug)
            ->with(['practiceArea', 'featuredImage', 'seo', 'publicDocuments.media'])
            ->first();

        if (!$experience) {
            return ApiResponse::error('Courtroom experience not found or not published.', 404);
        }

        // Fetch related experiences (same practice area if available, else latest)
        $relatedQuery = CourtroomExperience::query()
            ->published()
            ->publicVisibility()
            ->where('id', '!=', $experience->id)
            ->with(['practiceArea', 'featuredImage'])
            ->limit(3);

        if ($experience->practice_area_id) {
            $relatedQuery->where('practice_area_id', $experience->practice_area_id);
        }

        $related = CourtroomExperienceResource::collection($relatedQuery->get())->toArray($request);

        $resource = (new CourtroomExperienceDetailResource($experience))->withRelated($related);
        $data = $resource->toArray($request);

        Cache::put($cacheKey, $data, CmsCacheService::TTL_COURTROOM);

        return ApiResponse::success($data, 'Courtroom experience details retrieved successfully.');
    }

    /**
     * Download a public, non-confidential case document.
     */
    public function downloadDocument(int $id): BinaryFileResponse|JsonResponse
    {
        $document = CaseDocument::query()
            ->where('id', $id)
            ->where('is_confidential', false)
            ->with(['courtroomExperience', 'media'])
            ->first();

        if (!$document) {
            return ApiResponse::error('Document not found or is confidential.', 404);
        }

        // Enforce parent courtroom experience publication and public visibility
        $parent = $document->courtroomExperience;
        if (!$parent || !$parent->isPublished() || $parent->visibility !== 'public') {
            return ApiResponse::error('Case document is not available for public download.', 404);
        }

        $media = $document->media;
        if (!$media) {
            return ApiResponse::error('Attached media file not found.', 404);
        }

        $disk = Storage::disk($media->disk ?: 'public');
        $path = $media->directory . '/' . $media->filename;

        if (!$disk->exists($path)) {
            return ApiResponse::error('File not found in storage.', 404);
        }

        // Increment public download count
        $document->increment('download_count');

        $downloadName = $media->original_name ?: $media->filename;

        return response()->download($disk->path($path), $downloadName, [
            'Content-Type' => $media->mime_type ?: 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

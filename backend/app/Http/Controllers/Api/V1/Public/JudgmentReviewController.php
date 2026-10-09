<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\JudgmentReviewDetailResource;
use App\Http\Resources\V1\JudgmentReviewResource;
use App\Http\Responses\ApiResponse;
use App\Models\JudgmentReview;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class JudgmentReviewController extends Controller
{
    /**
     * Retrieve a paginated list of published and public judgment reviews.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $page = max((int) $request->input('page', 1), 1);
        $perPage = min(max((int) $request->input('per_page', 12), 1), 50);

        $search = $request->input('search') ?: $request->input('q');
        $court = $request->input('court') ?: $request->input('filter.court');
        $legalArea = $request->input('legal_area') ?: $request->input('filter.legal_area');
        $practiceArea = $request->input('practice_area') ?: $request->input('filter.practice_area');
        $category = $request->input('category') ?: $request->input('filter.category');
        $tag = $request->input('tag') ?: $request->input('filter.tag');
        $year = $request->input('year') ?: $request->input('filter.year');
        $featured = $request->has('featured') ? $request->boolean('featured') : ($request->has('is_featured') ? $request->boolean('is_featured') : null);

        $filterParams = array_filter([
            'court' => $court,
            'legal_area' => $legalArea,
            'practice_area' => $practiceArea,
            'category' => $category,
            'tag' => $tag,
            'year' => $year,
            'featured' => $featured,
        ], fn ($v) => $v !== null && $v !== '');

        $cacheKey = CmsCacheService::judgmentListKey($locale, $page, $filterParams);

        // Serve cached listing if no active text search
        if (empty($search) && Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            return ApiResponse::paginated($cached['paginator_meta'], $cached['data'], 'Judgment reviews retrieved successfully.');
        }

        $query = JudgmentReview::query()
            ->published()
            ->publicVisibility()
            ->with(['practiceArea', 'category', 'tags', 'featuredImage', 'pdfMedia']);

        if (!empty($search)) {
            $query->search($search);
        }

        if (!empty($court)) {
            $query->filterCourt($court);
        }

        if (!empty($legalArea)) {
            $query->filterLegalArea($legalArea);
        }

        if (!empty($practiceArea)) {
            $query->filterPracticeArea($practiceArea);
        }

        if (!empty($category)) {
            $query->filterCategory($category);
        }

        if (!empty($tag)) {
            $query->filterTag($tag);
        }

        if (!empty($year)) {
            $query->filterYear((int) $year);
        }

        if ($featured !== null) {
            $query->where('is_featured', $featured);
        }

        // Default sort: sort_order asc, then judgment_date desc, published_at desc
        $query->orderBy('sort_order', 'asc')
            ->orderBy('judgment_date', 'desc')
            ->orderBy('published_at', 'desc');

        $paginator = $query->paginate($perPage);

        $data = JudgmentReviewResource::collection($paginator->getCollection())->toArray($request);

        // Cache for 24h when no active search
        if (empty($search)) {
            Cache::put($cacheKey, [
                'paginator_meta' => $paginator,
                'data' => $data,
            ], CmsCacheService::TTL_JUDGMENTS);
        }

        return ApiResponse::paginated($paginator, $data, 'Judgment reviews retrieved successfully.');
    }

    /**
     * Retrieve a single published judgment review by slug.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::judgmentDetailKey($slug, $locale);

        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            return ApiResponse::success($cached, 'Judgment review details retrieved successfully.');
        }

        $judgment = JudgmentReview::query()
            ->published()
            ->publicVisibility()
            ->where('slug', $slug)
            ->with(['practiceArea', 'category', 'legalResearch', 'tags', 'featuredImage', 'pdfMedia', 'seo'])
            ->first();

        if (!$judgment) {
            return ApiResponse::error('Judgment review not found or not published.', 404);
        }

        // Fetch related judgments: deterministic ranking, strictly published + public
        $relatedQuery = JudgmentReview::query()
            ->published()
            ->publicVisibility()
            ->where('id', '!=', $judgment->id)
            ->with(['practiceArea', 'category', 'tags', 'featuredImage'])
            ->limit(3);

        if ($judgment->practice_area_id) {
            $relatedQuery->where('practice_area_id', $judgment->practice_area_id);
        } elseif (!empty($judgment->court)) {
            $relatedQuery->where('court', $judgment->court);
        } elseif ($judgment->category_id) {
            $relatedQuery->where('category_id', $judgment->category_id);
        }

        $related = JudgmentReviewResource::collection($relatedQuery->get())->toArray($request);

        $resource = (new JudgmentReviewDetailResource($judgment))->withRelated($related);
        $data = $resource->toArray($request);

        Cache::put($cacheKey, $data, CmsCacheService::TTL_JUDGMENTS);

        return ApiResponse::success($data, 'Judgment review details retrieved successfully.');
    }

    /**
     * Download or stream attached PDF for published, public judgment review.
     */
    public function downloadPdf(string $slug): BinaryFileResponse|JsonResponse
    {
        $judgment = JudgmentReview::query()
            ->published()
            ->publicVisibility()
            ->where('slug', $slug)
            ->with('pdfMedia')
            ->first();

        if (!$judgment || !$judgment->pdfMedia) {
            return ApiResponse::error('Judgment document not found or access denied.', 404);
        }

        $media = $judgment->pdfMedia;
        $disk = Storage::disk($media->disk ?: 'public');
        $path = $media->directory . '/' . $media->filename;

        if (!$disk->exists($path)) {
            return ApiResponse::error('Document file not found on storage disk.', 404);
        }

        $downloadName = $media->original_name ?: $media->filename;

        return response()->download($disk->path($path), $downloadName, [
            'Content-Type' => $media->mime_type ?: 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\JudgmentReviewRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\JudgmentReviewDetailResource;
use App\Http\Resources\V1\JudgmentReviewResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\JudgmentReview;
use App\Models\Redirect;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminJudgmentReviewController extends Controller
{
    /**
     * List all judgment reviews with administrative filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = JudgmentReview::query()->with([
            'practiceArea',
            'category',
            'legalResearch',
            'tags',
            'featuredImage',
            'pdfMedia',
            'seo',
        ]);

        // Search
        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->search($search);
        }

        // Filters
        if ($court = $request->input('court')) {
            $query->filterCourt($court);
        }

        if ($legalArea = $request->input('legal_area')) {
            $query->filterLegalArea($legalArea);
        }

        if ($practiceArea = $request->input('practice_area_id') ?: $request->input('practice_area')) {
            $query->filterPracticeArea($practiceArea);
        }

        if ($category = $request->input('category_id') ?: $request->input('category')) {
            $query->filterCategory($category);
        }

        if ($tag = $request->input('tag')) {
            $query->filterTag($tag);
        }

        if ($year = $request->input('year')) {
            $query->filterYear((int) $year);
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($visibility = $request->input('visibility')) {
            if ($visibility !== 'all') {
                $query->where('visibility', $visibility);
            }
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'sort_order');
        $sortDir = strtolower($request->input('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['sort_order', 'judgment_date', 'created_at', 'updated_at', 'published_at', 'citation', 'court', 'slug'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('sort_order', 'asc')->orderBy('judgment_date', 'desc')->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        $data = JudgmentReviewResource::collection($paginator->getCollection())->toArray($request);

        return ApiResponse::paginated($paginator, $data, 'Judgment review records retrieved successfully.');
    }

    /**
     * Create a new judgment review monograph.
     */
    public function store(JudgmentReviewRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 1. Sanitize rich text HTML fields
        $validated['summary'] = HtmlSanitizer::cleanTranslations($validated['summary']);
        $validated['court_decision'] = HtmlSanitizer::cleanTranslations($validated['court_decision']);
        $validated['author_analysis'] = HtmlSanitizer::cleanTranslations($validated['author_analysis']);
        if (!empty($validated['practical_significance'])) {
            $validated['practical_significance'] = HtmlSanitizer::cleanTranslations($validated['practical_significance']);
        }
        if (!empty($validated['key_issues'])) {
            $validated['key_issues'] = HtmlSanitizer::cleanTranslations($validated['key_issues']);
        }

        // 2. Set published_at if status is published
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $judgment = JudgmentReview::create([
            'case_name' => $validated['case_name'],
            'citation' => trim($validated['citation']),
            'slug' => strtolower(trim($validated['slug'])),
            'court' => trim($validated['court']),
            'judgment_date' => $validated['judgment_date'] ?? null,
            'legal_area' => $validated['legal_area'] ?? null,
            'summary' => $validated['summary'],
            'key_issues' => $validated['key_issues'] ?? null,
            'court_decision' => $validated['court_decision'],
            'author_analysis' => $validated['author_analysis'],
            'practical_significance' => $validated['practical_significance'] ?? null,
            'practice_area_id' => $validated['practice_area_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'legal_research_id' => $validated['legal_research_id'] ?? null,
            'author' => $validated['author'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'pdf_media_id' => $validated['pdf_media_id'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? null,
        ]);

        // 3. Sync Tags if provided
        if (isset($validated['tags'])) {
            $judgment->tags()->sync($validated['tags']);
        }

        // 4. Attach SEO metadata if provided
        if (!empty($validated['seo'])) {
            $judgment->seo()->create($validated['seo']);
        }

        // 5. Invalidate Cache
        CmsCacheService::forgetJudgments($judgment->slug);

        // 6. Audit Logging
        $caseNameEn = $judgment->case_name['en'] ?? 'Untitled Case';
        ActivityLog::record(
            action: 'judgment_review_created',
            description: "Created judgment review: {$caseNameEn} ({$judgment->citation})",
            subject: $judgment,
            newValues: $judgment->only(['id', 'slug', 'citation', 'court', 'status', 'visibility'])
        );

        if ($judgment->status === 'published') {
            ActivityLog::record(
                action: 'judgment_review_published',
                description: "Published judgment review on creation: {$caseNameEn}",
                subject: $judgment
            );
        }

        if (!empty($judgment->pdf_media_id)) {
            ActivityLog::record(
                action: 'judgment_document_added',
                description: "Attached PDF document ID #{$judgment->pdf_media_id} to judgment review: {$caseNameEn}",
                subject: $judgment
            );
        }

        $judgment->load(['practiceArea', 'category', 'legalResearch', 'tags', 'featuredImage', 'pdfMedia', 'seo']);

        return ApiResponse::created(
            (new JudgmentReviewDetailResource($judgment))->toArray($request),
            'Judgment review created successfully.'
        );
    }

    /**
     * Retrieve a single judgment review record for administrative review or editing.
     */
    public function show(JudgmentReview $judgment, Request $request): JsonResponse
    {
        $judgment->load(['practiceArea', 'category', 'legalResearch', 'tags', 'featuredImage', 'pdfMedia', 'seo']);

        return ApiResponse::success(
            (new JudgmentReviewDetailResource($judgment))->toArray($request),
            'Judgment review details retrieved successfully.'
        );
    }

    /**
     * Update an existing judgment review record.
     */
    public function update(JudgmentReviewRequest $request, JudgmentReview $judgment): JsonResponse
    {
        $validated = $request->validated();
        $oldSlug = $judgment->slug;
        $newSlug = strtolower(trim($validated['slug']));
        $oldStatus = $judgment->status;
        $newStatus = $validated['status'];
        $oldVisibility = $judgment->visibility;
        $newVisibility = $validated['visibility'];
        $oldFeatured = (bool) $judgment->is_featured;
        $newFeatured = (bool) ($validated['is_featured'] ?? false);
        $oldPdfId = $judgment->pdf_media_id;
        $newPdfId = $validated['pdf_media_id'] ?? null;

        // 1. Slug change 301 redirect logic: if a published judgment slug changed, auto-create redirect
        if ($oldStatus === 'published' && $oldSlug !== $newSlug) {
            $sourceUrl = "/judgments/{$oldSlug}";
            $targetUrl = "/judgments/{$newSlug}";

            Redirect::updateOrCreate(
                ['source_url' => $sourceUrl],
                [
                    'target_url' => $targetUrl,
                    'status_code' => 301,
                    'is_active' => true,
                ]
            );

            ActivityLog::record(
                action: 'redirect_created',
                description: "Auto-created 301 redirect due to judgment slug change: {$sourceUrl} -> {$targetUrl}",
                newValues: ['source_url' => $sourceUrl, 'target_url' => $targetUrl, 'status_code' => 301]
            );
        }

        // 2. Sanitize rich text HTML fields
        $validated['summary'] = HtmlSanitizer::cleanTranslations($validated['summary']);
        $validated['court_decision'] = HtmlSanitizer::cleanTranslations($validated['court_decision']);
        $validated['author_analysis'] = HtmlSanitizer::cleanTranslations($validated['author_analysis']);
        if (!empty($validated['practical_significance'])) {
            $validated['practical_significance'] = HtmlSanitizer::cleanTranslations($validated['practical_significance']);
        }
        if (!empty($validated['key_issues'])) {
            $validated['key_issues'] = HtmlSanitizer::cleanTranslations($validated['key_issues']);
        }

        // 3. Set published_at timestamp if newly published
        if ($newStatus === 'published' && empty($judgment->published_at) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $judgment->update([
            'case_name' => $validated['case_name'],
            'citation' => trim($validated['citation']),
            'slug' => $newSlug,
            'court' => trim($validated['court']),
            'judgment_date' => $validated['judgment_date'] ?? null,
            'legal_area' => $validated['legal_area'] ?? null,
            'summary' => $validated['summary'],
            'key_issues' => $validated['key_issues'] ?? null,
            'court_decision' => $validated['court_decision'],
            'author_analysis' => $validated['author_analysis'],
            'practical_significance' => $validated['practical_significance'] ?? null,
            'practice_area_id' => $validated['practice_area_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'legal_research_id' => $validated['legal_research_id'] ?? null,
            'author' => $validated['author'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'pdf_media_id' => $newPdfId,
            'visibility' => $newVisibility,
            'status' => $newStatus,
            'is_featured' => $newFeatured,
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? $judgment->published_at,
        ]);

        // 4. Sync Tags if provided
        if (isset($validated['tags'])) {
            $judgment->tags()->sync($validated['tags']);
        }

        // 5. Update SEO metadata
        if (isset($validated['seo'])) {
            $judgment->seo()->updateOrCreate([], $validated['seo']);
        }

        // 6. Invalidate Cache
        CmsCacheService::forgetJudgments($oldSlug);
        if ($oldSlug !== $newSlug) {
            CmsCacheService::forgetJudgments($newSlug);
        }

        // 7. Audit Logging
        $caseNameEn = $judgment->case_name['en'] ?? 'Untitled Case';
        ActivityLog::record(
            action: 'judgment_review_updated',
            description: "Updated judgment review: {$caseNameEn} ({$judgment->citation})",
            subject: $judgment,
            newValues: $judgment->only(['id', 'slug', 'citation', 'court', 'status', 'visibility'])
        );

        if ($oldStatus !== 'published' && $newStatus === 'published') {
            ActivityLog::record(
                action: 'judgment_review_published',
                description: "Published judgment review: {$caseNameEn}",
                subject: $judgment
            );
        } elseif ($oldStatus === 'published' && $newStatus !== 'published') {
            ActivityLog::record(
                action: 'judgment_review_unpublished',
                description: "Unpublished judgment review (status changed to {$newStatus}): {$caseNameEn}",
                subject: $judgment
            );
        }

        if ($oldVisibility !== $newVisibility) {
            ActivityLog::record(
                action: 'judgment_review_visibility_changed',
                description: "Changed judgment review visibility from {$oldVisibility} to {$newVisibility}: {$caseNameEn}",
                subject: $judgment
            );
        }

        if (!$oldFeatured && $newFeatured) {
            ActivityLog::record(
                action: 'judgment_review_featured',
                description: "Marked judgment review as featured: {$caseNameEn}",
                subject: $judgment
            );
        } elseif ($oldFeatured && !$newFeatured) {
            ActivityLog::record(
                action: 'judgment_review_unfeatured',
                description: "Removed featured flag from judgment review: {$caseNameEn}",
                subject: $judgment
            );
        }

        if ($oldPdfId !== $newPdfId) {
            if ($newPdfId) {
                ActivityLog::record(
                    action: 'judgment_document_added',
                    description: "Attached PDF media ID #{$newPdfId} to judgment review: {$caseNameEn}",
                    subject: $judgment
                );
            } else {
                ActivityLog::record(
                    action: 'judgment_document_deleted',
                    description: "Removed PDF document from judgment review: {$caseNameEn}",
                    subject: $judgment
                );
            }
        }

        $judgment->load(['practiceArea', 'category', 'legalResearch', 'tags', 'featuredImage', 'pdfMedia', 'seo']);

        return ApiResponse::success(
            (new JudgmentReviewDetailResource($judgment))->toArray($request),
            'Judgment review updated successfully.'
        );
    }

    /**
     * Delete an existing judgment review record.
     */
    public function destroy(JudgmentReview $judgment): JsonResponse
    {
        $caseNameEn = $judgment->case_name['en'] ?? 'Untitled Case';
        $slug = $judgment->slug;

        $judgment->delete();

        CmsCacheService::forgetJudgments($slug);

        ActivityLog::record(
            action: 'judgment_review_deleted',
            description: "Soft deleted judgment review: {$caseNameEn}",
            subject: $judgment
        );

        return ApiResponse::success(null, 'Judgment review deleted successfully.');
    }

    /**
     * Batch reorder judgment review items.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $items = $request->validated()['items'];

        foreach ($items as $index => $id) {
            JudgmentReview::where('id', $id)->update(['sort_order' => $index]);
        }

        CmsCacheService::forgetJudgments();

        ActivityLog::record(
            action: 'judgment_review_reordered',
            description: 'Updated sort order for judgment reviews.',
            newValues: ['reordered_count' => count($items)]
        );

        return ApiResponse::success(null, 'Judgment review order updated successfully.');
    }

    /**
     * Authenticated administrative preview for drafts.
     */
    public function preview(JudgmentReview $judgment, Request $request): JsonResponse
    {
        $judgment->load(['practiceArea', 'category', 'legalResearch', 'tags', 'featuredImage', 'pdfMedia', 'seo']);

        $data = (new JudgmentReviewDetailResource($judgment))->toArray($request);
        $data['is_preview'] = true;

        return response()->json([
            'success' => true,
            'message' => 'Judgment review draft preview generated.',
            'data' => $data,
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'locale' => app()->getLocale(),
                'preview_mode' => true,
            ],
        ])->header('X-Robots-Tag', 'noindex, nofollow');
    }

    /**
     * Authenticated download of attached judgment PDF document.
     */
    public function downloadDocument(JudgmentReview $judgment): BinaryFileResponse|JsonResponse
    {
        $judgment->load('pdfMedia');
        $media = $judgment->pdfMedia;

        if (!$media) {
            return ApiResponse::error('No attached PDF document found for this judgment review.', 404);
        }

        $disk = Storage::disk($media->disk ?: 'public');
        $path = $media->directory . '/' . $media->filename;

        if (!$disk->exists($path)) {
            return ApiResponse::error('Attached document file is not present on storage disk.', 404);
        }

        $downloadName = $media->original_name ?: $media->filename;

        ActivityLog::record(
            action: 'judgment_document_downloaded',
            description: "Admin downloaded judgment document: {$downloadName} for review #{$judgment->id}",
            subject: $judgment
        );

        return response()->download($disk->path($path), $downloadName, [
            'Content-Type' => $media->mime_type ?: 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

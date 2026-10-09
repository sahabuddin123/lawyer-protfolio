<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LegalResearchRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\LegalResearchDetailResource;
use App\Http\Resources\V1\LegalResearchResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\LegalResearch;
use App\Models\Redirect;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminLegalResearchController extends Controller
{
    /**
     * List all legal research records with administrative filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LegalResearch::query()->with(['category', 'tags', 'featuredImage', 'pdfMedia', 'seo']);

        // Search
        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->search($search);
        }

        // Filters
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

        if ($type = $request->input('research_type') ?: $request->input('type')) {
            if ($type !== 'all') {
                $query->where('research_type', $type);
            }
        }

        if ($category = $request->input('category_id') ?: $request->input('category')) {
            $query->filterCategory($category);
        }

        if ($tag = $request->input('tag')) {
            $query->filterTag($tag);
        }

        if ($author = $request->input('author')) {
            $query->where(function ($q) use ($author) {
                $q->where('author->en', 'like', "%{$author}%")
                  ->orWhere('author->bn', 'like', "%{$author}%");
            });
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'sort_order');
        $sortDir = strtolower($request->input('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['sort_order', 'research_date', 'created_at', 'updated_at', 'published_at', 'slug', 'view_count'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        $data = LegalResearchResource::collection($paginator->getCollection())->toArray($request);

        return ApiResponse::paginated($paginator, $data, 'Legal research records retrieved successfully.');
    }

    /**
     * Create a new legal research monograph.
     */
    public function store(LegalResearchRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 1. Sanitize rich text HTML fields
        $validated['content'] = HtmlSanitizer::cleanTranslations($validated['content']);
        $validated['excerpt'] = HtmlSanitizer::cleanTranslations($validated['excerpt']);

        // 2. Set published_at if status is published
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $research = LegalResearch::create([
            'category_id' => $validated['category_id'] ?? null,
            'research_type' => $validated['research_type'],
            'title' => $validated['title'],
            'slug' => strtolower(trim($validated['slug'])),
            'author' => $validated['author'],
            'excerpt' => $validated['excerpt'],
            'content' => $validated['content'],
            'research_date' => $validated['research_date'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'pdf_media_id' => $validated['pdf_media_id'] ?? null,
            'external_url' => $validated['external_url'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? null,
        ]);

        // 3. Sync Tags if provided
        if (isset($validated['tags'])) {
            $research->tags()->sync($validated['tags']);
        }

        // 4. Attach SEO metadata if provided
        if (!empty($validated['seo'])) {
            $research->seo()->create($validated['seo']);
        }

        // 5. Invalidate Cache
        CmsCacheService::forgetResearch($research->slug);

        // 6. Audit Logging
        $titleEn = $research->title['en'] ?? 'Untitled';
        ActivityLog::record(
            action: 'research_created',
            description: "Created legal research: {$titleEn}",
            subject: $research,
            newValues: $research->only(['id', 'slug', 'title', 'status', 'visibility', 'research_type'])
        );

        if ($research->status === 'published') {
            ActivityLog::record(
                action: 'research_published',
                description: "Published legal research on creation: {$titleEn}",
                subject: $research
            );
        }

        if (!empty($research->pdf_media_id)) {
            ActivityLog::record(
                action: 'research_document_attached',
                description: "Attached PDF media ID #{$research->pdf_media_id} to research: {$titleEn}",
                subject: $research
            );
        }

        $research->load(['category', 'tags', 'featuredImage', 'pdfMedia', 'seo']);

        return ApiResponse::created(
            (new LegalResearchDetailResource($research))->toArray($request),
            'Legal research monograph created successfully.'
        );
    }

    /**
     * Retrieve a single legal research record for administrative review or editing.
     */
    public function show(LegalResearch $research, Request $request): JsonResponse
    {
        $research->load(['category', 'tags', 'featuredImage', 'pdfMedia', 'seo']);

        return ApiResponse::success(
            (new LegalResearchDetailResource($research))->toArray($request),
            'Legal research details retrieved successfully.'
        );
    }

    /**
     * Update an existing legal research record.
     */
    public function update(LegalResearchRequest $request, LegalResearch $research): JsonResponse
    {
        $validated = $request->validated();
        $oldSlug = $research->slug;
        $newSlug = strtolower(trim($validated['slug']));
        $oldStatus = $research->status;
        $newStatus = $validated['status'];
        $oldVisibility = $research->visibility;
        $newVisibility = $validated['visibility'];
        $oldFeatured = (bool) $research->is_featured;
        $newFeatured = (bool) ($validated['is_featured'] ?? false);
        $oldPdfId = $research->pdf_media_id;
        $newPdfId = $validated['pdf_media_id'] ?? null;

        // 1. Slug change 301 redirect logic: if a published research slug changed, auto-create redirect
        if ($oldStatus === 'published' && $oldSlug !== $newSlug) {
            $sourceUrl = "/research/{$oldSlug}";
            $targetUrl = "/research/{$newSlug}";

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
                description: "Auto-created 301 redirect due to research slug change: {$sourceUrl} -> {$targetUrl}",
                newValues: ['source_url' => $sourceUrl, 'target_url' => $targetUrl, 'status_code' => 301]
            );
        }

        // 2. Sanitize rich text HTML fields
        $validated['content'] = HtmlSanitizer::cleanTranslations($validated['content']);
        $validated['excerpt'] = HtmlSanitizer::cleanTranslations($validated['excerpt']);

        // 3. Set published_at timestamp if newly published
        if ($newStatus === 'published' && empty($research->published_at) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $research->update([
            'category_id' => $validated['category_id'] ?? null,
            'research_type' => $validated['research_type'],
            'title' => $validated['title'],
            'slug' => $newSlug,
            'author' => $validated['author'],
            'excerpt' => $validated['excerpt'],
            'content' => $validated['content'],
            'research_date' => $validated['research_date'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'pdf_media_id' => $newPdfId,
            'external_url' => $validated['external_url'] ?? null,
            'visibility' => $newVisibility,
            'status' => $newStatus,
            'is_featured' => $newFeatured,
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? $research->published_at,
        ]);

        // 4. Sync Tags if provided
        if (isset($validated['tags'])) {
            $research->tags()->sync($validated['tags']);
        }

        // 5. Update SEO metadata
        if (isset($validated['seo'])) {
            $research->seo()->updateOrCreate([], $validated['seo']);
        }

        // 6. Invalidate Cache
        CmsCacheService::forgetResearch($oldSlug);
        if ($oldSlug !== $newSlug) {
            CmsCacheService::forgetResearch($newSlug);
        }

        // 7. Audit Logging
        $titleEn = $research->title['en'] ?? 'Untitled';
        ActivityLog::record(
            action: 'research_updated',
            description: "Updated legal research: {$titleEn}",
            subject: $research,
            newValues: $research->only(['id', 'slug', 'title', 'status', 'visibility', 'research_type'])
        );

        if ($oldStatus !== 'published' && $newStatus === 'published') {
            ActivityLog::record(
                action: 'research_published',
                description: "Published legal research: {$titleEn}",
                subject: $research
            );
        } elseif ($oldStatus === 'published' && $newStatus !== 'published') {
            ActivityLog::record(
                action: 'research_unpublished',
                description: "Unpublished legal research (status changed to {$newStatus}): {$titleEn}",
                subject: $research
            );
        }

        if ($oldVisibility !== $newVisibility) {
            ActivityLog::record(
                action: 'research_visibility_changed',
                description: "Changed legal research visibility from {$oldVisibility} to {$newVisibility}: {$titleEn}",
                subject: $research
            );
        }

        if (!$oldFeatured && $newFeatured) {
            ActivityLog::record(
                action: 'research_featured',
                description: "Marked legal research as featured: {$titleEn}",
                subject: $research
            );
        } elseif ($oldFeatured && !$newFeatured) {
            ActivityLog::record(
                action: 'research_unfeatured',
                description: "Removed featured flag from legal research: {$titleEn}",
                subject: $research
            );
        }

        if ($oldPdfId !== $newPdfId) {
            if ($newPdfId) {
                ActivityLog::record(
                    action: 'research_document_attached',
                    description: "Attached PDF media ID #{$newPdfId} to research: {$titleEn}",
                    subject: $research
                );
            } else {
                ActivityLog::record(
                    action: 'research_document_removed',
                    description: "Removed PDF document from research: {$titleEn}",
                    subject: $research
                );
            }
        }

        $research->load(['category', 'tags', 'featuredImage', 'pdfMedia', 'seo']);

        return ApiResponse::success(
            (new LegalResearchDetailResource($research))->toArray($request),
            'Legal research updated successfully.'
        );
    }

    /**
     * Delete an existing legal research record.
     */
    public function destroy(LegalResearch $research): JsonResponse
    {
        $titleEn = $research->title['en'] ?? 'Untitled';
        $slug = $research->slug;

        $research->delete();

        CmsCacheService::forgetResearch($slug);

        ActivityLog::record(
            action: 'research_deleted',
            description: "Soft deleted legal research: {$titleEn}",
            subject: $research
        );

        return ApiResponse::success(null, 'Legal research deleted successfully.');
    }

    /**
     * Batch reorder legal research items.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $items = $request->validated()['items'];

        foreach ($items as $index => $id) {
            LegalResearch::where('id', $id)->update(['sort_order' => $index]);
        }

        CmsCacheService::forgetResearch();

        ActivityLog::record(
            action: 'research_reordered',
            description: 'Updated sort order for legal research monographs.',
            newValues: ['reordered_count' => count($items)]
        );

        return ApiResponse::success(null, 'Legal research order updated successfully.');
    }

    /**
     * Authenticated administrative preview for drafts.
     */
    public function preview(LegalResearch $research, Request $request): JsonResponse
    {
        $research->load(['category', 'tags', 'featuredImage', 'pdfMedia', 'seo']);

        $data = (new LegalResearchDetailResource($research))->toArray($request);
        $data['is_preview'] = true;

        return response()->json([
            'success' => true,
            'message' => 'Legal research draft preview generated.',
            'data' => $data,
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'locale' => app()->getLocale(),
                'preview_mode' => true,
            ],
        ])->header('X-Robots-Tag', 'noindex, nofollow');
    }

    /**
     * Authenticated download of attached research PDF document.
     */
    public function downloadDocument(LegalResearch $research): BinaryFileResponse|JsonResponse
    {
        $research->load('pdfMedia');
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

        ActivityLog::record(
            action: 'research_document_downloaded',
            description: "Admin downloaded research document: {$downloadName} for research #{$research->id}",
            subject: $research
        );

        return response()->download($disk->path($path), $downloadName, [
            'Content-Type' => $media->mime_type ?: 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

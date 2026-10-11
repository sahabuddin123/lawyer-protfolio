<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PublicationRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\PublicationDetailResource;
use App\Http\Resources\V1\PublicationResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\Publication;
use App\Models\Redirect;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminPublicationController extends Controller
{
    /**
     * List all publications with administrative filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Publication::query()->with([
            'category',
            'tags',
            'coverImage',
            'pdfMedia',
            'seo',
        ]);

        // Search
        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->search($search);
        }

        // Filters
        if ($type = $request->input('type') ?: $request->input('publication_type')) {
            $query->filterType($type);
        }

        if ($category = $request->input('category_id') ?: $request->input('category')) {
            $query->filterCategory($category);
        }

        if ($tag = $request->input('tag')) {
            $query->filterTag($tag);
        }

        if ($author = $request->input('author')) {
            $query->filterAuthor($author);
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
        $allowedSorts = ['sort_order', 'publication_date', 'created_at', 'updated_at', 'published_at', 'publication_type', 'slug'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('sort_order', 'asc')->orderBy('publication_date', 'desc')->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        $data = PublicationResource::collection($paginator->getCollection())->toArray($request);

        return ApiResponse::paginated($paginator, $data, 'Publication records retrieved successfully.');
    }

    /**
     * Create a new publication record.
     */
    public function store(PublicationRequest $request): JsonResponse
    {
        $validated = $request->sanitizedData();

        // 1. Sanitize rich text HTML fields if present
        if (!empty($validated['content'])) {
            $validated['content'] = HtmlSanitizer::cleanTranslations($validated['content']);
        }
        if (!empty($validated['excerpt'])) {
            $validated['excerpt'] = HtmlSanitizer::cleanTranslations($validated['excerpt']);
        }

        // 2. Set published_at if status is published
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $publication = Publication::create([
            'category_id' => $validated['category_id'] ?? null,
            'publication_type' => trim($validated['publication_type']),
            'title' => $validated['title'],
            'slug' => strtolower(trim($validated['slug'])),
            'publication_name' => $validated['publication_name'] ?? null,
            'publication_date' => $validated['publication_date'] ?? null,
            'author' => $validated['author'] ?? null,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'] ?? null,
            'external_url' => $validated['external_url'] ?? null,
            'cover_image_id' => $validated['cover_image_id'] ?? null,
            'pdf_media_id' => $validated['pdf_media_id'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? null,
        ]);

        // 3. Sync Tags if provided
        if (isset($validated['tags'])) {
            $publication->tags()->sync($validated['tags']);
        }

        // 4. Attach SEO metadata if provided
        if (!empty($validated['seo'])) {
            $publication->seo()->create($validated['seo']);
        }

        // 5. Invalidate Cache
        CmsCacheService::forgetPublications($publication->slug);

        // 6. Audit Logging
        $titleEn = $publication->title['en'] ?? 'Untitled Publication';
        ActivityLog::record(
            action: 'publication_created',
            description: "Created publication: {$titleEn} ({$publication->publication_type})",
            subject: $publication,
            newValues: $publication->only(['id', 'slug', 'publication_type', 'status', 'visibility'])
        );

        if ($publication->status === 'published') {
            ActivityLog::record(
                action: 'publication_published',
                description: "Published publication on creation: {$titleEn}",
                subject: $publication
            );
        }

        if (!empty($publication->pdf_media_id)) {
            ActivityLog::record(
                action: 'publication_document_added',
                description: "Attached PDF document ID #{$publication->pdf_media_id} to publication: {$titleEn}",
                subject: $publication
            );
        }

        $publication->load(['category', 'tags', 'coverImage', 'pdfMedia', 'seo']);

        return ApiResponse::created(
            (new PublicationDetailResource($publication))->toArray($request),
            'Publication created successfully.'
        );
    }

    /**
     * Retrieve a single publication record for administrative review or editing.
     */
    public function show(Publication $publication, Request $request): JsonResponse
    {
        $publication->load(['category', 'tags', 'coverImage', 'pdfMedia', 'seo']);

        return ApiResponse::success(
            (new PublicationDetailResource($publication))->toArray($request),
            'Publication details retrieved successfully.'
        );
    }

    /**
     * Update an existing publication record.
     */
    public function update(PublicationRequest $request, Publication $publication): JsonResponse
    {
        $validated = $request->sanitizedData();
        $oldSlug = $publication->slug;
        $newSlug = strtolower(trim($validated['slug']));
        $oldStatus = $publication->status;
        $newStatus = $validated['status'];
        $oldVisibility = $publication->visibility;

        // 1. Sanitize rich text HTML fields
        if (!empty($validated['content'])) {
            $validated['content'] = HtmlSanitizer::cleanTranslations($validated['content']);
        }
        if (!empty($validated['excerpt'])) {
            $validated['excerpt'] = HtmlSanitizer::cleanTranslations($validated['excerpt']);
        }

        // 2. Automated 301 Redirect on slug change for published publications
        if ($oldSlug !== $newSlug && $oldStatus === 'published') {
            Redirect::updateOrCreate(
                ['source_url' => "/publications/{$oldSlug}"],
                [
                    'target_url' => "/publications/{$newSlug}",
                    'status_code' => 301,
                    'is_active' => true,
                ]
            );

            ActivityLog::record(
                action: 'redirect_created',
                description: "Auto-created 301 redirect due to publication slug change: /publications/{$oldSlug} -> /publications/{$newSlug}",
                newValues: ['source_url' => "/publications/{$oldSlug}", 'target_url' => "/publications/{$newSlug}", 'status_code' => 301]
            );
        }

        // 3. Status transition handling
        if ($newStatus === 'published' && !$publication->published_at && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $publication->update([
            'category_id' => $validated['category_id'] ?? null,
            'publication_type' => trim($validated['publication_type']),
            'title' => $validated['title'],
            'slug' => $newSlug,
            'publication_name' => $validated['publication_name'] ?? null,
            'publication_date' => $validated['publication_date'] ?? null,
            'author' => $validated['author'] ?? null,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'] ?? null,
            'external_url' => $validated['external_url'] ?? null,
            'cover_image_id' => $validated['cover_image_id'] ?? null,
            'pdf_media_id' => $validated['pdf_media_id'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? $publication->sort_order,
            'published_at' => $validated['published_at'] ?? $publication->published_at,
        ]);

        // 4. Sync Tags if provided
        if (isset($validated['tags'])) {
            $publication->tags()->sync($validated['tags']);
        }

        // 5. Update or create SEO metadata
        if (isset($validated['seo'])) {
            if ($publication->seo) {
                $publication->seo->update($validated['seo']);
            } elseif (!empty($validated['seo'])) {
                $publication->seo()->create($validated['seo']);
            }
        }

        // 6. Invalidate Cache
        CmsCacheService::forgetPublications($oldSlug);
        if ($oldSlug !== $newSlug) {
            CmsCacheService::forgetPublications($newSlug);
        }

        // 7. Audit Logging
        $titleEn = $publication->title['en'] ?? 'Untitled Publication';
        ActivityLog::record(
            action: 'publication_updated',
            description: "Updated publication: {$titleEn}",
            subject: $publication,
            newValues: $publication->only(['id', 'slug', 'publication_type', 'status', 'visibility'])
        );

        if ($oldStatus !== 'published' && $newStatus === 'published') {
            ActivityLog::record(
                action: 'publication_published',
                description: "Published publication: {$titleEn}",
                subject: $publication
            );
        } elseif ($oldStatus === 'published' && $newStatus !== 'published') {
            ActivityLog::record(
                action: 'publication_unpublished',
                description: "Unpublished publication: {$titleEn}",
                subject: $publication
            );
        }

        if ($oldVisibility !== $validated['visibility']) {
            ActivityLog::record(
                action: 'publication_visibility_changed',
                description: "Changed publication visibility from {$oldVisibility} to {$validated['visibility']}: {$titleEn}",
                subject: $publication
            );
        }

        $publication->load(['category', 'tags', 'coverImage', 'pdfMedia', 'seo']);

        return ApiResponse::success(
            (new PublicationDetailResource($publication))->toArray($request),
            'Publication updated successfully.'
        );
    }

    /**
     * Soft delete a publication record.
     */
    public function destroy(Publication $publication, Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && !$user->can('delete_publications')) {
            return ApiResponse::forbidden('You do not have permission to delete publications.');
        }

        $titleEn = $publication->title['en'] ?? 'Untitled Publication';
        $slug = $publication->slug;

        $publication->delete();

        CmsCacheService::forgetPublications($slug);

        ActivityLog::record(
            action: 'publication_deleted',
            description: "Soft deleted publication: {$titleEn} ({$slug})",
            subject: $publication
        );

        return ApiResponse::success(null, 'Publication deleted successfully.');
    }

    /**
     * Batch reorder publication ranks.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $user = $request->user();
        if ($user && !$user->can('edit_publications')) {
            return ApiResponse::forbidden('You do not have permission to reorder publications.');
        }

        $items = $request->validated()['items'];

        foreach ($items as $index => $id) {
            Publication::where('id', $id)->update(['sort_order' => $index]);
        }

        CmsCacheService::forgetPublications();

        ActivityLog::record(
            action: 'publications_reordered',
            description: 'Updated sorting ranks for ' . count($items) . ' publications.',
            newValues: ['reordered_count' => count($items)]
        );

        return ApiResponse::success(null, 'Publications reordered successfully.');
    }

    /**
     * Administrative editorial preview of a draft or private publication.
     * Enforces strict X-Robots-Tag to prevent search engine indexing.
     */
    public function preview(Publication $publication, Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && !$user->can('edit_publications') && !$user->can('view_cms')) {
            return ApiResponse::forbidden('You do not have permission to preview publications.');
        }

        $publication->load(['category', 'tags', 'coverImage', 'pdfMedia', 'seo']);

        $payload = (new PublicationDetailResource($publication))->toArray($request);

        return response()->json([
            'success' => true,
            'data' => $payload,
            'message' => 'Editorial draft preview loaded.',
        ], 200, [
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }

    /**
     * Administrative download of attached judgment or publication PDF document.
     */
    public function downloadDocument(Publication $publication, Request $request): BinaryFileResponse|JsonResponse
    {
        $user = $request->user();
        if ($user && !$user->can('edit_publications') && !$user->can('view_cms')) {
            return ApiResponse::forbidden('Unauthorized to download publication document.');
        }

        if (!$publication->pdf_media_id) {
            return ApiResponse::notFound('No PDF document attached to this publication.');
        }

        $media = $publication->pdfMedia;
        if (!$media) {
            return ApiResponse::notFound('Attached document media record not found.');
        }

        $disk = Storage::disk($media->disk ?: 'public');
        $path = $media->directory . '/' . $media->filename;

        if (!$disk->exists($path)) {
            return ApiResponse::notFound('Physical PDF document file not found on disk.');
        }

        $fileName = $media->original_name ?: "publication-{$publication->slug}.pdf";

        return response()->download($disk->path($path), $fileName, [
            'Content-Type' => $media->mime_type ?: 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-transform',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CaseDocumentRequest;
use App\Http\Requests\Admin\CourtroomExperienceRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\CaseDocumentResource;
use App\Http\Resources\V1\CourtroomExperienceResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\CaseDocument;
use App\Models\CourtroomExperience;
use App\Models\Redirect;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminCourtroomController extends Controller
{
    /**
     * List all courtroom experiences with administrative filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = CourtroomExperience::query()->with(['practiceArea', 'featuredImage', 'seo']);

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

        if ($court = $request->input('court')) {
            $query->where('court', $court);
        }

        if ($caseType = $request->input('case_type')) {
            $query->where('case_type', $caseType);
        }

        if ($year = $request->input('year')) {
            $query->where('year', (int) $year);
        }

        if ($practiceAreaId = $request->input('practice_area_id')) {
            $query->where('practice_area_id', (int) $practiceAreaId);
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'sort_order');
        $sortDir = strtolower($request->input('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['sort_order', 'year', 'created_at', 'updated_at', 'published_at', 'slug'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('sort_order', 'asc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        $data = CourtroomExperienceResource::collection($paginator->getCollection())->toArray($request);

        return ApiResponse::paginated($paginator, $data, 'Courtroom experiences retrieved successfully.');
    }

    /**
     * Create a new courtroom experience.
     */
    public function store(CourtroomExperienceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 1. Sanitize rich text HTML fields
        $validated['description'] = HtmlSanitizer::cleanTranslations($validated['description']);
        if (!empty($validated['issues'])) {
            $validated['issues'] = HtmlSanitizer::cleanTranslations($validated['issues']);
        }
        if (!empty($validated['arguments'])) {
            $validated['arguments'] = HtmlSanitizer::cleanTranslations($validated['arguments']);
        }
        if (!empty($validated['outcome'])) {
            $validated['outcome'] = HtmlSanitizer::cleanTranslations($validated['outcome']);
        }

        // 2. Set published_at if status is published
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $experience = CourtroomExperience::create([
            'title' => $validated['title'],
            'slug' => strtolower(trim($validated['slug'])),
            'case_number' => $validated['case_number'] ?? null,
            'court' => $validated['court'],
            'case_type' => $validated['case_type'],
            'year' => (int) $validated['year'],
            'practice_area_id' => $validated['practice_area_id'] ?? null,
            'legal_area' => $validated['legal_area'],
            'role' => $validated['role'],
            'summary' => $validated['summary'],
            'description' => $validated['description'],
            'issues' => $validated['issues'] ?? null,
            'arguments' => $validated['arguments'] ?? null,
            'outcome' => $validated['outcome'] ?? null,
            'judgment_date' => $validated['judgment_date'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? null,
        ]);

        // 3. Attach SEO metadata if provided
        if (!empty($validated['seo'])) {
            $experience->seo()->create($validated['seo']);
        }

        // 4. Invalidate Cache
        CmsCacheService::forgetCourtroom($experience->slug);

        // 5. Audit Logging
        ActivityLog::record(
            action: 'courtroom_created',
            description: "Created courtroom experience: {$experience->title['en']}",
            subject: $experience,
            newValues: $experience->toArray()
        );

        if ($experience->status === 'published') {
            ActivityLog::record(
                action: 'courtroom_published',
                description: "Published courtroom experience on creation: {$experience->title['en']}",
                subject: $experience
            );
        }

        $experience->load(['practiceArea', 'featuredImage', 'seo']);

        return ApiResponse::created(
            (new CourtroomExperienceResource($experience))->toArray($request),
            'Courtroom experience created successfully.'
        );
    }

    /**
     * Retrieve a single courtroom experience for administrative review or editing.
     */
    public function show(CourtroomExperience $courtroom, Request $request): JsonResponse
    {
        $courtroom->load(['practiceArea', 'featuredImage', 'seo', 'documents.media']);

        return ApiResponse::success(
            (new CourtroomExperienceResource($courtroom))->toArray($request),
            'Courtroom experience retrieved successfully.'
        );
    }

    /**
     * Update an existing courtroom experience.
     */
    public function update(CourtroomExperienceRequest $request, CourtroomExperience $courtroom): JsonResponse
    {
        $validated = $request->validated();
        $oldValues = $courtroom->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'sort_order', 'published_at']);
        $oldSlug = $courtroom->slug;
        $newSlug = strtolower(trim($validated['slug']));
        $oldStatus = $courtroom->status;
        $newStatus = $validated['status'];
        $oldFeatured = (bool) $courtroom->is_featured;
        $newFeatured = (bool) ($validated['is_featured'] ?? false);

        // 1. Slug change 301 redirect logic: if a published experience slug changed, auto-create redirect
        if ($oldStatus === 'published' && $oldSlug !== $newSlug) {
            $sourceUrl = "/courtroom/{$oldSlug}";
            $targetUrl = "/courtroom/{$newSlug}";

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
                description: "Auto-created 301 redirect due to courtroom slug change: {$sourceUrl} -> {$targetUrl}",
                newValues: ['source_url' => $sourceUrl, 'target_url' => $targetUrl, 'status_code' => 301]
            );
        }

        // 2. Sanitize rich text HTML fields
        $validated['description'] = HtmlSanitizer::cleanTranslations($validated['description']);
        if (!empty($validated['issues'])) {
            $validated['issues'] = HtmlSanitizer::cleanTranslations($validated['issues']);
        }
        if (!empty($validated['arguments'])) {
            $validated['arguments'] = HtmlSanitizer::cleanTranslations($validated['arguments']);
        }
        if (!empty($validated['outcome'])) {
            $validated['outcome'] = HtmlSanitizer::cleanTranslations($validated['outcome']);
        }

        if ($newStatus === 'published' && empty($courtroom->published_at) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $courtroom->update([
            'title' => $validated['title'],
            'slug' => $newSlug,
            'case_number' => $validated['case_number'] ?? null,
            'court' => $validated['court'],
            'case_type' => $validated['case_type'],
            'year' => (int) $validated['year'],
            'practice_area_id' => $validated['practice_area_id'] ?? null,
            'legal_area' => $validated['legal_area'],
            'role' => $validated['role'],
            'summary' => $validated['summary'],
            'description' => $validated['description'],
            'issues' => $validated['issues'] ?? null,
            'arguments' => $validated['arguments'] ?? null,
            'outcome' => $validated['outcome'] ?? null,
            'judgment_date' => $validated['judgment_date'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $newStatus,
            'is_featured' => $newFeatured,
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? $courtroom->published_at,
        ]);

        // 3. Update or create SEO metadata
        if (isset($validated['seo'])) {
            if ($courtroom->seo) {
                $courtroom->seo->update($validated['seo']);
            } else {
                $courtroom->seo()->create($validated['seo']);
            }
        }

        // 4. Invalidate Cache
        CmsCacheService::forgetCourtroom($oldSlug);
        if ($oldSlug !== $newSlug) {
            CmsCacheService::forgetCourtroom($newSlug);
        }

        // 5. Audit Logging
        ActivityLog::record(
            action: 'courtroom_updated',
            description: "Updated courtroom experience: {$courtroom->title['en']}",
            subject: $courtroom,
            oldValues: $oldValues,
            newValues: $courtroom->only(['title', 'slug', 'status', 'visibility', 'is_featured', 'sort_order', 'published_at'])
        );

        if ($oldStatus !== 'published' && $newStatus === 'published') {
            ActivityLog::record(
                action: 'courtroom_published',
                description: "Published courtroom experience: {$courtroom->title['en']}",
                subject: $courtroom
            );
        } elseif ($oldStatus === 'published' && $newStatus !== 'published') {
            ActivityLog::record(
                action: 'courtroom_unpublished',
                description: "Unpublished courtroom experience: {$courtroom->title['en']} (status: {$newStatus})",
                subject: $courtroom
            );
        }

        if (!$oldFeatured && $newFeatured) {
            ActivityLog::record(
                action: 'courtroom_featured',
                description: "Marked courtroom experience as featured: {$courtroom->title['en']}",
                subject: $courtroom
            );
        } elseif ($oldFeatured && !$newFeatured) {
            ActivityLog::record(
                action: 'courtroom_unfeatured',
                description: "Removed featured flag from courtroom experience: {$courtroom->title['en']}",
                subject: $courtroom
            );
        }

        $courtroom->load(['practiceArea', 'featuredImage', 'seo', 'documents.media']);

        return ApiResponse::success(
            (new CourtroomExperienceResource($courtroom))->toArray($request),
            'Courtroom experience updated successfully.'
        );
    }

    /**
     * Delete a courtroom experience.
     */
    public function destroy(CourtroomExperience $courtroom): JsonResponse
    {
        $this->authorize('delete_cases');

        $slug = $courtroom->slug;
        $title = $courtroom->title['en'] ?? 'Courtroom Experience';

        $courtroom->delete();

        CmsCacheService::forgetCourtroom($slug);

        ActivityLog::record(
            action: 'courtroom_deleted',
            description: "Deleted courtroom experience: {$title}",
            subject: $courtroom
        );

        return ApiResponse::success(null, 'Courtroom experience deleted successfully.');
    }

    /**
     * Batch reorder courtroom experiences.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $items = $request->input('items', []);

        foreach ($items as $index => $id) {
            CourtroomExperience::where('id', $id)->update(['sort_order' => $index]);
        }

        CmsCacheService::forgetCourtroom();

        ActivityLog::record(
            action: 'courtroom_reordered',
            description: 'Courtroom experiences reordered.',
            newValues: ['ordered_ids' => $items]
        );

        return ApiResponse::success(null, 'Courtroom experiences reordered successfully.');
    }

    /**
     * Add a document to a courtroom experience.
     */
    public function addDocument(int $id, CaseDocumentRequest $request): JsonResponse
    {
        $courtroom = CourtroomExperience::findOrFail($id);
        $validated = $request->validated();

        $document = $courtroom->documents()->create([
            'title' => $validated['title'],
            'document_type' => $validated['document_type'] ?? null,
            'media_id' => (int) $validated['media_id'],
            'is_confidential' => (bool) ($validated['is_confidential'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        CmsCacheService::forgetCourtroom($courtroom->slug);

        ActivityLog::record(
            action: 'case_document_added',
            description: "Added document to courtroom experience #{$courtroom->id}: {$document->title['en']}",
            subject: $document
        );

        $document->load('media');

        return ApiResponse::created(
            (new CaseDocumentResource($document))->toArray($request),
            'Case document added successfully.'
        );
    }

    /**
     * Update an existing case document.
     */
    public function updateDocument(int $id, CaseDocumentRequest $request): JsonResponse
    {
        $document = CaseDocument::with('courtroomExperience')->findOrFail($id);
        $validated = $request->validated();

        $oldConfidential = (bool) $document->is_confidential;
        $newConfidential = (bool) ($validated['is_confidential'] ?? false);

        $document->update([
            'title' => $validated['title'],
            'document_type' => $validated['document_type'] ?? null,
            'media_id' => (int) $validated['media_id'],
            'is_confidential' => $newConfidential,
            'sort_order' => $validated['sort_order'] ?? $document->sort_order,
        ]);

        if ($document->courtroomExperience) {
            CmsCacheService::forgetCourtroom($document->courtroomExperience->slug);
        }

        ActivityLog::record(
            action: 'case_document_updated',
            description: "Updated case document #{$document->id}: {$document->title['en']}",
            subject: $document
        );

        if ($oldConfidential !== $newConfidential) {
            ActivityLog::record(
                action: 'case_document_visibility_changed',
                description: "Changed confidentiality of document #{$document->id} to " . ($newConfidential ? 'confidential' : 'public'),
                subject: $document
            );
        }

        $document->load('media');

        return ApiResponse::success(
            (new CaseDocumentResource($document))->toArray($request),
            'Case document updated successfully.'
        );
    }

    /**
     * Delete a case document.
     */
    public function deleteDocument(int $id): JsonResponse
    {
        if (!auth()->user()->can('manage_case_documents')) {
            abort(403, 'Unauthorized to manage case documents.');
        }

        $document = CaseDocument::with('courtroomExperience')->findOrFail($id);
        $title = $document->title['en'] ?? 'Case Document';
        $slug = $document->courtroomExperience?->slug;

        $document->delete();

        if ($slug) {
            CmsCacheService::forgetCourtroom($slug);
        }

        ActivityLog::record(
            action: 'case_document_deleted',
            description: "Deleted case document: {$title}",
            subject: $document
        );

        return ApiResponse::success(null, 'Case document deleted successfully.');
    }

    /**
     * Authenticated download of case documents (including confidential ones).
     */
    public function downloadDocument(int $id, Request $request): BinaryFileResponse|JsonResponse
    {
        $document = CaseDocument::with(['courtroomExperience', 'media'])->findOrFail($id);

        // If confidential, verify view_confidential_cases or manage_case_documents permission
        if ($document->is_confidential) {
            if (!$request->user()->can('view_confidential_cases') && !$request->user()->can('manage_case_documents')) {
                abort(403, 'Unauthorized to view or download confidential case documents.');
            }
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

        $document->increment('download_count');

        ActivityLog::record(
            action: 'case_document_downloaded',
            description: "Admin downloaded case document #{$document->id} ({$document->title['en']})",
            subject: $document
        );

        $downloadName = $media->original_name ?: $media->filename;

        return response()->download($disk->path($path), $downloadName, [
            'Content-Type' => $media->mime_type ?: 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

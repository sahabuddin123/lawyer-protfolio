<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PracticeAreaRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\PracticeAreaResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\PracticeArea;
use App\Models\Redirect;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPracticeAreaController extends Controller
{
    /**
     * List all practice areas with administrative filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = PracticeArea::query()->with(['featuredImage', 'seo']);

        // Search term
        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->search($search);
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        // Featured filter
        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'sort_order');
        $sortDir = strtolower($request->input('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['sort_order', 'created_at', 'updated_at', 'published_at', 'slug'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('sort_order', 'asc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        $data = PracticeAreaResource::collection($paginator->getCollection())->toArray($request);

        return ApiResponse::paginated($paginator, $data, 'Practice areas retrieved successfully.');
    }

    /**
     * Store a newly created practice area.
     */
    public function store(PracticeAreaRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 1. Sanitize HTML content in descriptions
        $validated['short_description'] = HtmlSanitizer::cleanTranslations($validated['short_description']);
        $validated['full_description'] = HtmlSanitizer::cleanTranslations($validated['full_description']);

        // 2. Set published timestamp if publishing now
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $practiceArea = PracticeArea::create([
            'title' => $validated['title'],
            'slug' => strtolower(trim($validated['slug'])),
            'short_description' => $validated['short_description'],
            'full_description' => $validated['full_description'],
            'icon_name' => $validated['icon_name'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'status' => $validated['status'],
            'is_featured' => $validated['is_featured'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? null,
        ]);

        // 3. Attach SEO metadata if provided
        if (!empty($validated['seo'])) {
            $practiceArea->seo()->create($validated['seo']);
        }

        // 4. Invalidate public cache
        CmsCacheService::forgetPracticeAreas($practiceArea->slug);

        // 5. Audit Logging
        ActivityLog::record(
            action: 'practice_area_created',
            description: "Created practice area: {$practiceArea->title['en']}",
            subject: $practiceArea,
            newValues: $practiceArea->toArray()
        );

        if ($practiceArea->status === 'published') {
            ActivityLog::record(
                action: 'practice_area_published',
                description: "Published practice area: {$practiceArea->title['en']}",
                subject: $practiceArea
            );
        }

        if ($practiceArea->is_featured) {
            ActivityLog::record(
                action: 'practice_area_featured',
                description: "Marked practice area as featured: {$practiceArea->title['en']}",
                subject: $practiceArea
            );
        }

        $practiceArea->load(['featuredImage', 'seo']);

        return ApiResponse::success(
            (new PracticeAreaResource($practiceArea))->toArray($request),
            'Practice area created successfully.',
            201
        );
    }

    /**
     * Retrieve a single practice area for administrative review or editing.
     */
    public function show(PracticeArea $practiceArea, Request $request): JsonResponse
    {
        $practiceArea->load(['featuredImage', 'seo']);

        return ApiResponse::success(
            (new PracticeAreaResource($practiceArea))->toArray($request),
            'Practice area retrieved successfully.'
        );
    }

    /**
     * Update an existing practice area.
     */
    public function update(PracticeAreaRequest $request, PracticeArea $practiceArea): JsonResponse
    {
        $validated = $request->validated();
        $oldValues = $practiceArea->only(['title', 'slug', 'status', 'is_featured', 'sort_order', 'published_at']);
        $oldSlug = $practiceArea->slug;
        $newSlug = strtolower(trim($validated['slug']));
        $oldStatus = $practiceArea->status;
        $newStatus = $validated['status'];
        $oldFeatured = (bool) $practiceArea->is_featured;
        $newFeatured = (bool) ($validated['is_featured'] ?? false);

        // 1. Slug change redirect logic: If a published practice area slug changed, auto-create a 301 redirect
        if ($oldStatus === 'published' && $oldSlug !== $newSlug) {
            $sourceUrl = "/practice-areas/{$oldSlug}";
            $targetUrl = "/practice-areas/{$newSlug}";

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
                description: "Auto-created 301 redirect due to practice area slug change: {$sourceUrl} -> {$targetUrl}",
                newValues: ['source_url' => $sourceUrl, 'target_url' => $targetUrl, 'status_code' => 301]
            );
        }

        // 2. Sanitize HTML content
        $validated['short_description'] = HtmlSanitizer::cleanTranslations($validated['short_description']);
        $validated['full_description'] = HtmlSanitizer::cleanTranslations($validated['full_description']);

        if ($newStatus === 'published' && empty($practiceArea->published_at) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $practiceArea->update([
            'title' => $validated['title'],
            'slug' => $newSlug,
            'short_description' => $validated['short_description'],
            'full_description' => $validated['full_description'],
            'icon_name' => $validated['icon_name'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'status' => $newStatus,
            'is_featured' => $newFeatured,
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? $practiceArea->published_at,
        ]);

        // 3. Update or create SEO metadata
        if (isset($validated['seo'])) {
            if ($practiceArea->seo) {
                $practiceArea->seo->update($validated['seo']);
            } else {
                $practiceArea->seo()->create($validated['seo']);
            }
        }

        // 4. Invalidate Cache
        CmsCacheService::forgetPracticeAreas($oldSlug);
        if ($oldSlug !== $newSlug) {
            CmsCacheService::forgetPracticeAreas($newSlug);
        }

        // 5. Audit Logging for status and feature state changes
        ActivityLog::record(
            action: 'practice_area_updated',
            description: "Updated practice area: {$practiceArea->title['en']}",
            subject: $practiceArea,
            oldValues: $oldValues,
            newValues: $practiceArea->only(['title', 'slug', 'status', 'is_featured', 'sort_order', 'published_at'])
        );

        if ($oldStatus !== 'published' && $newStatus === 'published') {
            ActivityLog::record(
                action: 'practice_area_published',
                description: "Published practice area: {$practiceArea->title['en']}",
                subject: $practiceArea
            );
        } elseif ($oldStatus === 'published' && $newStatus !== 'published') {
            ActivityLog::record(
                action: 'practice_area_unpublished',
                description: "Unpublished practice area: {$practiceArea->title['en']} (status: {$newStatus})",
                subject: $practiceArea
            );
        }

        if (!$oldFeatured && $newFeatured) {
            ActivityLog::record(
                action: 'practice_area_featured',
                description: "Marked practice area as featured: {$practiceArea->title['en']}",
                subject: $practiceArea
            );
        } elseif ($oldFeatured && !$newFeatured) {
            ActivityLog::record(
                action: 'practice_area_unfeatured',
                description: "Removed featured flag from practice area: {$practiceArea->title['en']}",
                subject: $practiceArea
            );
        }

        $practiceArea->load(['featuredImage', 'seo']);

        return ApiResponse::success(
            (new PracticeAreaResource($practiceArea))->toArray($request),
            'Practice area updated successfully.'
        );
    }

    /**
     * Soft-delete a practice area.
     */
    public function destroy(PracticeArea $practiceArea): JsonResponse
    {
        $oldValues = $practiceArea->toArray();
        $slug = $practiceArea->slug;

        $practiceArea->delete();

        CmsCacheService::forgetPracticeAreas($slug);

        ActivityLog::record(
            action: 'practice_area_deleted',
            description: "Deleted practice area: {$oldValues['title']['en']}",
            subject: $practiceArea,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'Practice area deleted successfully.');
    }

    /**
     * Batch reorder practice areas.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $items = $request->validated('items');

        foreach ($items as $index => $id) {
            PracticeArea::where('id', $id)->update(['sort_order' => $index + 1]);
        }

        CmsCacheService::forgetPracticeAreas();

        ActivityLog::record(
            action: 'practice_areas_reordered',
            description: 'Batch reordered practice areas'
        );

        return ApiResponse::success(null, 'Practice areas reordered successfully.');
    }
}

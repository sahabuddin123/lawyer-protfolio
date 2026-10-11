<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaPressRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\MediaPressDetailResource;
use App\Http\Resources\V1\MediaPressResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\MediaPress;
use App\Models\Redirect;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminMediaPressController extends Controller
{
    /**
     * List all press articles with administrative filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MediaPress::query()->with([
            'category',
            'tags',
            'featuredImage',
            'documentMedia',
            'seo',
        ]);

        // Search
        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->search($search);
        }

        // Filters
        if ($type = $request->input('type') ?: $request->input('media_type')) {
            $query->filterType($type);
        }

        if ($category = $request->input('category_id') ?: $request->input('category')) {
            $query->filterCategory($category);
        }

        if ($tag = $request->input('tag')) {
            $query->filterTag($tag);
        }

        if ($source = $request->input('source') ?: $request->input('media_name')) {
            $query->filterSource($source);
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
        $allowedSorts = ['sort_order', 'published_date', 'created_at', 'updated_at', 'published_at', 'media_type', 'slug'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('sort_order', 'asc')->orderBy('published_date', 'desc')->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        $data = MediaPressResource::collection($paginator->getCollection())->toArray($request);

        return ApiResponse::paginated($paginator, $data, 'Press media records retrieved successfully.');
    }

    /**
     * Create a new press media record.
     */
    public function store(MediaPressRequest $request): JsonResponse
    {
        $validated = $request->sanitizedData();

        if (!empty($validated['description'])) {
            $validated['description'] = HtmlSanitizer::cleanTranslations($validated['description']);
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $mediaPress = MediaPress::create([
            'category_id' => $validated['category_id'] ?? null,
            'media_type' => trim($validated['media_type']),
            'media_name' => $validated['media_name'],
            'title' => $validated['title'],
            'slug' => strtolower(trim($validated['slug'])),
            'published_date' => $validated['published_date'] ?? null,
            'article_url' => $validated['article_url'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'document_media_id' => $validated['document_media_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? null,
        ]);

        if (isset($validated['tags'])) {
            $mediaPress->tags()->sync($validated['tags']);
        }

        if (!empty($validated['seo'])) {
            $mediaPress->seo()->create($validated['seo']);
        }

        CmsCacheService::forgetMediaPress($mediaPress->slug);

        $titleEn = $mediaPress->title['en'] ?? 'Untitled Press Record';
        ActivityLog::record(
            action: 'media_press_created',
            description: "Created press media record: {$titleEn} ({$mediaPress->media_type})",
            subject: $mediaPress,
            newValues: $mediaPress->only(['id', 'slug', 'media_type', 'status', 'visibility'])
        );

        if ($mediaPress->status === 'published') {
            ActivityLog::record(
                action: 'media_press_published',
                description: "Published press record on creation: {$titleEn}",
                subject: $mediaPress
            );
        }

        if (!empty($mediaPress->document_media_id)) {
            ActivityLog::record(
                action: 'media_document_added',
                description: "Attached document ID #{$mediaPress->document_media_id} to press record: {$titleEn}",
                subject: $mediaPress
            );
        }

        $mediaPress->load(['category', 'tags', 'featuredImage', 'documentMedia', 'seo']);

        return ApiResponse::created(
            (new MediaPressDetailResource($mediaPress))->toArray($request),
            'Press media record created successfully.'
        );
    }

    /**
     * Retrieve a single press media record.
     */
    public function show(MediaPress $mediaPress, Request $request): JsonResponse
    {
        $mediaPress->load(['category', 'tags', 'featuredImage', 'documentMedia', 'seo']);

        return ApiResponse::success(
            (new MediaPressDetailResource($mediaPress))->toArray($request),
            'Press media record retrieved successfully.'
        );
    }

    /**
     * Update an existing press media record.
     */
    public function update(MediaPressRequest $request, MediaPress $mediaPress): JsonResponse
    {
        $validated = $request->sanitizedData();
        $oldSlug = $mediaPress->slug;
        $newSlug = strtolower(trim($validated['slug']));
        $oldStatus = $mediaPress->status;
        $newStatus = $validated['status'];

        if (!empty($validated['description'])) {
            $validated['description'] = HtmlSanitizer::cleanTranslations($validated['description']);
        }

        // Automated 301 Redirect on slug change
        if ($oldSlug !== $newSlug && $oldStatus === 'published') {
            Redirect::updateOrCreate(
                ['source_url' => "/media/press/{$oldSlug}"],
                [
                    'target_url' => "/media/press/{$newSlug}",
                    'status_code' => 301,
                    'is_active' => true,
                ]
            );

            ActivityLog::record(
                action: 'redirect_created',
                description: "Auto-created 301 redirect due to press slug change: /media/press/{$oldSlug} -> /media/press/{$newSlug}",
                newValues: ['source_url' => "/media/press/{$oldSlug}", 'target_url' => "/media/press/{$newSlug}", 'status_code' => 301]
            );
        }

        if ($newStatus === 'published' && !$mediaPress->published_at && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $mediaPress->update([
            'category_id' => $validated['category_id'] ?? null,
            'media_type' => trim($validated['media_type']),
            'media_name' => $validated['media_name'],
            'title' => $validated['title'],
            'slug' => $newSlug,
            'published_date' => $validated['published_date'] ?? null,
            'article_url' => $validated['article_url'] ?? null,
            'featured_image_id' => $validated['featured_image_id'] ?? null,
            'document_media_id' => $validated['document_media_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? $mediaPress->sort_order,
            'published_at' => $validated['published_at'] ?? $mediaPress->published_at,
        ]);

        if (isset($validated['tags'])) {
            $mediaPress->tags()->sync($validated['tags']);
        }

        if (isset($validated['seo'])) {
            if ($mediaPress->seo) {
                $mediaPress->seo->update($validated['seo']);
            } else {
                $mediaPress->seo()->create($validated['seo']);
            }
        }

        CmsCacheService::forgetMediaPress($oldSlug);
        if ($oldSlug !== $newSlug) {
            CmsCacheService::forgetMediaPress($newSlug);
        }

        $titleEn = $mediaPress->title['en'] ?? 'Untitled Press Record';
        ActivityLog::record(
            action: 'media_press_updated',
            description: "Updated press media record: {$titleEn}",
            subject: $mediaPress
        );

        $mediaPress->load(['category', 'tags', 'featuredImage', 'documentMedia', 'seo']);

        return ApiResponse::success(
            (new MediaPressDetailResource($mediaPress))->toArray($request),
            'Press media record updated successfully.'
        );
    }

    /**
     * Soft delete a press media record.
     */
    public function destroy(MediaPress $mediaPress): JsonResponse
    {
        $titleEn = $mediaPress->title['en'] ?? 'Untitled Press Record';
        $slug = $mediaPress->slug;

        $mediaPress->delete();

        CmsCacheService::forgetMediaPress($slug);

        ActivityLog::record(
            action: 'media_press_deleted',
            description: "Soft deleted press media record: {$titleEn}",
            subject: $mediaPress
        );

        return ApiResponse::success(null, 'Press media record deleted successfully.');
    }

    /**
     * Reorder press media records.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $items = $request->validated()['items'];

        if ($request->has('order') && is_array($request->input('order'))) {
            foreach ($request->input('order') as $entry) {
                if (is_array($entry) && isset($entry['id'], $entry['sort_order'])) {
                    MediaPress::where('id', $entry['id'])->update(['sort_order' => (int) $entry['sort_order']]);
                }
            }
        } else {
            foreach ($items as $index => $id) {
                MediaPress::where('id', $id)->update(['sort_order' => $index]);
            }
        }

        CmsCacheService::forgetMediaPress();

        ActivityLog::record(
            action: 'media_press_reordered',
            description: 'Updated sort order for press media records',
            newValues: ['items_count' => count($items)]
        );

        return ApiResponse::success(null, 'Press media records reordered successfully.');
    }

    /**
     * Preview a draft or private press media record for authorized administrators.
     */
    public function preview(MediaPress $mediaPress, Request $request): JsonResponse
    {
        $mediaPress->load(['category', 'tags', 'featuredImage', 'documentMedia', 'seo']);

        return response()->json([
            'success' => true,
            'message' => 'Administrative preview retrieved successfully.',
            'data' => (new MediaPressDetailResource($mediaPress))->toArray($request),
        ], 200, [
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }

    /**
     * Download attached document for authorized administrators.
     */
    public function downloadDocument(MediaPress $mediaPress): BinaryFileResponse|JsonResponse
    {
        if (empty($mediaPress->document_media_id) || !$mediaPress->documentMedia) {
            return ApiResponse::notFound('No attached document found for this press media record.');
        }

        $document = $mediaPress->documentMedia;
        $disk = $document->disk ?? 'public';
        $filePath = $document->file_path;

        if (!Storage::disk($disk)->exists($filePath)) {
            return ApiResponse::notFound('Document file is missing from physical storage.');
        }

        $absolutePath = Storage::disk($disk)->path($filePath);
        $downloadName = $document->original_name ?: basename($filePath);

        return response()->download($absolutePath, $downloadName, [
            'Content-Type' => $document->mime_type ?: 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

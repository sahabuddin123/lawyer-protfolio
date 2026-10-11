<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaAppearanceRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\MediaAppearanceDetailResource;
use App\Http\Resources\V1\MediaAppearanceResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\MediaAppearance;
use App\Models\Redirect;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminMediaAppearanceController extends Controller
{
    /**
     * List all electronic media appearances with administrative filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MediaAppearance::query()->with([
            'category',
            'tags',
            'thumbnail',
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

        if ($channel = $request->input('channel')) {
            $query->filterChannel($channel);
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
        $allowedSorts = ['sort_order', 'broadcast_date', 'created_at', 'updated_at', 'published_at', 'media_type', 'slug'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('sort_order', 'asc')->orderBy('broadcast_date', 'desc')->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        $data = MediaAppearanceResource::collection($paginator->getCollection())->toArray($request);

        return ApiResponse::paginated($paginator, $data, 'Electronic media appearances retrieved successfully.');
    }

    /**
     * Create a new media appearance record.
     */
    public function store(MediaAppearanceRequest $request): JsonResponse
    {
        $validated = $request->sanitizedData();

        if (!empty($validated['description'])) {
            $validated['description'] = HtmlSanitizer::cleanTranslations($validated['description']);
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $appearance = MediaAppearance::create([
            'category_id' => $validated['category_id'] ?? null,
            'media_type' => trim($validated['media_type']),
            'channel' => $validated['channel'] ?? ['en' => '', 'bn' => ''],
            'program' => $validated['program'] ?? ['en' => '', 'bn' => ''],
            'title' => $validated['title'],
            'slug' => strtolower(trim($validated['slug'])),
            'video_url' => $validated['video_url'] ?? null,
            'thumbnail_id' => $validated['thumbnail_id'] ?? null,
            'document_media_id' => $validated['document_media_id'] ?? null,
            'broadcast_date' => $validated['broadcast_date'] ?? null,
            'description' => $validated['description'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? null,
        ]);

        if (isset($validated['tags'])) {
            $appearance->tags()->sync($validated['tags']);
        }

        if (!empty($validated['seo'])) {
            $appearance->seo()->create($validated['seo']);
        }

        CmsCacheService::forgetMediaAppearances($appearance->slug);

        $titleEn = $appearance->title['en'] ?? 'Untitled Media Appearance';
        ActivityLog::record(
            action: 'media_appearance_created',
            description: "Created electronic media appearance: {$titleEn} ({$appearance->media_type})",
            subject: $appearance,
            newValues: $appearance->only(['id', 'slug', 'media_type', 'status', 'visibility'])
        );

        if ($appearance->status === 'published') {
            ActivityLog::record(
                action: 'media_appearance_published',
                description: "Published electronic media appearance on creation: {$titleEn}",
                subject: $appearance
            );
        }

        if (!empty($appearance->document_media_id)) {
            ActivityLog::record(
                action: 'media_document_added',
                description: "Attached document ID #{$appearance->document_media_id} to media appearance: {$titleEn}",
                subject: $appearance
            );
        }

        $appearance->load(['category', 'tags', 'thumbnail', 'documentMedia', 'seo']);

        return ApiResponse::created(
            (new MediaAppearanceDetailResource($appearance))->toArray($request),
            'Electronic media appearance created successfully.'
        );
    }

    /**
     * Retrieve a single media appearance record.
     */
    public function show(MediaAppearance $mediaAppearance, Request $request): JsonResponse
    {
        $mediaAppearance->load(['category', 'tags', 'thumbnail', 'documentMedia', 'seo']);

        return ApiResponse::success(
            (new MediaAppearanceDetailResource($mediaAppearance))->toArray($request),
            'Media appearance details retrieved successfully.'
        );
    }

    /**
     * Update an existing media appearance record.
     */
    public function update(MediaAppearanceRequest $request, MediaAppearance $mediaAppearance): JsonResponse
    {
        $validated = $request->sanitizedData();
        $oldSlug = $mediaAppearance->slug;
        $newSlug = strtolower(trim($validated['slug']));
        $oldStatus = $mediaAppearance->status;
        $newStatus = $validated['status'];

        if (!empty($validated['description'])) {
            $validated['description'] = HtmlSanitizer::cleanTranslations($validated['description']);
        }

        // Automated 301 Redirect on slug change
        if ($oldSlug !== $newSlug && $oldStatus === 'published') {
            Redirect::updateOrCreate(
                ['source_url' => "/media/appearances/{$oldSlug}"],
                [
                    'target_url' => "/media/appearances/{$newSlug}",
                    'status_code' => 301,
                    'is_active' => true,
                ]
            );

            ActivityLog::record(
                action: 'redirect_created',
                description: "Auto-created 301 redirect due to appearance slug change: /media/appearances/{$oldSlug} -> /media/appearances/{$newSlug}",
                newValues: ['source_url' => "/media/appearances/{$oldSlug}", 'target_url' => "/media/appearances/{$newSlug}", 'status_code' => 301]
            );
        }

        if ($newStatus === 'published' && !$mediaAppearance->published_at && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $mediaAppearance->update([
            'category_id' => $validated['category_id'] ?? null,
            'media_type' => trim($validated['media_type']),
            'channel' => $validated['channel'] ?? $mediaAppearance->channel,
            'program' => $validated['program'] ?? $mediaAppearance->program ?? ['en' => '', 'bn' => ''],
            'title' => $validated['title'],
            'slug' => $newSlug,
            'video_url' => $validated['video_url'] ?? null,
            'thumbnail_id' => $validated['thumbnail_id'] ?? null,
            'document_media_id' => $validated['document_media_id'] ?? null,
            'broadcast_date' => $validated['broadcast_date'] ?? null,
            'description' => $validated['description'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? $mediaAppearance->sort_order,
            'published_at' => $validated['published_at'] ?? $mediaAppearance->published_at,
        ]);

        if (isset($validated['tags'])) {
            $mediaAppearance->tags()->sync($validated['tags']);
        }

        if (isset($validated['seo'])) {
            if ($mediaAppearance->seo) {
                $mediaAppearance->seo->update($validated['seo']);
            } else {
                $mediaAppearance->seo()->create($validated['seo']);
            }
        }

        CmsCacheService::forgetMediaAppearances($oldSlug);
        if ($oldSlug !== $newSlug) {
            CmsCacheService::forgetMediaAppearances($newSlug);
        }

        $titleEn = $mediaAppearance->title['en'] ?? 'Untitled Media Appearance';
        ActivityLog::record(
            action: 'media_appearance_updated',
            description: "Updated electronic media appearance: {$titleEn}",
            subject: $mediaAppearance
        );

        $mediaAppearance->load(['category', 'tags', 'thumbnail', 'documentMedia', 'seo']);

        return ApiResponse::success(
            (new MediaAppearanceDetailResource($mediaAppearance))->toArray($request),
            'Electronic media appearance updated successfully.'
        );
    }

    /**
     * Soft delete a media appearance record.
     */
    public function destroy(MediaAppearance $mediaAppearance): JsonResponse
    {
        $titleEn = $mediaAppearance->title['en'] ?? 'Untitled Media Appearance';
        $slug = $mediaAppearance->slug;

        $mediaAppearance->delete();

        CmsCacheService::forgetMediaAppearances($slug);

        ActivityLog::record(
            action: 'media_appearance_deleted',
            description: "Soft deleted electronic media appearance: {$titleEn}",
            subject: $mediaAppearance
        );

        return ApiResponse::success(null, 'Electronic media appearance deleted successfully.');
    }

    /**
     * Reorder media appearance records.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $items = $request->validated()['items'];

        if ($request->has('order') && is_array($request->input('order'))) {
            foreach ($request->input('order') as $entry) {
                if (is_array($entry) && isset($entry['id'], $entry['sort_order'])) {
                    MediaAppearance::where('id', $entry['id'])->update(['sort_order' => (int) $entry['sort_order']]);
                }
            }
        } else {
            foreach ($items as $index => $id) {
                MediaAppearance::where('id', $id)->update(['sort_order' => $index]);
            }
        }

        CmsCacheService::forgetMediaAppearances();

        ActivityLog::record(
            action: 'media_appearance_reordered',
            description: 'Updated sort order for electronic media appearances',
            newValues: ['items_count' => count($items)]
        );

        return ApiResponse::success(null, 'Electronic media appearances reordered successfully.');
    }

    /**
     * Preview a draft or private media appearance record for authorized administrators.
     */
    public function preview(MediaAppearance $mediaAppearance, Request $request): JsonResponse
    {
        $mediaAppearance->load(['category', 'tags', 'thumbnail', 'documentMedia', 'seo']);

        return response()->json([
            'success' => true,
            'message' => 'Administrative preview retrieved successfully.',
            'data' => (new MediaAppearanceDetailResource($mediaAppearance))->toArray($request),
        ], 200, [
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }

    /**
     * Download attached document for authorized administrators.
     */
    public function downloadDocument(MediaAppearance $mediaAppearance): BinaryFileResponse|JsonResponse
    {
        if (empty($mediaAppearance->document_media_id) || !$mediaAppearance->documentMedia) {
            return ApiResponse::notFound('No attached document found for this media appearance.');
        }

        $document = $mediaAppearance->documentMedia;
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

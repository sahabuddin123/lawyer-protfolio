<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Requests\Admin\VideoRequest;
use App\Http\Resources\V1\VideoDetailResource;
use App\Http\Resources\V1\VideoResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\Redirect;
use App\Models\Video;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVideoController extends Controller
{
    /**
     * List all videos with administrative filters, search, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Video::query()->with([
            'category',
            'tags',
            'thumbnail',
            'seo',
        ]);

        // Search
        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->search($search);
        }

        // Platform filter
        if ($platform = $request->input('platform')) {
            $query->platform($platform);
        }

        // Category filter
        if ($category = $request->input('category_id') ?: $request->input('category')) {
            if (is_numeric($category)) {
                $query->where('category_id', (int) $category);
            } else {
                $query->categorySlug($category);
            }
        }

        // Tag filter
        if ($tag = $request->input('tag')) {
            $query->whereHas('tags', function ($q) use ($tag) {
                if (is_numeric($tag)) {
                    $q->where('tags.id', (int) $tag);
                } else {
                    $q->where('tags.slug', $tag);
                }
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        // Visibility filter
        if ($visibility = $request->input('visibility')) {
            if ($visibility !== 'all') {
                $query->where('visibility', $visibility);
            }
        }

        // Featured filter
        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        } elseif ($request->has('featured')) {
            $query->where('is_featured', $request->boolean('featured'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'sort_order');
        $sortDir = strtolower($request->input('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['sort_order', 'published_date', 'created_at', 'updated_at', 'published_at', 'platform', 'slug'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('sort_order', 'asc')->orderBy('published_date', 'desc')->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        $data = VideoResource::collection($paginator->getCollection())->toArray($request);

        return ApiResponse::paginated($paginator, $data, 'Videos retrieved successfully.');
    }

    /**
     * Create a new video record.
     */
    public function store(VideoRequest $request): JsonResponse
    {
        $validated = $request->sanitizedData();

        if (!empty($validated['description'])) {
            $validated['description'] = HtmlSanitizer::cleanTranslations($validated['description']);
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $video = Video::create([
            'category_id' => $validated['category_id'] ?? null,
            'title' => $validated['title'],
            'slug' => strtolower(trim($validated['slug'])),
            'platform' => $validated['platform'],
            'video_url' => $validated['video_url'],
            'video_id' => $validated['video_id'] ?? null,
            'thumbnail_id' => $validated['thumbnail_id'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'description' => $validated['description'] ?? null,
            'published_date' => $validated['published_date'] ?? null,
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'sort_order' => $validated['sort_order'] ?? 0,
            'published_at' => $validated['published_at'] ?? null,
        ]);

        if (isset($validated['tags'])) {
            $video->tags()->sync($validated['tags']);
        }

        if (!empty($validated['seo'])) {
            $video->seo()->create($validated['seo']);
        }

        CmsCacheService::forgetVideos($video->slug);

        $titleEn = $video->title['en'] ?? 'Untitled Video';
        ActivityLog::record(
            action: 'video_created',
            description: "Created video: {$titleEn} [{$video->platform}]",
            subject: $video,
            newValues: $video->only(['id', 'slug', 'platform', 'status', 'visibility'])
        );

        if ($video->status === 'published') {
            ActivityLog::record(
                action: 'video_published',
                description: "Published video on creation: {$titleEn}",
                subject: $video
            );
        }

        if ($video->is_featured) {
            ActivityLog::record(
                action: 'video_featured',
                description: "Featured video on creation: {$titleEn}",
                subject: $video
            );
        }

        $video->load(['category', 'tags', 'thumbnail', 'seo']);

        return ApiResponse::created(
            (new VideoResource($video))->toArray($request),
            'Video created successfully.'
        );
    }

    /**
     * Retrieve a single video record for editing.
     */
    public function show(Video $video, Request $request): JsonResponse
    {
        $video->load(['category', 'tags', 'thumbnail', 'seo']);

        return ApiResponse::success(
            (new VideoResource($video))->toArray($request),
            'Video retrieved successfully.'
        );
    }

    /**
     * Update an existing video record.
     */
    public function update(VideoRequest $request, Video $video): JsonResponse
    {
        $validated = $request->sanitizedData();
        $oldSlug = $video->slug;
        $newSlug = strtolower(trim($validated['slug']));
        $oldStatus = $video->status;
        $newStatus = $validated['status'];
        $oldFeatured = (bool) $video->is_featured;
        $newFeatured = (bool) ($validated['is_featured'] ?? false);
        $oldVisibility = $video->visibility;
        $newVisibility = $validated['visibility'];

        if (!empty($validated['description'])) {
            $validated['description'] = HtmlSanitizer::cleanTranslations($validated['description']);
        }

        // Automated 301 Redirect on slug change
        if ($oldSlug !== $newSlug && $oldStatus === 'published' && $oldVisibility === 'public') {
            Redirect::updateOrCreate(
                ['source_url' => "/videos/{$oldSlug}"],
                [
                    'target_url' => "/videos/{$newSlug}",
                    'status_code' => 301,
                    'is_active' => true,
                ]
            );

            ActivityLog::record(
                action: 'redirect_created',
                description: "Auto-created 301 redirect due to video slug change: /videos/{$oldSlug} -> /videos/{$newSlug}",
                newValues: ['source_url' => "/videos/{$oldSlug}", 'target_url' => "/videos/{$newSlug}", 'status_code' => 301]
            );
        }

        if ($newStatus === 'published' && empty($video->published_at) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $video->update([
            'category_id' => $validated['category_id'] ?? null,
            'title' => $validated['title'],
            'slug' => $newSlug,
            'platform' => $validated['platform'],
            'video_url' => $validated['video_url'],
            'video_id' => $validated['video_id'] ?? null,
            'thumbnail_id' => $validated['thumbnail_id'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'description' => $validated['description'] ?? null,
            'published_date' => $validated['published_date'] ?? null,
            'visibility' => $newVisibility,
            'status' => $newStatus,
            'is_featured' => $newFeatured,
            'sort_order' => $validated['sort_order'] ?? $video->sort_order,
            'published_at' => $validated['published_at'] ?? $video->published_at,
        ]);

        if (isset($validated['tags'])) {
            $video->tags()->sync($validated['tags']);
        }

        if (isset($validated['seo'])) {
            $video->seo()->updateOrCreate(
                ['seoable_id' => $video->id, 'seoable_type' => Video::class],
                $validated['seo']
            );
        }

        CmsCacheService::forgetVideos($oldSlug);
        if ($oldSlug !== $newSlug) {
            CmsCacheService::forgetVideos($newSlug);
        }

        $titleEn = $video->title['en'] ?? 'Untitled Video';

        ActivityLog::record(
            action: 'video_updated',
            description: "Updated video: {$titleEn}",
            subject: $video,
            oldValues: ['slug' => $oldSlug, 'status' => $oldStatus],
            newValues: ['slug' => $newSlug, 'status' => $newStatus]
        );

        if ($oldStatus !== $newStatus) {
            ActivityLog::record(
                action: $newStatus === 'published' ? 'video_published' : 'video_unpublished',
                description: "Changed video status from {$oldStatus} to {$newStatus}: {$titleEn}",
                subject: $video
            );
        }

        if ($oldFeatured !== $newFeatured) {
            ActivityLog::record(
                action: $newFeatured ? 'video_featured' : 'video_unfeatured',
                description: ($newFeatured ? 'Featured' : 'Unfeatured') . " video: {$titleEn}",
                subject: $video
            );
        }

        if ($oldVisibility !== $newVisibility) {
            ActivityLog::record(
                action: 'video_visibility_changed',
                description: "Changed video visibility to {$newVisibility}: {$titleEn}",
                subject: $video
            );
        }

        $video->load(['category', 'tags', 'thumbnail', 'seo']);

        return ApiResponse::success(
            (new VideoResource($video))->toArray($request),
            'Video updated successfully.'
        );
    }

    /**
     * Soft delete a video record.
     */
    public function destroy(Video $video): JsonResponse
    {
        $slug = $video->slug;
        $titleEn = $video->title['en'] ?? 'Untitled Video';

        $video->delete();

        CmsCacheService::forgetVideos($slug);

        ActivityLog::record(
            action: 'video_deleted',
            description: "Deleted video: {$titleEn} [ID: {$video->id}]",
            subject: $video
        );

        return ApiResponse::success(null, 'Video deleted successfully.');
    }

    /**
     * Preview an unpublished draft video.
     */
    public function preview(Video $video, Request $request): JsonResponse
    {
        $video->load(['category', 'tags', 'thumbnail', 'seo']);

        $response = ApiResponse::success(
            (new VideoDetailResource($video))->toArray($request),
            'Video preview retrieved.'
        );

        $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive');

        return $response;
    }

    /**
     * Reorder videos in bulk.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $order = $request->input('order', []);

        foreach ($order as $index => $item) {
            $id = is_array($item) ? ($item['id'] ?? null) : $item;
            $sortOrder = is_array($item) ? ($item['sort_order'] ?? $index) : $index;

            if ($id) {
                Video::where('id', $id)->update(['sort_order' => $sortOrder]);
            }
        }

        CmsCacheService::forgetVideos();

        ActivityLog::record(
            action: 'videos_reordered',
            description: 'Updated video display sort order in bulk.'
        );

        return ApiResponse::success(null, 'Videos reordered successfully.');
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GalleryAlbumRequest;
use App\Http\Requests\Admin\GalleryImageAttachRequest;
use App\Http\Requests\Admin\GalleryImageRequest;
use App\Http\Requests\Admin\GalleryImageUploadRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\GalleryAlbumResource;
use App\Http\Resources\V1\GalleryImageResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\GalleryAlbum;
use App\Models\GalleryImage;
use App\Models\Redirect;
use App\Services\CmsCacheService;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminGalleryAlbumController extends Controller
{
    /**
     * List all gallery albums with administrative filters, search, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = GalleryAlbum::query()->with([
            'category',
            'coverImage',
            'seo',
        ]);

        // Search
        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->search($search);
        }

        // Category filter
        if ($category = $request->input('category_id') ?: $request->input('category')) {
            if (is_numeric($category)) {
                $query->where('category_id', (int) $category);
            } else {
                $query->categorySlug($category);
            }
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Visibility filter
        if ($visibility = $request->input('visibility')) {
            $query->where('visibility', $visibility);
        }

        // Featured filter
        if ($request->has('featured') || $request->has('is_featured')) {
            $featured = $request->input('featured', $request->input('is_featured'));
            if ($featured !== null && $featured !== '') {
                $query->where('is_featured', filter_var($featured, FILTER_VALIDATE_BOOLEAN));
            }
        }

        // Date sorting / filtering
        if ($request->filled('date_from')) {
            $query->whereDate('event_date', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('event_date', '<=', $request->input('date_to'));
        }

        $sortField = $request->input('sort_by', 'event_date');
        $sortDir = strtolower($request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['id', 'event_date', 'sort_order', 'created_at', 'status', 'published_at'];
        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDir);
        } else {
            $query->orderBy('event_date', 'desc')->orderBy('sort_order', 'asc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $paginator = $query->paginate($perPage);

        $data = GalleryAlbumResource::collection($paginator->getCollection())->toArray($request);

        return ApiResponse::paginated($paginator, $data, 'Gallery albums retrieved successfully.');
    }

    /**
     * Store a newly created gallery album.
     */
    public function store(GalleryAlbumRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $seoData = $validated['seo'] ?? null;
        unset($validated['seo']);

        if (!empty($validated['status']) && $validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $album = DB::transaction(function () use ($validated, $seoData) {
            $created = GalleryAlbum::create($validated);

            if (!empty($seoData)) {
                $created->seo()->create($this->formatSeoPayload($seoData));
            }

            return $created;
        });

        ActivityLog::record(
            'album_created',
            "Gallery album '{$album->slug}' was created by administrator.",
            $album
        );

        CmsCacheService::forgetGallery();

        $album->load(['category', 'coverImage', 'seo', 'images.media']);

        return ApiResponse::created(
            new GalleryAlbumResource($album),
            'Gallery album created successfully.'
        );
    }

    /**
     * Display a specific gallery album for admin editing.
     */
    public function show(int $id): JsonResponse
    {
        $album = GalleryAlbum::with([
            'category',
            'coverImage',
            'seo',
            'images.media',
        ])->findOrFail($id);

        return ApiResponse::success(
            new GalleryAlbumResource($album),
            'Gallery album retrieved successfully.'
        );
    }

    /**
     * Update an existing gallery album.
     */
    public function update(GalleryAlbumRequest $request, int $id): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($id);
        $validated = $request->validated();
        $seoData = $validated['seo'] ?? null;
        unset($validated['seo']);

        $oldSlug = $album->slug;
        $wasPublished = $album->status === 'published';

        if (isset($validated['status']) && $validated['status'] === 'published' && empty($album->published_at) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        DB::transaction(function () use ($album, $validated, $seoData, $oldSlug, $wasPublished) {
            $album->update($validated);

            if ($seoData !== null) {
                $album->seo()->updateOrCreate([], $this->formatSeoPayload($seoData));
            }

            // Create 301 permanent redirect if published album slug changed
            if ($wasPublished && !empty($validated['slug']) && $oldSlug !== $validated['slug']) {
                Redirect::updateOrCreate(
                    ['source_url' => "/gallery/{$oldSlug}"],
                    [
                        'target_url' => "/gallery/{$validated['slug']}",
                        'status_code' => 301,
                        'is_active' => true,
                    ]
                );
            }
        });

        ActivityLog::record(
            'album_updated',
            "Gallery album '{$album->slug}' was updated by administrator.",
            $album
        );

        CmsCacheService::forgetGallery($oldSlug);
        if ($oldSlug !== $album->slug) {
            CmsCacheService::forgetGallery($album->slug);
        }

        $album->load(['category', 'coverImage', 'seo', 'images.media']);

        return ApiResponse::success(
            new GalleryAlbumResource($album),
            'Gallery album updated successfully.'
        );
    }

    /**
     * Soft delete an album. Does NOT delete underlying Media Library assets.
     */
    public function destroy(int $id): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($id);
        $slug = $album->slug;

        $album->delete();

        ActivityLog::record(
            'album_deleted',
            "Gallery album '{$slug}' was soft-deleted by administrator.",
            $album
        );

        CmsCacheService::forgetGallery($slug);

        return ApiResponse::success(null, 'Gallery album deleted successfully.');
    }

    /**
     * Batch update sort orders of albums.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $rawItems = $request->input('raw_items') ?: $request->input('order') ?: $request->input('items', []);

        DB::transaction(function () use ($rawItems) {
            foreach ($rawItems as $index => $item) {
                $id = is_array($item) ? ($item['id'] ?? null) : $item;
                $sort = is_array($item) ? ($item['sort_order'] ?? $index) : $index;
                if ($id) {
                    GalleryAlbum::where('id', $id)->update(['sort_order' => $sort]);
                }
            }
        });

        CmsCacheService::forgetGallery();

        return ApiResponse::success(null, 'Gallery albums reordered successfully.');
    }

    /**
     * Preview an unpublished draft album with indexing safety headers.
     */
    public function preview(int $id): JsonResponse
    {
        $album = GalleryAlbum::with([
            'category',
            'coverImage',
            'seo',
            'images.media',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Admin draft preview retrieved.',
            'data' => new GalleryAlbumResource($album),
            'meta' => [
                'preview_mode' => true,
                'status' => $album->status,
                'visibility' => $album->visibility,
                'timestamp' => now()->toIso8601String(),
            ],
        ])->header('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }

    /**
     * Attach an existing Media asset to the album as a GalleryImage.
     */
    public function attachImage(GalleryImageAttachRequest $request, int $albumId): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($albumId);
        $validated = $request->validated();

        $maxSort = (int) $album->images()->max('sort_order');
        $sortOrder = $validated['sort_order'] ?? ($maxSort + 1);

        $image = $album->images()->create([
            'media_id' => $validated['media_id'],
            'caption' => $validated['caption'] ?? null,
            'alt_text' => $validated['alt_text'] ?? null,
            'sort_order' => $sortOrder,
            'is_featured' => $validated['is_featured'] ?? false,
            'visibility' => $validated['visibility'] ?? 'public',
            'metadata' => $validated['metadata'] ?? null,
        ]);

        // If album does not have a cover image, set this media as cover
        if (empty($album->cover_image_id)) {
            $album->update(['cover_image_id' => $validated['media_id']]);
        }

        ActivityLog::record(
            'album_image_added',
            "Image attached to gallery album '{$album->slug}'.",
            $image
        );

        CmsCacheService::forgetGallery($album->slug);

        $image->load('media');

        return ApiResponse::created(
            new GalleryImageResource($image),
            'Image attached to album successfully.'
        );
    }

    /**
     * Direct upload of an image file to centralized Media Library and attach to album.
     */
    public function uploadImage(GalleryImageUploadRequest $request, int $albumId, MediaService $mediaService): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($albumId);
        $file = $request->file('file');
        $validated = $request->validated();

        $media = $mediaService->uploadFile(
            file: $file,
            disk: 'public',
            directory: 'media/gallery/' . date('Y/m'),
            altText: $validated['alt_text'] ?? null,
            caption: $validated['caption'] ?? null,
            uploadedBy: $request->user()?->id
        );

        $maxSort = (int) $album->images()->max('sort_order');
        $sortOrder = $validated['sort_order'] ?? ($maxSort + 1);

        $image = $album->images()->create([
            'media_id' => $media->id,
            'caption' => $validated['caption'] ?? null,
            'alt_text' => $validated['alt_text'] ?? null,
            'sort_order' => $sortOrder,
            'is_featured' => $validated['is_featured'] ?? false,
            'visibility' => $validated['visibility'] ?? 'public',
            'metadata' => $validated['metadata'] ?? null,
        ]);

        if (empty($album->cover_image_id)) {
            $album->update(['cover_image_id' => $media->id]);
        }

        ActivityLog::record(
            'album_image_uploaded',
            "New image uploaded and attached to gallery album '{$album->slug}'.",
            $image
        );

        CmsCacheService::forgetGallery($album->slug);

        $image->load('media');

        return ApiResponse::created(
            new GalleryImageResource($image),
            'Image uploaded and attached to album successfully.'
        );
    }

    /**
     * Update an individual image's caption, alt text, sort order, or visibility.
     */
    public function updateImage(GalleryImageRequest $request, int $albumId, int $imageId): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($albumId);
        $image = GalleryImage::where('album_id', $album->id)->findOrFail($imageId);

        $validated = $request->validated();
        $image->update($validated);

        ActivityLog::record(
            'album_image_updated',
            "Gallery image #{$image->id} in album '{$album->slug}' was updated.",
            $image
        );

        CmsCacheService::forgetGallery($album->slug);

        $image->load('media');

        return ApiResponse::success(
            new GalleryImageResource($image),
            'Image updated successfully.'
        );
    }

    /**
     * Detach an image from the album. Does NOT delete underlying Media record.
     */
    public function detachImage(int $albumId, int $imageId): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($albumId);
        $image = GalleryImage::where('album_id', $album->id)->findOrFail($imageId);

        $wasCover = ($album->cover_image_id === $image->media_id);
        $image->delete();

        // If the removed image was the cover image, find another public image or set null
        if ($wasCover) {
            $nextImage = $album->images()->first();
            $album->update(['cover_image_id' => $nextImage?->media_id]);
        }

        ActivityLog::record(
            'album_image_removed',
            "Gallery image #{$imageId} removed from album '{$album->slug}'.",
            $album
        );

        CmsCacheService::forgetGallery($album->slug);

        return ApiResponse::success(null, 'Image detached from album successfully.');
    }

    /**
     * Reorder images within an album.
     */
    public function reorderImages(ReorderItemsRequest $request, int $albumId): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($albumId);
        $rawItems = $request->input('raw_items') ?: $request->input('order') ?: $request->input('items', []);

        DB::transaction(function () use ($album, $rawItems) {
            foreach ($rawItems as $index => $item) {
                $id = is_array($item) ? ($item['id'] ?? null) : $item;
                $sort = is_array($item) ? ($item['sort_order'] ?? $index) : $index;
                if ($id) {
                    GalleryImage::where('album_id', $album->id)
                        ->where('id', $id)
                        ->update(['sort_order' => $sort]);
                }
            }
        });

        CmsCacheService::forgetGallery($album->slug);

        return ApiResponse::success(null, 'Album images reordered successfully.');
    }

    /**
     * Set a specific image as the cover image of the album.
     */
    public function setCoverImage(int $albumId, int $imageId): JsonResponse
    {
        $album = GalleryAlbum::findOrFail($albumId);
        $image = GalleryImage::where('album_id', $album->id)->findOrFail($imageId);

        $album->update(['cover_image_id' => $image->media_id]);

        ActivityLog::record(
            'album_cover_updated',
            "Cover image updated for gallery album '{$album->slug}'.",
            $album
        );

        CmsCacheService::forgetGallery($album->slug);

        $album->load(['category', 'coverImage', 'seo', 'images.media']);

        return ApiResponse::success(
            new GalleryAlbumResource($album),
            'Album cover image updated successfully.'
        );
    }

    /**
     * Format incoming SEO array into SeoMeta attributes.
     */
    protected function formatSeoPayload(array $seoData): array
    {
        $formatted = [
            'seo_title' => $seoData['seo_title'] ?? $seoData['meta_title'] ?? null,
            'meta_description' => $seoData['meta_description'] ?? null,
            'canonical_url' => $seoData['canonical_url'] ?? null,
            'og_title' => $seoData['og_title'] ?? null,
            'og_description' => $seoData['og_description'] ?? null,
            'og_image_id' => $seoData['og_image_id'] ?? null,
            'robots' => !empty($seoData['noindex']) ? 'noindex,nofollow' : ($seoData['robots'] ?? null),
        ];

        return array_filter($formatted, fn($v) => !is_null($v));
    }
}

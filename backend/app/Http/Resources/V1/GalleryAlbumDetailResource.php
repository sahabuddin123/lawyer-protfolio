<?php

namespace App\Http\Resources\V1;

use App\Models\GalleryAlbum;
use Illuminate\Http\Request;

class GalleryAlbumDetailResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        // Deterministic related albums: same category, published, public, excluding current
        $relatedAlbums = GalleryAlbum::query()
            ->published()
            ->public()
            ->where('id', '!=', $this->id)
            ->when($this->category_id, function ($q) {
                $q->where('category_id', $this->category_id);
            })
            ->with(['coverImage', 'category'])
            ->orderByDesc('event_date')
            ->orderBy('sort_order')
            ->limit(4)
            ->get();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->resolveTranslation($this->title),
            'description' => $this->resolveTranslation($this->description),
            'cover_image_url' => $this->cover_image_url,
            'cover_image' => $this->relationLoaded('coverImage') && $this->coverImage ? [
                'url' => $this->coverImage->url,
                'variants' => $this->coverImage->variants ?? [],
                'width' => $this->coverImage->width,
                'height' => $this->coverImage->height,
            ] : null,
            'category' => $this->relationLoaded('category') && $this->category ? [
                'id' => $this->category->id,
                'name' => $this->resolveTranslation($this->category->name),
                'slug' => $this->category->slug,
            ] : null,
            'event_date' => $this->event_date?->format('Y-m-d'),
            'is_featured' => (bool) $this->is_featured,
            'image_count' => $this->public_image_count,
            'published_at' => $this->published_at?->toIso8601String(),
            'images' => GalleryImageResource::collection(
                $this->relationLoaded('publicImages') ? $this->publicImages : $this->publicImages()->with('media')->get()
            ),
            'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
            'related_albums' => GalleryAlbumResource::collection($relatedAlbums),
        ];
    }
}

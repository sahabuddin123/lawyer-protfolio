<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class GalleryAlbumResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            return [
                'id' => $this->id,
                'slug' => $this->slug,
                'title' => $this->title,
                'description' => $this->description,
                'cover_image_id' => $this->cover_image_id,
                'cover_image_url' => $this->cover_image_url,
                'cover_image' => $this->relationLoaded('coverImage') && $this->coverImage ? new MediaResource($this->coverImage) : null,
                'category_id' => $this->category_id,
                'category' => $this->relationLoaded('category') && $this->category ? [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                    'type' => $this->category->type,
                ] : null,
                'event_date' => $this->event_date?->format('Y-m-d'),
                'published_at' => $this->published_at?->toIso8601String(),
                'status' => $this->status,
                'visibility' => $this->visibility,
                'is_featured' => (bool) $this->is_featured,
                'featured' => (bool) $this->is_featured,
                'sort_order' => (int) $this->sort_order,
                'image_count' => $this->image_count,
                'public_image_count' => $this->public_image_count,
                'images' => $this->relationLoaded('images') ? GalleryImageResource::collection($this->images) : [],
                'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
                'created_at' => $this->created_at?->toIso8601String(),
                'updated_at' => $this->updated_at?->toIso8601String(),
            ];
        }

        // Public representation (Album card in listing)
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
            'sort_order' => (int) $this->sort_order,
            'image_count' => $this->public_image_count,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}

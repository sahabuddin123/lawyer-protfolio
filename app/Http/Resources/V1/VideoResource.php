<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class VideoResource extends BaseApiResource
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
                'platform' => $this->platform,
                'video_url' => $this->video_url,
                'video_id' => $this->video_id,
                'embed_url' => $this->embed_url,
                'thumbnail_id' => $this->thumbnail_id,
                'thumbnail' => $this->relationLoaded('thumbnail') && $this->thumbnail ? new MediaResource($this->thumbnail) : null,
                'category_id' => $this->category_id,
                'category' => $this->relationLoaded('category') && $this->category ? [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                    'type' => $this->category->type,
                ] : null,
                'tags' => $this->relationLoaded('tags') ? $this->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                    ];
                }) : [],
                'duration' => $this->duration,
                'description' => $this->description,
                'published_date' => $this->published_date?->format('Y-m-d'),
                'status' => $this->status,
                'visibility' => $this->visibility,
                'is_featured' => (bool) $this->is_featured,
                'featured' => (bool) $this->is_featured,
                'sort_order' => (int) $this->sort_order,
                'published_at' => $this->published_at?->toIso8601String(),
                'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
                'created_at' => $this->created_at?->toIso8601String(),
                'updated_at' => $this->updated_at?->toIso8601String(),
            ];
        }

        // Public representation (list/card format)
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->resolveTranslation($this->title),
            'platform' => $this->platform,
            'video_url' => $this->video_url,
            'video_id' => $this->video_id,
            'embed_url' => $this->embed_url,
            'external_watch_url' => $this->video_url,
            'duration' => $this->duration,
            'description' => $this->resolveTranslation($this->description),
            'published_date' => $this->published_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'date' => $this->published_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'category' => $this->relationLoaded('category') && $this->category ? [
                'id' => $this->category->id,
                'name' => $this->resolveTranslation($this->category->name),
                'slug' => $this->category->slug,
            ] : null,
            'tags' => $this->relationLoaded('tags') ? $this->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $this->resolveTranslation($tag->name),
                    'slug' => $tag->slug,
                ];
            }) : [],
            'thumbnail' => $this->relationLoaded('thumbnail') && $this->thumbnail ? [
                'id' => $this->thumbnail->id,
                'url' => $this->thumbnail->url,
                'alt_text' => $this->thumbnail->alt_text,
                'variants' => $this->thumbnail->variants,
            ] : null,
            'is_featured' => (bool) $this->is_featured,
            'featured' => (bool) $this->is_featured,
        ];
    }
}

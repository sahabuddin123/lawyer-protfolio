<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class MediaPressDetailResource extends BaseApiResource
{
    /**
     * Related media items to include.
     */
    protected array $relatedItems = [];

    public function withRelated(array $related): self
    {
        $this->relatedItems = $related;
        return $this;
    }

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            return (new MediaPressResource($this->resource))->toArray($request);
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'kind' => 'press',
            'item_type' => 'press',
            'media_type' => $this->media_type,
            'source' => $this->resolveTranslation($this->media_name),
            'source_name' => $this->resolveTranslation($this->media_name),
            'media_name' => $this->resolveTranslation($this->media_name),
            'title' => $this->resolveTranslation($this->title),
            'date' => $this->published_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'published_date' => $this->published_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'description' => $this->resolveTranslation($this->description),
            'article_url' => $this->article_url,
            'external_url' => $this->article_url,
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
            'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
            'has_document' => !empty($this->document_media_id),
            'document_media' => ($this->relationLoaded('documentMedia') && $this->documentMedia) ? [
                'id' => $this->documentMedia->id,
                'original_name' => $this->documentMedia->original_name,
                'size_bytes' => (int) $this->documentMedia->size_bytes,
                'mime_type' => $this->documentMedia->mime_type,
                'download_url' => url("/api/v1/media/press/{$this->slug}/download"),
            ] : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
            'related_items' => $this->relatedItems,
            'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

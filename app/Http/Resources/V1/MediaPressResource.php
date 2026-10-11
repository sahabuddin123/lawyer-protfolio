<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class MediaPressResource extends BaseApiResource
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
                'media_type' => $this->media_type,
                'media_name' => $this->media_name,
                'source_name' => is_array($this->media_name) ? ($this->media_name[app()->getLocale()] ?? $this->media_name['en'] ?? $this->media_name['bn'] ?? null) : $this->media_name,
                'title' => $this->title,
                'published_date' => $this->published_date?->format('Y-m-d'),
                'article_url' => $this->article_url,
                'external_url' => $this->article_url,
                'description' => $this->description,
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
                'featured_image_id' => $this->featured_image_id,
                'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
                'document_media_id' => $this->document_media_id,
                'document_media' => $this->relationLoaded('documentMedia') && $this->documentMedia ? new MediaResource($this->documentMedia) : null,
                'status' => $this->status,
                'visibility' => $this->visibility,
                'is_featured' => (bool) $this->is_featured,
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
            'thumbnail' => $this->relationLoaded('featuredImage') && $this->featuredImage ? [
                'id' => $this->featuredImage->id,
                'url' => $this->featuredImage->url,
                'alt_text' => $this->featuredImage->alt_text,
            ] : null,
            'has_document' => !empty($this->document_media_id),
            'document_url' => !empty($this->document_media_id)
                ? url("/api/v1/media/press/{$this->slug}/download")
                : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}

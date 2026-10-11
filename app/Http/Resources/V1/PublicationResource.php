<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class PublicationResource extends BaseApiResource
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
                'publication_type' => $this->publication_type,
                'title' => $this->title,
                'publication_name' => $this->publication_name,
                'publication_date' => $this->publication_date?->format('Y-m-d'),
                'author' => $this->author,
                'excerpt' => $this->excerpt,
                'content' => $this->content,
                'external_url' => $this->external_url,
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
                'cover_image_id' => $this->cover_image_id,
                'cover_image' => $this->relationLoaded('coverImage') && $this->coverImage ? new MediaResource($this->coverImage) : null,
                'pdf_media_id' => $this->pdf_media_id,
                'pdf_media' => $this->relationLoaded('pdfMedia') && $this->pdfMedia ? new MediaResource($this->pdfMedia) : null,
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
            'publication_type' => $this->publication_type,
            'title' => $this->resolveTranslation($this->title),
            'publication_name' => $this->resolveTranslation($this->publication_name),
            'publication_date' => $this->publication_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'author' => $this->resolveTranslation($this->author),
            'excerpt' => $this->resolveTranslation($this->excerpt),
            'external_url' => $this->external_url,
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
            'cover_image' => $this->relationLoaded('coverImage') && $this->coverImage ? [
                'id' => $this->coverImage->id,
                'url' => $this->coverImage->url,
                'alt_text' => $this->coverImage->alt_text,
            ] : null,
            'pdf_url' => !empty($this->pdf_media_id)
                ? url("/api/v1/publications/{$this->slug}/download")
                : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}

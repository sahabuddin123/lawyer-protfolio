<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class LegalResearchResource extends BaseApiResource
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
                'research_type' => $this->research_type,
                'title' => $this->title,
                'author' => $this->author,
                'excerpt' => $this->excerpt,
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
                'research_date' => $this->research_date?->format('Y-m-d'),
                'featured_image_id' => $this->featured_image_id,
                'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
                'pdf_media_id' => $this->pdf_media_id,
                'pdf_media' => $this->relationLoaded('pdfMedia') && $this->pdfMedia ? new MediaResource($this->pdfMedia) : null,
                'external_url' => $this->external_url,
                'view_count' => (int) $this->view_count,
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
        $locale = app()->getLocale();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'research_type' => $this->research_type,
            'title' => $this->resolveTranslation($this->title),
            'author' => $this->resolveTranslation($this->author),
            'excerpt' => $this->resolveTranslation($this->excerpt),
            'category_id' => $this->category_id,
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
            'research_date' => $this->research_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'read_time_minutes' => $this->readingTime($locale),
            'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
            'has_pdf' => !empty($this->pdf_media_id),
            'pdf_download_url' => !empty($this->pdf_media_id) ? url("/api/v1/research/{$this->slug}/download") : null,
            'external_url' => $this->external_url,
            'view_count' => (int) $this->view_count,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class LegalResearchDetailResource extends BaseApiResource
{
    /**
     * Additional related research to include.
     */
    protected array $relatedResearch = [];

    public function withRelated(array $related): self
    {
        $this->relatedResearch = $related;
        return $this;
    }

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            $base = (new LegalResearchResource($this->resource))->toArray($request);
            $base['content'] = $this->content;
            return $base;
        }

        $locale = app()->getLocale();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'research_type' => $this->research_type,
            'title' => $this->resolveTranslation($this->title),
            'author' => $this->resolveTranslation($this->author),
            'excerpt' => $this->resolveTranslation($this->excerpt),
            'content' => $this->resolveTranslation($this->content),
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
            'pdf_media' => $this->relationLoaded('pdfMedia') && $this->pdfMedia ? [
                'id' => $this->pdfMedia->id,
                'original_name' => $this->pdfMedia->original_name,
                'size_bytes' => (int) $this->pdfMedia->size_bytes,
                'mime_type' => $this->pdfMedia->mime_type,
                'download_url' => url("/api/v1/research/{$this->slug}/download"),
            ] : null,
            'external_url' => $this->external_url,
            'view_count' => (int) $this->view_count,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
            'related_research' => $this->relatedResearch,
            'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

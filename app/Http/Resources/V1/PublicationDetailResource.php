<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class PublicationDetailResource extends BaseApiResource
{
    /**
     * Additional related publications to include.
     */
    protected array $relatedPublications = [];

    public function withRelated(array $related): self
    {
        $this->relatedPublications = $related;
        return $this;
    }

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            return (new PublicationResource($this->resource))->toArray($request);
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'publication_type' => $this->publication_type,
            'title' => $this->resolveTranslation($this->title),
            'publication_name' => $this->resolveTranslation($this->publication_name),
            'publication_date' => $this->publication_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'author' => $this->resolveTranslation($this->author),
            'excerpt' => $this->resolveTranslation($this->excerpt),
            'content' => $this->resolveTranslation($this->content),
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
            'cover_image' => $this->relationLoaded('coverImage') && $this->coverImage ? new MediaResource($this->coverImage) : null,
            'has_pdf' => !empty($this->pdf_media_id),
            'pdf_media' => ($this->relationLoaded('pdfMedia') && $this->pdfMedia) ? [
                'id' => $this->pdfMedia->id,
                'original_name' => $this->pdfMedia->original_name,
                'size_bytes' => (int) $this->pdfMedia->size_bytes,
                'mime_type' => $this->pdfMedia->mime_type,
                'download_url' => url("/api/v1/publications/{$this->slug}/download"),
            ] : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
            'related_publications' => $this->relatedPublications,
            'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class JudgmentReviewDetailResource extends BaseApiResource
{
    /**
     * Additional related judgments to include.
     */
    protected array $relatedJudgments = [];

    public function withRelated(array $related): self
    {
        $this->relatedJudgments = $related;
        return $this;
    }

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            $base = (new JudgmentReviewResource($this->resource))->toArray($request);
            return $base;
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'case_name' => $this->resolveTranslation($this->case_name),
            'citation' => $this->citation,
            'court' => $this->court,
            'judgment_date' => $this->judgment_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'legal_area' => $this->resolveTranslation($this->legal_area),
            'summary' => $this->resolveTranslation($this->summary),
            'key_issues' => $this->resolveTranslation($this->key_issues),
            'court_decision' => $this->resolveTranslation($this->court_decision),
            'author_analysis' => $this->resolveTranslation($this->author_analysis),
            'practical_significance' => $this->resolveTranslation($this->practical_significance),
            'author' => $this->resolveTranslation($this->author),
            'practice_area' => $this->relationLoaded('practiceArea') && $this->practiceArea ? [
                'id' => $this->practiceArea->id,
                'title' => $this->resolveTranslation($this->practiceArea->title),
                'slug' => $this->practiceArea->slug,
            ] : null,
            'category' => $this->relationLoaded('category') && $this->category ? [
                'id' => $this->category->id,
                'name' => $this->resolveTranslation($this->category->name),
                'slug' => $this->category->slug,
            ] : null,
            'legal_research' => $this->relationLoaded('legalResearch') && $this->legalResearch ? [
                'id' => $this->legalResearch->id,
                'title' => $this->resolveTranslation($this->legalResearch->title),
                'slug' => $this->legalResearch->slug,
                'excerpt' => $this->resolveTranslation($this->legalResearch->excerpt),
            ] : null,
            'tags' => $this->relationLoaded('tags') ? $this->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $this->resolveTranslation($tag->name),
                    'slug' => $tag->slug,
                ];
            }) : [],
            'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
            'has_pdf' => !empty($this->pdf_media_id),
            'pdf_media' => $this->relationLoaded('pdfMedia') && $this->pdfMedia ? [
                'id' => $this->pdfMedia->id,
                'original_name' => $this->pdfMedia->original_name,
                'size_bytes' => (int) $this->pdfMedia->size_bytes,
                'mime_type' => $this->pdfMedia->mime_type,
                'download_url' => url("/api/v1/judgments/{$this->slug}/download"),
            ] : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
            'related_judgments' => $this->relatedJudgments,
            'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

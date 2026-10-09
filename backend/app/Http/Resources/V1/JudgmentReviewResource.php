<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class JudgmentReviewResource extends BaseApiResource
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
                'case_name' => $this->case_name,
                'citation' => $this->citation,
                'court' => $this->court,
                'judgment_date' => $this->judgment_date?->format('Y-m-d'),
                'legal_area' => $this->legal_area,
                'summary' => $this->summary,
                'key_issues' => $this->key_issues,
                'court_decision' => $this->court_decision,
                'author_analysis' => $this->author_analysis,
                'practical_significance' => $this->practical_significance,
                'author' => $this->author,
                'practice_area_id' => $this->practice_area_id,
                'practice_area' => $this->relationLoaded('practiceArea') && $this->practiceArea ? [
                    'id' => $this->practiceArea->id,
                    'title' => $this->practiceArea->title,
                    'slug' => $this->practiceArea->slug,
                ] : null,
                'category_id' => $this->category_id,
                'category' => $this->relationLoaded('category') && $this->category ? [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                    'type' => $this->category->type,
                ] : null,
                'legal_research_id' => $this->legal_research_id,
                'legal_research' => $this->relationLoaded('legalResearch') && $this->legalResearch ? [
                    'id' => $this->legalResearch->id,
                    'title' => $this->legalResearch->title,
                    'slug' => $this->legalResearch->slug,
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
            'case_name' => $this->resolveTranslation($this->case_name),
            'citation' => $this->citation,
            'court' => $this->court,
            'judgment_date' => $this->judgment_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'legal_area' => $this->resolveTranslation($this->legal_area),
            'summary' => $this->resolveTranslation($this->summary),
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
            'tags' => $this->relationLoaded('tags') ? $this->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $this->resolveTranslation($tag->name),
                    'slug' => $tag->slug,
                ];
            }) : [],
            'author' => $this->resolveTranslation($this->author),
            'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
            'has_pdf' => !empty($this->pdf_media_id),
            'pdf_download_url' => !empty($this->pdf_media_id) ? url("/api/v1/judgments/{$this->slug}/download") : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class CourtroomExperienceDetailResource extends BaseApiResource
{
    /**
     * Additional data to include.
     */
    protected array $relatedExperiences = [];

    public function withRelated(array $related): self
    {
        $this->relatedExperiences = $related;
        return $this;
    }

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            return (new CourtroomExperienceResource($this->resource))->toArray($request);
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->resolveTranslation($this->title),
            'case_number' => $this->case_number,
            'court' => $this->court,
            'case_type' => $this->case_type,
            'year' => (int) $this->year,
            'practice_area_id' => $this->practice_area_id,
            'practice_area' => $this->relationLoaded('practiceArea') && $this->practiceArea ? [
                'id' => $this->practiceArea->id,
                'title' => $this->resolveTranslation($this->practiceArea->title),
                'slug' => $this->practiceArea->slug,
            ] : null,
            'legal_area' => $this->resolveTranslation($this->legal_area),
            'role' => $this->resolveTranslation($this->role),
            'summary' => $this->resolveTranslation($this->summary),
            'description' => $this->resolveTranslation($this->description),
            'issues' => $this->resolveTranslation($this->issues),
            'arguments' => $this->resolveTranslation($this->arguments),
            'outcome' => $this->resolveTranslation($this->outcome),
            'judgment_date' => $this->judgment_date?->format('Y-m-d'),
            'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
            'documents' => CaseDocumentResource::collection($this->publicDocuments),
            'related_experiences' => $this->relatedExperiences,
            'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

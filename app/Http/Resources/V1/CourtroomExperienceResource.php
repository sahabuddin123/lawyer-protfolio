<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class CourtroomExperienceResource extends BaseApiResource
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
                'case_number' => $this->case_number,
                'court' => $this->court,
                'case_type' => $this->case_type,
                'year' => (int) $this->year,
                'practice_area_id' => $this->practice_area_id,
                'practice_area' => $this->relationLoaded('practiceArea') && $this->practiceArea ? [
                    'id' => $this->practiceArea->id,
                    'title' => $this->practiceArea->title,
                    'slug' => $this->practiceArea->slug,
                ] : null,
                'legal_area' => $this->legal_area,
                'role' => $this->role,
                'summary' => $this->summary,
                'description' => $this->description,
                'issues' => $this->issues,
                'arguments' => $this->arguments,
                'outcome' => $this->outcome,
                'judgment_date' => $this->judgment_date?->format('Y-m-d'),
                'featured_image_id' => $this->featured_image_id,
                'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
                'visibility' => $this->visibility,
                'status' => $this->status,
                'is_featured' => (bool) $this->is_featured,
                'sort_order' => (int) $this->sort_order,
                'published_at' => $this->published_at?->toIso8601String(),
                'documents_count' => $this->documents_count ?? ($this->relationLoaded('documents') ? $this->documents->count() : 0),
                'documents' => $this->relationLoaded('documents') ? CaseDocumentResource::collection($this->documents) : [],
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
            'judgment_date' => $this->judgment_date?->format('Y-m-d'),
            'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}

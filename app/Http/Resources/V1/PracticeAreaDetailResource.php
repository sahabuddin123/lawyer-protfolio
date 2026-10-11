<?php

namespace App\Http\Resources\V1;

use App\Models\PracticeArea;
use Illuminate\Http\Request;

class PracticeAreaDetailResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            return (new PracticeAreaResource($this->resource))->toArray($request);
        }

        $related = PracticeArea::published()
            ->where('id', '!=', $this->id)
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit(3)
            ->get()
            ->map(fn($pa) => [
                'id' => $pa->id,
                'slug' => $pa->slug,
                'title' => $this->resolveTranslation($pa->title),
                'short_description' => $this->resolveTranslation($pa->short_description),
                'icon_name' => $pa->icon_name,
            ]);

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->resolveTranslation($this->title),
            'short_description' => $this->resolveTranslation($this->short_description),
            'full_description' => $this->resolveTranslation($this->full_description),
            'tagline' => $this->tagline,
            'at_a_glance' => $this->at_a_glance,
            'areas_of_assistance' => $this->areas_of_assistance,
            'common_concerns' => $this->common_concerns,
            'legal_process' => $this->legal_process,
            'document_checklist' => $this->document_checklist,
            'faqs' => $this->faqs,
            'icon_name' => $this->icon_name,
            'featured_image' => $this->relationLoaded('featuredImage') && $this->featuredImage ? new MediaResource($this->featuredImage) : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
            'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
            'related_services' => $related,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

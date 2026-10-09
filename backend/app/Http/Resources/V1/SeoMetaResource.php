<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class SeoMetaResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        if (is_null($this->resource) || $this->resource instanceof \Illuminate\Http\Resources\MissingValue) {
            return [];
        }

        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'seo_title' => $isAdmin ? $this->seo_title : $this->resolveTranslation($this->seo_title),
            'meta_description' => $isAdmin ? $this->meta_description : $this->resolveTranslation($this->meta_description),
            'canonical_url' => $this->canonical_url,
            'og_title' => $isAdmin ? $this->og_title : $this->resolveTranslation($this->og_title),
            'og_description' => $isAdmin ? $this->og_description : $this->resolveTranslation($this->og_description),
            'og_image_id' => $this->og_image_id,
            'og_image_url' => $this->whenLoaded('ogImage', fn () => $this->ogImage?->url),
            'robots' => $this->robots ?? 'index, follow',
            'schema_type' => $this->schema_type,
            'structured_data' => $this->structured_data,
        ];
    }
}

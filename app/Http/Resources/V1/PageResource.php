<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class PageResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $isAdmin ? $this->title : $this->resolveTranslation($this->title),
            'content' => $isAdmin ? $this->content : $this->resolveTranslation($this->content),
            'status' => $this->status,
            'published_at' => $this->published_at?->toIso8601String(),
            'seo' => new SeoMetaResource($this->whenLoaded('seo')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

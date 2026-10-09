<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class CredentialResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'category' => $this->category,
            'title' => $isAdmin ? $this->title : $this->resolveTranslation($this->title),
            'institution' => $isAdmin ? $this->institution : $this->resolveTranslation($this->institution),
            'description' => $isAdmin ? $this->description : $this->resolveTranslation($this->description),
            'year' => $this->year,
            'credential_id' => $this->credential_id,
            'certificate_media_id' => $this->certificate_media_id,
            'certificate' => new MediaResource($this->whenLoaded('certificate')),
            'is_featured' => (bool) $this->is_featured,
            'is_active' => (bool) $this->is_active,
            'sort_order' => (int) $this->sort_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class CareerTimelineResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'period' => $this->period,
            'title' => $isAdmin ? $this->title : $this->resolveTranslation($this->title),
            'organization' => $isAdmin ? $this->organization : $this->resolveTranslation($this->organization),
            'description' => $isAdmin ? $this->description : $this->resolveTranslation($this->description),
            'is_current' => (bool) $this->is_current,
            'is_active' => (bool) $this->is_active,
            'sort_order' => (int) $this->sort_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

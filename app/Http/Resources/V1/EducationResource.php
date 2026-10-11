<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class EducationResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'degree' => $isAdmin ? $this->degree : $this->resolveTranslation($this->degree),
            'institution' => $isAdmin ? $this->institution : $this->resolveTranslation($this->institution),
            'department' => $isAdmin ? $this->department : $this->resolveTranslation($this->department),
            'description' => $isAdmin ? $this->description : $this->resolveTranslation($this->description),
            'year_completed' => $this->year_completed,
            'distinction' => $isAdmin ? $this->distinction : $this->resolveTranslation($this->distinction),
            'is_active' => (bool) $this->is_active,
            'sort_order' => (int) $this->sort_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

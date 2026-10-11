<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class ProfessionalMembershipResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'organization' => $isAdmin ? $this->organization : $this->resolveTranslation($this->organization),
            'role' => $isAdmin ? $this->role : $this->resolveTranslation($this->role),
            'description' => $isAdmin ? $this->description : $this->resolveTranslation($this->description),
            'membership_number' => $this->membership_number,
            'year_joined' => $this->year_joined,
            'is_active' => (bool) $this->is_active,
            'sort_order' => (int) $this->sort_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

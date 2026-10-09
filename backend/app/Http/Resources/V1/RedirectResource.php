<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class RedirectResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source_url' => $this->source_url,
            'target_url' => $this->target_url,
            'status_code' => (int) $this->status_code,
            'is_active' => (bool) $this->is_active,
            'hit_count' => (int) $this->hit_count,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

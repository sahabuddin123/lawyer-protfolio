<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class UserResource extends BaseApiResource
{
    /**
     * Transform the user entity into a safe API array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => ($this->relationLoaded('avatar') && $this->avatar) ? [
                'id' => $this->avatar->id,
                'uuid' => $this->avatar->uuid,
                'url' => $this->avatar->url,
                'variants' => $this->avatar->variants,
            ] : null,
            'is_active' => (bool) $this->is_active,
            'roles' => $this->relationLoaded('roles')
                ? $this->roles->pluck('name')->values()->toArray()
                : $this->getRoleNames()->values()->toArray(),
            'permissions' => ($this->relationLoaded('roles') && $this->relationLoaded('permissions'))
                ? $this->roles->flatMap(fn ($role) => $role->relationLoaded('permissions') ? $role->permissions : collect())
                    ->pluck('name')
                    ->merge($this->permissions->pluck('name'))
                    ->unique()
                    ->values()
                    ->toArray()
                : $this->getAllPermissions()->pluck('name')->values()->toArray(),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

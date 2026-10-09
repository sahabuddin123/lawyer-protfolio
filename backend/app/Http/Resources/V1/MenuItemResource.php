<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class MenuItemResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'menu_id' => $this->menu_id,
            'parent_id' => $this->parent_id,
            'title' => $isAdmin ? $this->title : $this->resolveTranslation($this->title),
            'url' => $this->url,
            'target' => $this->target,
            'sort_order' => $this->sort_order,
            'children' => MenuItemResource::collection($this->whenLoaded('children')),
        ];
    }
}

<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class MenuResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'location' => $this->location,
            'title' => $this->title,
            'items' => MenuItemResource::collection($this->whenLoaded('items')),
        ];
    }
}

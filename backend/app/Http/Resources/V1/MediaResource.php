<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class MediaResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        if (is_null($this->resource)) {
            return [];
        }

        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'filename' => $this->filename,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'extension' => $this->extension,
            'size_bytes' => $this->size_bytes,
            'width' => $this->width,
            'height' => $this->height,
            'url' => $this->url,
            'alt_text' => $isAdmin ? $this->alt_text : $this->resolveTranslation($this->alt_text),
            'caption' => $isAdmin ? $this->caption : $this->resolveTranslation($this->caption),
            'variants' => $this->variants,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class GalleryImageResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            return [
                'id' => $this->id,
                'album_id' => $this->album_id,
                'media_id' => $this->media_id,
                'url' => $this->media?->url,
                'variants' => $this->media?->variants ?? [],
                'width' => $this->media?->width,
                'height' => $this->media?->height,
                'mime_type' => $this->media?->mime_type,
                'size_bytes' => $this->media?->size_bytes,
                'caption' => $this->caption,
                'alt_text' => $this->alt_text,
                'sort_order' => (int) $this->sort_order,
                'is_featured' => (bool) $this->is_featured,
                'featured' => (bool) $this->is_featured,
                'visibility' => $this->visibility,
                'metadata' => $this->metadata,
                'created_at' => $this->created_at?->toIso8601String(),
                'updated_at' => $this->updated_at?->toIso8601String(),
            ];
        }

        // Public representation
        return [
            'id' => $this->id,
            'url' => $this->media?->url,
            'variants' => $this->media?->variants ?? [],
            'width' => $this->media?->width,
            'height' => $this->media?->height,
            'caption' => $this->resolveTranslation($this->caption),
            'alt_text' => $this->resolveTranslation($this->alt_text) ?: $this->resolveTranslation($this->caption) ?: 'Chamber and judicial photograph',
            'sort_order' => (int) $this->sort_order,
            'is_featured' => (bool) $this->is_featured,
        ];
    }
}

<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class CaseDocumentResource extends BaseApiResource
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
                'courtroom_experience_id' => (int) $this->courtroom_experience_id,
                'title' => $this->title,
                'document_type' => $this->document_type,
                'media_id' => (int) $this->media_id,
                'media' => $this->relationLoaded('media') && $this->media ? new MediaResource($this->media) : null,
                'is_confidential' => (bool) $this->is_confidential,
                'sort_order' => (int) $this->sort_order,
                'download_count' => (int) $this->download_count,
                'download_url' => url("/api/v1/admin/case-documents/{$this->id}/download"),
                'created_at' => $this->created_at?->toIso8601String(),
                'updated_at' => $this->updated_at?->toIso8601String(),
            ];
        }

        // Public resource: Never expose confidential documents
        if ($this->is_confidential) {
            return [];
        }

        return [
            'id' => $this->id,
            'title' => $this->resolveTranslation($this->title),
            'document_type' => $this->document_type,
            'media' => $this->relationLoaded('media') && $this->media ? new MediaResource($this->media) : null,
            'sort_order' => (int) $this->sort_order,
            'download_count' => (int) $this->download_count,
            'download_url' => url("/api/v1/courtroom/documents/{$this->id}/download"),
        ];
    }
}

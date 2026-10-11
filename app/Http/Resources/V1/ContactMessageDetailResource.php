<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class ContactMessageDetailResource extends BaseApiResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'subject' => $this->subject,
            'message' => $this->message,
            'practice_area_id' => $this->practice_area_id,
            'practice_area' => $this->whenLoaded('practiceArea', function () {
                return [
                    'id' => $this->practiceArea?->id,
                    'title' => $this->practiceArea?->title,
                    'slug' => $this->practiceArea?->slug,
                ];
            }),
            'consent_given' => (bool) $this->consent_given,
            'consented_at' => $this->consented_at?->toISOString(),
            'status' => $this->status,
            'admin_notes' => $this->admin_notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

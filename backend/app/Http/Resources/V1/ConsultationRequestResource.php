<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class ConsultationRequestResource extends BaseApiResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'subject' => $this->subject,
            'practice_area' => $this->whenLoaded('practiceArea', function () {
                return [
                    'id' => $this->practiceArea?->id,
                    'title' => $this->practiceArea?->title,
                ];
            }),
            'preferred_date' => $this->preferred_date?->format('Y-m-d'),
            'preferred_time' => $this->preferred_time,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

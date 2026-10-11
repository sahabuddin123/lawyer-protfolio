<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateConsultationRequestRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_consultations') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'required', 'string', 'in:new,contacted,in_progress,scheduled,completed,closed,spam'],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}

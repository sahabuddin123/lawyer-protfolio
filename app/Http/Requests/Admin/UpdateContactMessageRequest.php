<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateContactMessageRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_contacts') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'required', 'string', 'in:new,read,replied,archived,spam'],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}

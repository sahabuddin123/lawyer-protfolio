<?php

namespace App\Http\Requests\Public;

use App\Http\Requests\BaseApiRequest;

class ContactFormRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'practice_area_id' => ['nullable', 'integer', 'exists:practice_areas,id'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
            'consent' => ['required', 'accepted'],
            '_honeypot' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'consent.accepted' => 'You must acknowledge the legal notice to submit a message.',
            'message.min' => 'The message must be at least 10 characters.',
            'message.max' => 'The message may not exceed 3000 characters.',
        ];
    }
}

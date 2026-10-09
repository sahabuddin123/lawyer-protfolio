<?php

namespace App\Http\Requests\Public;

use App\Http\Requests\BaseApiRequest;

class ConsultationFormRequest extends BaseApiRequest
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
            'preferred_date' => ['nullable', 'date', 'after_or_equal:today'],
            'preferred_time' => ['nullable', 'string', 'max:50'],
            'message' => ['required', 'string', 'min:15', 'max:5000'],
            'consent' => ['required', 'accepted'],
            '_honeypot' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'consent.accepted' => 'You must acknowledge the legal notice to submit a consultation request.',
            'preferred_date.after_or_equal' => 'The preferred date must be today or a future date.',
            'message.min' => 'The message must be at least 15 characters to provide sufficient context.',
            'message.max' => 'The message may not exceed 5000 characters.',
        ];
    }
}

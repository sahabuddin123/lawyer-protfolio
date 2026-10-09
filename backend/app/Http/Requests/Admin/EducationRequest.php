<?php

namespace App\Http\Requests\Admin;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;

class EducationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manage_educations') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'degree' => ['required', 'array'],
            'degree.en' => ['required', 'string', 'max:255'],
            'degree.bn' => ['nullable', 'string', 'max:255'],
            'institution' => ['required', 'array'],
            'institution.en' => ['required', 'string', 'max:255'],
            'institution.bn' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'array'],
            'department.en' => ['nullable', 'string', 'max:255'],
            'department.bn' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'array'],
            'description.en' => ['nullable', 'string', 'max:1000'],
            'description.bn' => ['nullable', 'string', 'max:1000'],
            'year_completed' => ['nullable', 'string', 'max:20'],
            'distinction' => ['nullable', 'array'],
            'distinction.en' => ['nullable', 'string', 'max:255'],
            'distinction.bn' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    /**
     * Sanitize inputs before processing.
     */
    protected function passedValidation(): void
    {
        $description = $this->input('description', []);
        if (isset($description['en'])) {
            $description['en'] = HtmlSanitizer::clean($description['en']);
        }
        if (isset($description['bn'])) {
            $description['bn'] = HtmlSanitizer::clean($description['bn']);
        }
        if (!empty($description)) {
            $this->merge(['description' => $description]);
        }
    }
}

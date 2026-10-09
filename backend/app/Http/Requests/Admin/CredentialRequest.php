<?php

namespace App\Http\Requests\Admin;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;

class CredentialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manage_credentials') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'category' => ['required', 'in:academic,professional,court,certification'],
            'title' => ['required', 'array'],
            'title.en' => ['required', 'string', 'max:255'],
            'title.bn' => ['nullable', 'string', 'max:255'],
            'institution' => ['required', 'array'],
            'institution.en' => ['required', 'string', 'max:255'],
            'institution.bn' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'array'],
            'description.en' => ['nullable', 'string', 'max:1000'],
            'description.bn' => ['nullable', 'string', 'max:1000'],
            'year' => ['nullable', 'string', 'max:50'],
            'credential_id' => ['nullable', 'string', 'max:100'],
            'certificate_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'is_featured' => ['boolean'],
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

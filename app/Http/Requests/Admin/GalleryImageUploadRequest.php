<?php

namespace App\Http\Requests\Admin;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GalleryImageUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) {
            return false;
        }

        return $user->can('manage_gallery');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('featured') && !$this->has('is_featured')) {
            $this->merge(['is_featured' => filter_var($this->input('featured'), FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,webp,avif',
                'max:10240', // 10MB
            ],
            'caption' => ['nullable', 'array'],
            'caption.en' => ['nullable', 'string', 'max:500'],
            'caption.bn' => ['nullable', 'string', 'max:500'],

            'alt_text' => ['nullable', 'array'],
            'alt_text.en' => ['nullable', 'string', 'max:255'],
            'alt_text.bn' => ['nullable', 'string', 'max:255'],

            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'visibility' => ['nullable', Rule::in(['public', 'private'])],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'An image file is required for upload.',
            'file.mimes' => 'The uploaded file must be an approved image format (JPEG, PNG, WebP, AVIF).',
            'file.max' => 'The image size may not exceed 10 megabytes.',
        ];
    }

    public function passedValidation(): void
    {
        $sanitizer = app(HtmlSanitizer::class);

        $caption = $this->input('caption', []);
        if (is_array($caption)) {
            $cleaned = [];
            foreach ($caption as $lang => $text) {
                $cleaned[$lang] = $text ? $sanitizer->clean($text) : null;
            }
            $this->merge(['caption' => $cleaned]);
        }
    }
}

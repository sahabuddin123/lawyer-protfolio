<?php

namespace App\Http\Requests\Admin;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RedirectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_redirects') ?? false;
    }

    public function rules(): array
    {
        $redirectId = $this->route('redirect')?->id ?? $this->route('redirect');

        return [
            'source_url' => [
                'required',
                'string',
                'max:255',
                Rule::unique('redirects', 'source_url')->ignore($redirectId),
            ],
            'target_url' => 'required|string|max:255',
            'status_code' => 'required|in:301,302,307,308',
            'is_active' => 'nullable|boolean',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $source = trim($this->input('source_url', ''));
            $target = trim($this->input('target_url', ''));

            // Prevent redirect loop
            if (rtrim($source, '/') === rtrim($target, '/')) {
                $v->errors()->add('target_url', 'The target URL cannot be identical to the source URL (redirect loop).');
            }

            // Protocol safety check
            if (!HtmlSanitizer::isSafeUrl($target)) {
                $v->errors()->add('target_url', 'The target URL contains an unsafe protocol.');
            }
        });
    }
}

<?php

namespace App\Http\Requests\Admin;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_settings') ?? false;
    }

    public function rules(): array
    {
        return [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|max:100',
            'settings.*.value' => 'nullable',
            'settings.*.group' => 'nullable|string|max:50',
            'settings.*.is_public' => 'nullable|boolean',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $settings = $this->input('settings', []);
            foreach ($settings as $index => $item) {
                $key = $item['key'] ?? '';
                $val = $item['value'] ?? null;

                // Validate URL safety if social or link key
                if (in_array($key, ['facebook', 'youtube', 'linkedin', 'twitter', 'google_maps_url'], true)) {
                    $url = is_array($val) ? ($val['value'] ?? '') : $val;
                    if (!empty($url) && !HtmlSanitizer::isSafeUrl($url)) {
                        $v->errors()->add("settings.{$index}.value", "The URL provided for {$key} contains an unsafe protocol.");
                    }
                }
            }
        });
    }
}

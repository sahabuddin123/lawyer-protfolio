<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class HomepageSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_homepage') ?? false;
    }

    public function rules(): array
    {
        $rules = [
            'title' => 'required|array',
            'title.en' => 'required|string|max:255',
            'title.bn' => 'nullable|string|max:255',
            'subtitle' => 'nullable|array',
            'subtitle.en' => 'nullable|string|max:255',
            'subtitle.bn' => 'nullable|string|max:255',
            'content' => 'nullable|array',
            'content.en' => 'nullable|string',
            'content.bn' => 'nullable|string',
            'settings' => 'nullable|array',
            'is_enabled' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ];

        if ($this->isMethod('post')) {
            $rules['section_key'] = [
                'required',
                'string',
                'max:50',
                'unique:homepage_sections,section_key',
                'regex:/^[a-z0-9_-]+$/',
            ];
        }

        return $rules;
    }
}

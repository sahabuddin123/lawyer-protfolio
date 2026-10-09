<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_pages') ?? false;
    }

    public function rules(): array
    {
        $pageId = $this->route('page')?->id ?? $this->route('page');

        return [
            'title' => 'required|array',
            'title.en' => 'required|string|max:255',
            'title.bn' => 'nullable|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('pages', 'slug')->ignore($pageId),
            ],
            'content' => 'required|array',
            'content.en' => 'required|string',
            'content.bn' => 'nullable|string',
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'seo' => 'nullable|array',
            'seo.seo_title' => 'nullable|array',
            'seo.meta_description' => 'nullable|array',
            'seo.canonical_url' => 'nullable|string|max:500',
            'seo.og_title' => 'nullable|array',
            'seo.og_description' => 'nullable|array',
            'seo.og_image_id' => 'nullable|exists:media,id',
            'seo.robots' => 'nullable|string|max:100',
        ];
    }
}

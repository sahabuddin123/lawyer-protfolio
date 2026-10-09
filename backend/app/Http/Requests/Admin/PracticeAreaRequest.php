<?php

namespace App\Http\Requests\Admin;

use App\Models\PracticeArea;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PracticeAreaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) {
            return false;
        }

        // Check base permission
        if ($this->isMethod('post') && !$user->can('create_practice_area')) {
            return false;
        }

        if (($this->isMethod('put') || $this->isMethod('patch')) && !$user->can('edit_practice_area')) {
            return false;
        }

        // If requesting to publish or maintain published state, enforce publish permission
        $status = $this->input('status');
        if ($status === 'published' && !$user->can('publish_practice_area')) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $practiceAreaId = $this->route('practiceArea')?->id ?? $this->route('practiceArea') ?? $this->route('practice_area')?->id ?? $this->route('practice_area');

        return [
            'title' => 'required|array',
            'title.en' => 'required|string|max:255',
            'title.bn' => 'nullable|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('practice_areas', 'slug')->ignore($practiceAreaId),
            ],
            'short_description' => 'required|array',
            'short_description.en' => 'required|string|max:1000',
            'short_description.bn' => 'nullable|string|max:1000',
            'full_description' => 'required|array',
            'full_description.en' => 'required|string',
            'full_description.bn' => 'nullable|string',
            'icon_name' => [
                'nullable',
                'string',
                'max:50',
                Rule::in(PracticeArea::APPROVED_ICONS),
            ],
            'featured_image_id' => 'nullable|exists:media,id',
            'status' => 'required|in:draft,published,archived',
            'is_featured' => 'boolean',
            'sort_order' => 'integer|min:0',
            'published_at' => 'nullable|date',
            'seo' => 'nullable|array',
            'seo.seo_title' => 'nullable|array',
            'seo.meta_description' => 'nullable|array',
            'seo.canonical_url' => 'nullable|string|max:500',
            'seo.og_title' => 'nullable|array',
            'seo.og_description' => 'nullable|array',
            'seo.og_image_id' => 'nullable|exists:media,id',
            'seo.robots' => 'nullable|string|max:100',
            'seo.schema_type' => 'nullable|string|max:100',
            'seo.structured_data' => 'nullable|array',
        ];
    }
}

<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourtroomExperienceRequest extends FormRequest
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

        if ($this->isMethod('post') && !$user->can('create_cases')) {
            return false;
        }

        if (($this->isMethod('put') || $this->isMethod('patch')) && !$user->can('edit_cases')) {
            return false;
        }

        // If requesting to publish, require publish_cases permission
        $status = $this->input('status');
        if ($status === 'published' && !$user->can('publish_cases')) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $experienceId = $this->route('courtroom')?->id ?? $this->route('courtroom') ?? $this->route('courtroom_experience')?->id ?? $this->route('courtroom_experience');

        return [
            'title' => 'required|array',
            'title.en' => 'required|string|max:255',
            'title.bn' => 'nullable|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('courtroom_experiences', 'slug')->ignore($experienceId),
            ],
            'case_number' => 'nullable|string|max:255',
            'court' => 'required|string|max:255',
            'case_type' => 'required|string|max:100',
            'year' => 'required|integer|min:1900|max:2100',
            'practice_area_id' => 'nullable|exists:practice_areas,id',
            'legal_area' => 'required|array',
            'legal_area.en' => 'required|string|max:255',
            'legal_area.bn' => 'nullable|string|max:255',
            'role' => 'required|array',
            'role.en' => 'required|string|max:255',
            'role.bn' => 'nullable|string|max:255',
            'summary' => 'required|array',
            'summary.en' => 'required|string',
            'summary.bn' => 'nullable|string',
            'description' => 'required|array',
            'description.en' => 'required|string',
            'description.bn' => 'nullable|string',
            'issues' => 'nullable|array',
            'issues.en' => 'nullable|string',
            'issues.bn' => 'nullable|string',
            'arguments' => 'nullable|array',
            'arguments.en' => 'nullable|string',
            'arguments.bn' => 'nullable|string',
            'outcome' => 'nullable|array',
            'outcome.en' => 'nullable|string',
            'outcome.bn' => 'nullable|string',
            'judgment_date' => 'nullable|date',
            'featured_image_id' => 'nullable|exists:media,id',
            'visibility' => 'required|in:public,private',
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

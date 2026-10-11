<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LegalResearchRequest extends FormRequest
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

        if ($this->isMethod('post') && !$user->can('create_research')) {
            return false;
        }

        if (($this->isMethod('put') || $this->isMethod('patch')) && !$user->can('edit_research')) {
            return false;
        }

        // If requesting to publish, require publish_research permission
        $status = $this->input('status');
        if ($status === 'published' && !$user->can('publish_research')) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $researchId = $this->route('research')?->id ?? $this->route('research') ?? $this->route('legal_research')?->id ?? $this->route('legal_research');

        return [
            'title' => 'required|array',
            'title.en' => 'required|string|max:255',
            'title.bn' => 'nullable|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('legal_researches', 'slug')->ignore($researchId),
            ],
            'research_type' => [
                'required',
                'string',
                Rule::in([
                    'article',
                    'case_analysis',
                    'research_paper',
                    'constitutional_analysis',
                    'statutory_analysis',
                    'legal_opinion',
                    'commentary',
                ]),
            ],
            'category_id' => 'nullable|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id',
            'author' => 'required|array',
            'author.en' => 'required|string|max:255',
            'author.bn' => 'nullable|string|max:255',
            'excerpt' => 'required|array',
            'excerpt.en' => 'required|string',
            'excerpt.bn' => 'nullable|string',
            'content' => 'required|array',
            'content.en' => 'required|string',
            'content.bn' => 'nullable|string',
            'research_date' => 'nullable|date',
            'featured_image_id' => 'nullable|exists:media,id',
            'pdf_media_id' => 'nullable|exists:media,id',
            'external_url' => 'nullable|url|max:500',
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

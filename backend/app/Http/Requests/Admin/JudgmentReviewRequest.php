<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JudgmentReviewRequest extends FormRequest
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

        if ($this->isMethod('post') && !$user->can('create_judgments')) {
            return false;
        }

        if (($this->isMethod('put') || $this->isMethod('patch')) && !$user->can('edit_judgments')) {
            return false;
        }

        // If requesting to publish, require publish_judgments permission
        $status = $this->input('status');
        if ($status === 'published' && !$user->can('publish_judgments')) {
            return false;
        }

        return true;
    }

    /**
     * Prepare inputs before validation.
     */
    protected function prepareForValidation(): void
    {
        // Support aliases if sent by client
        $merge = [];
        if ($this->has('legal_issues') && !$this->has('key_issues')) {
            $merge['key_issues'] = $this->input('legal_issues');
        }
        if ($this->has('decision') && !$this->has('court_decision')) {
            $merge['court_decision'] = $this->input('decision');
        }
        if ($this->has('significance') && !$this->has('practical_significance')) {
            $merge['practical_significance'] = $this->input('significance');
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $reviewId = $this->route('judgment')?->id ?? $this->route('judgment') ?? $this->route('judgment_review')?->id ?? $this->route('judgment_review');

        return [
            'case_name' => 'required|array',
            'case_name.en' => 'required|string|max:255',
            'case_name.bn' => 'nullable|string|max:255',
            'citation' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('judgment_reviews', 'slug')->ignore($reviewId),
            ],
            'court' => 'required|string|max:255',
            'judgment_date' => 'nullable|date',
            'legal_area' => 'nullable|array',
            'legal_area.en' => 'nullable|string|max:255',
            'legal_area.bn' => 'nullable|string|max:255',
            'summary' => 'required|array',
            'summary.en' => 'required|string',
            'summary.bn' => 'nullable|string',
            'key_issues' => 'nullable|array',
            'court_decision' => 'required|array',
            'court_decision.en' => 'required|string',
            'court_decision.bn' => 'nullable|string',
            'author_analysis' => 'required|array',
            'author_analysis.en' => 'required|string',
            'author_analysis.bn' => 'nullable|string',
            'practical_significance' => 'nullable|array',
            'practice_area_id' => 'nullable|exists:practice_areas,id',
            'category_id' => 'nullable|exists:categories,id',
            'legal_research_id' => 'nullable|exists:legal_researches,id',
            'author' => 'nullable|array',
            'author.en' => 'nullable|string|max:255',
            'author.bn' => 'nullable|string|max:255',
            'featured_image_id' => 'nullable|exists:media,id',
            'pdf_media_id' => 'nullable|exists:media,id',
            'visibility' => 'required|in:public,private',
            'status' => 'required|in:draft,published,archived',
            'is_featured' => 'boolean',
            'sort_order' => 'integer|min:0',
            'published_at' => 'nullable|date',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id',
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

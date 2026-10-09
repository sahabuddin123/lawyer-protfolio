<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PublicationRequest extends FormRequest
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

        if ($this->isMethod('post') && !$user->can('create_publications')) {
            return false;
        }

        if (($this->isMethod('put') || $this->isMethod('patch')) && !$user->can('edit_publications')) {
            return false;
        }

        // If requesting to publish, require publish_publications permission
        $status = $this->input('status');
        if ($status === 'published' && !$user->can('publish_publications')) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $publicationId = $this->route('publication')?->id ?? $this->route('publication');

        return [
            'title' => 'required|array',
            'title.en' => 'required|string|max:255',
            'title.bn' => 'nullable|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('publications', 'slug')->ignore($publicationId),
            ],
            'publication_type' => 'required|string|max:50',
            'category_id' => 'nullable|exists:categories,id',
            'publication_name' => 'nullable|array',
            'publication_name.en' => 'nullable|string|max:255',
            'publication_name.bn' => 'nullable|string|max:255',
            'publication_date' => 'nullable|date',
            'author' => 'nullable|array',
            'author.en' => 'nullable|string|max:255',
            'author.bn' => 'nullable|string|max:255',
            'excerpt' => 'nullable|array',
            'excerpt.en' => 'nullable|string',
            'excerpt.bn' => 'nullable|string',
            'content' => 'nullable|array',
            'content.en' => 'nullable|string',
            'content.bn' => 'nullable|string',
            'external_url' => [
                'nullable',
                'string',
                'max:500',
                'regex:/^https?:\/\/[^\s]+$/i',
            ],
            'cover_image_id' => 'nullable|exists:media,id',
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

    /**
     * Sanitize input content against XSS / script tags.
     */
    public function sanitizedData(): array
    {
        $data = $this->validated();

        if (isset($data['content'])) {
            $data['content'] = [
                'en' => isset($data['content']['en']) ? $this->cleanHtml($data['content']['en']) : null,
                'bn' => isset($data['content']['bn']) ? $this->cleanHtml($data['content']['bn']) : null,
            ];
        }

        if (isset($data['excerpt'])) {
            $data['excerpt'] = [
                'en' => isset($data['excerpt']['en']) ? strip_tags($data['excerpt']['en']) : null,
                'bn' => isset($data['excerpt']['bn']) ? strip_tags($data['excerpt']['bn']) : null,
            ];
        }

        return $data;
    }

    protected function cleanHtml(?string $html): ?string
    {
        if (!$html) {
            return null;
        }

        // Strip dangerous scripts, event handlers, and javascript: links
        $html = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $html);
        $html = preg_replace('#<iframe(.*?)>(.*?)</iframe>#is', '', $html);
        $html = preg_replace('#\s*on\w+\s*=\s*(".*?"|\'.*?\'|[^\s>]+)#is', '', $html);
        $html = preg_replace('#href\s*=\s*["\']javascript:[^"\']*["\']#is', 'href="#"', $html);

        return $html;
    }
}

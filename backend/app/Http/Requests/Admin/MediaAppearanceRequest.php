<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MediaAppearanceRequest extends FormRequest
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

        return $user->can('manage_appearances');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $appearanceId = $this->route('media_appearance')?->id ?? $this->route('mediaAppearance')?->id ?? $this->route('media_appearance') ?? $this->route('mediaAppearance');

        return [
            'title' => 'required|array',
            'title.en' => 'required|string|max:255',
            'title.bn' => 'nullable|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('media_appearances', 'slug')->ignore($appearanceId),
            ],
            'media_type' => 'required|string|max:50',
            'channel' => 'required|array',
            'channel.en' => 'required|string|max:255',
            'channel.bn' => 'nullable|string|max:255',
            'program' => 'required|array',
            'program.en' => 'required|string|max:255',
            'program.bn' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'broadcast_date' => 'nullable|date',
            'video_url' => [
                'nullable',
                'string',
                'max:500',
                'regex:/^https?:\/\/[^\s]+$/i',
            ],
            'thumbnail_id' => 'nullable|exists:media,id',
            'document_media_id' => 'nullable|exists:media,id',
            'description' => 'nullable|array',
            'description.en' => 'nullable|string',
            'description.bn' => 'nullable|string',
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

        if (isset($data['description'])) {
            $data['description'] = [
                'en' => isset($data['description']['en']) ? $this->cleanHtml($data['description']['en']) : null,
                'bn' => isset($data['description']['bn']) ? $this->cleanHtml($data['description']['bn']) : null,
            ];
        }

        return $data;
    }

    protected function cleanHtml(?string $html): ?string
    {
        if (!$html) {
            return null;
        }

        $html = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $html);
        $html = preg_replace('#<iframe(.*?)>(.*?)</iframe>#is', '', $html);
        $html = preg_replace('#\s*on\w+\s*=\s*(".*?"|\'.*?\'|[^\s>]+)#is', '', $html);
        $html = preg_replace('#href\s*=\s*["\']javascript:[^"\']*["\']#is', 'href="#"', $html);

        return $html;
    }
}

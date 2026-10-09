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

    protected function prepareForValidation(): void
    {
        $merge = [];

        if (empty($this->input('slug')) && !empty($this->input('title.en'))) {
            $merge['slug'] = \Illuminate\Support\Str::slug($this->input('title.en'));
        }

        if ($this->has('broadcast_type') && !$this->has('media_type')) {
            $merge['media_type'] = $this->input('broadcast_type');
        }

        if ($this->has('channel') && is_string($this->input('channel'))) {
            $val = $this->input('channel');
            $merge['channel'] = ['en' => $val, 'bn' => $val];
        }

        if ($this->has('program_name') && !$this->has('program')) {
            $val = $this->input('program_name');
            $merge['program'] = is_array($val) ? $val : ['en' => $val, 'bn' => $val];
        } elseif ($this->has('program') && is_string($this->input('program'))) {
            $val = $this->input('program');
            $merge['program'] = ['en' => $val, 'bn' => $val];
        }

        if ($this->has('appearance_date') && !$this->has('broadcast_date')) {
            $merge['broadcast_date'] = $this->input('appearance_date');
        }

        if ($merge) {
            $this->merge($merge);
        }
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
            'title.bn' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('media_appearances', 'slug')->ignore($appearanceId),
            ],
            'media_type' => 'required|string|in:tv,radio,interview,talk_show,discussion,podcast,digital,other',
            'broadcast_type' => 'nullable|string|in:tv,radio,interview,talk_show,discussion,podcast,digital,other',
            'channel' => 'required',
            'channel.en' => 'nullable|string|max:255',
            'channel.bn' => 'nullable|string|max:255',
            'program' => 'nullable',
            'program.en' => 'nullable|string|max:255',
            'program.bn' => 'nullable|string|max:255',
            'program_name' => 'nullable',
            'category_id' => 'nullable|exists:categories,id',
            'broadcast_date' => 'nullable|date',
            'appearance_date' => 'nullable|date',
            'video_url' => [
                'nullable',
                'string',
                'max:500',
                'regex:/^https?:\/\/[^\s]+$/i',
            ],
            'external_url' => [
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

        if (empty($data['media_type']) && !empty($data['broadcast_type'])) {
            $data['media_type'] = $data['broadcast_type'];
        }

        if (is_string($data['channel'] ?? null)) {
            $val = $data['channel'];
            $data['channel'] = ['en' => $val, 'bn' => $val];
        }

        if (empty($data['program']) && !empty($data['program_name'])) {
            $val = $data['program_name'];
            $data['program'] = is_array($val) ? $val : ['en' => $val, 'bn' => $val];
        } elseif (is_string($data['program'] ?? null)) {
            $val = $data['program'];
            $data['program'] = ['en' => $val, 'bn' => $val];
        }

        if (empty($data['broadcast_date']) && !empty($data['appearance_date'])) {
            $data['broadcast_date'] = $data['appearance_date'];
        }

        if (empty($data['video_url']) && !empty($data['external_url'])) {
            $data['video_url'] = $data['external_url'];
        }

        if (empty($data['slug']) && !empty($data['title']['en'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['title']['en']);
        }

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

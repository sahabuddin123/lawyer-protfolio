<?php

namespace App\Http\Requests\Admin;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GalleryAlbumRequest extends FormRequest
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

        return $user->can('manage_gallery');
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if (empty($this->input('slug')) && !empty($this->input('title.en'))) {
            $merge['slug'] = Str::slug($this->input('title.en'));
        }

        if ($this->has('featured') && !$this->has('is_featured')) {
            $merge['is_featured'] = filter_var($this->input('featured'), FILTER_VALIDATE_BOOLEAN);
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
        $albumId = $this->route('album') ? ($this->route('album')->id ?? $this->route('album')) : null;

        return [
            'title' => ['required', 'array'],
            'title.en' => ['required', 'string', 'max:255'],
            'title.bn' => ['nullable', 'string', 'max:255'],

            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('gallery_albums', 'slug')->ignore($albumId),
            ],

            'description' => ['nullable', 'array'],
            'description.en' => ['nullable', 'string'],
            'description.bn' => ['nullable', 'string'],

            'cover_image_id' => ['nullable', 'integer', 'exists:media,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'event_date' => ['nullable', 'date'],
            'published_at' => ['nullable', 'date'],

            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'visibility' => ['required', Rule::in(['public', 'private'])],
            'is_featured' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],

            // SEO Metadata
            'seo' => ['nullable', 'array'],
            'seo.meta_title' => ['nullable', 'array'],
            'seo.meta_title.en' => ['nullable', 'string', 'max:160'],
            'seo.meta_title.bn' => ['nullable', 'string', 'max:160'],
            'seo.meta_description' => ['nullable', 'array'],
            'seo.meta_description.en' => ['nullable', 'string', 'max:320'],
            'seo.meta_description.bn' => ['nullable', 'string', 'max:320'],
            'seo.canonical_url' => ['nullable', 'url', 'max:500'],
            'seo.og_image_id' => ['nullable', 'integer', 'exists:media,id'],
            'seo.noindex' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.en.required' => 'The English album title is mandatory.',
            'slug.regex' => 'The album slug must consist of lowercase alphanumeric characters and single hyphens.',
            'slug.unique' => 'This album slug is already in use by another gallery album.',
            'status.in' => 'Status must be one of: draft, published, archived.',
            'visibility.in' => 'Visibility must be either public or private.',
            'cover_image_id.exists' => 'The selected cover image media record does not exist.',
            'category_id.exists' => 'The selected category does not exist.',
        ];
    }

    /**
     * Sanitize inputs after validation passes.
     */
    public function passedValidation(): void
    {
        $sanitizer = app(HtmlSanitizer::class);

        $description = $this->input('description', []);
        if (is_array($description)) {
            $cleaned = [];
            foreach ($description as $lang => $content) {
                $cleaned[$lang] = $content ? $sanitizer->clean($content) : null;
            }
            $this->merge(['description' => $cleaned]);
        }
    }
}

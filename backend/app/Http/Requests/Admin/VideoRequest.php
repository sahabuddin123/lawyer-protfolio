<?php

namespace App\Http\Requests\Admin;

use App\Services\VideoPlatformService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use InvalidArgumentException;

class VideoRequest extends FormRequest
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

        return $user->can('manage_videos');
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

        // Try auto-detecting platform and video_id if url is given
        $url = $this->input('video_url');
        if (!empty($url)) {
            try {
                $service = app(VideoPlatformService::class);
                $parsed = $service->parse($url, $this->input('platform'));
                if (empty($this->input('platform'))) {
                    $merge['platform'] = $parsed['platform'];
                }
                if (empty($this->input('video_id')) && !empty($parsed['video_id'])) {
                    $merge['video_id'] = $parsed['video_id'];
                }
            } catch (\Throwable $e) {
                // Let withValidator handle error
            }
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
        $videoId = $this->route('video')?->id ?? $this->route('video');

        return [
            'title' => 'required|array',
            'title.en' => 'required|string|max:255',
            'title.bn' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('videos', 'slug')->ignore($videoId),
            ],
            'video_url' => [
                'required',
                'string',
                'max:500',
                'regex:/^https?:\/\/[^\s]+$/i',
            ],
            'platform' => 'required|string|in:youtube,vimeo,external',
            'video_id' => 'nullable|string|max:100',
            'thumbnail_id' => 'nullable|exists:media,id',
            'category_id' => 'nullable|exists:categories,id',
            'duration' => 'nullable|string|max:50',
            'description' => 'nullable|array',
            'description.en' => 'nullable|string',
            'description.bn' => 'nullable|string',
            'published_date' => 'nullable|date',
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
     * Configure validator instance for deep URL validation.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $url = $this->input('video_url');
            if (!empty($url)) {
                try {
                    $service = app(VideoPlatformService::class);
                    $parsed = $service->parse($url, $this->input('platform'));
                    $selectedPlatform = strtolower($this->input('platform', $parsed['platform']));

                    if (in_array($selectedPlatform, ['youtube', 'vimeo']) && $parsed['platform'] !== $selectedPlatform) {
                        $validator->errors()->add('video_url', "Provided URL does not match the selected {$selectedPlatform} platform.");
                    }
                } catch (InvalidArgumentException $e) {
                    $validator->errors()->add('video_url', $e->getMessage());
                } catch (\Throwable $e) {
                    $validator->errors()->add('video_url', 'Invalid video URL.');
                }
            }
        });
    }

    /**
     * Sanitize input content against XSS / script tags.
     */
    public function sanitizedData(): array
    {
        $data = $this->validated();

        if (empty($data['slug']) && !empty($data['title']['en'])) {
            $data['slug'] = Str::slug($data['title']['en']);
        }

        // Parse and populate normalized video attributes
        if (!empty($data['video_url'])) {
            try {
                $service = app(VideoPlatformService::class);
                $parsed = $service->parse($data['video_url'], $data['platform'] ?? null);
                $data['platform'] = $data['platform'] ?? $parsed['platform'];
                $data['video_id'] = $parsed['video_id'] ?? ($data['video_id'] ?? null);
                $data['video_url'] = $parsed['normalized_url'];
            } catch (\Throwable $e) {
                // fall through
            }
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

<?php

namespace App\Http\Requests\Admin;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('edit_profile') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'array'],
            'name.en' => ['required', 'string', 'max:255'],
            'name.bn' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'array'],
            'title.en' => ['required', 'string', 'max:255'],
            'title.bn' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'array'],
            'subtitle.en' => ['nullable', 'string', 'max:255'],
            'subtitle.bn' => ['nullable', 'string', 'max:255'],
            'short_bio' => ['required', 'array'],
            'short_bio.en' => ['required', 'string', 'max:1000'],
            'short_bio.bn' => ['nullable', 'string', 'max:1000'],
            'long_bio' => ['required', 'array'],
            'long_bio.en' => ['required', 'string'],
            'long_bio.bn' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,hidden'],
            'profile_photo_id' => ['nullable', 'integer', 'exists:media,id'],
            'court_robes_photo_id' => ['nullable', 'integer', 'exists:media,id'],
            'signature_photo_id' => ['nullable', 'integer', 'exists:media,id'],
            'bar_council_enrollment' => ['nullable', 'string', 'max:255'],
            'high_court_enrollment' => ['nullable', 'string', 'max:255'],
            'appellate_division_enrollment' => ['nullable', 'string', 'max:255'],
            'chambers_address' => ['required', 'array'],
            'chambers_address.en' => ['required', 'string', 'max:500'],
            'chambers_address.bn' => ['nullable', 'string', 'max:500'],
            'office_address' => ['required', 'array'],
            'office_address.en' => ['required', 'string', 'max:500'],
            'office_address.bn' => ['nullable', 'string', 'max:500'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:100'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'philosophy' => ['nullable', 'array'],
            'philosophy.en' => ['nullable', 'string', 'max:1000'],
            'philosophy.bn' => ['nullable', 'string', 'max:1000'],
            'legal_approach' => ['nullable', 'array'],
            'legal_approach.en' => ['nullable', 'string', 'max:1000'],
            'legal_approach.bn' => ['nullable', 'string', 'max:1000'],
            // SEO metadata
            'seo' => ['nullable', 'array'],
            'seo.seo_title' => ['nullable', 'array'],
            'seo.meta_description' => ['nullable', 'array'],
            'seo.canonical_url' => ['nullable', 'url', 'max:500'],
            'seo.og_title' => ['nullable', 'array'],
            'seo.og_description' => ['nullable', 'array'],
            'seo.og_image_id' => ['nullable', 'integer', 'exists:media,id'],
            'seo.robots' => ['nullable', 'string', 'max:100'],
            'seo.schema_type' => ['nullable', 'string', 'max:100'],
            'seo.structured_data' => ['nullable', 'array'],
        ];
    }

    /**
     * Sanitize inputs before processing.
     */
    protected function passedValidation(): void
    {
        $longBio = $this->input('long_bio', []);
        if (isset($longBio['en'])) {
            $longBio['en'] = HtmlSanitizer::clean($longBio['en']);
        }
        if (isset($longBio['bn'])) {
            $longBio['bn'] = HtmlSanitizer::clean($longBio['bn']);
        }
        $this->merge(['long_bio' => $longBio]);
    }
}

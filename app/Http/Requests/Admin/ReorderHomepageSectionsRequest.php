<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderHomepageSectionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_homepage') ?? false;
    }

    public function rules(): array
    {
        return [
            'sections' => 'required|array|min:1',
            'sections.*.id' => 'required|exists:homepage_sections,id',
            'sections.*.sort_order' => 'required|integer',
        ];
    }
}

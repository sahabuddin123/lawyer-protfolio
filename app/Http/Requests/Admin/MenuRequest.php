<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_menus') ?? false;
    }

    public function rules(): array
    {
        $menuId = $this->route('menu')?->id ?? $this->route('menu');

        return [
            'location' => [
                'required',
                'string',
                'max:50',
                Rule::unique('menus', 'location')->ignore($menuId),
            ],
            'title' => 'required|string|max:100',
        ];
    }
}

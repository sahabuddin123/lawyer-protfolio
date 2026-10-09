<?php

namespace App\Http\Requests\Admin;

use App\Services\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;

class MenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_menus') ?? false;
    }

    public function rules(): array
    {
        return [
            'menu_id' => 'required|exists:menus,id',
            'parent_id' => 'nullable|exists:menu_items,id',
            'title' => 'required|array',
            'title.en' => 'required|string|max:100',
            'title.bn' => 'nullable|string|max:100',
            'url' => 'required|string|max:255',
            'target' => 'required|in:_self,_blank',
            'sort_order' => 'nullable|integer',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $url = $this->input('url');
            if (!empty($url) && !HtmlSanitizer::isSafeUrl($url)) {
                $v->errors()->add('url', 'The specified URL contains an unsafe scheme (such as javascript: or data:).');
            }
        });
    }
}

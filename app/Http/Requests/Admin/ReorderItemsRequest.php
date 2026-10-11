<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderItemsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Controller checks specific permission
    }

    protected function prepareForValidation(): void
    {
        $raw = null;
        if ($this->has('order') && !$this->has('items')) {
            $raw = $this->input('order');
        } elseif ($this->has('items')) {
            $raw = $this->input('items');
        }

        if (is_array($raw)) {
            $items = [];
            foreach ($raw as $entry) {
                if (is_array($entry) && isset($entry['id'])) {
                    $items[] = (int) $entry['id'];
                } elseif (is_numeric($entry)) {
                    $items[] = (int) $entry;
                }
            }
            $this->merge(['items' => $items, 'raw_items' => $raw]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array'],
            'items.*' => ['required', 'integer'],
        ];
    }
}

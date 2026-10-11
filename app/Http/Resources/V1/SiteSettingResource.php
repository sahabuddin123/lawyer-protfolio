<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class SiteSettingResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $val = $this->value;

        // If the request is from an admin route or expects raw translations, return raw
        $isAdmin = $request->is('*api/v1/admin/*');

        if (!$isAdmin && is_array($val)) {
            // Check if it's a translated object with 'en' / 'bn'
            if (isset($val['en']) || isset($val['bn'])) {
                $val = $this->resolveTranslation($val);
            } elseif (array_key_exists('value', $val)) {
                $val = $val['value'];
            }
        } elseif (is_array($val) && array_key_exists('value', $val) && count($val) === 1) {
            $val = $val['value'];
        }

        $data = [
            'id' => $this->id,
            'key' => $this->key,
            'value' => $val,
            'group' => $this->group,
            'is_public' => (bool) $this->is_public,
        ];

        if ($isAdmin) {
            $data['raw_value'] = $this->value;
            $data['updated_at'] = $this->updated_at?->toIso8601String();
        }

        return $data;
    }
}

<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class HomepageSectionResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        return [
            'id' => $this->id,
            'section_key' => $this->section_key,
            'title' => $isAdmin ? $this->title : $this->resolveTranslation($this->title),
            'subtitle' => $isAdmin ? $this->subtitle : $this->resolveTranslation($this->subtitle),
            'content' => $isAdmin ? $this->content : $this->resolveTranslation($this->content),
            'settings' => $this->resolveLocalizedSettings($this->settings, $isAdmin),
            'sort_order' => $this->sort_order,
            'is_enabled' => (bool) $this->is_enabled,
        ];
    }

    /**
     * Resolve localized attributes inside settings if any (e.g. cta_label: {en: '...', bn: '...'}).
     */
    protected function resolveLocalizedSettings(?array $settings, bool $isAdmin): ?array
    {
        if (empty($settings) || $isAdmin) {
            return $settings;
        }

        $resolved = [];
        foreach ($settings as $key => $val) {
            if (is_array($val) && (isset($val['en']) || isset($val['bn']))) {
                $resolved[$key] = $this->resolveTranslation($val);
            } else {
                $resolved[$key] = $val;
            }
        }

        return $resolved;
    }
}

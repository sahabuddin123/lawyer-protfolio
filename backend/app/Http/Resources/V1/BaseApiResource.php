<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

abstract class BaseApiResource extends JsonResource
{
    /**
     * Disable default data wrapping to respect ApiResponse envelope.
     */
    public static $wrap = null;
    /**
     * Resolve a translatable attribute to the active or default locale.
     */
    protected function resolveTranslation(mixed $attribute, ?string $locale = null): ?string
    {
        if (is_string($attribute)) {
            $decoded = json_decode($attribute, true);
            $attribute = is_array($decoded) ? $decoded : $attribute;
        }

        if (!is_array($attribute)) {
            return is_string($attribute) ? $attribute : null;
        }

        $target = $locale ?: app()->getLocale();
        $fallback = config('app.fallback_locale', 'en');

        if (!empty($attribute[$target])) {
            return (string) $attribute[$target];
        }

        if (!empty($attribute[$fallback])) {
            return (string) $attribute[$fallback];
        }

        $first = reset($attribute);
        return $first !== false && $first !== null ? (string) $first : null;
    }

    /**
     * Additional data to be added to the response.
     */
    public function with(Request $request): array
    {
        return [
            'success' => true,
            'meta' => [
                'timestamp' => now()->toIso8601String(),
                'locale' => app()->getLocale(),
            ],
        ];
    }
}

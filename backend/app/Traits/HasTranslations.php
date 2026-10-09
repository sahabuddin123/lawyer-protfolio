<?php

namespace App\Traits;

use Illuminate\Support\Facades\App;

trait HasTranslations
{
    /**
     * Get a translated attribute in the current or requested locale.
     */
    public function getTranslated(string $attribute, ?string $locale = null): ?string
    {
        $translations = $this->getAttributeFromArray($attribute);

        if (is_string($translations)) {
            $decoded = json_decode($translations, true);
            $translations = is_array($decoded) ? $decoded : $translations;
        }

        if (!is_array($translations)) {
            return is_string($translations) ? $translations : null;
        }

        $targetLocale = $locale ?: App::getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');

        if (!empty($translations[$targetLocale])) {
            return (string) $translations[$targetLocale];
        }

        if (!empty($translations[$fallbackLocale])) {
            return (string) $translations[$fallbackLocale];
        }

        $first = reset($translations);
        return $first !== false && $first !== null ? (string) $first : null;
    }

    /**
     * Get raw translation array for a translatable attribute.
     */
    public function getTranslations(string $attribute): array
    {
        $val = $this->getAttributeFromArray($attribute);

        if (is_string($val)) {
            $decoded = json_decode($val, true);
            return is_array($decoded) ? $decoded : [];
        }

        return is_array($val) ? $val : [];
    }

    /**
     * Set a translation for a specific locale.
     */
    public function setTranslation(string $attribute, string $locale, ?string $value): self
    {
        $translations = $this->getTranslations($attribute);
        $translations[$locale] = $value;
        $this->attributes[$attribute] = json_encode($translations, JSON_UNESCAPED_UNICODE);

        return $this;
    }

    /**
     * Scope query to match a translated column value.
     */
    public function scopeWhereTranslation($query, string $column, string $value, ?string $locale = null)
    {
        $targetLocale = $locale ?: App::getLocale();
        return $query->where("{$column}->{$targetLocale}", $value);
    }
}

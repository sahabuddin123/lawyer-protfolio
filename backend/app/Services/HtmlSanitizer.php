<?php

namespace App\Services;

class HtmlSanitizer
{
    /**
     * Allowed HTML tags.
     */
    protected static array $allowedTags = [
        'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's', 'strike',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'hr',
        'a', 'img',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'code', 'pre', 'span', 'div', 'sub', 'sup'
    ];

    /**
     * Allowed attributes per tag.
     */
    protected static array $allowedAttributes = [
        'a' => ['href', 'title', 'target', 'rel'],
        'img' => ['src', 'alt', 'title', 'width', 'height', 'loading'],
        '*' => ['class', 'id', 'dir', 'lang']
    ];

    /**
     * Dangerous URL schemes.
     */
    protected static array $disallowedSchemes = [
        'javascript:', 'vbscript:', 'data:', 'file:'
    ];

    /**
     * Sanitize rich text or HTML string.
     */
    public static function clean(?string $html): string
    {
        if (empty($html)) {
            return '';
        }

        // 1. Remove dangerous script and iframe elements directly
        $cleaned = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $html);
        $cleaned = preg_replace('#<style(.*?)>(.*?)</style>#is', '', $cleaned);
        $cleaned = preg_replace('#<iframe(.*?)>(.*?)</iframe>#is', '', $cleaned);
        $cleaned = preg_replace('#<object(.*?)>(.*?)</object>#is', '', $cleaned);
        $cleaned = preg_replace('#<embed(.*?)>(.*?)</embed>#is', '', $cleaned);

        // 2. Remove all on* event handler attributes (e.g., onclick, onerror, onload)
        $cleaned = preg_replace('#\s*on\w+\s*=\s*(".*?"|\'.*?\'|[^\'">\s]+)#is', '', $cleaned);

        // 3. Remove javascript:/vbscript:/data: URL protocols inside attributes
        foreach (static::$disallowedSchemes as $scheme) {
            $cleaned = preg_replace('#(href|src)\s*=\s*["\']\s*' . preg_quote($scheme, '#') . '[^"\']*["\']#is', '$1="#"', $cleaned);
        }

        // 4. Strip tags not in whitelist
        $tagsString = '<' . implode('><', static::$allowedTags) . '>';
        $cleaned = strip_tags($cleaned, $tagsString);

        return trim($cleaned);
    }

    /**
     * Sanitize bilingual content structure (e.g. ['en' => '...', 'bn' => '...']).
     */
    public static function cleanTranslations(array|string|null $content): array|string|null
    {
        if (is_array($content)) {
            $cleaned = [];
            foreach ($content as $locale => $text) {
                $cleaned[$locale] = is_string($text) ? static::clean($text) : $text;
            }
            return $cleaned;
        }

        return is_string($content) ? static::clean($content) : $content;
    }

    /**
     * Verify whether a URL protocol is safe.
     */
    public static function isSafeUrl(?string $url): bool
    {
        if (empty($url)) {
            return true;
        }

        $trimmed = strtolower(trim($url));

        // Allow relative URLs starting with / or #
        if (str_starts_with($trimmed, '/') || str_starts_with($trimmed, '#') || str_starts_with($trimmed, '?')) {
            return true;
        }

        // Check against disallowed schemes
        foreach (static::$disallowedSchemes as $scheme) {
            if (str_starts_with($trimmed, $scheme)) {
                return false;
            }
        }

        // Allow http://, https://, mailto:, tel:
        if (preg_match('#^(https?://|mailto:|tel:)#i', $trimmed)) {
            return true;
        }

        // Unknown protocol
        return false;
    }
}

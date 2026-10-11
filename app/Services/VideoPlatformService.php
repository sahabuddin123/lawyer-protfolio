<?php

namespace App\Services;

use InvalidArgumentException;

class VideoPlatformService
{
    /**
     * Allowed iframe embed hostnames.
     */
    protected const ALLOWED_EMBED_DOMAINS = [
        'youtube.com',
        'www.youtube.com',
        'youtube-nocookie.com',
        'www.youtube-nocookie.com',
        'youtu.be',
        'vimeo.com',
        'player.vimeo.com',
    ];

    /**
     * Parse video URL and extract platform, video ID, normalized URL and embed URL.
     *
     * @param string $url
     * @param string|null $preferredPlatform
     * @return array{platform: string, video_id: ?string, normalized_url: string, embed_url: ?string, is_embeddable: bool}
     * @throws InvalidArgumentException
     */
    public function parse(string $url, ?string $preferredPlatform = null): array
    {
        $cleanUrl = trim($url);

        // Security check: validate protocol
        if (!preg_match('/^https?:\/\//i', $cleanUrl)) {
            throw new InvalidArgumentException('Video URL must use HTTP or HTTPS protocol.');
        }

        // Check for disallowed protocols/schemes embedded
        if (preg_match('/^(javascript|data|file|vbscript|about):/i', $cleanUrl)) {
            throw new InvalidArgumentException('Unsafe protocol detected in video URL.');
        }

        $parsed = parse_url($cleanUrl);
        if (!$parsed || empty($parsed['host'])) {
            throw new InvalidArgumentException('Malformed video URL.');
        }

        $host = strtolower($parsed['host']);

        // 1. YouTube Detection
        if (str_contains($host, 'youtube.com') || str_contains($host, 'youtu.be')) {
            $videoId = $this->extractYouTubeId($cleanUrl);
            if ($videoId) {
                return [
                    'platform' => 'youtube',
                    'video_id' => $videoId,
                    'normalized_url' => "https://www.youtube.com/watch?v={$videoId}",
                    'embed_url' => "https://www.youtube-nocookie.com/embed/{$videoId}",
                    'is_embeddable' => true,
                ];
            }
        }

        // 2. Vimeo Detection
        if (str_contains($host, 'vimeo.com')) {
            $videoId = $this->extractVimeoId($cleanUrl);
            if ($videoId) {
                return [
                    'platform' => 'vimeo',
                    'video_id' => $videoId,
                    'normalized_url' => "https://vimeo.com/{$videoId}",
                    'embed_url' => "https://player.vimeo.com/video/{$videoId}",
                    'is_embeddable' => true,
                ];
            }
        }

        // 3. External Video
        // Check for private / localhost IP target blocking for safety
        if ($this->isPrivateOrLocalhostHost($host)) {
            throw new InvalidArgumentException('Video URL cannot point to localhost or private network targets.');
        }

        return [
            'platform' => 'external',
            'video_id' => null,
            'normalized_url' => $cleanUrl,
            'embed_url' => null, // External videos do not allow arbitrary iframe injection
            'is_embeddable' => false,
        ];
    }

    /**
     * Extract YouTube 11-character video ID.
     */
    public function extractYouTubeId(string $url): ?string
    {
        $patterns = [
            '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/i',
            '/^[a-zA-Z0-9_-]{11}$/', // In case admin passes raw ID
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1] ?? $matches[0];
            }
        }

        return null;
    }

    /**
     * Extract Vimeo video ID.
     */
    public function extractVimeoId(string $url): ?string
    {
        $patterns = [
            '/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|))?(\d{6,12})/i',
            '/^\d{6,12}$/', // Raw Vimeo ID
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1] ?? $matches[0];
            }
        }

        return null;
    }

    /**
     * Get safe embed URL given platform and video_id.
     */
    public function getEmbedUrl(string $platform, ?string $videoId): ?string
    {
        if (empty($videoId)) {
            return null;
        }

        return match (strtolower($platform)) {
            'youtube' => "https://www.youtube-nocookie.com/embed/{$videoId}",
            'vimeo' => "https://player.vimeo.com/video/{$videoId}",
            default => null,
        };
    }

    /**
     * Check if a host is localhost or private IP.
     */
    protected function isPrivateOrLocalhostHost(string $host): bool
    {
        if (in_array(strtolower($host), ['localhost', '127.0.0.1', '::1'])) {
            return true;
        }

        $ip = gethostbyname($host);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return !filter_var(
                $ip,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
            );
        }

        return false;
    }
}

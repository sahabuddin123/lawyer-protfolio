<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

        // Content Security Policy crafted from verified runtime dependencies (fonts, YouTube, Vimeo, icons)
        $csp = "default-src 'self'; "
            . "script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com; "
            . "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            . "font-src 'self' https://fonts.gstatic.com data:; "
            . "img-src 'self' data: https: blob:; "
            . "media-src 'self' https: blob:; "
            . "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com; "
            . "connect-src 'self' http://localhost:8000 http://localhost:5173 http://127.0.0.1:8000 http://127.0.0.1:5173 https:; "
            . "frame-ancestors 'self'; "
            . "form-action 'self'; "
            . "base-uri 'self'; "
            . "object-src 'none';";

        $response->headers->set('Content-Security-Policy', $csp);

        if ($request->isSecure() || app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}

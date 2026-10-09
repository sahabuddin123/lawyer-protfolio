<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Supported application locales.
     */
    protected array $supportedLocales = ['en', 'bn'];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('lang');

        if (! $locale || ! in_array($locale, $this->supportedLocales, true)) {
            $header = $request->header('Accept-Language');
            if ($header) {
                // Parse preferred language from Accept-Language (e.g. "bn,en;q=0.9")
                $preferred = strtolower(substr($header, 0, 2));
                if (in_array($preferred, $this->supportedLocales, true)) {
                    $locale = $preferred;
                }
            }
        }

        if (! $locale || ! in_array($locale, $this->supportedLocales, true)) {
            $locale = config('app.locale', 'en');
        }

        app()->setLocale($locale);

        $response = $next($request);

        $response->headers->set('Content-Language', $locale);

        return $response;
    }
}

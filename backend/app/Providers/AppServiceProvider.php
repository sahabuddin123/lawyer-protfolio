<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::shouldBeStrict(!app()->isProduction());
        \Illuminate\Http\Resources\Json\JsonResource::withoutWrapping();

        // Implicitly grant 'super_admin' role all permission checks using Gate::before
        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            return $user->hasRole('super_admin') ? true : null;
        });

        // Default API Rate Limiter
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Intake Form Rate Limiter (Public contact & consultation)
        RateLimiter::for('intake', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Authentication Rate Limiter (Brute-force protection: dual layer IP + credential key)
        RateLimiter::for('auth', function (Request $request) {
            $email = strtolower((string) $request->input('email', ''));
            return [
                Limit::perMinute(5)->by($request->ip()),
                Limit::perMinute(5)->by($email . '|' . $request->ip()),
            ];
        });
    }
}

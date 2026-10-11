<?php

use App\Http\Controllers\Api\V1\Public\RobotsController;
use App\Http\Controllers\Api\V1\Public\SitemapController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Single Page Application & Technical Crawlers)
|--------------------------------------------------------------------------
|
| The root domain and all non-API client routes are dispatched to the
| unified React Blade view ('app'). API routes are strictly encapsulated
| in routes/api.php under the /api/v1 prefix.
|
*/

// Technical SEO Crawl Endpoints
Route::get('/sitemap.xml', [SitemapController::class, 'index']);
Route::get('/robots.txt', [RobotsController::class, 'index']);

// Single Page Application: Root Entry
Route::get('/', function () {
    return view('app');
});

// Single Page Application: Fallback Route (excludes /api/*)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api/).*$');

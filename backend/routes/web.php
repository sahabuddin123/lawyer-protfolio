<?php

use App\Http\Controllers\Api\V1\Public\RobotsController;
use App\Http\Controllers\Api\V1\Public\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Technical SEO Root Crawl Endpoints
Route::get('/sitemap.xml', [SitemapController::class, 'index']);
Route::get('/robots.txt', [RobotsController::class, 'index']);

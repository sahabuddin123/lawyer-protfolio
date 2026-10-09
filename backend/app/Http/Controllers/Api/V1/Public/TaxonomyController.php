<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxonomyController extends Controller
{
    /**
     * Retrieve active categories for public filtering.
     */
    public function categories(Request $request): JsonResponse
    {
        $type = $request->input('type', 'research');
        $locale = app()->getLocale();

        $categories = Category::query()
            ->where('is_active', true)
            ->where('type', $type)
            ->orderBy('sort_order', 'asc')
            ->get()
            ->map(function ($cat) use ($locale) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->getTranslated('name', $locale) ?: ($cat->name['en'] ?? ''),
                    'slug' => $cat->slug,
                    'type' => $cat->type,
                ];
            });

        return ApiResponse::success($categories, 'Taxonomy categories retrieved successfully.');
    }

    /**
     * Retrieve tags for public filtering.
     */
    public function tags(Request $request): JsonResponse
    {
        $locale = app()->getLocale();

        $tags = Tag::query()
            ->orderBy('slug', 'asc')
            ->get()
            ->map(function ($tag) use ($locale) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->getTranslated('name', $locale) ?: ($tag->name['en'] ?? ''),
                    'slug' => $tag->slug,
                ];
            });

        return ApiResponse::success($tags, 'Taxonomy tags retrieved successfully.');
    }
}

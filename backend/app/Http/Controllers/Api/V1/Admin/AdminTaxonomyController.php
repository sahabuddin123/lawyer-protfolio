<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminTaxonomyController extends Controller
{
    /**
     * List categories for administration.
     */
    public function categories(Request $request): JsonResponse
    {
        $query = Category::query()->with('parent');

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('slug', 'like', "%{$search}%")
                  ->orWhere('name->en', 'like', "%{$search}%")
                  ->orWhere('name->bn', 'like', "%{$search}%");
            });
        }

        $categories = $query->orderBy('sort_order', 'asc')->get();

        return ApiResponse::success($categories, 'Categories retrieved successfully.');
    }

    /**
     * Store a new category.
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.en' => 'required|string|max:255',
            'name.bn' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'type' => ['required', 'string', Rule::in(['research', 'publication', 'courtroom', 'gallery', 'media', 'press', 'appearances'])],
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|array',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']['en']);
        }

        $category = Category::create($validated);

        ActivityLog::record(
            action: 'category_created',
            description: "Created {$category->type} category: {$category->name['en']}",
            subject: $category
        );

        return ApiResponse::created($category, 'Category created successfully.');
    }

    /**
     * List tags for administration.
     */
    public function tags(Request $request): JsonResponse
    {
        $query = Tag::query();

        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('slug', 'like', "%{$search}%")
                  ->orWhere('name->en', 'like', "%{$search}%")
                  ->orWhere('name->bn', 'like', "%{$search}%");
            });
        }

        $tags = $query->orderBy('slug', 'asc')->get();

        return ApiResponse::success($tags, 'Tags retrieved successfully.');
    }

    /**
     * Store a new tag.
     */
    public function storeTag(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.en' => 'required|string|max:255',
            'name.bn' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:tags,slug',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']['en']);
        }

        $tag = Tag::create($validated);

        ActivityLog::record(
            action: 'tag_created',
            description: "Created tag: {$tag->name['en']}",
            subject: $tag
        );

        return ApiResponse::created($tag, 'Tag created successfully.');
    }
}

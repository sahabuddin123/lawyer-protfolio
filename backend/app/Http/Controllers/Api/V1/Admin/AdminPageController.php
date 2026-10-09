<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\PageResource;
use App\Models\ActivityLog;
use App\Models\Page;
use App\Models\Redirect;
use App\Models\SeoMeta;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPageController extends Controller
{
    /**
     * Display a listing of CMS pages.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manage_pages');

        $query = Page::with('seo');

        if ($request->has('status') && !empty($request->query('status'))) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('q') && !empty($request->query('q'))) {
            $term = $request->query('q');
            $query->where(function ($q) use ($term) {
                $q->where('slug', 'like', "%{$term}%")
                  ->orWhere('title->en', 'like', "%{$term}%")
                  ->orWhere('title->bn', 'like', "%{$term}%");
            });
        }

        $perPage = min((int) ($request->query('per_page', 15)), 50);
        $pages = $query->latest()->paginate($perPage);

        return ApiResponse::paginated(
            $pages,
            PageResource::collection($pages),
            'CMS pages retrieved successfully.'
        );
    }

    /**
     * Store a newly created CMS page.
     */
    public function store(PageRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 1. Sanitize HTML content
        $validated['content'] = HtmlSanitizer::cleanTranslations($validated['content']);

        // 2. Set published_at timestamp if published and not provided
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $page = Page::create([
            'title' => $validated['title'],
            'slug' => strtolower(trim($validated['slug'])),
            'content' => $validated['content'],
            'status' => $validated['status'],
            'published_at' => $validated['published_at'] ?? null,
        ]);

        // 3. Attach SEO metadata if present
        if (!empty($validated['seo'])) {
            $seoData = $validated['seo'];
            $seoData['seotable_type'] = Page::class;
            $seoData['seotable_id'] = $page->id;
            SeoMeta::create($seoData);
        }

        // Invalidate cache
        CmsCacheService::forgetPage($page->slug);

        // Audit Log
        ActivityLog::record(
            action: 'page_created',
            description: "Created CMS page: {$page->slug}",
            subject: $page,
            newValues: $page->only(['title', 'slug', 'status', 'published_at'])
        );

        $page->load('seo');

        return ApiResponse::created(
            new PageResource($page),
            'CMS page created successfully.'
        );
    }

    /**
     * Display the specified CMS page.
     */
    public function show(Page $page): JsonResponse
    {
        $this->authorize('manage_pages');

        $page->load('seo');

        return ApiResponse::success(
            new PageResource($page),
            'CMS page retrieved successfully.'
        );
    }

    /**
     * Update the specified CMS page.
     */
    public function update(PageRequest $request, Page $page): JsonResponse
    {
        $validated = $request->validated();
        $oldValues = $page->only(['title', 'slug', 'status', 'published_at']);
        $oldSlug = $page->slug;
        $newSlug = strtolower(trim($validated['slug']));

        // 1. Slug change redirect logic: If a published page slug changed, auto-create a 301 redirect
        if ($page->status === 'published' && $oldSlug !== $newSlug) {
            $sourceUrl = "/{$oldSlug}";
            $targetUrl = "/{$newSlug}";

            Redirect::updateOrCreate(
                ['source_url' => $sourceUrl],
                [
                    'target_url' => $targetUrl,
                    'status_code' => 301,
                    'is_active' => true,
                ]
            );

            ActivityLog::record(
                action: 'redirect_created',
                description: "Auto-created 301 redirect due to slug change: {$sourceUrl} -> {$targetUrl}",
                newValues: ['source_url' => $sourceUrl, 'target_url' => $targetUrl, 'status_code' => 301]
            );
        }

        // 2. Sanitize HTML content
        $validated['content'] = HtmlSanitizer::cleanTranslations($validated['content']);

        if ($validated['status'] === 'published' && empty($page->published_at) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $page->update([
            'title' => $validated['title'],
            'slug' => $newSlug,
            'content' => $validated['content'],
            'status' => $validated['status'],
            'published_at' => $validated['published_at'] ?? $page->published_at,
        ]);

        // 3. Update or create SEO metadata
        if (isset($validated['seo'])) {
            $page->seo()->updateOrCreate(
                ['seotable_type' => Page::class, 'seotable_id' => $page->id],
                $validated['seo']
            );
        }

        // Invalidate caches
        CmsCacheService::forgetPage($oldSlug);
        CmsCacheService::forgetPage($newSlug);

        // Audit Log
        ActivityLog::record(
            action: 'page_updated',
            description: "Updated CMS page: {$page->slug}",
            subject: $page,
            oldValues: $oldValues,
            newValues: $page->only(['title', 'slug', 'status', 'published_at'])
        );

        $page->load('seo');

        return ApiResponse::success(
            new PageResource($page),
            'CMS page updated successfully.'
        );
    }

    /**
     * Remove the specified CMS page.
     */
    public function destroy(Page $page): JsonResponse
    {
        $this->authorize('manage_pages');

        $slug = $page->slug;
        $oldValues = $page->toArray();

        $page->delete();

        CmsCacheService::forgetPage($slug);

        ActivityLog::record(
            action: 'page_deleted',
            description: "Deleted CMS page: {$slug}",
            subject: $page,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'CMS page deleted successfully.');
    }
}

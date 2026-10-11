<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HomepageSectionRequest;
use App\Http\Requests\Admin\ReorderHomepageSectionsRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\HomepageSectionResource;
use App\Models\ActivityLog;
use App\Models\HomepageSection;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;

class AdminHomepageController extends Controller
{
    /**
     * Display all homepage sections in order.
     */
    public function index(): JsonResponse
    {
        $this->authorize('manage_homepage');

        $sections = HomepageSection::ordered()->get();

        return ApiResponse::success(
            HomepageSectionResource::collection($sections),
            'Homepage sections retrieved successfully.'
        );
    }

    /**
     * Store a newly created homepage section.
     */
    public function store(HomepageSectionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (!isset($validated['sort_order'])) {
            $max = HomepageSection::max('sort_order') ?? 0;
            $validated['sort_order'] = $max + 1;
        }

        if (!isset($validated['settings'])) {
            $validated['settings'] = [];
        }

        if (isset($validated['content'])) {
            $validated['content'] = \App\Services\HtmlSanitizer::cleanTranslations($validated['content']);
        }

        $section = HomepageSection::create($validated);

        CmsCacheService::forgetHome();

        ActivityLog::record(
            action: 'homepage_section_created',
            description: "Created homepage section: {$section->section_key}",
            subject: $section,
            newValues: $section->toArray()
        );

        return ApiResponse::created(
            new HomepageSectionResource($section),
            'Homepage section created successfully.'
        );
    }

    /**
     * Update configuration for a specific homepage section.
     */
    public function update(HomepageSectionRequest $request, HomepageSection $homepageSection): JsonResponse
    {
        $oldValues = $homepageSection->toArray();
        $validated = $request->validated();

        if (isset($validated['content'])) {
            $validated['content'] = \App\Services\HtmlSanitizer::cleanTranslations($validated['content']);
        }

        $homepageSection->update($validated);

        CmsCacheService::forgetHome();

        ActivityLog::record(
            action: 'homepage_section_updated',
            description: "Updated homepage section: {$homepageSection->section_key}",
            subject: $homepageSection,
            oldValues: $oldValues,
            newValues: $homepageSection->toArray()
        );

        return ApiResponse::success(
            new HomepageSectionResource($homepageSection),
            'Homepage section updated successfully.'
        );
    }

    /**
     * Delete a homepage section.
     */
    public function destroy(HomepageSection $homepageSection): JsonResponse
    {
        $this->authorize('manage_homepage');

        $oldValues = $homepageSection->toArray();
        $key = $homepageSection->section_key;

        $homepageSection->delete();

        CmsCacheService::forgetHome();

        ActivityLog::record(
            action: 'homepage_section_deleted',
            description: "Deleted homepage section: {$key}",
            subject: $homepageSection,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'Homepage section deleted successfully.');
    }

    /**
     * Bulk reorder homepage sections.
     */
    public function reorder(ReorderHomepageSectionsRequest $request): JsonResponse
    {
        $sections = $request->validated()['sections'];

        foreach ($sections as $sectionData) {
            HomepageSection::where('id', $sectionData['id'])
                ->update(['sort_order' => $sectionData['sort_order']]);
        }

        CmsCacheService::forgetHome();

        ActivityLog::record(
            action: 'homepage_sections_reordered',
            description: 'Reordered homepage sections'
        );

        $refreshed = HomepageSection::ordered()->get();

        return ApiResponse::success(
            HomepageSectionResource::collection($refreshed),
            'Homepage sections successfully reordered.'
        );
    }
}

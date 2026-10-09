<?php

namespace App\Http\Controllers\Api\v1\Admin;

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
     * Update configuration for a specific homepage section.
     */
    public function update(HomepageSectionRequest $request, HomepageSection $homepageSection): JsonResponse
    {
        $oldValues = $homepageSection->toArray();
        $validated = $request->validated();

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

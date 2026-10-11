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

        if ($section->section_key === 'consultation_cta') {
            $this->syncGlobalCtaSetting($section);
        }

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

        if ($homepageSection->section_key === 'consultation_cta') {
            $this->syncGlobalCtaSetting($homepageSection);
        }

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

        if ($key === 'consultation_cta') {
            \App\Models\SiteSetting::where('group', 'cta')->where('key', 'global_cta')->update([
                'value->is_enabled' => false,
            ]);
            CmsCacheService::forgetSettings();
        }

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
     * Synchronize consultation_cta homepage section with central site_settings global_cta.
     */
    protected function syncGlobalCtaSetting(HomepageSection $section): void
    {
        $settings = $section->settings ?? [];
        $buttonLabel = $settings['cta_label'] ?? $settings['cta_button_text'] ?? ['en' => 'Book Consultation', 'bn' => 'পরামর্শ বুক করুন'];
        $globalCtaData = [
            'heading' => $section->title,
            'subheading' => $section->subtitle,
            'primary_button_label' => $buttonLabel,
            'button_text' => $buttonLabel,
            'primary_button_url' => $settings['cta_url'] ?? '/about#contact',
            'secondary_button_label' => $settings['secondary_cta_label'] ?? ['en' => 'Contact Chamber', 'bn' => 'চেম্বার যোগাযোগ'],
            'secondary_button_url' => $settings['secondary_cta_url'] ?? '/contact',
            'is_enabled' => (bool) $section->is_enabled,
        ];

        \App\Models\SiteSetting::updateOrCreate(
            ['key' => 'global_cta', 'group' => 'cta'],
            [
                'is_public' => true,
                'value' => $globalCtaData,
            ]
        );

        CmsCacheService::forgetSettings();
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

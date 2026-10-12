<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\FooterRevision;
use App\Models\FooterTemplate;
use App\Services\FooterBuilderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminFooterBuilderController extends Controller
{
    public function __construct(
        protected FooterBuilderService $footerService
    ) {}

    /**
     * List all footer templates
     */
    public function index(): JsonResponse
    {
        $this->authorizeAdmin();

        $templates = FooterTemplate::withCount('revisions')
            ->with(['creator:id,name,email', 'updater:id,name,email'])
            ->orderBy('is_active', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return ApiResponse::success($templates, 'Footer templates retrieved successfully.');
    }

    /**
     * Create a new footer template
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'slug' => 'nullable|string|max:150|unique:footer_templates,slug',
            'preset' => 'nullable|string|in:institutional,minimal,corporate',
            'layout_data' => 'nullable|array',
            'display_conditions' => 'nullable|array',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);
        if (FooterTemplate::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::random(5);
        }

        $layoutData = $validated['layout_data'] ?? null;
        if (!$layoutData) {
            $layoutData = $this->footerService->getDefaultInstitutionalLayout();
        }

        $sanitizedLayout = $this->footerService->validateAndSanitizeLayout($layoutData);

        $template = FooterTemplate::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'status' => 'draft',
            'is_active' => false,
            'display_conditions' => $validated['display_conditions'] ?? ['type' => 'all_pages'],
            'layout_data' => $sanitizedLayout,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);

        ActivityLog::record(
            action: 'footer_template_created',
            description: "Created footer template: {$template->name}",
            subject: $template,
            newValues: ['name' => $template->name, 'slug' => $template->slug]
        );

        return ApiResponse::created($template, 'Footer template created successfully.');
    }

    /**
     * Show single footer template with full layout data
     */
    public function show(int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $template = FooterTemplate::with(['creator:id,name', 'updater:id,name'])->findOrFail($id);

        return ApiResponse::success($template, 'Footer template details retrieved.');
    }

    /**
     * Save draft updates to footer template
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $template = FooterTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'display_conditions' => 'nullable|array',
            'layout_data' => 'sometimes|required|array',
        ]);

        $updated = $this->footerService->saveDraft($template, $validated, $request->user()?->id);

        ActivityLog::record(
            action: 'footer_draft_saved',
            description: "Saved draft for footer template: {$template->name}",
            subject: $template
        );

        return ApiResponse::success($updated, 'Footer draft saved successfully.');
    }

    /**
     * Delete a footer template (cannot delete currently active template)
     */
    public function destroy(int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $template = FooterTemplate::findOrFail($id);

        if ($template->is_active) {
            return ApiResponse::error(
                'Cannot delete the currently active published footer. Please activate another template first.',
                422
            );
        }

        $name = $template->name;
        $template->delete();

        ActivityLog::record(
            action: 'footer_template_deleted',
            description: "Deleted footer template: {$name}",
            oldValues: ['id' => $id, 'name' => $name]
        );

        return ApiResponse::success(null, 'Footer template deleted successfully.');
    }

    /**
     * Publish and activate a footer template
     */
    public function publish(Request $request, int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $template = FooterTemplate::findOrFail($id);

        $validated = $request->validate([
            'change_summary' => 'nullable|string|max:255',
        ]);

        $published = $this->footerService->publish(
            $template,
            $validated['change_summary'] ?? null,
            $request->user()?->id
        );

        ActivityLog::record(
            action: 'footer_published',
            description: "Published footer template: {$template->name}",
            subject: $published,
            newValues: ['status' => 'published', 'is_active' => true]
        );

        return ApiResponse::success($published, 'Footer template published and activated successfully.');
    }

    /**
     * Duplicate a template
     */
    public function duplicate(Request $request, int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $template = FooterTemplate::findOrFail($id);
        $cloned = $this->footerService->duplicate($template, $request->user()?->id);

        ActivityLog::record(
            action: 'footer_template_duplicated',
            description: "Duplicated footer template: {$template->name} -> {$cloned->name}",
            subject: $cloned
        );

        return ApiResponse::created($cloned, 'Footer template duplicated successfully.');
    }

    /**
     * Retrieve revision history for template
     */
    public function revisions(int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $template = FooterTemplate::findOrFail($id);
        $revisions = FooterRevision::where('footer_template_id', $template->id)
            ->with('creator:id,name,email')
            ->orderBy('version', 'desc')
            ->get();

        return ApiResponse::success($revisions, 'Revisions retrieved successfully.');
    }

    /**
     * Restore a specific revision
     */
    public function restoreRevision(Request $request, int $id, int $revisionId): JsonResponse
    {
        $this->authorizeAdmin();

        $template = FooterTemplate::findOrFail($id);
        $restored = $this->footerService->restoreRevision($template, $revisionId, $request->user()?->id);

        ActivityLog::record(
            action: 'footer_revision_restored',
            description: "Restored revision #{$revisionId} for template: {$template->name}",
            subject: $template
        );

        return ApiResponse::success($restored, 'Revision restored successfully.');
    }

    /**
     * Retrieve canonical database records for live binding in editor
     */
    public function canonicalData(): JsonResponse
    {
        $this->authorizeAdmin();

        $data = $this->footerService->getCanonicalDataSources();

        return ApiResponse::success($data, 'Canonical data sources retrieved.');
    }

    /**
     * Helper to verify admin permissions
     */
    protected function authorizeAdmin(): void
    {
        $user = request()->user();
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        // Allow users with manage_settings or manage_homepage or super_admin
        if (
            !$user->hasRole('super_admin') &&
            !$user->can('manage_settings') &&
            !$user->can('manage_homepage')
        ) {
            abort(403, 'Unauthorized access to footer builder.');
        }
    }
}

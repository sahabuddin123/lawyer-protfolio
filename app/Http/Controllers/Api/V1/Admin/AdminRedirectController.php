<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RedirectRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\RedirectResource;
use App\Models\ActivityLog;
use App\Models\Redirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRedirectController extends Controller
{
    /**
     * Display a listing of URL redirects.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manage_redirects');

        $query = Redirect::query();

        if ($request->has('q') && !empty($request->query('q'))) {
            $term = $request->query('q');
            $query->where(function ($q) use ($term) {
                $q->where('source_url', 'like', "%{$term}%")
                  ->orWhere('target_url', 'like', "%{$term}%");
            });
        }

        $perPage = min((int) ($request->query('per_page', 15)), 50);
        $redirects = $query->latest()->paginate($perPage);

        return ApiResponse::paginated(
            $redirects,
            RedirectResource::collection($redirects),
            'Redirects retrieved successfully.'
        );
    }

    /**
     * Store a newly created redirect.
     */
    public function store(RedirectRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $redirect = Redirect::create([
            'source_url' => trim($validated['source_url']),
            'target_url' => trim($validated['target_url']),
            'status_code' => (int) $validated['status_code'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        ActivityLog::record(
            action: 'redirect_created',
            description: "Created redirect: {$redirect->source_url} -> {$redirect->target_url} ({$redirect->status_code})",
            subject: $redirect,
            newValues: $redirect->toArray()
        );

        return ApiResponse::created(
            new RedirectResource($redirect),
            'Redirect created successfully.'
        );
    }

    /**
     * Update the specified redirect.
     */
    public function update(RedirectRequest $request, Redirect $redirect): JsonResponse
    {
        $oldValues = $redirect->toArray();
        $validated = $request->validated();

        $redirect->update([
            'source_url' => trim($validated['source_url']),
            'target_url' => trim($validated['target_url']),
            'status_code' => (int) $validated['status_code'],
            'is_active' => $validated['is_active'] ?? $redirect->is_active,
        ]);

        ActivityLog::record(
            action: 'redirect_updated',
            description: "Updated redirect: {$redirect->source_url} -> {$redirect->target_url}",
            subject: $redirect,
            oldValues: $oldValues,
            newValues: $redirect->toArray()
        );

        return ApiResponse::success(
            new RedirectResource($redirect),
            'Redirect updated successfully.'
        );
    }

    /**
     * Remove the specified redirect.
     */
    public function destroy(Redirect $redirect): JsonResponse
    {
        $this->authorize('manage_redirects');

        $oldValues = $redirect->toArray();
        $desc = "{$redirect->source_url} -> {$redirect->target_url}";

        $redirect->delete();

        ActivityLog::record(
            action: 'redirect_deleted',
            description: "Deleted redirect: {$desc}",
            subject: $redirect,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'Redirect deleted successfully.');
    }
}

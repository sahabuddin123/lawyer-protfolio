<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProfessionalMembershipRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\ProfessionalMembershipResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\ProfessionalMembership;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProfessionalMembershipController extends Controller
{
    /**
     * Display a listing of professional memberships.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manage_memberships');

        $memberships = ProfessionalMembership::ordered()->get();

        return ApiResponse::success(
            ProfessionalMembershipResource::collection($memberships),
            'Professional memberships retrieved successfully.'
        );
    }

    /**
     * Store a newly created professional membership.
     */
    public function store(ProfessionalMembershipRequest $request): JsonResponse
    {
        $this->authorize('manage_memberships');

        $validated = $request->validated();
        $membership = ProfessionalMembership::create($validated);

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'membership_created',
            description: "Created professional membership: {$membership->organization['en']}",
            subject: $membership,
            newValues: $membership->toArray()
        );

        return ApiResponse::created(
            new ProfessionalMembershipResource($membership),
            'Professional membership created successfully.'
        );
    }

    /**
     * Display the specified professional membership.
     */
    public function show(ProfessionalMembership $membership): JsonResponse
    {
        $this->authorize('manage_memberships');

        return ApiResponse::success(
            new ProfessionalMembershipResource($membership),
            'Professional membership retrieved successfully.'
        );
    }

    /**
     * Update the specified professional membership.
     */
    public function update(ProfessionalMembershipRequest $request, ProfessionalMembership $membership): JsonResponse
    {
        $this->authorize('manage_memberships');

        $oldValues = $membership->getOriginal();
        $membership->update($request->validated());

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'membership_updated',
            description: "Updated professional membership: {$membership->organization['en']}",
            subject: $membership,
            oldValues: $oldValues,
            newValues: $membership->getChanges()
        );

        return ApiResponse::success(
            new ProfessionalMembershipResource($membership),
            'Professional membership updated successfully.'
        );
    }

    /**
     * Remove the specified professional membership.
     */
    public function destroy(ProfessionalMembership $membership): JsonResponse
    {
        $this->authorize('manage_memberships');

        $oldValues = $membership->toArray();
        $membership->delete();

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'membership_deleted',
            description: "Deleted professional membership: {$oldValues['organization']['en']}",
            subject: $membership,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'Professional membership deleted successfully.');
    }

    /**
     * Reorder professional memberships in batch.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $this->authorize('manage_memberships');

        $items = $request->validated('items');

        foreach ($items as $index => $id) {
            ProfessionalMembership::where('id', $id)->update(['sort_order' => $index + 1]);
        }

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'memberships_reordered',
            description: 'Batch reordered professional memberships'
        );

        return ApiResponse::success(null, 'Professional memberships reordered successfully.');
    }
}

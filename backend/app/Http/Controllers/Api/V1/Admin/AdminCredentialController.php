<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CredentialRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\CredentialResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\Credential;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCredentialController extends Controller
{
    /**
     * Display a listing of credentials.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manage_credentials');

        $credentials = Credential::ordered()->with('certificate')->get();

        return ApiResponse::success(
            CredentialResource::collection($credentials),
            'Credentials retrieved successfully.'
        );
    }

    /**
     * Store a newly created credential.
     */
    public function store(CredentialRequest $request): JsonResponse
    {
        $this->authorize('manage_credentials');

        $validated = $request->validated();
        $credential = Credential::create($validated);

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'credential_created',
            description: "Created credential: {$credential->title['en']}",
            subject: $credential,
            newValues: $credential->toArray()
        );

        $credential->load('certificate');

        return ApiResponse::created(
            new CredentialResource($credential),
            'Credential created successfully.'
        );
    }

    /**
     * Display the specified credential.
     */
    public function show(Credential $credential): JsonResponse
    {
        $this->authorize('manage_credentials');

        $credential->load('certificate');

        return ApiResponse::success(
            new CredentialResource($credential),
            'Credential retrieved successfully.'
        );
    }

    /**
     * Update the specified credential.
     */
    public function update(CredentialRequest $request, Credential $credential): JsonResponse
    {
        $this->authorize('manage_credentials');

        $oldValues = $credential->getOriginal();
        $credential->update($request->validated());

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'credential_updated',
            description: "Updated credential: {$credential->title['en']}",
            subject: $credential,
            oldValues: $oldValues,
            newValues: $credential->getChanges()
        );

        $credential->load('certificate');

        return ApiResponse::success(
            new CredentialResource($credential),
            'Credential updated successfully.'
        );
    }

    /**
     * Remove the specified credential.
     */
    public function destroy(Credential $credential): JsonResponse
    {
        $this->authorize('manage_credentials');

        $oldValues = $credential->toArray();
        $credential->delete();

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'credential_deleted',
            description: "Deleted credential: {$oldValues['title']['en']}",
            subject: $credential,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'Credential deleted successfully.');
    }

    /**
     * Reorder credentials in batch.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $this->authorize('manage_credentials');

        $items = $request->validated('items');

        foreach ($items as $index => $id) {
            Credential::where('id', $id)->update(['sort_order' => $index + 1]);
        }

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'credentials_reordered',
            description: 'Batch reordered credentials'
        );

        return ApiResponse::success(null, 'Credentials reordered successfully.');
    }
}

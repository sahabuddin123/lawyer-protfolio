<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EducationRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\EducationResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\Education;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminEducationController extends Controller
{
    /**
     * Display a listing of educations.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manage_educations');

        $educations = Education::ordered()->get();

        return ApiResponse::success(
            EducationResource::collection($educations),
            'Educations retrieved successfully.'
        );
    }

    /**
     * Store a newly created education record.
     */
    public function store(EducationRequest $request): JsonResponse
    {
        $this->authorize('manage_educations');

        $validated = $request->validated();
        $education = Education::create($validated);

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'education_created',
            description: "Created education record: {$education->degree['en']}",
            subject: $education,
            newValues: $education->toArray()
        );

        return ApiResponse::created(
            new EducationResource($education),
            'Education created successfully.'
        );
    }

    /**
     * Display the specified education record.
     */
    public function show(Education $education): JsonResponse
    {
        $this->authorize('manage_educations');

        return ApiResponse::success(
            new EducationResource($education),
            'Education retrieved successfully.'
        );
    }

    /**
     * Update the specified education record.
     */
    public function update(EducationRequest $request, Education $education): JsonResponse
    {
        $this->authorize('manage_educations');

        $oldValues = $education->getOriginal();
        $education->update($request->validated());

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'education_updated',
            description: "Updated education record: {$education->degree['en']}",
            subject: $education,
            oldValues: $oldValues,
            newValues: $education->getChanges()
        );

        return ApiResponse::success(
            new EducationResource($education),
            'Education updated successfully.'
        );
    }

    /**
     * Remove the specified education record.
     */
    public function destroy(Education $education): JsonResponse
    {
        $this->authorize('manage_educations');

        $oldValues = $education->toArray();
        $education->delete();

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'education_deleted',
            description: "Deleted education record: {$oldValues['degree']['en']}",
            subject: $education,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'Education deleted successfully.');
    }

    /**
     * Reorder educations in batch.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $this->authorize('manage_educations');

        $items = $request->validated('items');

        foreach ($items as $index => $id) {
            Education::where('id', $id)->update(['sort_order' => $index + 1]);
        }

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'educations_reordered',
            description: 'Batch reordered educations'
        );

        return ApiResponse::success(null, 'Educations reordered successfully.');
    }
}

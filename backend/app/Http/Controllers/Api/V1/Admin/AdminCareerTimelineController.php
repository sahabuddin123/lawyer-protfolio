<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CareerTimelineRequest;
use App\Http\Requests\Admin\ReorderItemsRequest;
use App\Http\Resources\V1\CareerTimelineResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\CareerTimeline;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCareerTimelineController extends Controller
{
    /**
     * Display a listing of career timeline milestones.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manage_timeline');

        $timeline = CareerTimeline::ordered()->get();

        return ApiResponse::success(
            CareerTimelineResource::collection($timeline),
            'Career timeline retrieved successfully.'
        );
    }

    /**
     * Store a newly created timeline milestone.
     */
    public function store(CareerTimelineRequest $request): JsonResponse
    {
        $this->authorize('manage_timeline');

        $validated = $request->validated();
        $timeline = CareerTimeline::create($validated);

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'timeline_created',
            description: "Created timeline milestone: {$timeline->title['en']}",
            subject: $timeline,
            newValues: $timeline->toArray()
        );

        return ApiResponse::created(
            new CareerTimelineResource($timeline),
            'Timeline milestone created successfully.'
        );
    }

    /**
     * Display the specified timeline milestone.
     */
    public function show(CareerTimeline $careerTimeline): JsonResponse
    {
        $this->authorize('manage_timeline');

        return ApiResponse::success(
            new CareerTimelineResource($careerTimeline),
            'Timeline milestone retrieved successfully.'
        );
    }

    /**
     * Update the specified timeline milestone.
     */
    public function update(CareerTimelineRequest $request, CareerTimeline $careerTimeline): JsonResponse
    {
        $this->authorize('manage_timeline');

        $oldValues = $careerTimeline->getOriginal();
        $careerTimeline->update($request->validated());

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'timeline_updated',
            description: "Updated timeline milestone: {$careerTimeline->title['en']}",
            subject: $careerTimeline,
            oldValues: $oldValues,
            newValues: $careerTimeline->getChanges()
        );

        return ApiResponse::success(
            new CareerTimelineResource($careerTimeline),
            'Timeline milestone updated successfully.'
        );
    }

    /**
     * Remove the specified timeline milestone.
     */
    public function destroy(CareerTimeline $careerTimeline): JsonResponse
    {
        $this->authorize('manage_timeline');

        $oldValues = $careerTimeline->toArray();
        $careerTimeline->delete();

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'timeline_deleted',
            description: "Deleted timeline milestone: {$oldValues['title']['en']}",
            subject: $careerTimeline,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'Timeline milestone deleted successfully.');
    }

    /**
     * Reorder timeline milestones in batch.
     */
    public function reorder(ReorderItemsRequest $request): JsonResponse
    {
        $this->authorize('manage_timeline');

        $items = $request->validated('items');

        foreach ($items as $index => $id) {
            CareerTimeline::where('id', $id)->update(['sort_order' => $index + 1]);
        }

        CmsCacheService::forgetProfile();

        ActivityLog::record(
            action: 'timeline_reordered',
            description: 'Batch reordered career timeline'
        );

        return ApiResponse::success(null, 'Career timeline reordered successfully.');
    }
}

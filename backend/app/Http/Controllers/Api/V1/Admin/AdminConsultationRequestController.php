<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateConsultationRequestRequest;
use App\Http\Resources\V1\ConsultationRequestDetailResource;
use App\Http\Resources\V1\ConsultationRequestResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\ConsultationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminConsultationRequestController extends Controller
{
    /**
     * List consultation booking requests with filtering, searching, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizePermission($request, 'view_consultations');

        $query = ConsultationRequest::query()->with(['practiceArea']);

        // Filter by status
        if ($status = $request->input('status')) {
            $query->status($status);
        }

        // Filter by practice area
        if ($practiceAreaId = $request->input('practice_area_id')) {
            $query->practiceArea($practiceAreaId);
        }

        // Search in name, phone, email, subject
        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->search($search);
        }

        // Sorting
        $sortColumn = $request->input('sort_by', 'created_at');
        $sortDirection = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['id', 'name', 'status', 'preferred_date', 'created_at'];
        if (in_array($sortColumn, $allowedSorts, true)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = min((int) $request->input('per_page', 15), 100);
        $paginator = $query->paginate($perPage);

        return ApiResponse::paginated(
            $paginator,
            ConsultationRequestResource::collection($paginator)->toArray($request),
            'Consultation requests retrieved successfully.'
        );
    }

    /**
     * View detailed consultation request.
     */
    public function show(Request $request, ConsultationRequest $consultation): JsonResponse
    {
        $this->authorizePermission($request, 'view_consultations');

        $consultation->load(['practiceArea']);

        return ApiResponse::success(
            new ConsultationRequestDetailResource($consultation),
            'Consultation request details retrieved successfully.'
        );
    }

    /**
     * Update consultation status and private admin notes.
     */
    public function update(UpdateConsultationRequestRequest $request, ConsultationRequest $consultation): JsonResponse
    {
        $oldValues = [
            'status' => $consultation->status,
            'admin_notes' => $consultation->admin_notes,
        ];

        $updateData = [];
        if ($request->has('status')) {
            $updateData['status'] = $request->input('status');
        }
        if ($request->has('admin_notes')) {
            $updateData['admin_notes'] = $request->input('admin_notes');
        }

        $consultation->update($updateData);

        // Record audit activity
        ActivityLog::record(
            action: 'consultation_updated',
            description: "Updated consultation request #{$consultation->id} (Status: {$consultation->status})",
            oldValues: $oldValues,
            newValues: $updateData
        );

        $consultation->load(['practiceArea']);

        return ApiResponse::success(
            new ConsultationRequestDetailResource($consultation),
            'Consultation request updated successfully.'
        );
    }

    /**
     * Soft delete consultation request.
     */
    public function destroy(Request $request, ConsultationRequest $consultation): JsonResponse
    {
        $this->authorizePermission($request, 'manage_consultations');

        $consultationId = $consultation->id;
        $consultation->delete();

        ActivityLog::record(
            action: 'consultation_deleted',
            description: "Soft-deleted consultation request #{$consultationId}"
        );

        return ApiResponse::success(null, 'Consultation request successfully deleted.');
    }

    /**
     * Helper to verify authorization.
     */
    protected function authorizePermission(Request $request, string $permission): void
    {
        $user = $request->user();
        if (!$user || (!$user->can($permission) && !$user->hasRole('super_admin'))) {
            abort(403, 'You do not have authorization to perform this action.');
        }
    }
}

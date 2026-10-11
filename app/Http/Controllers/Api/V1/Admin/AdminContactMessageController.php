<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateContactMessageRequest;
use App\Http\Resources\V1\ContactMessageDetailResource;
use App\Http\Resources\V1\ContactMessageResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactMessageController extends Controller
{
    /**
     * List contact messages with filtering, searching, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizePermission($request, 'view_contacts');

        $query = ContactMessage::query()->with(['practiceArea']);

        // Filter by status
        if ($status = $request->input('status')) {
            $query->status($status);
        }

        // Filter by practice area
        if ($practiceAreaId = $request->input('practice_area_id')) {
            $query->where('practice_area_id', $practiceAreaId);
        }

        // Search in name, phone, email, subject
        if ($search = $request->input('search') ?: $request->input('q')) {
            $query->search($search);
        }

        // Sorting
        $sortColumn = $request->input('sort_by', 'created_at');
        $sortDirection = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['id', 'name', 'status', 'created_at'];
        if (in_array($sortColumn, $allowedSorts, true)) {
            $query->orderBy($sortColumn, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = min((int) $request->input('per_page', 15), 100);
        $paginator = $query->paginate($perPage);

        return ApiResponse::paginated(
            $paginator,
            ContactMessageResource::collection($paginator)->toArray($request),
            'Contact messages retrieved successfully.'
        );
    }

    /**
     * View detailed contact message.
     */
    public function show(Request $request, ContactMessage $contact): JsonResponse
    {
        $this->authorizePermission($request, 'view_contacts');

        $contact->load(['practiceArea']);

        // Mark as read if status was 'new'
        if ($contact->status === 'new' && $request->user()->can('manage_contacts')) {
            $contact->update(['status' => 'read']);
        }

        return ApiResponse::success(
            new ContactMessageDetailResource($contact),
            'Contact message details retrieved successfully.'
        );
    }

    /**
     * Update status and private admin notes.
     */
    public function update(UpdateContactMessageRequest $request, ContactMessage $contact): JsonResponse
    {
        $oldValues = [
            'status' => $contact->status,
            'admin_notes' => $contact->admin_notes,
        ];

        $updateData = [];
        if ($request->has('status')) {
            $updateData['status'] = $request->input('status');
        }
        if ($request->has('admin_notes')) {
            $updateData['admin_notes'] = $request->input('admin_notes');
        }

        $contact->update($updateData);

        // Record audit activity
        ActivityLog::record(
            action: 'contact_updated',
            description: "Updated contact message #{$contact->id} (Status: {$contact->status})",
            oldValues: $oldValues,
            newValues: $updateData
        );

        $contact->load(['practiceArea']);

        return ApiResponse::success(
            new ContactMessageDetailResource($contact),
            'Contact message updated successfully.'
        );
    }

    /**
     * Soft delete contact message.
     */
    public function destroy(Request $request, ContactMessage $contact): JsonResponse
    {
        $this->authorizePermission($request, 'manage_contacts');

        $contactId = $contact->id;
        $contact->delete();

        ActivityLog::record(
            action: 'contact_deleted',
            description: "Soft-deleted contact message #{$contactId}"
        );

        return ApiResponse::success(null, 'Contact message successfully deleted.');
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

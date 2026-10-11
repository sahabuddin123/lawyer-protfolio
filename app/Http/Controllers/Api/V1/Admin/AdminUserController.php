<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRolesRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Resources\V1\UserResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    /**
     * Display a paginated listing of administrators.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['avatar', 'roles.permissions', 'permissions']);

        if ($request->filled('q')) {
            $term = $request->query('q');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('phone', 'like', "%{$term}%");
            });
        }

        if ($request->filled('role')) {
            $role = $request->query('role');
            $query->whereHas('roles', fn ($q) => $q->where('name', $role));
        }

        if ($request->has('status') && $request->query('status') !== '' && $request->query('status') !== null) {
            $status = filter_var($request->query('status'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($status !== null) {
                $query->where('is_active', $status);
            }
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 50);
        $users = $query->latest()->paginate($perPage);

        return ApiResponse::paginated(
            $users,
            UserResource::collection($users),
            'Administrative users retrieved successfully.'
        );
    }

    /**
     * Display the specified administrator.
     */
    public function show(User $user): JsonResponse
    {
        $user->loadMissing(['avatar', 'roles.permissions', 'permissions']);

        return ApiResponse::success(
            new UserResource($user),
            'Administrator profile retrieved successfully.'
        );
    }

    /**
     * Update roles assigned to an administrator.
     */
    public function updateRoles(UpdateUserRolesRequest $request, User $user): JsonResponse
    {
        $user->loadMissing('roles');
        $previousRoles = $user->roles->pluck('name')->values()->toArray();
        $newRoles = $request->input('roles');

        $user->syncRoles($newRoles);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'user_roles_updated',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'description' => "Roles updated for administrator {$user->name} ({$user->email}) from [" . implode(', ', $previousRoles) . "] to [" . implode(', ', $newRoles) . "]",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        $user->load(['avatar', 'roles.permissions', 'permissions']);

        return ApiResponse::success(
            new UserResource($user),
            'Administrator roles successfully updated.'
        );
    }

    /**
     * Update active status for an administrator.
     */
    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        $newStatus = (bool) $request->input('is_active');
        $user->update(['is_active' => $newStatus]);

        if (!$newStatus) {
            // Revoke all existing Sanctum tokens immediately on account deactivation
            $user->tokens()->delete();
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => $newStatus ? 'user_activated' : 'user_deactivated',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'description' => "Account " . ($newStatus ? 'activated' : 'deactivated') . " for administrator {$user->name} ({$user->email})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        $user->load(['avatar', 'roles.permissions', 'permissions']);

        return ApiResponse::success(
            new UserResource($user),
            'Administrator status successfully updated.'
        );
    }

    /**
     * Display a listing of system roles and their assigned permissions.
     */
    public function roles(): JsonResponse
    {
        $roles = Role::with('permissions')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => $role->permissions->pluck('name')->values()->toArray(),
            ];
        });

        return ApiResponse::success(
            $roles,
            'System roles and permissions retrieved successfully.'
        );
    }
}

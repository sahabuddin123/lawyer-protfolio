<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRolesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_roles') || $this->user()?->hasRole('super_admin');
    }

    public function rules(): array
    {
        return [
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', 'string', 'exists:roles,name'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $currentUser = $this->user();
            $targetUserParam = $this->route('user');
            $targetUser = $targetUserParam instanceof User ? $targetUserParam : User::find($targetUserParam);

            if (!$targetUser) {
                return;
            }

            $requestedRoles = $this->input('roles', []);
            $isTargetSuperAdmin = $targetUser->hasRole('super_admin');
            $isCurrentSuperAdmin = $currentUser->hasRole('super_admin');

            // 1. Non-super-admins cannot assign the super_admin role (privilege escalation defense)
            if (in_array('super_admin', $requestedRoles) && !$isCurrentSuperAdmin) {
                $v->errors()->add('roles', 'Only an active Super Administrator can grant the super_admin role.');
            }

            // 2. Non-super-admins cannot alter roles of an existing super_admin
            if ($isTargetSuperAdmin && !$isCurrentSuperAdmin) {
                $v->errors()->add('roles', 'You do not have judicial authority to modify a Super Administrator account.');
            }

            // 3. Prevent self-lockout: a super_admin cannot strip their own super_admin role
            if ($currentUser->id === $targetUser->id && $isTargetSuperAdmin && !in_array('super_admin', $requestedRoles)) {
                $v->errors()->add('roles', 'You cannot revoke your own Super Administrator role to prevent administrative lockout.');
            }
        });
    }
}

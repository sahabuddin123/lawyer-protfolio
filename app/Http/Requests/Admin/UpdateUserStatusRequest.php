<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage_users') || $this->user()?->hasRole('super_admin');
    }

    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
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

            $isActive = (bool) $this->input('is_active');

            // 1. Prevent self-deactivation (anti-lockout)
            if ($currentUser->id === $targetUser->id && !$isActive) {
                $v->errors()->add('is_active', 'You cannot deactivate your own administrative account.');
            }

            // 2. Only super_admin can deactivate another super_admin
            if ($targetUser->hasRole('super_admin') && !$currentUser->hasRole('super_admin')) {
                $v->errors()->add('is_active', 'You do not have permission to alter the active status of a Super Administrator.');
            }
        });
    }
}

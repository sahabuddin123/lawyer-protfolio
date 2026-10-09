<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\V1\UserResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Authenticate an administrative user and issue Sanctum token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            ActivityLog::create([
                'user_id' => $user?->id,
                'action' => 'login_failed',
                'subject_type' => User::class,
                'subject_id' => $user?->id,
                'description' => 'Failed login attempt with email: ' . $request->email,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);

            return ApiResponse::error(
                'Invalid credentials provided.',
                401,
                [],
                'INVALID_CREDENTIALS'
            );
        }

        if (!$user->is_active) {
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'login_failed_inactive',
                'subject_type' => User::class,
                'subject_id' => $user->id,
                'description' => 'Login attempt blocked for inactive account: ' . $request->email,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);

            return ApiResponse::error(
                'Your account is currently inactive. Please contact administration.',
                403,
                [],
                'ACCOUNT_INACTIVE'
            );
        }

        // Update login audit fields
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        $deviceName = $request->input('device_name') ?: ($request->userAgent() ? substr($request->userAgent(), 0, 50) : 'api-client');
        $token = $user->createToken($deviceName)->plainTextToken;

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login_success',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'description' => "Successful login for user {$user->name} ({$user->email})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        $user->loadMissing(['avatar', 'roles.permissions', 'permissions']);

        return ApiResponse::success(
            [
                'token' => $token,
                'user' => new UserResource($user),
            ],
            'Login successful.'
        );
    }

    /**
     * Terminate session and invalidate active Sanctum token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'subject_type' => User::class,
                'subject_id' => $user->id,
                'description' => "User {$user->name} logged out",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);
        }

        return ApiResponse::success(null, 'Successfully logged out.');
    }

    /**
     * Return authenticated user profile with roles and permissions.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing(['avatar', 'roles.permissions', 'permissions']);

        return ApiResponse::success(
            new UserResource($user),
            'Authenticated user profile.'
        );
    }

    /**
     * Issue password reset token without account enumeration.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if ($user && $user->is_active) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'password_reset_requested',
                'subject_type' => User::class,
                'subject_id' => $user->id,
                'description' => 'Password reset requested for email: ' . $request->email,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);
        }

        return ApiResponse::success(
            null,
            'If the email address exists in our system, a password reset instruction has been dispatched.'
        );
    }

    /**
     * Verify token, reset password, and revoke previous tokens.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record) {
            return ApiResponse::error(
                'Invalid or expired password reset token.',
                400,
                [],
                'INVALID_RESET_TOKEN'
            );
        }

        // Token expiry check: 60 minutes
        $createdAt = Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return ApiResponse::error(
                'Password reset token has expired. Please request a new one.',
                400,
                [],
                'EXPIRED_RESET_TOKEN'
            );
        }

        if (!Hash::check($request->token, $record->token)) {
            return ApiResponse::error(
                'Invalid or expired password reset token.',
                400,
                [],
                'INVALID_RESET_TOKEN'
            );
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return ApiResponse::error(
                'Unable to process password reset request.',
                400,
                [],
                'INVALID_USER'
            );
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Revoke the token once consumed
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Invalidate all existing tokens for this user for security
        $user->tokens()->delete();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'password_reset_completed',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'description' => "Password reset completed for {$user->email}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return ApiResponse::success(
            null,
            'Password has been successfully reset. Please log in with your new credentials.'
        );
    }
}

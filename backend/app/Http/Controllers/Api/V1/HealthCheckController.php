<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthCheckController extends Controller
{
    /**
     * Platform health check endpoint.
     */
    public function __invoke(): JsonResponse
    {
        $dbStatus = 'disconnected';
        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
        } catch (\Throwable $e) {
            $dbStatus = 'error';
        }

        $data = [
            'status' => 'ok',
            'application' => config('app.name'),
            'environment' => config('app.env'),
            'database' => $dbStatus,
            'locale' => app()->getLocale(),
            'timestamp' => now()->toIso8601String(),
        ];

        return ApiResponse::success($data, 'API is healthy');
    }
}

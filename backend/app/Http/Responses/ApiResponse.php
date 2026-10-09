<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

class ApiResponse
{
    /**
     * Standard success JSON response envelope.
     */
    public static function success(
        mixed $data = null,
        string $message = 'Resource retrieved successfully.',
        int $statusCode = 200,
        array $extraMeta = []
    ): JsonResponse {
        $meta = array_merge([
            'timestamp' => now()->toIso8601String(),
            'locale' => app()->getLocale(),
        ], $extraMeta);

        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data ?? (object) [],
            'meta' => $meta,
        ];

        return response()->json($payload, $statusCode);
    }

    /**
     * Standard paginated list JSON response envelope.
     */
    public static function paginated(
        LengthAwarePaginator $paginator,
        mixed $data = null,
        string $message = 'List retrieved successfully.',
        int $statusCode = 200
    ): JsonResponse {
        $meta = [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'last_page' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'locale' => app()->getLocale(),
            'timestamp' => now()->toIso8601String(),
        ];

        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data ?? $paginator->items(),
            'meta' => $meta,
        ];

        return response()->json($payload, $statusCode);
    }

    /**
     * Standard error JSON response envelope.
     */
    public static function error(
        string $message,
        int $statusCode = 400,
        array $errors = [],
        string $errorCode = 'ERROR'
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
            'errors' => (object) $errors,
            'error_code' => $errorCode,
        ];

        return response()->json($payload, $statusCode);
    }

    /**
     * Created response (201).
     */
    public static function created(mixed $data = null, string $message = 'Resource created successfully.'): JsonResponse
    {
        return static::success($data, $message, 201);
    }

    /**
     * Not found error response (404).
     */
    public static function notFound(string $message = 'Resource not found.'): JsonResponse
    {
        return static::error($message, 404, [], 'NOT_FOUND');
    }
}

<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\AbstractPaginator;

abstract class BaseApiCollection extends ResourceCollection
{
    /**
     * Customize the pagination information for the resource.
     */
    public function paginationInformation(Request $request, array $paginated, array $default): array
    {
        return [
            'success' => true,
            'message' => 'List retrieved successfully.',
            'meta' => [
                'current_page' => $paginated['current_page'] ?? 1,
                'per_page'     => $paginated['per_page'] ?? 12,
                'total'        => $paginated['total'] ?? 0,
                'last_page'    => $paginated['last_page'] ?? 1,
                'from'         => $paginated['from'] ?? null,
                'to'           => $paginated['to'] ?? null,
                'locale'       => app()->getLocale(),
                'timestamp'    => now()->toIso8601String(),
            ],
        ];
    }
}

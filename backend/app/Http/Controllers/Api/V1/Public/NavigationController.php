<?php

namespace App\Http\Controllers\Api\v1\Public;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\MenuResource;
use App\Models\Menu;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NavigationController extends Controller
{
    /**
     * Retrieve structured navigation menus.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::navigationKey($locale);

        $navigation = Cache::remember($cacheKey, CmsCacheService::TTL_NAVIGATION, function () use ($request) {
            $menus = Menu::with(['items.children'])->get();
            $transformed = MenuResource::collection($menus)->toArray($request);

            $keyed = [];
            foreach ($transformed as $menu) {
                $keyed[$menu['location']] = $menu;
            }

            return $keyed;
        });

        return ApiResponse::success($navigation, 'Navigation menus retrieved successfully.');
    }
}

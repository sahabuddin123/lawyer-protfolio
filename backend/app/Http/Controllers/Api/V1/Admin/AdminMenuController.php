<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MenuRequest;
use App\Http\Requests\Admin\ReorderMenuItemsRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\MenuResource;
use App\Models\ActivityLog;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMenuController extends Controller
{
    /**
     * Display a listing of menus with nested items.
     */
    public function index(): JsonResponse
    {
        $this->authorize('manage_menus');

        $menus = Menu::with(['items.children'])->get();

        return ApiResponse::success(
            MenuResource::collection($menus),
            'Navigation menus retrieved successfully.'
        );
    }

    /**
     * Store a newly created menu.
     */
    public function store(MenuRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $menu = Menu::create($validated);

        CmsCacheService::forgetNavigation();

        ActivityLog::record(
            action: 'menu_created',
            description: "Created navigation menu: {$menu->title} ({$menu->location})",
            subject: $menu,
            newValues: $menu->toArray()
        );

        $menu->load(['items.children']);

        return ApiResponse::created(
            new MenuResource($menu),
            'Navigation menu created successfully.'
        );
    }

    /**
     * Display the specified menu.
     */
    public function show(Menu $menu): JsonResponse
    {
        $this->authorize('manage_menus');

        $menu->load(['items.children']);

        return ApiResponse::success(
            new MenuResource($menu),
            'Navigation menu retrieved successfully.'
        );
    }

    /**
     * Update the specified menu.
     */
    public function update(MenuRequest $request, Menu $menu): JsonResponse
    {
        $oldValues = $menu->toArray();
        $validated = $request->validated();

        $menu->update($validated);

        CmsCacheService::forgetNavigation();

        ActivityLog::record(
            action: 'menu_updated',
            description: "Updated navigation menu: {$menu->title}",
            subject: $menu,
            oldValues: $oldValues,
            newValues: $menu->toArray()
        );

        $menu->load(['items.children']);

        return ApiResponse::success(
            new MenuResource($menu),
            'Navigation menu updated successfully.'
        );
    }

    /**
     * Remove the specified menu.
     */
    public function destroy(Menu $menu): JsonResponse
    {
        $this->authorize('manage_menus');

        $oldValues = $menu->toArray();
        $title = $menu->title;

        $menu->delete();

        CmsCacheService::forgetNavigation();

        ActivityLog::record(
            action: 'menu_deleted',
            description: "Deleted navigation menu: {$title}",
            subject: $menu,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'Navigation menu deleted successfully.');
    }

    /**
     * Reorder menu items in bulk.
     */
    public function reorderItems(ReorderMenuItemsRequest $request, Menu $menu): JsonResponse
    {
        $items = $request->validated()['items'];

        foreach ($items as $itemData) {
            MenuItem::where('id', $itemData['id'])
                ->where('menu_id', $menu->id)
                ->update([
                    'sort_order' => $itemData['sort_order'],
                    'parent_id' => $itemData['parent_id'] ?? null,
                ]);
        }

        CmsCacheService::forgetNavigation();

        ActivityLog::record(
            action: 'menu_items_reordered',
            description: "Reordered navigation items for menu: {$menu->title}",
            subject: $menu
        );

        $menu->load(['items.children']);

        return ApiResponse::success(
            new MenuResource($menu),
            'Menu items successfully reordered.'
        );
    }
}

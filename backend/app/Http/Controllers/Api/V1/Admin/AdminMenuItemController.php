<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MenuItemRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\MenuItemResource;
use App\Models\ActivityLog;
use App\Models\MenuItem;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;

class AdminMenuItemController extends Controller
{
    /**
     * Store a newly created menu item.
     */
    public function store(MenuItemRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (!isset($validated['sort_order'])) {
            $max = MenuItem::where('menu_id', $validated['menu_id'])
                ->where('parent_id', $validated['parent_id'] ?? null)
                ->max('sort_order') ?? 0;
            $validated['sort_order'] = $max + 1;
        }

        $item = MenuItem::create($validated);

        CmsCacheService::forgetNavigation();

        ActivityLog::record(
            action: 'menu_item_created',
            description: "Created menu item: " . ($validated['title']['en'] ?? 'Item'),
            subject: $item,
            newValues: $item->toArray()
        );

        return ApiResponse::created(
            new MenuItemResource($item),
            'Menu item created successfully.'
        );
    }

    /**
     * Update the specified menu item.
     */
    public function update(MenuItemRequest $request, MenuItem $menuItem): JsonResponse
    {
        $oldValues = $menuItem->toArray();
        $validated = $request->validated();

        $menuItem->update($validated);

        CmsCacheService::forgetNavigation();

        ActivityLog::record(
            action: 'menu_item_updated',
            description: "Updated menu item: " . ($validated['title']['en'] ?? 'Item'),
            subject: $menuItem,
            oldValues: $oldValues,
            newValues: $menuItem->toArray()
        );

        return ApiResponse::success(
            new MenuItemResource($menuItem),
            'Menu item updated successfully.'
        );
    }

    /**
     * Remove the specified menu item.
     */
    public function destroy(MenuItem $menuItem): JsonResponse
    {
        $this->authorize('manage_menus');

        $oldValues = $menuItem->toArray();
        $title = $menuItem->title['en'] ?? 'Item';

        $menuItem->delete();

        CmsCacheService::forgetNavigation();

        ActivityLog::record(
            action: 'menu_item_deleted',
            description: "Deleted menu item: {$title}",
            subject: $menuItem,
            oldValues: $oldValues
        );

        return ApiResponse::success(null, 'Menu item deleted successfully.');
    }
}

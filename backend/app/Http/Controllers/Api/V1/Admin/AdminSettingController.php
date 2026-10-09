<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\SiteSettingResource;
use App\Models\ActivityLog;
use App\Models\SiteSetting;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    /**
     * Retrieve all settings for administration.
     */
    public function index(Request $request): JsonResponse
    {
        $group = $request->query('group');

        $query = SiteSetting::query();
        if ($group) {
            $query->where('group', $group);
        }

        $settings = $query->orderBy('group')->orderBy('key')->get();

        return ApiResponse::success(
            SiteSettingResource::collection($settings),
            'Admin settings retrieved successfully.'
        );
    }

    /**
     * Bulk update settings.
     */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $incomingSettings = $request->validated()['settings'];
        $oldValues = [];
        $newValues = [];

        foreach ($incomingSettings as $item) {
            $key = $item['key'];
            $val = $item['value'] ?? null;

            $setting = SiteSetting::where('key', $key)->first();
            if ($setting) {
                $oldValues[$key] = $setting->value;

                $updateData = ['value' => is_array($val) ? $val : ['value' => $val]];
                if (isset($item['group'])) {
                    $updateData['group'] = $item['group'];
                }
                if (isset($item['is_public'])) {
                    $updateData['is_public'] = (bool) $item['is_public'];
                }

                $setting->update($updateData);
                $newValues[$key] = $setting->value;
            } else {
                $newSetting = SiteSetting::create([
                    'key' => $key,
                    'value' => is_array($val) ? $val : ['value' => $val],
                    'group' => $item['group'] ?? 'general',
                    'is_public' => $item['is_public'] ?? true,
                ]);
                $newValues[$key] = $newSetting->value;
            }
        }

        // Flush CMS cache
        CmsCacheService::forgetSettings();
        CmsCacheService::forgetContactConfig();

        // Audit Log
        ActivityLog::record(
            action: 'settings_updated',
            description: 'Updated system settings: ' . implode(', ', array_keys($newValues)),
            oldValues: $oldValues,
            newValues: $newValues
        );

        $refreshed = SiteSetting::all();

        return ApiResponse::success(
            SiteSettingResource::collection($refreshed),
            'Site settings successfully updated.'
        );
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\SiteSettingResource;
use App\Models\SiteSetting;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    /**
     * Retrieve public site settings.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $group = $request->query('group');

        $cacheKey = CmsCacheService::settingsKey($locale) . ($group ? ":{$group}" : '');

        $settings = Cache::remember($cacheKey, CmsCacheService::TTL_SETTINGS, function () use ($group, $request) {
            $query = SiteSetting::where('is_public', true);
            if ($group) {
                $query->where('group', $group);
            }
            $records = $query->get();

            // Transform each setting using SiteSettingResource
            $transformed = SiteSettingResource::collection($records)->toArray($request);

            // Group by group category and key-value mapping
            $grouped = [];
            foreach ($transformed as $setting) {
                $grp = $setting['group'] ?? 'general';
                $key = $setting['key'];
                $grouped[$grp][$key] = $setting['value'];
            }

            return $grouped;
        });

        return ApiResponse::success($settings, 'Site settings retrieved successfully.');
    }
}

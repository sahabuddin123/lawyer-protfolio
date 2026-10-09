<?php

namespace App\Http\Controllers\Api\v1\Public;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Http\Resources\V1\HomepageSectionResource;
use App\Http\Resources\V1\SiteSettingResource;
use App\Models\HomepageSection;
use App\Models\SiteSetting;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    /**
     * Retrieve aggregated initial bootstrap data for homepage.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::homeKey($locale);

        $data = Cache::remember($cacheKey, CmsCacheService::TTL_HOME, function () use ($request) {
            // 1. Enabled homepage sections ordered by sort_order
            $sections = HomepageSection::enabled()
                ->ordered()
                ->get();

            $sectionsTransformed = HomepageSectionResource::collection($sections)->toArray($request);

            // 2. Public site settings
            $settings = SiteSetting::where('is_public', true)->get();
            $settingsTransformed = SiteSettingResource::collection($settings)->toArray($request);

            $groupedSettings = [];
            foreach ($settingsTransformed as $st) {
                $grp = $st['group'] ?? 'general';
                $key = $st['key'];
                $groupedSettings[$grp][$key] = $st['value'];
            }

            return [
                'sections' => $sectionsTransformed,
                'site_settings' => $groupedSettings,
                'profile' => [
                    'name' => 'Advocate Nijam Uddin (Haq)',
                    'title' => 'Advocate, Supreme Court of Bangladesh',
                    'chamber' => $groupedSettings['contact']['office_name'] ?? 'Supreme Court Chamber',
                ],
                'featured_credentials' => [],
                'featured_practice_areas' => [],
                'featured_courtroom' => [],
                'featured_judgments' => [],
                'featured_research' => [],
                'featured_publications' => [],
                'featured_videos' => [],
                'featured_media' => [],
                'featured_gallery' => [],
            ];
        });

        return ApiResponse::success($data, 'Homepage data retrieved successfully.');
    }
}

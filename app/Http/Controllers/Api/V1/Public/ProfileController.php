<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\CredentialResource;
use App\Http\Resources\V1\EducationResource;
use App\Http\Resources\V1\CareerTimelineResource;
use App\Http\Resources\V1\ProfessionalMembershipResource;
use App\Http\Resources\V1\ProfileResource;
use App\Http\Responses\ApiResponse;
use App\Models\Credential;
use App\Models\Education;
use App\Models\CareerTimeline;
use App\Models\ProfessionalMembership;
use App\Models\Profile;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProfileController extends Controller
{
    /**
     * Get the public authoritative profile with associated credentials, education, and timeline.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::profileKey($locale);

        $payload = Cache::remember($cacheKey, CmsCacheService::TTL_PROFILE, function () {
            $profile = Profile::published()
                ->with(['profilePhoto', 'courtRobesPhoto', 'signaturePhoto', 'seo'])
                ->first();

            if (!$profile) {
                return null;
            }

            // Load associated active entities for comprehensive profile/about rendering
            $credentials = Credential::active()->ordered()->with('certificate')->get();
            $educations = Education::active()->ordered()->get();
            $timeline = CareerTimeline::active()->ordered()->get();
            $memberships = ProfessionalMembership::active()->ordered()->get();

            $profile->setRelation('credentials', $credentials);
            $profile->setRelation('educations', $educations);
            $profile->setRelation('timeline', $timeline);
            $profile->setRelation('memberships', $memberships);

            return (new ProfileResource($profile))->resolve();
        });

        if (!$payload) {
            return ApiResponse::notFound('Profile information is currently unavailable.');
        }

        return ApiResponse::success($payload, 'Profile retrieved successfully.');
    }

    /**
     * Get public credentials and academic qualifications.
     */
    public function credentials(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::credentialsKey($locale);

        $data = Cache::remember($cacheKey, CmsCacheService::TTL_PROFILE, function () {
            $credentials = Credential::active()->ordered()->with('certificate')->get();
            $educations = Education::active()->ordered()->get();

            return [
                'credentials' => CredentialResource::collection($credentials)->resolve(),
                'educations' => EducationResource::collection($educations)->resolve(),
            ];
        });

        return ApiResponse::success($data, 'Credentials and qualifications retrieved successfully.');
    }

    /**
     * Get public career timeline and professional memberships.
     */
    public function timeline(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::timelineKey($locale);

        $data = Cache::remember($cacheKey, CmsCacheService::TTL_PROFILE, function () {
            $timeline = CareerTimeline::active()->ordered()->get();
            $memberships = ProfessionalMembership::active()->ordered()->get();

            return [
                'timeline' => CareerTimelineResource::collection($timeline)->resolve(),
                'memberships' => ProfessionalMembershipResource::collection($memberships)->resolve(),
            ];
        });

        return ApiResponse::success($data, 'Career timeline and memberships retrieved successfully.');
    }
}

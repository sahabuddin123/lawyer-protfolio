<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateProfileRequest;
use App\Http\Resources\V1\ProfileResource;
use App\Http\Responses\ApiResponse;
use App\Models\ActivityLog;
use App\Models\Profile;
use App\Models\SeoMeta;
use App\Services\CmsCacheService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProfileController extends Controller
{
    /**
     * Display the admin profile details.
     */
    public function show(): JsonResponse
    {
        $this->authorize('edit_profile');

        $profile = Profile::with(['profilePhoto', 'courtRobesPhoto', 'signaturePhoto', 'seo'])->first();

        if (!$profile) {
            return ApiResponse::notFound('Profile not found.');
        }

        return ApiResponse::success(
            new ProfileResource($profile),
            'Profile retrieved successfully.'
        );
    }

    /**
     * Update the profile details and polymorphic SEO.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $this->authorize('edit_profile');

        $profile = Profile::first();

        if (!$profile) {
            $profile = new Profile();
        }

        $validated = $request->validated();
        if (isset($validated['long_bio'])) {
            $validated['long_bio'] = HtmlSanitizer::cleanTranslations($validated['long_bio']);
        }
        $oldValues = $profile->getOriginal();

        // Separate SEO payload
        $seoData = $validated['seo'] ?? null;
        unset($validated['seo']);

        $profile->fill($validated);
        $profile->save();

        // Update or create polymorphic SEO
        if ($seoData) {
            $seoData['seotable_type'] = Profile::class;
            $seoData['seotable_id'] = $profile->id;

            SeoMeta::updateOrCreate(
                [
                    'seotable_type' => Profile::class,
                    'seotable_id' => $profile->id,
                ],
                $seoData
            );
        }

        // Cache purge
        CmsCacheService::forgetProfile();

        // Audit Log
        ActivityLog::record(
            action: 'profile_updated',
            description: "Updated professional profile of {$profile->name['en']}",
            subject: $profile,
            oldValues: $oldValues,
            newValues: $profile->getChanges()
        );

        $profile->load(['profilePhoto', 'courtRobesPhoto', 'signaturePhoto', 'seo']);

        return ApiResponse::success(
            new ProfileResource($profile),
            'Profile updated successfully.'
        );
    }
}

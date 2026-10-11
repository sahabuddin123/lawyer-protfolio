<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\ContactFormRequest;
use App\Http\Requests\Public\ConsultationFormRequest;
use App\Http\Resources\V1\PublicContactConfigResource;
use App\Http\Responses\ApiResponse;
use App\Models\ConsultationRequest;
use App\Models\ContactMessage;
use App\Models\PracticeArea;
use App\Models\SiteSetting;
use App\Services\CmsCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicContactController extends Controller
{
    /**
     * Retrieve public contact information, office hours, map link, and published practice areas.
     */
    public function index(Request $request): JsonResponse
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::contactConfigKey($locale);

        $config = Cache::remember($cacheKey, CmsCacheService::TTL_CONTACT, function () {
            // Fetch contact and social group settings
            $settings = SiteSetting::whereIn('group', ['contact', 'social', 'general'])
                ->where('is_public', true)
                ->get()
                ->keyBy('key');

            $getVal = function (string $key, $default = null) use ($settings) {
                if (!$settings->has($key)) {
                    return $default;
                }
                $val = $settings[$key]->value;
                return is_array($val) && array_key_exists('value', $val) ? $val['value'] : $val;
            };

            // Fetch published practice areas for the dropdown
            $practiceAreas = PracticeArea::where('status', 'published')
                ->orderBy('sort_order')
                ->get(['id', 'slug', 'title'])
                ->map(function ($pa) {
                    return [
                        'id' => $pa->id,
                        'slug' => $pa->slug,
                        'title' => $pa->title,
                    ];
                });

            return [
                'office_name' => $getVal('contact_office_name', 'Chamber of Advocate Nijam Uddin'),
                'chamber_name' => $getVal('contact_chamber_name', 'Supreme Court & District Court Chamber'),
                'address' => $getVal('contact_address'),
                'city' => $getVal('contact_city', 'Dhaka & Chattogram'),
                'country' => $getVal('contact_country', 'Bangladesh'),
                'phone' => $getVal('contact_phone'),
                'email' => $getVal('contact_email'),
                'whatsapp' => $getVal('contact_whatsapp'),
                'office_hours' => $getVal('contact_office_hours'),
                'map_url' => $getVal('contact_map_url'),
                'map_embed_url' => $getVal('contact_map_embed_url'),
                'social_links' => $getVal('social_links', []),
                'practice_areas' => $practiceAreas,
            ];
        });

        return ApiResponse::success(
            new PublicContactConfigResource($config),
            'Public contact configuration retrieved successfully.'
        );
    }

    /**
     * Submit general contact inquiry form.
     */
    public function submitContact(ContactFormRequest $request): JsonResponse
    {
        // 1. Anti-abuse honeypot check
        if (!empty($request->input('_honeypot'))) {
            // Silently drop spam submission while returning success response (tarpit defense)
            return ApiResponse::success([
                'received' => true,
            ], 'Your inquiry has been received. Our office will review your message.');
        }

        // 2. Validate practice area if provided
        $practiceAreaId = $request->input('practice_area_id');
        if ($practiceAreaId) {
            $exists = PracticeArea::where('id', $practiceAreaId)
                ->where('status', 'published')
                ->exists();
            if (!$exists) {
                $practiceAreaId = null;
            }
        }

        // 3. Persist contact message
        $message = ContactMessage::create([
            'name' => strip_tags((string) $request->input('name')),
            'phone' => strip_tags((string) $request->input('phone')),
            'email' => $request->input('email') ? strip_tags((string) $request->input('email')) : null,
            'subject' => strip_tags((string) $request->input('subject')),
            'practice_area_id' => $practiceAreaId,
            'message' => strip_tags((string) $request->input('message')),
            'consent_given' => true,
            'consented_at' => now(),
            'status' => 'new',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
        ]);

        return ApiResponse::success([
            'id' => $message->id,
            'received' => true,
        ], 'Your message has been received. Our office will review your inquiry and contact you if appropriate.', 201);
    }

    /**
     * Submit formal consultation booking request.
     */
    public function submitConsultation(ConsultationFormRequest $request): JsonResponse
    {
        // 1. Anti-abuse honeypot check
        if (!empty($request->input('_honeypot'))) {
            return ApiResponse::success([
                'received' => true,
            ], 'Your consultation request has been received.');
        }

        // 2. Validate practice area if provided
        $practiceAreaId = $request->input('practice_area_id');
        if ($practiceAreaId) {
            $exists = PracticeArea::where('id', $practiceAreaId)
                ->where('status', 'published')
                ->exists();
            if (!$exists) {
                $practiceAreaId = null;
            }
        }

        // 3. Persist consultation request
        $consultation = ConsultationRequest::create([
            'name' => strip_tags((string) $request->input('name')),
            'phone' => strip_tags((string) $request->input('phone')),
            'email' => $request->input('email') ? strip_tags((string) $request->input('email')) : null,
            'subject' => strip_tags((string) $request->input('subject')),
            'practice_area_id' => $practiceAreaId,
            'preferred_date' => $request->input('preferred_date'),
            'preferred_time' => $request->input('preferred_time') ? strip_tags((string) $request->input('preferred_time')) : null,
            'message' => strip_tags((string) $request->input('message')),
            'consent_given' => true,
            'consented_at' => now(),
            'status' => 'new',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
        ]);

        return ApiResponse::success([
            'id' => $consultation->id,
            'received' => true,
        ], 'Your consultation request has been received. Our office will review the request and contact you if appropriate.', 201);
    }
}

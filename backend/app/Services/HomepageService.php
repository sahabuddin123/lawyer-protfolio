<?php

namespace App\Services;

use App\Http\Resources\V1\CourtroomExperienceResource;
use App\Http\Resources\V1\CredentialResource;
use App\Http\Resources\V1\GalleryAlbumResource;
use App\Http\Resources\V1\HomepageSectionResource;
use App\Http\Resources\V1\JudgmentReviewResource;
use App\Http\Resources\V1\LegalResearchResource;
use App\Http\Resources\V1\MediaAppearanceResource;
use App\Http\Resources\V1\MediaPressResource;
use App\Http\Resources\V1\PracticeAreaResource;
use App\Http\Resources\V1\ProfileResource;
use App\Http\Resources\V1\PublicationResource;
use App\Http\Resources\V1\SiteSettingResource;
use App\Http\Resources\V1\VideoResource;
use App\Models\CourtroomExperience;
use App\Models\Credential;
use App\Models\GalleryAlbum;
use App\Models\HomepageSection;
use App\Models\JudgmentReview;
use App\Models\LegalResearch;
use App\Models\MediaAppearance;
use App\Models\MediaPress;
use App\Models\PracticeArea;
use App\Models\Profile;
use App\Models\Publication;
use App\Models\SiteSetting;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomepageService
{
    /**
     * Retrieve aggregated, cached homepage payload.
     */
    public function getHomepageData(Request $request): array
    {
        $locale = app()->getLocale();
        $cacheKey = CmsCacheService::homeKey($locale);

        return Cache::remember($cacheKey, CmsCacheService::TTL_HOME, function () use ($request, $locale) {
            return $this->buildHomepagePayload($request, $locale);
        });
    }

    /**
     * Build the raw un-cached homepage payload.
     */
    public function buildHomepagePayload(Request $request, string $locale): array
    {
        // 1. Enabled homepage sections ordered by sort_order
        $sections = HomepageSection::enabled()
            ->ordered()
            ->get();

        $sectionsTransformed = HomepageSectionResource::collection($sections)->toArray($request);

        // Map section models by key for quick settings retrieval
        $sectionConfigs = [];
        foreach ($sections as $sec) {
            $sectionConfigs[$sec->section_key] = $sec;
        }

        // 2. Public Site Settings
        $settings = SiteSetting::where('is_public', true)->get();
        $settingsTransformed = SiteSettingResource::collection($settings)->toArray($request);

        $groupedSettings = [];
        foreach ($settingsTransformed as $st) {
            $grp = $st['group'] ?? 'general';
            $key = $st['key'];
            $groupedSettings[$grp][$key] = $st['value'];
        }

        // 3. Profile / About
        $profile = Profile::with(['profilePhoto', 'courtRobesPhoto'])
            ->where('status', 'published')
            ->first();

        $profileData = $profile
            ? (new ProfileResource($profile))->toArray($request)
            : [
                'name' => 'Advocate Nijam Uddin (Haq)',
                'title' => 'Advocate, Supreme Court of Bangladesh',
                'subtitle' => 'LL.B. (Honours), LL.M., University of Chittagong',
                'short_bio' => 'Advocate, Supreme Court of Bangladesh with extensive experience across the High Court and Appellate Divisions.',
                'chamber' => $groupedSettings['contact']['office_name'] ?? 'Supreme Court Chamber',
                'bar_council_enrollment' => 'Advocate, Supreme Court of Bangladesh',
                'high_court_enrollment' => 'Enrolled with High Court Division',
            ];

        // 4. Featured Credentials
        $credentialsLimit = ($sectionConfigs['credentials'] ?? null)?->settings['limit'] ?? 4;
        $credentials = Credential::with('certificate')
            ->active()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($credentialsLimit)
            ->get();

        $featuredCredentials = CredentialResource::collection($credentials)->toArray($request);

        // 5. Featured Practice Areas
        $practiceAreaLimit = ($sectionConfigs['practice_areas'] ?? null)?->settings['limit'] ?? 6;
        $practiceAreas = PracticeArea::with('featuredImage')
            ->published()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($practiceAreaLimit)
            ->get();

        $featuredPracticeAreas = PracticeAreaResource::collection($practiceAreas)->toArray($request);

        // 6. Featured Courtroom Experiences
        $courtroomLimit = ($sectionConfigs['courtroom'] ?? null)?->settings['limit'] ?? 3;
        $courtroom = CourtroomExperience::with(['practiceArea', 'featuredImage'])
            ->published()
            ->publicVisibility()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($courtroomLimit)
            ->get();

        $featuredCourtroom = CourtroomExperienceResource::collection($courtroom)->toArray($request);

        // 7. Featured Judgment Reviews
        $judgmentsLimit = ($sectionConfigs['judgment_reviews'] ?? null)?->settings['limit'] ?? 3;
        $judgments = JudgmentReview::with(['practiceArea', 'featuredImage'])
            ->published()
            ->publicVisibility()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($judgmentsLimit)
            ->get();

        $featuredJudgments = JudgmentReviewResource::collection($judgments)->toArray($request);

        // 8. Featured Legal Research
        $researchLimit = ($sectionConfigs['research'] ?? null)?->settings['limit'] ?? 3;
        $research = LegalResearch::with(['category', 'featuredImage'])
            ->published()
            ->publicVisibility()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($researchLimit)
            ->get();

        $featuredResearch = LegalResearchResource::collection($research)->toArray($request);

        // 9. Featured Publications
        $publicationsLimit = ($sectionConfigs['publications'] ?? null)?->settings['limit'] ?? 3;
        $publications = Publication::with(['category', 'coverImage'])
            ->published()
            ->publicVisibility()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($publicationsLimit)
            ->get();

        $featuredPublications = PublicationResource::collection($publications)->toArray($request);

        // 10. Featured Videos
        $videosLimit = ($sectionConfigs['videos'] ?? null)?->settings['limit'] ?? 3;
        $videos = Video::with(['category', 'thumbnail'])
            ->published()
            ->public()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($videosLimit)
            ->get();

        $featuredVideos = VideoResource::collection($videos)->toArray($request);

        // 11. Featured Media (Press & Electronic Appearances)
        $mediaLimit = ($sectionConfigs['media'] ?? null)?->settings['limit'] ?? 4;
        $press = MediaPress::with(['category', 'featuredImage'])
            ->published()
            ->publicVisibility()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($mediaLimit)
            ->get();

        $appearances = MediaAppearance::with(['category', 'thumbnail'])
            ->published()
            ->publicVisibility()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($mediaLimit)
            ->get();

        $pressTransformed = MediaPressResource::collection($press)->toArray($request);
        $appearancesTransformed = MediaAppearanceResource::collection($appearances)->toArray($request);

        $mergedMedia = array_slice(array_merge($pressTransformed, $appearancesTransformed), 0, $mediaLimit);

        // 12. Featured Gallery
        $galleryLimit = ($sectionConfigs['gallery'] ?? null)?->settings['limit'] ?? 6;
        $gallery = GalleryAlbum::with(['coverImage', 'category', 'publicImages.media'])
            ->published()
            ->public()
            ->orderByDesc('is_featured')
            ->ordered()
            ->limit($galleryLimit)
            ->get();

        $featuredGallery = GalleryAlbumResource::collection($gallery)->toArray($request);

        // 13. Consultation / Contact CTA Summary
        $consultationCta = [
            'title' => $sectionConfigs['consultation_cta']?->title ?? ['en' => 'Schedule a Chamber Consultation', 'bn' => 'চেম্বার পরামর্শের সময় নির্ধারণ করুন'],
            'subtitle' => $sectionConfigs['consultation_cta']?->subtitle ?? ['en' => 'Strictly Confidential In-Person or Digital Legal Assessment', 'bn' => 'সম্পূর্ণ গোপনীয়তার সাথে চেম্বার অথবা অনলাইন আইনি মূল্যায়ন'],
            'content' => $sectionConfigs['consultation_cta']?->content ?? ['en' => 'Initiate a structured legal review of your constitutional, commercial, or appellate dispute.', 'bn' => 'আপনার জটিল আইনি ও সাংবিধানিক বিরোধের ক্ষেত্রে যথাযথ পরামর্শের জন্য চেম্বার বুকিং দিন।'],
            'cta_url' => '/contact',
            'phone' => $groupedSettings['contact']['phone'] ?? null,
            'email' => $groupedSettings['contact']['email'] ?? null,
            'whatsapp' => $groupedSettings['contact']['whatsapp'] ?? null,
            'office_hours' => $groupedSettings['contact']['office_hours'] ?? null,
        ];

        // 14. SEO Metadata & Schema.org JSON-LD
        $siteName = $groupedSettings['general']['site_name'] ?? 'Advocate Nijam Uddin (Haq)';
        $siteTitle = $locale === 'bn'
            ? 'এডভোকেট নিজাম উদ্দিন (হক) — বাংলাদেশ সুপ্রিম কোর্ট'
            : 'Advocate Nijam Uddin (Haq) — Supreme Court of Bangladesh';
        $siteDesc = $groupedSettings['seo']['default_meta_description'] 
            ?? $groupedSettings['general']['site_description'] 
            ?? 'Official legal authority platform of Advocate Nijam Uddin (Haq), Supreme Court of Bangladesh.';
        $canonicalUrl = rtrim(config('app.url', 'http://localhost:8000'), '/') . '/';

        $structuredData = [
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'Person',
                    '@id' => $canonicalUrl . '#person',
                    'name' => 'Advocate Nijam Uddin (Haq)',
                    'jobTitle' => 'Advocate, Supreme Court of Bangladesh',
                    'worksFor' => [
                        '@id' => $canonicalUrl . '#chambers',
                    ],
                    'alumnusOf' => [
                        [
                            '@type' => 'EducationalOrganization',
                            'name' => 'University of Chittagong',
                            'department' => 'Faculty of Law',
                        ],
                    ],
                    'memberOf' => [
                        [
                            '@type' => 'Organization',
                            'name' => 'Bangladesh Bar Council',
                        ],
                        [
                            '@type' => 'Organization',
                            'name' => 'Supreme Court Bar Association',
                        ],
                    ],
                    'knowsAbout' => [
                        'Constitutional Law',
                        'Appellate Litigation',
                        'Civil Jurisprudence',
                        'Corporate Law',
                    ],
                    'url' => $canonicalUrl,
                ],
                [
                    '@type' => 'LegalService',
                    '@id' => $canonicalUrl . '#chambers',
                    'name' => 'Chambers of Advocate Nijam Uddin',
                    'telephone' => $groupedSettings['contact']['phone'] ?? '+8801819382194',
                    'email' => $groupedSettings['contact']['email'] ?? 'contact@nijamuddin.com',
                    'url' => $canonicalUrl,
                    'address' => [
                        '@type' => 'PostalAddress',
                        'streetAddress' => $groupedSettings['contact']['chambers_address'] ?? 'Supreme Court Bar Association Building, Shahbagh',
                        'addressLocality' => 'Dhaka',
                        'addressCountry' => 'BD',
                    ],
                ],
                [
                    '@type' => 'WebSite',
                    '@id' => $canonicalUrl . '#website',
                    'url' => $canonicalUrl,
                    'name' => $siteName,
                    'publisher' => [
                        '@id' => $canonicalUrl . '#person',
                    ],
                ],
            ],
        ];

        $seo = [
            'meta_title' => $siteTitle,
            'meta_description' => $siteDesc,
            'canonical_url' => $canonicalUrl,
            'og_title' => $siteTitle,
            'og_description' => $siteDesc,
            'og_type' => 'website',
            'schema' => $structuredData,
        ];

            return [
                // Standard snake_case contract matching Phase 5 & 04_API_SPEC.md
                'sections' => $sectionsTransformed,
                'site_settings' => $groupedSettings,
                'profile' => $profileData,
                'featured_credentials' => $featuredCredentials,
                'featured_practice_areas' => $featuredPracticeAreas,
                'practice_areas' => $featuredPracticeAreas,
                'featured_courtroom' => $featuredCourtroom,
                'featured_judgments' => $featuredJudgments,
                'judgment_reviews' => $featuredJudgments,
                'featured_research' => $featuredResearch,
                'featured_publications' => $featuredPublications,
                'featured_videos' => $featuredVideos,
                'featured_media' => $mergedMedia,
                'featured_press' => $pressTransformed,
                'featured_appearances' => $appearancesTransformed,
                'featured_gallery' => $featuredGallery,
                'consultation_cta' => $consultationCta,
                'seo' => $seo,
                'structured_data' => $structuredData,

                // CamelCase aliases matching Requirement 26
                'settings' => $groupedSettings,
                'hero' => isset($sectionConfigs['hero']) ? (new HomepageSectionResource($sectionConfigs['hero']))->toArray($request) : null,
                'credentials' => $featuredCredentials,
                'about' => $profileData,
                'practiceAreas' => $featuredPracticeAreas,
                'courtroom' => $featuredCourtroom,
                'judgmentReviews' => $featuredJudgments,
                'research' => $featuredResearch,
                'publications' => $featuredPublications,
                'videos' => $featuredVideos,
                'media' => $mergedMedia,
                'gallery' => $featuredGallery,
                'consultationCta' => $consultationCta,
            ];
    }
}

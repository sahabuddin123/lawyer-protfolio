<?php

namespace Database\Seeders;

use App\Models\HomepageSection;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\SeoMeta;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class CmsAndSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds for Phase 5 CMS & Site Settings.
     */
    public function run(): void
    {
        // 1. Seed Site Settings
        $settings = [
            // General
            [
                'key' => 'site_name',
                'group' => 'general',
                'is_public' => true,
                'value' => [
                    'en' => 'Advocate Nijam Uddin',
                    'bn' => 'এডভোকেট নিজাম উদ্দিন',
                ],
            ],
            [
                'key' => 'site_title',
                'group' => 'general',
                'is_public' => true,
                'value' => [
                    'en' => 'Advocate Nijam Uddin (Haq) — Supreme Court of Bangladesh',
                    'bn' => 'এডভোকেট নিজাম উদ্দিন (হক) — বাংলাদেশ সুপ্রিম কোর্ট',
                ],
            ],
            [
                'key' => 'short_description',
                'group' => 'general',
                'is_public' => true,
                'value' => [
                    'en' => 'Advocate, Supreme Court of Bangladesh. Dedicated to constitutional integrity, judicial excellence, and the rule of law.',
                    'bn' => 'এডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট। সংবিধানের অখণ্ডতা, বিচারিক উৎকর্ষ এবং আইনের শাসনের প্রতি নিবেদিতপ্রাণ।',
                ],
            ],
            [
                'key' => 'default_language',
                'group' => 'general',
                'is_public' => true,
                'value' => ['value' => 'en'],
            ],
            [
                'key' => 'supported_languages',
                'group' => 'general',
                'is_public' => true,
                'value' => ['value' => ['en', 'bn']],
            ],
            [
                'key' => 'timezone',
                'group' => 'general',
                'is_public' => true,
                'value' => ['value' => 'Asia/Dhaka'],
            ],
            [
                'key' => 'website_status',
                'group' => 'general',
                'is_public' => true,
                'value' => ['value' => 'online'],
            ],
            [
                'key' => 'maintenance_mode',
                'group' => 'general',
                'is_public' => true,
                'value' => ['value' => false],
            ],
            [
                'key' => 'copyright_text',
                'group' => 'general',
                'is_public' => true,
                'value' => [
                    'en' => '© 2026 Advocate Nijam Uddin (Haq). All rights reserved.',
                    'bn' => '© ২০২৬ এডভোকেট নিজাম উদ্দিন (হক)। সর্বস্বত্ব সংরক্ষিত।',
                ],
            ],

            // Branding
            [
                'key' => 'primary_logo',
                'group' => 'branding',
                'is_public' => true,
                'value' => ['value' => null],
            ],
            [
                'key' => 'alternate_logo',
                'group' => 'branding',
                'is_public' => true,
                'value' => ['value' => null],
            ],
            [
                'key' => 'favicon',
                'group' => 'branding',
                'is_public' => true,
                'value' => ['value' => null],
            ],
            [
                'key' => 'dark_logo',
                'group' => 'branding',
                'is_public' => true,
                'value' => ['value' => null],
            ],
            [
                'key' => 'light_logo',
                'group' => 'branding',
                'is_public' => true,
                'value' => ['value' => null],
            ],
            [
                'key' => 'default_og_image',
                'group' => 'branding',
                'is_public' => true,
                'value' => ['value' => null],
            ],

            // Contact & Office
            [
                'key' => 'office_name',
                'group' => 'contact',
                'is_public' => true,
                'value' => [
                    'en' => 'Supreme Court Chamber',
                    'bn' => 'সুপ্রিম কোর্ট চেম্বার',
                ],
            ],
            [
                'key' => 'address',
                'group' => 'contact',
                'is_public' => true,
                'value' => [
                    'en' => 'Room 402, Supreme Court Bar Association Building, Dhaka-1000, Bangladesh',
                    'bn' => 'কক্ষ ৪০২, সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন ভবন, ঢাকা-১০০০, বাংলাদেশ',
                ],
            ],
            [
                'key' => 'phone',
                'group' => 'contact',
                'is_public' => true,
                'value' => ['value' => '+8801700000000'],
            ],
            [
                'key' => 'email',
                'group' => 'contact',
                'is_public' => true,
                'value' => ['value' => 'chamber@nijamuddin.com'],
            ],
            [
                'key' => 'whatsapp',
                'group' => 'contact',
                'is_public' => true,
                'value' => ['value' => '+8801700000000'],
            ],
            [
                'key' => 'business_hours',
                'group' => 'contact',
                'is_public' => true,
                'value' => [
                    'en' => 'Sunday – Thursday: 9:00 AM – 7:00 PM',
                    'bn' => 'রবিবার – বৃহস্পতিবার: সকাল ৯:০০ – সন্ধ্যা ৭:০০',
                ],
            ],
            [
                'key' => 'google_maps_url',
                'group' => 'contact',
                'is_public' => true,
                'value' => ['value' => 'https://maps.google.com'],
            ],
            [
                'key' => 'emergency_note',
                'group' => 'contact',
                'is_public' => true,
                'value' => [
                    'en' => 'For urgent legal bail and writ matters, please contact chamber mobile.',
                    'bn' => 'জরুরী জামিন এবং রিট সংক্রান্ত বিষয়ে চেম্বার মোবাইলে যোগাযোগ করুন।',
                ],
            ],

            // Social
            [
                'key' => 'facebook',
                'group' => 'social',
                'is_public' => true,
                'value' => ['value' => 'https://facebook.com'],
            ],
            [
                'key' => 'youtube',
                'group' => 'social',
                'is_public' => true,
                'value' => ['value' => 'https://youtube.com'],
            ],
            [
                'key' => 'linkedin',
                'group' => 'social',
                'is_public' => true,
                'value' => ['value' => 'https://linkedin.com'],
            ],
            [
                'key' => 'twitter',
                'group' => 'social',
                'is_public' => true,
                'value' => ['value' => 'https://x.com'],
            ],

            // SEO
            [
                'key' => 'default_title',
                'group' => 'seo',
                'is_public' => true,
                'value' => [
                    'en' => 'Advocate Nijam Uddin (Haq) | Supreme Court of Bangladesh',
                    'bn' => 'এডভোকেট নিজাম উদ্দিন (হক) | বাংলাদেশ সুপ্রিম কোর্ট',
                ],
            ],
            [
                'key' => 'title_suffix',
                'group' => 'seo',
                'is_public' => true,
                'value' => [
                    'en' => ' | Advocate Nijam Uddin',
                    'bn' => ' | এডভোকেট নিজাম উদ্দিন',
                ],
            ],
            [
                'key' => 'default_description',
                'group' => 'seo',
                'is_public' => true,
                'value' => [
                    'en' => 'Official legal authority platform of Advocate Nijam Uddin (Haq), Supreme Court of Bangladesh. Constitutional, Corporate, Writ, and Appellate Practice.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্টের আইনজীবী এডভোকেট নিজাম উদ্দিন (হক)-এর প্রাতিষ্ঠানিক প্ল্যাটফর্ম।',
                ],
            ],
            [
                'key' => 'default_keywords',
                'group' => 'seo',
                'is_public' => true,
                'value' => ['value' => 'Advocate Nijam Uddin, Supreme Court of Bangladesh, Constitutional Lawyer, Writ Specialist, Dhaka Bar, Legal Counsel'],
            ],
            [
                'key' => 'robots_default',
                'group' => 'seo',
                'is_public' => true,
                'value' => ['value' => 'index, follow'],
            ],
            [
                'key' => 'canonical_domain',
                'group' => 'seo',
                'is_public' => true,
                'value' => ['value' => 'https://nijamuddin.com'],
            ],

            // Localization
            [
                'key' => 'default_locale',
                'group' => 'localization',
                'is_public' => true,
                'value' => ['value' => 'en'],
            ],
            [
                'key' => 'fallback_locale',
                'group' => 'localization',
                'is_public' => true,
                'value' => ['value' => 'en'],
            ],

            // System (internal)
            [
                'key' => 'cache_enabled',
                'group' => 'system',
                'is_public' => false,
                'value' => ['value' => true],
            ],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                [
                    'group' => $setting['group'],
                    'is_public' => $setting['is_public'],
                    'value' => $setting['value'],
                ]
            );
        }

        // 2. Seed Homepage Sections
        $sections = [
            [
                'section_key' => 'hero',
                'title' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'এডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'subtitle' => [
                    'en' => 'Advocate, Supreme Court of Bangladesh',
                    'bn' => 'আইনজীবী, বাংলাদেশ সুপ্রিম কোর্ট',
                ],
                'content' => [
                    'en' => 'Committed to Constitutional Justice, Judicial Rigor, and Uncompromising Legal Advocacy.',
                    'bn' => 'সংবিধানের সুবিচার, বিচারিক নিষ্ঠা এবং আপসহীন আইনি প্রতিনিধিত্বে নিবেদিতপ্রাণ।',
                ],
                'settings' => [
                    'show_cta' => true,
                    'cta_label' => ['en' => 'Request Consultation', 'bn' => 'পরামর্শের আবেদন'],
                    'cta_url' => '/consultation',
                    'secondary_cta_label' => ['en' => 'Explore Practice Areas', 'bn' => 'আইনি ক্ষেত্রসমূহ'],
                    'secondary_cta_url' => '/practice-areas',
                ],
                'sort_order' => 1,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'credentials',
                'title' => [
                    'en' => 'Credentials & Institutional Standing',
                    'bn' => 'সনদ ও প্রাতিষ্ঠানিক মর্যাদা',
                ],
                'subtitle' => [
                    'en' => 'Supreme Court Bar Association & Bangladesh Bar Council Enrollment',
                    'bn' => 'সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন ও বাংলাদেশ বার কাউন্সিল অন্তর্ভুক্তি',
                ],
                'content' => [
                    'en' => 'A comprehensive record of judicial enrollment, academic standing, and distinguished bar admissions.',
                    'bn' => 'বিচারিক অন্তর্ভুক্তি, উচ্চতর শিক্ষাগত মান এবং বার কাউন্সিলের প্রাতিষ্ঠানিক স্বীকৃতির বিবরণ।',
                ],
                'settings' => ['layout' => 'grid', 'limit' => 4],
                'sort_order' => 2,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'about_preview',
                'title' => [
                    'en' => 'Judicial Philosophy & Chambers',
                    'bn' => 'বিচারিক দর্শন ও চেম্বার',
                ],
                'subtitle' => [
                    'en' => 'Dedicated Legal Counsel with an Unblemished Professional Ethos',
                    'bn' => 'অনবদ্য পেশাগত নীতিবোধ এবং দায়িত্বশীল আইনি প্রতিনিধিত্ব',
                ],
                'content' => [
                    'en' => 'Rooted in deep jurisprudence and procedural precision, the chamber provides comprehensive representation across constitutional, appellate, and civil jurisdictions.',
                    'bn' => 'আইনশাস্ত্রের গভীর অনুধাবন এবং কার্যবিধির সূক্ষ্মতার ওপর ভিত্তি করে সংবিধান, আপিল ও দেওয়ানি বিরোধে বিশ্বস্ত আইনি সেবা।',
                ],
                'settings' => [
                    'cta_label' => ['en' => 'Read Full Profile', 'bn' => 'সম্পূর্ণ পরিচয় পড়ুন'],
                    'cta_url' => '/about',
                ],
                'sort_order' => 3,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'practice_areas',
                'title' => [
                    'en' => 'Core Practice Areas',
                    'bn' => 'প্রধান আইনি কর্মক্ষেত্র',
                ],
                'subtitle' => [
                    'en' => 'Constitutional, Corporate, Banking, Criminal, and Appellate Jurisdictions',
                    'bn' => 'সংবিধান, করপোরেট, ব্যাংকিং, ফৌজদারি ও আপিল অধিক্ষেত্র',
                ],
                'content' => [
                    'en' => 'Specialized advocacy across high-stakes constitutional litigations, regulatory compliance, and appellate disputes.',
                    'bn' => 'সাংবিধানিক রিট, করপোরেট আইন ও সুপ্রিম কোর্টের আপিল বিভাগে বিশেষায়িত আইনি প্রতিনিধিত্ব।',
                ],
                'settings' => ['limit' => 6, 'show_icons' => true],
                'sort_order' => 4,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'courtroom',
                'title' => [
                    'en' => 'Courtroom Experience & Landmark Precedents',
                    'bn' => 'আদালতের অভিজ্ঞতা ও তাৎপর্যপূর্ণ নজির',
                ],
                'subtitle' => [
                    'en' => 'Appellate Division & High Court Division Appearances',
                    'bn' => 'আপিল বিভাগ ও হাইকোর্ট বিভাগের শুনানির রেকর্ড',
                ],
                'content' => [
                    'en' => 'Select public case briefings, constitutional arguments, and landmark judicial pronouncements.',
                    'bn' => 'জনস্বার্থে পরিচালিত রিট এবং সুপ্রিম কোর্টের বিভিন্ন বেঞ্চে প্রতিষ্ঠিত গুরুত্বপূর্ণ নজিরসমূহ।',
                ],
                'settings' => ['limit' => 3],
                'sort_order' => 5,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'judgment_reviews',
                'title' => [
                    'en' => 'Landmark Judgment Reviews',
                    'bn' => 'তাৎপর্যপূর্ণ রায় বিশ্লেষণ',
                ],
                'subtitle' => [
                    'en' => 'Analytical Insights into Leading Supreme Court Decisions',
                    'bn' => 'সুপ্রিম কোর্টের যুগান্তকারী রায়ের প্রাতিষ্ঠানিক আইনি পর্যালোচনা',
                ],
                'content' => [
                    'en' => 'In-depth scholarly briefings examining the ratio decidendi and statutory implications of pivotal judgments.',
                    'bn' => 'গুরুত্বপূর্ণ রায়ের অন্তর্নিহিত নীতি এবং সংবিধিবদ্ধ আইনের তাৎপর্যের বিশদ বিশ্লেষণ।',
                ],
                'settings' => ['limit' => 3],
                'sort_order' => 6,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'research',
                'title' => [
                    'en' => 'Legal Research & Papers',
                    'bn' => 'আইনি গবেষণা ও নিবন্ধ',
                ],
                'subtitle' => [
                    'en' => 'Scholarly Treatises on Constitutional Jurisprudence & Legal Reform',
                    'bn' => 'সাংবিধানিক আইন ও বিচারিক সংস্কার বিষয়ক উচ্চমার্গীয় গবেষণাপত্র',
                ],
                'content' => [
                    'en' => 'Peer-reviewed research and scholarly commentary on contemporary judicial challenges in Bangladesh.',
                    'bn' => 'বাংলাদেশের আইন ব্যবস্থার সমসাময়িক প্রেক্ষাপট ও সমাধানভিত্তিক গবেষণাকর্ম।',
                ],
                'settings' => ['limit' => 3],
                'sort_order' => 7,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'publications',
                'title' => [
                    'en' => 'Books & Publications',
                    'bn' => 'গ্রন্থ ও প্রকাশনা',
                ],
                'subtitle' => [
                    'en' => 'Authored Legal Books, Law Review Articles, and Treatises',
                    'bn' => 'প্রণীত আইনি গ্রন্থ ও প্রামাণ্য গবেষণা সংকলন',
                ],
                'content' => [
                    'en' => 'Published legal volumes providing authoritative guidance for jurists, advocates, and researchers.',
                    'bn' => 'আইনজীবী ও গবেষকদের রেফারেন্স উপযোগী প্রামাণ্য আইনি প্রকাশনাসমূহ।',
                ],
                'settings' => ['limit' => 3],
                'sort_order' => 8,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'videos',
                'title' => [
                    'en' => 'Legal Discussions & Lectures',
                    'bn' => 'আইনি আলোচনা ও বক্তব্য',
                ],
                'subtitle' => [
                    'en' => 'Television Appearances, Keynote Addresses, and Academic Discourses',
                    'bn' => 'টেলিভিশন আইনবিষয়ক আলোচনা ও জাতীয় সেমিনারের প্রামাণ্য ভিডিও',
                ],
                'content' => [
                    'en' => 'Recorded addresses, constitutional discussions, and judicial analyses on national media.',
                    'bn' => 'আইন সচেতনতা ও জটিল আইনি বিষয়ের প্রাতিষ্ঠানিক ভিডিও সংকলন।',
                ],
                'settings' => ['limit' => 3],
                'sort_order' => 9,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'media',
                'title' => [
                    'en' => 'Media & Press Coverage',
                    'bn' => 'গণমাধ্যম ও প্রেস কভারেজ',
                ],
                'subtitle' => [
                    'en' => 'National Broadsheet Features & Judicial Opinions in Print',
                    'bn' => 'জাতীয় দৈনিক পত্রিকা ও মূলধারার গণমাধ্যমে প্রকাশিত মতামত',
                ],
                'content' => [
                    'en' => 'Reportage, legal analysis, and commentary published in leading daily publications.',
                    'bn' => 'শীর্ষস্থানীয় সংবাদপত্রে প্রকাশিত আইনি অভিমত ও ফিচারসমূহ।',
                ],
                'settings' => ['limit' => 4],
                'sort_order' => 10,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'gallery',
                'title' => [
                    'en' => 'Judicial & Chamber Gallery',
                    'bn' => 'বিচারিক ও চেম্বার ফটো গ্যালারি',
                ],
                'subtitle' => [
                    'en' => 'Moments from the Bar Association, International Conferences, and Chamber Life',
                    'bn' => 'বার অ্যাসোসিয়েশন, আন্তর্জাতিক সম্মেলন ও চেম্বার জীবনের স্থিরচিত্র',
                ],
                'content' => [
                    'en' => 'A curated photographic archive of ceremonial events, academic symposia, and legal delegations.',
                    'bn' => 'আইন অঙ্গনের গুরুত্বপূর্ণ স্মৃতি ও প্রাতিষ্ঠানিক কার্যক্রমের আলোকচিত্র।',
                ],
                'settings' => ['limit' => 6],
                'sort_order' => 11,
                'is_enabled' => true,
            ],
            [
                'section_key' => 'consultation_cta',
                'title' => [
                    'en' => 'Schedule a Chamber Consultation',
                    'bn' => 'চেম্বার পরামর্শের সময় নির্ধারণ করুন',
                ],
                'subtitle' => [
                    'en' => 'Strictly Confidential In-Person or Digital Legal Assessment',
                    'bn' => 'সম্পূর্ণ গোপনীয়তার সাথে চেম্বার অথবা অনলাইন আইনি মূল্যায়ন',
                ],
                'content' => [
                    'en' => 'Initiate a structured legal review of your constitutional, commercial, or appellate dispute.',
                    'bn' => 'আপনার জটিল আইনি ও সাংবিধানিক বিরোধের ক্ষেত্রে যথাযথ পরামর্শের জন্য চেম্বার বুকিং দিন।',
                ],
                'settings' => [
                    'cta_label' => ['en' => 'Book Appointment', 'bn' => 'অ্যাপয়েন্টমেন্ট নিন'],
                    'cta_url' => '/consultation',
                ],
                'sort_order' => 12,
                'is_enabled' => true,
            ],
        ];

        foreach ($sections as $sec) {
            HomepageSection::updateOrCreate(
                ['section_key' => $sec['section_key']],
                $sec
            );
        }

        // 3. Seed Menus & Menu Items
        $menus = [
            [
                'location' => 'header',
                'title' => 'Primary Navigation',
                'items' => [
                    ['title' => ['en' => 'About', 'bn' => 'পরিচয়'], 'url' => '/about', 'target' => '_self', 'sort_order' => 1],
                    ['title' => ['en' => 'Practice Areas', 'bn' => 'আইনি ক্ষেত্র'], 'url' => '/practice-areas', 'target' => '_self', 'sort_order' => 2],
                    ['title' => ['en' => 'Courtroom', 'bn' => 'আদালত'], 'url' => '/courtroom', 'target' => '_self', 'sort_order' => 3],
                    ['title' => ['en' => 'Research & Judgments', 'bn' => 'গবেষণা ও রায়'], 'url' => '/research', 'target' => '_self', 'sort_order' => 4],
                    ['title' => ['en' => 'Media', 'bn' => 'মিডিয়া'], 'url' => '/media', 'target' => '_self', 'sort_order' => 5],
                    ['title' => ['en' => 'Contact', 'bn' => 'যোগাযোগ'], 'url' => '/contact', 'target' => '_self', 'sort_order' => 6],
                ],
            ],
            [
                'location' => 'footer',
                'title' => 'Footer Navigation',
                'items' => [
                    ['title' => ['en' => 'About Chamber', 'bn' => 'চেম্বার পরিচিতি'], 'url' => '/about', 'target' => '_self', 'sort_order' => 1],
                    ['title' => ['en' => 'Practice Areas', 'bn' => 'আইনি কর্মক্ষেত্র'], 'url' => '/practice-areas', 'target' => '_self', 'sort_order' => 2],
                    ['title' => ['en' => 'Legal Research', 'bn' => 'আইনি গবেষণা'], 'url' => '/research', 'target' => '_self', 'sort_order' => 3],
                    ['title' => ['en' => 'Consultations', 'bn' => 'পরামর্শ বুকিং'], 'url' => '/consultation', 'target' => '_self', 'sort_order' => 4],
                ],
            ],
            [
                'location' => 'legal',
                'title' => 'Legal & Policies',
                'items' => [
                    ['title' => ['en' => 'Disclaimer', 'bn' => 'ডিসক্লেইমার'], 'url' => '/disclaimer', 'target' => '_self', 'sort_order' => 1],
                    ['title' => ['en' => 'Privacy Policy', 'bn' => 'গোপনীয়তা নীতি'], 'url' => '/privacy-policy', 'target' => '_self', 'sort_order' => 2],
                    ['title' => ['en' => 'Terms of Engagement', 'bn' => 'ব্যবহারের শর্তাবলী'], 'url' => '/terms', 'target' => '_self', 'sort_order' => 3],
                ],
            ],
        ];

        foreach ($menus as $m) {
            $menu = Menu::updateOrCreate(
                ['location' => $m['location']],
                ['title' => $m['title']]
            );

            // Re-seed top items
            MenuItem::where('menu_id', $menu->id)->delete();
            foreach ($m['items'] as $item) {
                MenuItem::create([
                    'menu_id' => $menu->id,
                    'title' => $item['title'],
                    'url' => $item['url'],
                    'target' => $item['target'],
                    'sort_order' => $item['sort_order'],
                ]);
            }
        }

        // 4. Seed Static Pages
        $pages = [
            [
                'slug' => 'about',
                'title' => [
                    'en' => 'About Advocate Nijam Uddin',
                    'bn' => 'এডভোকেট নিজাম উদ্দিন সম্পর্কে',
                ],
                'content' => [
                    'en' => '<p>Advocate Nijam Uddin (Haq) is an esteemed legal practitioner practicing primarily before the Supreme Court of Bangladesh.</p><p>With extensive experience spanning the High Court Division and Appellate Division, Advocate Nijam Uddin provides rigorous representation in constitutional, corporate, and public law matters.</p>',
                    'bn' => '<p>এডভোকেট নিজাম উদ্দিন (হক) বাংলাদেশ সুপ্রিম কোর্টের একজন বিশিষ্ট আইনজীবী।</p><p>হাইকোর্ট বিভাগ ও আপিল বিভাগে দীর্ঘদিনের কাজের অভিজ্ঞতায় তিনি সংবিধান, করপোরেট ও জনস্বার্থ মামলায় নিষ্ঠার সাথে আইনি দায়িত্ব পালন করে আসছেন।</p>',
                ],
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'slug' => 'disclaimer',
                'title' => [
                    'en' => 'Legal Disclaimer & Regulatory Notice',
                    'bn' => 'আইনি নোটিশ ও ডিসক্লেইমার',
                ],
                'content' => [
                    'en' => '<p>This website is developed in strict accordance with the Bangladesh Bar Council Canons of Professional Conduct and Etiquette. The material contained on this website is provided solely for informational and educational purposes.</p><p>It does not constitute legal advertising, solicitation, or legal advice. Transmission or receipt of information does not create an advocate-client relationship.</p>',
                    'bn' => '<p>এই ওয়েবসাইটটি বাংলাদেশ বার কাউন্সিলের আচরণবিধি কঠোরভাবে অনুসরণ করে তথ্য ও শিক্ষামূলক উদ্দেশ্যে নির্মিত হয়েছে।</p><p>এটি কোনো ধরনের বিজ্ঞাপন, প্রত্যক্ষ প্রচার বা সরাসরি আইনি পরামর্শ হিসেবে গণ্য হবে না। তথ্য প্রাপ্তির মাধ্যমে কোনো আইনজীবী-মক্কেল সম্পর্ক সৃষ্টি হয় না।</p>',
                ],
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'slug' => 'privacy-policy',
                'title' => [
                    'en' => 'Privacy Policy',
                    'bn' => 'গোপনীয়তা নীতি',
                ],
                'content' => [
                    'en' => '<p>We are dedicated to safeguarding client confidentiality and personal data in full compliance with Bangladesh law and international privacy standards.</p><p>Any details provided through consultation requests or correspondence remain strictly privileged and protected by professional legal ethics.</p>',
                    'bn' => '<p>আমরা মক্কেলের তথ্যের সর্বোচ্চ গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ।</p><p>পরামর্শের আবেদন বা বার্তার মাধ্যমে প্রাপ্ত সকল তথ্য আইনজীবী-মক্কেল বিশেষাধিকার (Attorney-Client Privilege) অনুসারে সংরক্ষিত থাকে।</p>',
                ],
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'slug' => 'terms',
                'title' => [
                    'en' => 'Terms of Engagement',
                    'bn' => 'ব্যবহারের শর্তাবলী',
                ],
                'content' => [
                    'en' => '<p>Engagement of legal services requires a formal vakalatnama or retainer agreement duly executed with the chamber of Advocate Nijam Uddin.</p><p>All digital interactions are subject to chamber verification and preliminary conflict-of-interest screening.</p>',
                    'bn' => '<p>আইনি প্রতিনিধিত্বের জন্য চেম্বারের সাথে যথাযথ চুক্তি বা ওকালতনামা সম্পাদন আবশ্যক।</p><p>সকল ডিজিটাল যোগাযোগ চেম্বারের প্রাথমিক যাচাই ও স্বার্থের সংঘাত (Conflict of Interest) পরীক্ষার অধীন।</p>',
                ],
                'status' => 'published',
                'published_at' => now(),
            ],
        ];

        foreach ($pages as $p) {
            $page = Page::updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'title' => $p['title'],
                    'content' => $p['content'],
                    'status' => $p['status'],
                    'published_at' => $p['published_at'],
                ]
            );

            // Reusable SEO Meta for each page
            SeoMeta::updateOrCreate(
                ['seotable_type' => Page::class, 'seotable_id' => $page->id],
                [
                    'seo_title' => $p['title'],
                    'meta_description' => [
                        'en' => mb_substr(strip_tags($p['content']['en']), 0, 150),
                        'bn' => mb_substr(strip_tags($p['content']['bn']), 0, 150),
                    ],
                    'canonical_url' => "https://nijamuddin.com/{$p['slug']}",
                    'robots' => 'index, follow',
                ]
            );
        }
    }
}

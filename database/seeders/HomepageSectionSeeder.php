<?php

namespace Database\Seeders;

use App\Models\HomepageSection;
use App\Models\SiteSetting;
use App\Services\CmsCacheService;
use Illuminate\Database\Seeder;

class HomepageSectionSeeder extends Seeder
{
    /**
     * Run the database seeds for approved homepage sections.
     * Strictly idempotent: uses firstOrCreate to never overwrite administrator edits.
     */
    public function run(): void
    {
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
                    'en' => 'Committed to constitutional justice, judicial rigor, and principled legal advocacy before the Supreme Court of Bangladesh. Providing comprehensive legal representation and strategic counsel across constitutional writ petitions, civil litigation, property disputes, and corporate advisory with unwavering ethical integrity.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্টে সাংবিধানিক সুবিচার, বিচারিক নিষ্ঠা এবং নীতিবান আইনি প্রতিনিধিত্বে নিবেদিতপ্রাণ। সততা, গভীর প্রস্তুতি এবং পেশাগত দায়বদ্ধতার সাথে সাংবিধানিক রিট আবেদন, দেওয়ানি ও ফৌজদারি মামলা পরিচালনা, ভূমির স্বত্ব দলিল যাচাই এবং কর্পোরেট বিষয়ে নির্ভরযোগ্য আইনি সেবা প্রদান।',
                ],
                'settings' => [
                    'show_cta' => true,
                    'cta_label' => ['en' => 'Request Consultation', 'bn' => 'পরামর্শের আবেদন'],
                    'cta_url' => '/contact',
                    'secondary_cta_label' => ['en' => 'Explore Practice Areas', 'bn' => 'আইনি ক্ষেত্রসমূহ'],
                    'secondary_cta_url' => '/practice-areas',
                ],
                'sort_order' => 1,
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
                'sort_order' => 2,
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
                'settings' => [
                    'layout' => 'grid',
                    'limit' => 4,
                    'cta_label' => ['en' => 'View Full Profile', 'bn' => 'সম্পূর্ণ প্রোফাইল দেখুন'],
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
                'settings' => [
                    'limit' => 6,
                    'show_icons' => true,
                    'cta_label' => ['en' => 'View All Practice Areas', 'bn' => 'সকল প্র্যাকটিস এরিয়া দেখুন'],
                    'cta_url' => '/practice-areas',
                ],
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
                'settings' => [
                    'limit' => 3,
                    'cta_label' => ['en' => 'View Courtroom Records', 'bn' => 'মামলার বিবরণ দেখুন'],
                    'cta_url' => '/courtroom',
                ],
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
                'settings' => [
                    'limit' => 3,
                    'cta_label' => ['en' => 'View All Judgments', 'bn' => 'সকল রায় বিশ্লেষণ দেখুন'],
                    'cta_url' => '/judgments',
                ],
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
                'settings' => [
                    'limit' => 3,
                    'cta_label' => ['en' => 'View All Research', 'bn' => 'সকল গবেষণাপত্র দেখুন'],
                    'cta_url' => '/research',
                ],
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
                'settings' => [
                    'limit' => 3,
                    'cta_label' => ['en' => 'View All Publications', 'bn' => 'সকল প্রকাশনা দেখুন'],
                    'cta_url' => '/publications',
                ],
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
                'settings' => [
                    'limit' => 3,
                    'cta_label' => ['en' => 'View All Videos', 'bn' => 'সকল ভিডিও দেখুন'],
                    'cta_url' => '/videos',
                ],
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
                'settings' => [
                    'limit' => 4,
                    'cta_label' => ['en' => 'View All Media', 'bn' => 'সকল মিডিয়া কভারেজ দেখুন'],
                    'cta_url' => '/media',
                ],
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
                'settings' => [
                    'limit' => 6,
                    'cta_label' => ['en' => 'View Full Gallery', 'bn' => 'সকল ছবি দেখুন'],
                    'cta_url' => '/gallery',
                ],
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
                    'en' => 'Supreme Court Chambers — High Court Division',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট — চেম্বার সম্মেলন',
                ],
                'content' => [
                    'en' => 'Direct conference with Advocate Nijam Uddin (Haq) for constitutional writs, appellate litigation, and corporate counsel.',
                    'bn' => 'সাংবিধানিক রিট, সুপ্রিম কোর্ট আপিল ও কর্পোরেট আইনি বিষয়ে সরাসরি চেম্বার সম্মেলনের জন্য যোগাযোগ করুন।',
                ],
                'settings' => [
                    'cta_label' => ['en' => 'Book Consultation', 'bn' => 'পরামর্শ বুক করুন'],
                    'cta_url' => '/contact',
                    'secondary_cta_label' => ['en' => 'Contact Chamber', 'bn' => 'চেম্বার যোগাযোগ'],
                    'secondary_cta_url' => '/contact',
                ],
                'sort_order' => 12,
                'is_enabled' => true,
            ],
        ];

        foreach ($sections as $sec) {
            $section = HomepageSection::where('section_key', $sec['section_key'])->first();
            if ($section) {
                $section->title = $sec['title'];
                $section->subtitle = $sec['subtitle'];
                $section->content = $sec['content'];
                if (isset($sec['settings'])) {
                    $section->settings = array_merge($section->settings ?? [], $sec['settings']);
                }
                $section->save();
            } else {
                HomepageSection::create($sec);
            }
        }

        // Ensure SiteSetting global_cta is also synchronized idempotently
        SiteSetting::firstOrCreate(
            ['key' => 'global_cta', 'group' => 'cta'],
            [
                'is_public' => true,
                'value' => [
                    'heading' => [
                        'en' => 'Supreme Court Chamber Consultation & Strategic Advisory',
                        'bn' => 'সুপ্রিম কোর্ট চেম্বার পরামর্শ ও কৌশলগত আইনি সহায়তা',
                    ],
                    'subheading' => [
                        'en' => 'Direct conference with Advocate Nijam Uddin (Haq) for constitutional writs, appellate litigation, and corporate counsel.',
                        'bn' => 'সাংবিধানিক রিট, সুপ্রিম কোর্ট আপিল ও কর্পোরেট আইনি বিষয়ে সরাসরি চেম্বার সম্মেলনের জন্য যোগাযোগ করুন।',
                    ],
                    'primary_button_label' => [
                        'en' => 'Book Consultation',
                        'bn' => 'পরামর্শ বুক করুন',
                    ],
                    'primary_button_url' => '/about#contact',
                    'secondary_button_label' => [
                        'en' => 'Contact Chamber',
                        'bn' => 'চেম্বার যোগাযোগ',
                    ],
                    'secondary_button_url' => '/contact',
                    'is_enabled' => true,
                ],
            ]
        );

        CmsCacheService::forgetHome();
        CmsCacheService::forgetSettings();
    }
}

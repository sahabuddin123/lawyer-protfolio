<?php

namespace Database\Seeders;

use App\Models\CareerTimeline;
use App\Models\Credential;
use App\Models\Education;
use App\Models\Media;
use App\Models\ProfessionalMembership;
use App\Models\Profile;
use App\Models\SeoMeta;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsCacheService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProfileAndCredentialsSeeder extends Seeder
{
    /**
     * Run the database seeds for Profile and Credentials based strictly on the Lawyer's CV.
     */
    public function run(): void
    {
        $adminUser = User::first();
        $uploadedBy = $adminUser ? $adminUser->id : null;

        // 0. Ensure Lawyer Photos are Registered as Media
        $courtRobesMedia = Media::firstOrCreate(
            ['filename' => 'lawyer-court-robes.jpg'],
            [
                'uuid' => (string) Str::uuid(),
                'disk' => 'public',
                'directory' => 'lawyer',
                'original_name' => 'advocate-nijam-uddin-court-robes.jpg',
                'mime_type' => 'image/jpeg',
                'extension' => 'jpg',
                'size_bytes' => 121871,
                'width' => 800,
                'height' => 1066,
                'alt_text' => [
                    'en' => 'Advocate Nijam Uddin (Haq), Supreme Court of Bangladesh in Court Robes',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক), বাংলাদেশ সুপ্রিম কোর্ট — আইনজীবী পোশাকে',
                ],
                'caption' => [
                    'en' => 'Official Supreme Court Advocate Portrait',
                    'bn' => 'সুপ্রিম কোর্ট তালিকাভুক্ত আইনজীবী প্রতিকৃতি',
                ],
                'variants' => [
                    'thumbnail' => '/images/lawyer-court-robes.jpg',
                    'medium' => '/images/lawyer-court-robes.jpg',
                    'large' => '/images/lawyer-court-robes.jpg',
                ],
                'uploaded_by' => $uploadedBy,
            ]
        );

        $executiveMedia = Media::firstOrCreate(
            ['filename' => 'lawyer-executive.jpg'],
            [
                'uuid' => (string) Str::uuid(),
                'disk' => 'public',
                'directory' => 'lawyer',
                'original_name' => 'advocate-nijam-uddin-executive.jpg',
                'mime_type' => 'image/jpeg',
                'extension' => 'jpg',
                'size_bytes' => 130898,
                'width' => 800,
                'height' => 1013,
                'alt_text' => [
                    'en' => 'Advocate Nijam Uddin (Haq) Executive Portrait',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক) প্রফেশনাল পোর্ট্রেট',
                ],
                'caption' => [
                    'en' => 'Advocate Nijam Uddin (Haq), Supreme Court of Bangladesh',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক), বাংলাদেশ সুপ্রিম কোর্ট',
                ],
                'variants' => [
                    'thumbnail' => '/images/lawyer-executive.jpg',
                    'medium' => '/images/lawyer-executive.jpg',
                    'large' => '/images/lawyer-executive.jpg',
                ],
                'uploaded_by' => $uploadedBy,
            ]
        );

        // 1. Authoritative Profile Baseline (Strictly verified facts from CV + approved public portfolio identity)
        $profile = Profile::updateOrCreate(
            ['id' => 1],
            [
                'name' => [
                    'en' => 'Nijam Uddin (Haq)',
                    'bn' => 'নিজাম উদ্দিন (হক)',
                ],
                'title' => [
                    'en' => 'Advocate, Supreme Court of Bangladesh',
                    'bn' => 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট',
                ],
                'subtitle' => [
                    'en' => 'Legal Practitioner & Judicial Consultant',
                    'bn' => 'আইনজীবী ও বিচারিক পরামর্শক',
                ],
                'short_bio' => [
                    'en' => 'Advocate Nijam Uddin is an enrolled legal professional with First Class honors in LL.B. (Honours) and LL.M. from the University of Chittagong. Enrolled with the Bangladesh Bar Council in 2016, his legal practice spans civil and criminal litigation, property title verification and deeds drafting, banking and commercial documentation, and alternative dispute resolution (ADR), founded upon accessibility, availability, confidentiality, and integrity.',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন চট্টগ্রাম বিশ্ববিদ্যালয় থেকে এলএল.বি. (অনার্স) ও এলএল.এম.-এ প্রথম শ্রেণি অর্জনকারী একজন নিষ্ঠাবান আইনজীবী। ২০১৬ সালে বাংলাদেশ বার কাউন্সিলে তালিকাভুক্ত হয়ে তিনি দেওয়ানি ও ফৌজদারি মামলা পরিচালনা, ভূমির স্বত্ব দলিল যাচাই ও প্রস্তুতকরণ, ব্যাংকিং ও বাণিজ্যিক চুক্তি প্রণয়ন এবং বিকল্প বিরোধ নিষ্পত্তিতে (এডিআর) নীতিবান আইনি সেবা প্রদান করে আসছেন। তাঁর প্র্যাকটিসের মূল ভিত্তি হলো সহজলভ্যতা, সময়ানুবর্তিতা, গোপনীয়তা ও সততা।',
                ],
                'long_bio' => [
                    'en' => '<p>Advocate Nijam Uddin is a dedicated legal practitioner committed to disciplined legal advocacy, procedural justice, and the rule of law. With rigorous academic training from the Faculty of Law, University of Chittagong, he secured First Class honors in both Bachelor of Laws (LL.B. Honours, 2011) and Master of Laws (LL.M., 2012). Following his academic foundation, he successfully qualified in the Bangladesh Bar Council advocateship enrollment examination in 2016.</p><p>His professional career encompasses multifaceted legal practice across district bar environments in Chittagong, Dhaka, and Noakhali. His litigation experience includes marshalling complex facts, conducting client conferences, drafting plaints, written statements, interlocutory applications, and criminal complaint petitions, as well as regular courtroom appearances in civil and criminal matters.</p><p>In corporate and commercial practice, he has advised commercial clients and financial institutions on land administration, property ownership searches, title vetting, and legal opinions. His documentation practice involves preparing purchase deeds, mortgage deeds, powers of attorney, deeds of gift, and loan security agreements, alongside legal proceedings under the Artha Rin Adalat Ain and Section 138 of the Negotiable Instruments Act.</p><p>Beyond contentious litigation, his background includes substantial engagement with the Bangladesh Legal Aid and Services Trust (BLAST). In this capacity, he facilitated out-of-court conflict resolution through mediation and Alternative Dispute Resolution (ADR), organized legal awareness programs for underprivileged litigants, and coordinated public interest litigation (PIL) initiatives.</p><p>Guided by his core commitments of accessibility, availability, confidentiality, and integrity, Advocate Nijam Uddin maintains an objective, ethical approach focused on meticulous preparation and principled client representation.</p>',
                    'bn' => '<p>অ্যাডভোকেট নিজাম উদ্দিন নিয়মানুবর্তিতা, ন্যায়বিচার ও আইনের শাসনের প্রতি অবিচল একজন নিষ্ঠাবান আইনজীবী। চট্টগ্রাম বিশ্ববিদ্যালয়ের আইন অনুষদ থেকে তিনি কৃতিত্বের সাথে স্নাতক (এলএল.বি. অনার্স, ২০১১) ও স্নাতকোত্তর (এলএল.এম., ২০১২) উভয় ডিগ্রিতেই প্রথম শ্রেণি অর্জন করেন। প্রাতিষ্ঠানিক উচ্চশিক্ষা সমাপ্তির পর তিনি ২০১৬ সালে বাংলাদেশ বার কাউন্সিলের সংবিধিবদ্ধ আইনজীবী তালিকাভুক্তি পরীক্ষায় উত্তীর্ণ হন।</p><p>তাঁর পেশাগত অভিজ্ঞতা চট্টগ্রাম, ঢাকা ও নোয়াখালী জেলা বার অঙ্গনে দেওয়ানি ও ফৌজদারি মোকদ্দমা পরিচালনার মাধ্যমে সমৃদ্ধ হয়েছে। আইনি কর্মপদ্ধতিতে তিনি প্রাসঙ্গিক তথ্য-উপাত্তের পুঙ্খানুপুঙ্খ বিশ্লেষণ (Marshalling of Facts), মামলার আরজি, লিখিত জবাব, অন্তর্বর্তীকালীন আবেদন এবং নালিশি মামলার দরখাস্ত খসড়া প্রণয়ন ও আদালতে দায়িত্বশীল শুনানিতে পারদর্শী।</p><p>করপোরেট ও বাণিজ্যিক আইন অনুশীলনে তিনি ব্যাংক ও বাণিজ্যিক প্রতিষ্ঠানের জন্য ভূমির মালিকানা স্বত্ব যাচাই, আইনি মতামত প্রদান, বন্ধকি দলিল, বিক্রয় দলিল, হেবা দলিল, আমমোক্তারনামা এবং ঋণ চুক্তিপত্র প্রণয়নে বিস্তৃত ভূমিকা পালন করেছেন। পাশাপাশি অর্থ ঋণ আদালত আইন ও নেগোশিয়েবল ইনস্ট্রুমেন্টস অ্যাক্ট (১৩৮ ধারা) সংক্রান্ত কার্যক্রমে তিনি নিয়মিত আইনি পরামর্শ প্রদান করেন।</p><p>আদালতের আনুষ্ঠানিক মোকদ্দমা ছাড়াও তিনি বাংলাদেশ লিগ্যাল এইড অ্যান্ড সার্ভিসেস ট্রাস্ট (ব্লাস্ট)-এর সাথে যুক্ত থেকে আদালতের বাইরে মধ্যস্থতা ও বিকল্প বিরোধ নিষ্পত্তি (এডিআর), প্রান্তিক ও সুবিধাবঞ্চিত মানুষের জন্য আইন সচেতনতামূলক কর্মসূচি এবং জনস্বার্থ সংশ্লিষ্ট আইনি কার্যক্রমে কার্যকর অবদান রেখেছেন।</p><p>সহজলভ্যতা, সময়ানুবর্তিতা, কঠোর গোপনীয়তা এবং পেশাগত সততা — এই চার মৌলিক মূলনীতির আলোকে তিনি প্রতিটি আইনি বিষয়ে নিরপেক্ষ মূল্যায়ন ও দায়িত্বশীল প্রতিকার নিশ্চিতে প্রতিশ্রুতিবদ্ধ।</p>',
                ],
                'status' => 'published',
                'profile_photo_id' => $executiveMedia->id,
                'court_robes_photo_id' => $courtRobesMedia->id,
                'signature_photo_id' => null,
                'bar_council_enrollment' => 'Enrolled / Certified with Bangladesh Bar Council',
                'high_court_enrollment' => null,
                'appellate_division_enrollment' => null,
                'chambers_address' => [
                    'en' => 'Supreme Court Bar Association Building, Dhaka, Bangladesh',
                    'bn' => 'সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন ভবন, ঢাকা, বাংলাদেশ',
                ],
                'office_address' => [
                    'en' => 'Chamber of Advocate Nijam Uddin, Dhaka, Bangladesh',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিনের চেম্বার, ঢাকা, বাংলাদেশ',
                ],
                'phone' => '+880 1700 000000',
                'email' => 'advocate@nijamuddin.com',
                'whatsapp' => '+880 1700 000000',
                'philosophy' => [
                    'en' => 'Accessibility, availability, confidentiality, and integrity form the cornerstone of disciplined legal practice and meaningful access to justice.',
                    'bn' => 'সহজলভ্যতা, সময়ানুবর্তিতা, গোপনীয়তা ও সততা — এই চার স্তম্ভের ওপর প্রতিষ্ঠিত নীতিবান আইনি অনুশীলন ও ন্যায়বিচার প্রাপ্তির নিশ্চয়তা।',
                ],
                'legal_approach' => [
                    'en' => 'Rigorous factual marshalling, thorough statutory research, ethical document drafting, and objective counsel tailored to the legal merits of each matter.',
                    'bn' => 'সুনির্দিষ্ট তথ্য বিশ্লেষণ, গভীর আইনি গবেষণা, স্বচ্ছ দলিল খসড়া প্রণয়ন এবং প্রতিটি মামলার গুণাগুণ অনুযায়ী বাস্তবসম্মত ও দায়িত্বশীল আইনি পরামর্শ।',
                ],
            ]
        );

        // Polymorphic SEO Metadata for Profile
        SeoMeta::updateOrCreate(
            [
                'seotable_type' => Profile::class,
                'seotable_id' => $profile->id,
            ],
            [
                'seo_title' => [
                    'en' => 'About Advocate Nijam Uddin (Haq) | Legal Profile & Credentials',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক) সম্পর্কে | আইনি জীবনবৃত্তান্ত ও সনদ',
                ],
                'meta_description' => [
                    'en' => 'Authoritative profile of Advocate Nijam Uddin (Haq). Academic pedigree from the University of Chittagong (LL.B. Hons, LL.M. First Class), Bar Council enrollment (2016), civil & criminal litigation, property documentation, and ADR experience.',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)-এর পূর্ণাঙ্গ আইনি জীবনবৃত্তান্ত। চট্টগ্রাম বিশ্ববিদ্যালয় থেকে এলএল.বি. (অনার্স) ও এলএল.এম.-এ প্রথম শ্রেণি, বার কাউন্সিল তালিকাভুক্তি (২০১৬), দেওয়ানি ও ফৌজদারি মোকদ্দমা, ভূমির স্বত্ব দলিল এবং এডিআর অভিজ্ঞতা।',
                ],
                'canonical_url' => 'http://localhost:8000/about',
                'robots' => 'index, follow',
                'schema_type' => 'Person',
                'structured_data' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'Person',
                    'name' => 'Advocate Nijam Uddin (Haq)',
                    'jobTitle' => 'Advocate, Supreme Court of Bangladesh',
                    'alumniOf' => 'University of Chittagong',
                    'url' => 'http://localhost:8000/about',
                ],
            ]
        );

        // 2. Authoritative Baseline Credentials (Strictly CV-supported)
        $credentials = [
            [
                'category' => 'court',
                'title' => [
                    'en' => 'Advocate, Supreme Court of Bangladesh',
                    'bn' => 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট',
                ],
                'institution' => [
                    'en' => 'Supreme Court of Bangladesh',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট',
                ],
                'description' => [
                    'en' => 'Practitioner engaged in constitutional writs, appellate litigation, and civil revisions before the High Court Division.',
                    'bn' => 'হাইকোর্ট বিভাগে সাংবিধানিক রিট, আপিল মোকদ্দমা এবং দেওয়ানি রিভিশন পরিচালনায় নিয়োজিত আইনজীবী।',
                ],
                'year' => null,
                'credential_id' => null,
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'category' => 'professional',
                'title' => [
                    'en' => 'Enrolled / Certified Advocate',
                    'bn' => 'তালিকাভুক্ত ও সনদপ্রাপ্ত আইনজীবী',
                ],
                'institution' => [
                    'en' => 'Bangladesh Bar Council',
                    'bn' => 'বাংলাদেশ বার কাউন্সিল',
                ],
                'description' => [
                    'en' => 'Qualified in the statutory advocateship examination in 2016; admitted to practice as an Advocate entitled to conduct proceedings before competent courts in Bangladesh.',
                    'bn' => '২০১৬ সালে সংবিধিবদ্ধ অ্যাডভোকেটশিপ পরীক্ষায় উত্তীর্ণ; বাংলাদেশের আদালতসমূহে আইন পেশা ও শুনানী পরিচালনার জন্য আনুষ্ঠানিকভাবে তালিকাভুক্ত ও সনদপ্রাপ্ত।',
                ],
                'year' => '2016',
                'credential_id' => null,
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'category' => 'academic',
                'title' => [
                    'en' => 'Master of Laws (LL.M.)',
                    'bn' => 'মাস্টার অব লজ (এলএল.এম.)',
                ],
                'institution' => [
                    'en' => 'University of Chittagong',
                    'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয়',
                ],
                'description' => [
                    'en' => 'Postgraduate degree in advanced jurisprudence securing First Class honors (Marks: 65.6%, CGPA 3.28/4.00).',
                    'bn' => 'উচ্চতর আইনশাস্ত্রে স্নাতকোত্তর ডিগ্রি; প্রথম শ্রেণি প্রাপ্ত (নম্বর: ৬৫.৬%, সিজিপিএ ৩.২৮/৪.০০)।',
                ],
                'year' => '2012',
                'credential_id' => null,
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'category' => 'academic',
                'title' => [
                    'en' => 'Bachelor of Laws (LL.B. Honours)',
                    'bn' => 'ব্যাচেলর অব লজ (এলএল.বি. অনার্স)',
                ],
                'institution' => [
                    'en' => 'University of Chittagong',
                    'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয়',
                ],
                'description' => [
                    'en' => 'Undergraduate degree in fundamental statutory laws and court procedures securing First Class honors (Marks: 62.4%, CGPA 3.12/4.00).',
                    'bn' => 'মৌলিক আইনি নীতিমালা ও আদালতের কার্যপ্রণালী বিষয়ে চার বছর মেয়াদী স্নাতক ডিগ্রি; প্রথম শ্রেণি প্রাপ্ত (নম্বর: ৬২.৪%, সিজিপিএ ৩.১২/৪.০০)।',
                ],
                'year' => '2011',
                'credential_id' => null,
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        // Idempotently sync credentials
        Credential::query()->delete();
        foreach ($credentials as $credData) {
            Credential::create($credData);
        }

        // 3. Authoritative Baseline Educations (Strictly CV-supported)
        $educations = [
            [
                'degree' => [
                    'en' => 'Master of Laws (LL.M.)',
                    'bn' => 'মাস্টার অব লজ (এলএল.এম.)',
                ],
                'institution' => [
                    'en' => 'University of Chittagong',
                    'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয়',
                ],
                'department' => [
                    'en' => 'Department of Law',
                    'bn' => 'আইন বিভাগ',
                ],
                'year_completed' => '2012',
                'distinction' => [
                    'en' => 'First Class (Marks: 65.6%), CGPA 3.28 on a 4.00 scale',
                    'bn' => 'প্রথম শ্রেণি (প্রাপ্ত নম্বর: ৬৫.৬%), সিজিপিএ ৩.২৮ / ৪.০০',
                ],
                'description' => [
                    'en' => 'Specialized postgraduate legal studies focusing on advanced jurisprudence, constitutional principles, international trade law, and research methodology.',
                    'bn' => 'উচ্চতর আইনশাস্ত্র, সাংবিধানিক ব্যাখ্যা, আন্তর্জাতিক বাণিজ্য আইন ও গবেষণা পদ্ধতির ওপর বিশেষায়িত স্নাতকোত্তর শিক্ষা।',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'degree' => [
                    'en' => 'Bachelor of Laws (LL.B. Honours)',
                    'bn' => 'ব্যাচেলর অব লজ (এলএল.বি. অনার্স)',
                ],
                'institution' => [
                    'en' => 'University of Chittagong',
                    'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয়',
                ],
                'department' => [
                    'en' => 'Department of Law',
                    'bn' => 'আইন বিভাগ',
                ],
                'year_completed' => '2011',
                'distinction' => [
                    'en' => 'First Class (Marks: 62.4%), CGPA 3.12 on a 4.00 scale (4 Years)',
                    'bn' => 'প্রথম শ্রেণি (প্রাপ্ত নম্বর: ৬২.৪%), সিজিপিএ ৩.১২ / ৪.০০ (৪ বছর মেয়াদী)',
                ],
                'description' => [
                    'en' => 'Four-year comprehensive undergraduate study covering substantive statutory laws, civil and criminal procedural codes, evidence law, property law, and commercial jurisprudence.',
                    'bn' => 'চার বছর মেয়াদী পূর্ণাঙ্গ স্নাতক শিক্ষা; মৌলিক আইন, দেওয়ানি ও ফৌজদারি কার্যবিধি, সাক্ষ্য আইন, সম্পত্তি হস্তান্তর আইন ও বাণিজ্যিক আইনশাস্ত্রের সামগ্রিক অধ্যায়ন।',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        // Idempotently sync educations
        Education::query()->delete();
        foreach ($educations as $eduData) {
            Education::create($eduData);
        }

        // 4. Authoritative Baseline Career Timeline (Strictly CV-supported)
        $timelines = [
            [
                'period' => '2011',
                'title' => [
                    'en' => 'LL.B. (Honours) — Academic Legal Foundation',
                    'bn' => 'এলএল.বি. (অনার্স) — স্নাতক আইন শিক্ষা সম্পন্ন',
                ],
                'organization' => [
                    'en' => 'University of Chittagong',
                    'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয়',
                ],
                'description' => [
                    'en' => 'Completed 4-year undergraduate legal education securing First Class honors, building deep academic grounding in statutory frameworks, constitutional law, and procedural codes.',
                    'bn' => 'প্রথম শ্রেণি অর্জনের মাধ্যমে চার বছর মেয়াদী স্নাতক আইন শিক্ষা সম্পন্ন; বিধিবদ্ধ আইন, সংবিধান, কার্যপ্রণালীগত আইন ও তুলনামূলক আইনশাস্ত্রে গভীর অধ্যায়ন।',
                ],
                'is_current' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'period' => '2012',
                'title' => [
                    'en' => 'Master of Laws (LL.M.) & Socio-Legal Field Research',
                    'bn' => 'মাস্টার অব লজ (এলএল.এম.) ও আর্থ-সামাজিক আইনি গবেষণা',
                ],
                'organization' => [
                    'en' => 'University of Chittagong',
                    'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয়',
                ],
                'description' => [
                    'en' => 'Secured First Class honors in postgraduate legal studies (CGPA 3.28/4.00); carried out year-long research in Noakhali examining the jurisdiction, functions, and practical challenges of the Village Court system.',
                    'bn' => 'স্নাতকোত্তর পর্যায়ে উচ্চতর আইনশাস্ত্রে প্রথম শ্রেণি অর্জন (সিজিপিএ ৩.২৮/৪.০০); নোয়াখালীতে গ্রাম আদালতের এখতিয়ার, কার্যক্ষমতা ও বিচারিক অনুশীলন বিষয়ে বছরব্যাপী মাঠপর্যায়ের গবেষণা পরিচালনা।',
                ],
                'is_current' => false,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'period' => '2016',
                'title' => [
                    'en' => 'Advocate Enrollment — Bangladesh Bar Council',
                    'bn' => 'অ্যাডভোকেট তালিকাভুক্তি — বাংলাদেশ বার কাউন্সিল',
                ],
                'organization' => [
                    'en' => 'Bangladesh Bar Council',
                    'bn' => 'বাংলাদেশ বার কাউন্সিল',
                ],
                'description' => [
                    'en' => 'Qualified in the statutory advocateship examination administered by the Bangladesh Bar Council and officially enrolled as an Advocate entitled to practice across competent courts in Bangladesh.',
                    'bn' => 'বাংলাদেশ বার কাউন্সিল পরিচালিত সংবিধিবদ্ধ অ্যাডভোকেটশিপ পরীক্ষায় উত্তীর্ণ হয়ে আদালতে আইন পেশা পরিচালনার জন্য আনুষ্ঠানিকভাবে তালিকাভুক্ত ও সনদপ্রাপ্ত।',
                ],
                'is_current' => false,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'period' => '2016 – Present',
                'title' => [
                    'en' => 'Litigation Advocacy & District Bar Practice',
                    'bn' => 'আদালতে মোকদ্দমা পরিচালনা ও জেলা বার প্র্যাকটিস',
                ],
                'organization' => [
                    'en' => 'Chittagong & Dhaka Bar Environments | District & Sessions Courts',
                    'bn' => 'চট্টগ্রাম ও ঢাকা বার অ্যাসোসিয়েশন পরিবেশ | জেলা ও দায়রা জজ আদালত',
                ],
                'description' => [
                    'en' => 'Engaged in civil and criminal litigation practice; drafting plaints, written statements, interlocutory applications, and complaint petitions (C.R./G.R.); conducting client conferences and courtroom representation.',
                    'bn' => 'দেওয়ানি ও ফৌজদারি মামলা পরিচালনায় সক্রিয় সম্পৃক্ততা; আরজি, লিখিত জবাব, অন্তর্বর্তীকালীন আবেদন ও নালিশি দরখাস্ত (সি.আর./জি.আর.) খসড়া প্রণয়ন, মক্কেল পরামর্শ ও আদালতে আইনি প্রতিনিধিত্ব।',
                ],
                'is_current' => true,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'period' => 'Corporate Practice',
                'title' => [
                    'en' => 'Corporate Legal Advisory, Property Vetting & Commercial Drafting',
                    'bn' => 'করপোরেট আইনি পরামর্শ, ভূমির স্বত্ব যাচাই ও বাণিজ্যিক দলিল খসড়া',
                ],
                'organization' => [
                    'en' => 'Corporate Law Firm Practice',
                    'bn' => 'করপোরেট ল ফার্ম অনুশীলন',
                ],
                'description' => [
                    'en' => 'Assisted commercial clients and banking institutions with land title searches, vetting property ownership documents, legal opinions, loan security agreements, mortgage deeds, deeds of sale, and powers of attorney.',
                    'bn' => 'ব্যাংক ও করপোরেট প্রতিষ্ঠানের জন্য জমির স্বত্ব অনুসন্ধান ও যাচাইকরণ, আইনি মতামত প্রদান, ঋণ চুক্তি, বন্ধকি দলিল, বিক্রয় দলিল, হেবা দলিল ও আমমোক্তারনামা খসড়া প্রণয়ন।',
                ],
                'is_current' => false,
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'period' => 'Legal Aid & ADR',
                'title' => [
                    'en' => 'Alternative Dispute Resolution (ADR) & Legal Aid Services',
                    'bn' => 'বিকল্প বিরোধ নিষ্পত্তি (এডিআর) ও আইনি সহায়তা কার্যক্রম',
                ],
                'organization' => [
                    'en' => 'Bangladesh Legal Aid and Services Trust (BLAST)',
                    'bn' => 'বাংলাদেশ লিগ্যাল এইড অ্যান্ড সার্ভিসেস ট্রাস্ট (ব্লাস্ট)',
                ],
                'description' => [
                    'en' => 'Facilitated out-of-court conflict resolution through structured mediation and ADR; conducted community legal awareness programs for underprivileged litigants; coordinated public interest litigation (PIL) reporting and official liaisons.',
                    'bn' => 'আদালতের বাইরে মধ্যস্থতা ও এডিআর-এর মাধ্যমে বিরোধ নিষ্পত্তি; সুবিধাবঞ্চিত মানুষের জন্য আইনি সচেতনতামূলক কর্মসূচি পরিচালনা; এবং জনস্বার্থ মামলা (পিআইএল) সংক্রান্ত প্রাতিষ্ঠানিক সমন্বয় ও প্রতিবেদন প্রস্তুত।',
                ],
                'is_current' => false,
                'is_active' => true,
                'sort_order' => 6,
            ],
        ];

        // Idempotently sync timeline
        CareerTimeline::query()->delete();
        foreach ($timelines as $timelineData) {
            CareerTimeline::create($timelineData);
        }

        // 5. Authoritative Baseline Professional Memberships (Strictly CV-supported)
        $memberships = [
            [
                'organization' => [
                    'en' => 'Chittagong District Bar Association',
                    'bn' => 'চট্টগ্রাম জেলা বার অ্যাসোসিয়েশন',
                ],
                'role' => [
                    'en' => 'Member Advocate',
                    'bn' => 'সদস্য আইনজীবী',
                ],
                'description' => [
                    'en' => 'Professional membership and court practice affiliation across district and subordinate courts.',
                    'bn' => 'জেলা ও অধস্তন আদালতসমূহে প্র্যাকটিস ও সদস্যপদ অন্তর্ভুক্তি।',
                ],
                'membership_number' => null,
                'year_joined' => '2016',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'organization' => [
                    'en' => 'Noakhali District Bar Association',
                    'bn' => 'নোয়াখালী জেলা বার অ্যাসোসিয়েশন',
                ],
                'role' => [
                    'en' => 'Member Advocate',
                    'bn' => 'সদস্য আইনজীবী',
                ],
                'description' => [
                    'en' => 'Professional membership and court practice affiliation in district civil and criminal courts.',
                    'bn' => 'নোয়াখালী জেলা ও দায়রা জজ আদালতে আইনি অনুশীলন ও সদস্যপদ।',
                ],
                'membership_number' => null,
                'year_joined' => '2016',
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        // Idempotently sync memberships
        ProfessionalMembership::query()->delete();
        foreach ($memberships as $membershipData) {
            ProfessionalMembership::create($membershipData);
        }

        // 6. Dynamic About Page Settings (100% editable from Admin Panel)
        $aboutSettings = [
            [
                'key' => 'about_hero',
                'group' => 'about',
                'is_public' => true,
                'value' => [
                    'eyebrow_badge' => [
                        'en' => 'LL.B. (Hons) & LL.M. (First Class)',
                        'bn' => 'এলএল.বি. (অনার্স) ও এলএল.এম. (প্রথম শ্রেণি)',
                    ],
                    'heading' => [
                        'en' => 'Committed to Principled Legal Practice and Access to Justice',
                        'bn' => 'আইন ও ন্যায়ের শাসন প্রতিষ্ঠায় নীতিবান ও দায়বদ্ধ আইনি সেবা',
                    ],
                    'primary_cta_text' => [
                        'en' => 'Request a Consultation',
                        'bn' => 'পরামর্শের জন্য যোগাযোগ',
                    ],
                    'primary_cta_url' => '/contact',
                    'secondary_cta_text' => [
                        'en' => 'Explore Practice Areas',
                        'bn' => 'আইনি অনুশীলনের ক্ষেত্রসমূহ',
                    ],
                    'secondary_cta_url' => '#practice-areas',
                    'portrait_badge_text' => [
                        'en' => 'Certified Practitioner — Bangladesh Bar Council (2016)',
                        'bn' => 'বাংলাদেশ বার কাউন্সিল প্রত্যয়িত আইনজীবী (২০১৬)',
                    ],
                ],
            ],
            [
                'key' => 'about_section_headers',
                'group' => 'about',
                'is_public' => true,
                'value' => [
                    'bio' => [
                        'eyebrow' => ['en' => 'Professional Profile', 'bn' => 'পেশাগত পরিচিতি'],
                        'title' => ['en' => 'Academic Pedigree, Advocacy Experience & Ethical Practice', 'bn' => 'আইনি সাধনা, পেশাগত অভিজ্ঞতা ও নীতিবান কর্মপদ্ধতি'],
                    ],
                    'timeline' => [
                        'eyebrow' => ['en' => 'Career Milestones', 'bn' => 'পেশাগত সময়রেখা'],
                        'title' => ['en' => 'Career Journey & Professional Milestones', 'bn' => 'আইন অঙ্গনে পদচিহ্ন ও পেশাগত পথচলা'],
                        'description' => [
                            'en' => 'Chronological progression across university legal education, statutory Bar Council enrollment, corporate documentation, and litigation advocacy.',
                            'bn' => 'বিশ্ববিদ্যালয়ের উচ্চতর আইন শিক্ষা, সংবিধিবদ্ধ বার কাউন্সিল তালিকাভুক্তি, করপোরেট প্র্যাকটিস ও আদালত অঙ্গনে অভিজ্ঞতার ধারাবাহিক রূপরেখা।',
                        ],
                    ],
                    'practice_areas' => [
                        'eyebrow' => ['en' => 'Areas of Legal Practice', 'bn' => 'আইনি অনুশীলনের ক্ষেত্রসমূহ'],
                        'title' => ['en' => 'Categorized Legal Practice Disciplines', 'bn' => 'অভিজ্ঞতার বিষয়ভিত্তিক আইনি ক্ষেত্র'],
                        'description' => [
                            'en' => 'A structured overview of legal experience documented in the CV across litigation, real property vetting, commercial contracts, and dispute resolution.',
                            'bn' => 'দেওয়ানি ও ফৌজদারি মামলা, ভূমির স্বত্ব যাচাই ও দলিলপত্র, ব্যাংকিং বিরোধ, করপোরেট চুক্তি এবং বিকল্প বিরোধ নিষ্পত্তির সমন্বিত রূপরেখা।',
                        ],
                    ],
                    'education' => [
                        'eyebrow' => ['en' => 'Academic Pedigree & Qualifications', 'bn' => 'আইন শিক্ষাগত যোগ্যতা'],
                        'title' => ['en' => 'Formal Legal Degrees & Academic Standing', 'bn' => 'প্রাতিষ্ঠানিক আইন ডিগ্রি ও ফলাফল'],
                        'description' => [
                            'en' => 'Degrees and academic distinctions conferred by the University of Chittagong and statutory boards as documented in the CV.',
                            'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয় ও সংবিধিবদ্ধ বোর্ডের ফলাফল ও সনদ।',
                        ],
                    ],
                    'trainings' => [
                        'eyebrow' => ['en' => 'Professional Development & Training', 'bn' => 'পেশাগত উন্নয়ন ও প্রশিক্ষণ'],
                        'title' => ['en' => 'Workshops, Moot Court & Specialized Inquiries', 'bn' => 'আইনি কর্মশালা, মুট কোর্ট এবং মাঠপর্যায়ের গবেষণা'],
                        'description' => [
                            'en' => 'Participation in legal advocacy workshops, international humanitarian mooting, and field research documented in the CV.',
                            'bn' => 'বার অ্যাসোসিয়েশন, মানবাধিকার সংস্থা ও ঢাকা বিশ্ববিদ্যালয় আইন অনুষদ আয়োজিত প্রশিক্ষণ ও গবেষণার বিবরণ।',
                        ],
                    ],
                    'commitments' => [
                        'eyebrow' => ['en' => 'Professional Commitment', 'bn' => 'আইনি অনুশীলনের চার স্তম্ভ'],
                        'title' => ['en' => 'Accessibility, Availability, Confidentiality & Integrity', 'bn' => 'সহজলভ্যতা, সময়ানুবর্তিতা, গোপনীয়তা ও সততা'],
                        'description' => [
                            'en' => "The four non-negotiable professional principles explicitly declared in the lawyer's CV guiding all client engagements.",
                            'bn' => 'আইনজীবীর সিভিতে সুস্পষ্টভাবে ঘোষিত চার মূলনীতি, যা প্রতিটি মক্কেল ও বিচারিক বিষয়ে নিষ্ঠার সাথে অনুশীলিত হয়।',
                        ],
                    ],
                    'memberships' => [
                        'eyebrow' => ['en' => 'Bar & Chamber Affiliations', 'bn' => 'বার ও চেম্বার অন্তর্ভুক্তি'],
                        'title' => ['en' => 'Professional Bar Memberships', 'bn' => 'পেশাগত বার অ্যাসোসিয়েশন সদস্যপদ'],
                    ],
                    'consultation_cta' => [
                        'eyebrow' => ['en' => 'Chamber Consultation', 'bn' => 'চেম্বার ও কার্যালয়'],
                        'title' => ['en' => 'Discuss Your Legal Matter', 'bn' => 'আপনার আইনি বিষয়ে পরামর্শ গ্রহণ করুন'],
                        'description' => [
                            'en' => 'Share a brief description of your legal concern to request a consultation. The appropriate next steps depend on the facts, available documents, and applicable law.',
                            'bn' => 'আপনার আইনি সমস্যা ও প্রাসঙ্গিক নথিপত্র জানিয়ে পরামর্শের জন্য যোগাযোগ করুন। প্রতিটি বিষয়ের পরবর্তী পদক্ষেপ সুনির্দিষ্ট ঘটনা, প্রাপ্ত প্রমাণাদি এবং প্রচলিত আইনের ওপর নির্ভর করে।',
                        ],
                    ],
                ],
            ],
            [
                'key' => 'about_highlights',
                'group' => 'about',
                'is_public' => true,
                'value' => [
                    [
                        'id' => 'hl-1',
                        'title' => ['en' => 'University of Chittagong:', 'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয়:'],
                        'description' => ['en' => 'First Class honors in both LL.B. (Honours, 2011) and LL.M. (2012).', 'bn' => 'এলএল.বি. (অনার্স) ও এলএল.এম. উভয় ডিগ্রিতে প্রথম শ্রেণি।'],
                    ],
                    [
                        'id' => 'hl-2',
                        'title' => ['en' => 'Bar Council Enrollment:', 'bn' => 'বার কাউন্সিল তালিকাভুক্তি:'],
                        'description' => ['en' => 'Statutory qualification and enrollment as an Advocate in 2016.', 'bn' => '২০১৬ সালে সংবিধিবদ্ধ অ্যাডভোকেটশিপ পরীক্ষায় উত্তীর্ণ।'],
                    ],
                    [
                        'id' => 'hl-3',
                        'title' => ['en' => 'Litigation & Deeds Vetting:', 'bn' => 'আইনি দলিল ও আরজি খসড়া:'],
                        'description' => ['en' => 'Comprehensive plaint drafting, land title vetting, and commercial contracts.', 'bn' => 'দেওয়ানি ও ফৌজদারি মামলা, ভূমির স্বত্ব দলিল যাচাই ও বাণিজ্যিক চুক্তি।'],
                    ],
                    [
                        'id' => 'hl-4',
                        'title' => ['en' => 'ADR & Access to Justice:', 'bn' => 'আইনি সহায়তা ও এডিআর:'],
                        'description' => ['en' => 'Institutional ADR, community legal awareness, and PIL coordination.', 'bn' => 'ব্লাস্ট-এর মাধ্যমে মধ্যস্থতা, সচেতনতা ও জনস্বার্থ আইনি কার্যক্রম।'],
                    ],
                ],
            ],
            [
                'key' => 'about_commitments',
                'group' => 'about',
                'is_public' => true,
                'value' => [
                    [
                        'id' => 'accessibility',
                        'pillar' => ['en' => 'Accessibility', 'bn' => 'সহজলভ্যতা'],
                        'title' => ['en' => 'Clear Communication & Guidance', 'bn' => 'সহজবোধ্য যোগাযোগ ও দিকনির্দেশনা'],
                        'description' => [
                            'en' => 'Straightforward orientation on statutory procedures and practical options without confusing jargon, ensuring every litigant understands the realistic trajectory of their matter.',
                            'bn' => 'জটিল আইনি পরিভাষা পরিহার করে সেবাগ্রহীতাকে তাঁর আইনি অধিকার, আদালতের সম্ভাব্য কার্যপ্রণালী এবং বাস্তবসম্মত পদক্ষেপসমূহ স্পষ্টভাবে অবহিত করা।',
                        ],
                        'icon' => 'Compass',
                    ],
                    [
                        'id' => 'availability',
                        'pillar' => ['en' => 'Availability', 'bn' => 'সময়ানুবর্তিতা'],
                        'title' => ['en' => 'Disciplined Preparation & Follow-up', 'bn' => 'সময়োপযোগী প্রস্তুতি ও দায়িত্বশীল তদারকি'],
                        'description' => [
                            'en' => 'Conscientious scheduling and steady case tracking. Diligent preparation of court pleadings ahead of critical procedural deadlines and scheduled hearing dates.',
                            'bn' => 'নিয়মানুবর্তিতা ও সময়োপযোগী আইনি পদক্ষেপ। আদালতের ধার্য তারিখে মামলার নথিপত্র যথাযথভাবে প্রস্তুত রাখা এবং শুনানির পূর্বে পর্যাপ্ত প্রস্তুতি নিশ্চিতকরণ।',
                        ],
                        'icon' => 'Clock',
                    ],
                    [
                        'id' => 'confidentiality',
                        'pillar' => ['en' => 'Confidentiality', 'bn' => 'গোপনীয়তা'],
                        'title' => ['en' => 'Safeguarding Sensitive Records', 'bn' => 'পেশাগত বিশ্বস্ততা ও নথিপত্রের নিরাপত্তা'],
                        'description' => [
                            'en' => 'Strict protection of client disclosures, property title deeds, commercial records, and strategic deliberations in full compliance with legal professional ethics.',
                            'bn' => 'মক্কেলের ব্যক্তিগত তথ্য, আর্থিক বিবরণী, ভূমির মূল দলিলপত্র এবং মামলার কৌশলগত আলোচনার সর্বোচ্চ গোপনীয়তা ও পেশাগত বিশ্বস্ততা রক্ষা।',
                        ],
                        'icon' => 'Lock',
                    ],
                    [
                        'id' => 'integrity',
                        'pillar' => ['en' => 'Integrity', 'bn' => 'পেশাগত সততা'],
                        'title' => ['en' => 'Principled & Honest Advocacy', 'bn' => 'নীতিবান মূল্যায়ন ও সততা'],
                        'description' => [
                            'en' => 'Fidelity to truth, accurate factual marshalling in court documents, and objective assessments without exaggerated assurances or misleading promises.',
                            'bn' => 'আইনি নীতিশাস্ত্রের কঠোর অনুসরণ, আরজি ও জবাবে নির্ভুল তথ্য উপস্থাপন এবং কোনো অতিরঞ্জিত আশ্বাস না দিয়ে সততা ও আইনের শাসনের প্রতি অবিচল থাকা।',
                        ],
                        'icon' => 'ShieldCheck',
                    ],
                ],
            ],
            [
                'key' => 'about_trainings',
                'group' => 'about',
                'is_public' => true,
                'value' => [
                    [
                        'id' => 'tr-1',
                        'year' => '2016',
                        'duration' => ['en' => '3 Days', 'bn' => '৩ দিন'],
                        'title' => [
                            'en' => 'Professional Skill Development Workshop for Young Lawyers',
                            'bn' => 'তরুণ আইনজীবীদের পেশাগত দক্ষতা উন্নয়ন কর্মশালা',
                        ],
                        'institution' => [
                            'en' => "Chittagong District Bar Association — Chittagong Judge's Court",
                            'bn' => 'চট্টগ্রাম জেলা বার অ্যাসোসিয়েশন — চট্টগ্রাম জজ কোর্ট',
                        ],
                        'description' => [
                            'en' => 'Comprehensive workshop on trial advocacy, witness examination techniques, procedural management, and courtroom decorum.',
                            'bn' => 'আদালতের কার্যপ্রণালী, সাক্ষ্য গ্রহণ পদ্ধতি, শুনানির শিষ্টাচার ও পেশাগত দক্ষতার ওপর ৩ দিনব্যাপী নিবিড় প্রশিক্ষণ।',
                        ],
                    ],
                    [
                        'id' => 'tr-2',
                        'year' => '2015',
                        'duration' => ['en' => 'Day Long', 'bn' => 'দিনব্যাপী'],
                        'title' => [
                            'en' => 'Workshop on Prosecution Under Overseas Employment & Migration Law 2013',
                            'bn' => 'বৈদেশিক কর্মসংস্থান ও অভিবাসী আইন ২০১৩ বিষয়ক বিশেষায়িত কর্মশালা',
                        ],
                        'institution' => [
                            'en' => 'RMMRU (Refugee and Migratory Movements Research Unit) & Manusher Jonno Foundation, Dhaka',
                            'bn' => 'রামরু (রিফিউজি অ্যান্ড মাইগ্রেটরি মুভমেন্টস রিসার্চ ইউনিট) ও মানুষের জন্য ফাউন্ডেশন, ঢাকা',
                        ],
                        'description' => [
                            'en' => 'Specialized training on the Overseas Employment and Migrants Act 2013, refugee protection concepts, and statutory prosecution remedies.',
                            'bn' => 'বৈদেশিক কর্মসংস্থান আইন ২০১৩, অভিবাসী শ্রমিকদের অধিকার সুরক্ষা এবং সংশ্লিষ্ট অপরাধের বিচার প্রক্রিয়া ও আইনি প্রতিকার।',
                        ],
                    ],
                    [
                        'id' => 'tr-3',
                        'year' => '2012',
                        'duration' => ['en' => '13–15 Sept 2012', 'bn' => '১৩–১৫ সেপ্টেম্বর ২০১২'],
                        'title' => [
                            'en' => '8th Henry Dunant Memorial Moot Court Competition (Genocide & War Crimes)',
                            'bn' => '৮ম হেনরি ডুনান্ট মেমোরিয়াল মুট কোর্ট প্রতিযোগিতা (যুদ্ধাপরাধ ও আন্তর্জাতিক আইন)',
                        ],
                        'institution' => [
                            'en' => 'International Committee of the Red Cross (ICRC) & Faculty of Law, University of Dhaka',
                            'bn' => 'আইসিআরসি এবং আইন অনুষদ, ঢাকা বিশ্ববিদ্যালয়',
                        ],
                        'description' => [
                            'en' => 'National moot court competition at Nawab Ali Chowdhury Senate Bhaban, University of Dhaka, addressing genocide, war crimes jurisprudence, and appellate oral arguments.',
                            'bn' => 'ঢাকা বিশ্ববিদ্যালয় সিনেট ভবনে অনুষ্ঠিত জাতীয় মুট কোর্ট প্রতিযোগিতা; আন্তর্জাতিক মানবিক আইন, যুদ্ধাপরাধ এবং আপিল বিভাগীয় মৌখিক যুক্তি উপস্থাপন।',
                        ],
                    ],
                    [
                        'id' => 'tr-4',
                        'year' => '2012',
                        'duration' => ['en' => '1 Year Research', 'bn' => '১ বছর মেয়াদী গবেষণা'],
                        'title' => [
                            'en' => 'Comparative Study of Village Courts — Research & Field Inquiry',
                            'bn' => 'গ্রাম আদালতের ক্ষমতা ও কার্যাবলির তুলনামূলক গবেষণা',
                        ],
                        'institution' => [
                            'en' => 'University of Chittagong, Noakhali Field Study',
                            'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয় — নোয়াখালী মাঠপর্যায়ের গবেষণা',
                        ],
                        'description' => [
                            'en' => 'Year-long socio-legal research analyzing statutory village court powers, functions, dispute settlement dynamics, and practical challenges at the grassroots.',
                            'bn' => 'স্থানীয় পর্যায়ে বিরোধ নিষ্পত্তি, আইনি এখতিয়ার এবং গ্রাম আদালত ব্যবস্থার প্রায়োগিক সীমাবদ্ধতা ও সম্ভাবনার বছরব্যাপী মাঠপর্যায়ের বিশ্লেষণ।',
                        ],
                    ],
                    [
                        'id' => 'tr-5',
                        'year' => '2011',
                        'duration' => ['en' => 'Day Long', 'bn' => 'দিনব্যাপী'],
                        'title' => [
                            'en' => 'Human Resources Development Workshop',
                            'bn' => 'মানবসম্পদ উন্নয়ন ও প্রাতিষ্ঠানিক নেতৃত্ব কর্মশালা',
                        ],
                        'institution' => [
                            'en' => 'Rotaract Club of Chittagong University',
                            'bn' => 'রোটার‍্যাক্ট ক্লাব অব চিটাগং ইউনিভার্সিটি',
                        ],
                        'description' => [
                            'en' => 'Workshop covering human resources management principles, organizational communication ethics, and professional collaboration.',
                            'bn' => 'প্রাতিষ্ঠানিক যোগাযোগ, দলীয় নেতৃত্ব ও মানবসম্পদ ব্যবস্থাপনার মৌলিক নীতিমালা বিষয়ক দিনব্যাপী প্রশিক্ষণ।',
                        ],
                    ],
                ],
            ],
            [
                'key' => 'about_cta',
                'group' => 'about',
                'is_public' => true,
                'value' => [
                    'chamber_label_supreme_court' => ['en' => 'Supreme Court Chambers', 'bn' => 'সুপ্রিম কোর্ট চেম্বার'],
                    'chamber_label_office' => ['en' => 'Principal Office', 'bn' => 'প্রধান কার্যালয়'],
                    'button_label' => ['en' => 'Schedule Consultation', 'bn' => 'পরামর্শের অনুরোধ জানান'],
                    'button_url' => '/contact',
                    'disclaimer' => [
                        'en' => 'Regulatory Notice: Submitting a consultation inquiry through this platform does not create an automatic advocate-client relationship. Formal representation commences only upon mutual consent and direct chamber engagement.',
                        'bn' => 'আইনি সতর্কবার্তা: এই ওয়েবসাইটের মাধ্যমে প্রাথমিক যোগাযোগের অনুরোধ কোনো আইনজীবী-মক্কেল সম্পর্ক স্থাপন করে না। আনুষ্ঠানিক সাক্ষাৎ ও সম্মতির মাধ্যমেই কেবল দায়িত্ব গ্রহণ করা হয়।',
                    ],
                ],
            ],
        ];

        foreach ($aboutSettings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                [
                    'group' => $setting['group'],
                    'is_public' => $setting['is_public'],
                    'value' => $setting['value'],
                ]
            );
        }

        // Flush all CMS caches to ensure immediate consistency
        CmsCacheService::flushAll();
    }
}

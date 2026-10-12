<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CourtroomExperience;
use App\Models\GalleryAlbum;
use App\Models\GalleryImage;
use App\Models\HomepageSection;
use App\Models\JudgmentReview;
use App\Models\LegalResearch;
use App\Models\Media;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class HomepageContentPopulationSeeder extends Seeder
{
    /**
     * Run the database seeds idempotently without inventing personal claims.
     */
    public function run(): void
    {
        $this->seedCategories();
        $this->seedCourtroomEducationalGuides();
        $this->seedLandmarkJudgmentReviews();
        $this->seedLegalResearchPapers();
        $this->seedInstitutionalGalleryAlbum();
        $this->updateHomepageSectionsAndCta();

        // Flush homepage CMS cache so updates reflect immediately
        Cache::flush();
    }

    /**
     * 1. Seed foundational categories for taxonomies.
     */
    protected function seedCategories(): void
    {
        $categories = [
            [
                'slug' => 'constitutional-law',
                'type' => 'research',
                'name' => ['en' => 'Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
                'description' => ['en' => 'Constitutional principles and judicial review in Bangladesh', 'bn' => 'বাংলাদেশের সাংবিধানিক মূলনীতি ও বিচারিক পর্যালোচনা'],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'civil-jurisprudence',
                'type' => 'research',
                'name' => ['en' => 'Civil Jurisprudence', 'bn' => 'দেওয়ানি আইনতত্ত্ব'],
                'description' => ['en' => 'Substantive and procedural civil jurisprudence', 'bn' => 'দেওয়ানি কার্যপ্রণালী ও সম্পত্তি বিষয়ক আইনতত্ত্ব'],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'criminal-procedure',
                'type' => 'research',
                'name' => ['en' => 'Criminal Procedure', 'bn' => 'ফৌজদারি কার্যপ্রণালী'],
                'description' => ['en' => 'Due process and criminal justice administration', 'bn' => 'ফৌজদারি বিচার ও সাংবিধানিক সুরক্ষার রূপরেখা'],
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'slug' => 'village-justice',
                'type' => 'research',
                'name' => ['en' => 'Grassroots Justice Systems', 'bn' => 'তৃণমূল বিচারব্যবস্থা ও সালিশ'],
                'description' => ['en' => 'Socio-legal field inquiries into grassroots dispute resolution and village courts', 'bn' => 'গ্রাম আদালত ও তৃণমূল পর্যায়ের বিরোধ নিষ্পত্তি সংক্রান্ত আর্থ-সামাজিক ও আইনি গবেষণা'],
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'slug' => 'judicial-architecture',
                'type' => 'gallery',
                'name' => ['en' => 'Chamber & Judicial Heritage', 'bn' => 'চেম্বার ও বিচারিক ঐতিহ্য'],
                'description' => ['en' => 'Supreme Court chambers, law library, and institutional portraits', 'bn' => 'সুপ্রিম কোর্ট চেম্বার, আইন লাইব্রেরি এবং প্রামাণ্য প্রতিকৃতি'],
                'is_active' => true,
                'sort_order' => 1,
            ],
        ];

        foreach ($categories as $catData) {
            Category::firstOrCreate(
                ['slug' => $catData['slug']],
                $catData
            );
        }
    }

    /**
     * 2. Section 5: Courtroom Experience — Educational Procedure Guides.
     * (Clearly labelled as procedural explainers; no fabricated personal courtroom victories).
     */
    protected function seedCourtroomEducationalGuides(): void
    {
        $items = [
            [
                'slug' => 'understanding-writ-jurisdiction-procedure-article-102',
                'title' => [
                    'en' => 'Constitutional Writ Petitions: Procedure & Submissions Under Article 102',
                    'bn' => 'সাংবিধানিক রিট আবেদন: সংবিধানের ১০২ অনুচ্ছেদের আওতায় কার্যপ্রণালী ও যুক্তি',
                ],
                'case_number' => 'Procedural Guide Art. 102',
                'court' => 'High Court Division, Supreme Court of Bangladesh',
                'case_type' => 'Constitutional Procedure',
                'year' => 2024,
                'legal_area' => [
                    'en' => 'Constitutional Law',
                    'bn' => 'সাংবিধানিক আইন',
                ],
                'role' => [
                    'en' => 'Educational Procedure Guide',
                    'bn' => 'আইনি কার্যপ্রণালী নির্দেশিকা',
                ],
                'summary' => [
                    'en' => 'An educational guide examining the procedural stages of invoking writ jurisdiction before the High Court Division under Article 102 of the Constitution of Bangladesh when alternative legal remedies are inadequate.',
                    'bn' => 'বিকল্প প্রতিকার অপর্যাপ্ত হলে বাংলাদেশ সংবিধানের ১০২ অনুচ্ছেদ অনুসারে হাইকোর্ট বিভাগে রিট এখতিয়ার প্রয়োগের পর্যায়সমূহ ও কার্যপ্রণালী সংক্রান্ত আইনি বিশ্লেষণ।',
                ],
                'description' => [
                    'en' => "<p>Article 102 of the Constitution of Bangladesh empowers the High Court Division to issue directives, orders, or writs—including Mandamus, Certiorari, Prohibition, Habeas Corpus, and Quo Warranto—to protect fundamental rights and enforce public statutory duties.</p><p>This educational analysis outlines the admissibility threshold, the doctrine of exhaustion of alternative statutory remedies, and essential documentation required when drafting petitions before the Supreme Court.</p>",
                    'bn' => "<p>বাংলাদেশ সংবিধানের ১০২ অনুচ্ছেদ হাইকোর্ট বিভাগকে মৌলিক অধিকার বলবৎকরণ এবং সংবিধিবদ্ধ কর্তৃপক্ষের দায়িত্ব পালনে ব্যর্থতার বিরুদ্ধে ৫ প্রকারের রিট জারি করার সাংবিধানিক এখতিয়ার প্রদান করেছে।</p><p>এই শিক্ষামূলক নির্দেশিকায় রিট আবেদনের প্রাথমিক গ্রহণযোগ্যতা, বিকল্প সংবিধিবদ্ধ প্রতিকার নিষ্পত্তির নীতি এবং সুপ্রিম কোর্টে রিট পিটিশন দাখিলের সময় প্রয়োজনীয় নথিপত্র সংক্রান্ত সার্বিক প্রক্রিয়া আলোচনা করা হয়েছে।</p>",
                ],
                'issues' => [
                    'en' => ['Adequacy of alternative remedies', 'Locus standi under Article 102(2)', 'Jurisdictional error by statutory bodies'],
                    'bn' => ['বিকল্প প্রতিকারের পর্যাপ্ততা যাচাই', '১০২(২) অনুচ্ছেদে আবেদনকারীর আইনি অবস্থান', 'সংবিধিবদ্ধ কর্তৃপক্ষের এখতিয়ারবহির্ভূত আদেশ'],
                ],
                'arguments' => [
                    'en' => ['Writ lies where alternative remedy is onerous or ineffective', 'Violation of principles of natural justice vitiates executive action'],
                    'bn' => ['বিকল্প প্রতিকার কষ্টসাধ্য বা অকার্যকর হলে রিট রক্ষণীয়', 'প্রাকৃতিক ন্যায়বিচারের নীতি লঙ্ঘনে নির্বাহী আদেশ বাতিলযোগ্য'],
                ],
                'outcome' => [
                    'en' => 'Educational precedent reference outlining established constitutional principles.',
                    'bn' => 'সংবিধিবদ্ধ অধিকার সুরক্ষায় সুপ্রিম কোর্টের প্রতিষ্ঠিত নীতিমালার শিক্ষামূলক রূপরেখা।',
                ],
                'judgment_date' => '2024-01-15',
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'civil-litigation-stages-cpc-1908-bangladesh',
                'title' => [
                    'en' => 'Civil Litigation Procedure: Stages of Civil Suits Under CPC 1908',
                    'bn' => 'দেওয়ানি মামলার ধাপসমূহ: ১৯০৮ সালের দেওয়ানি কার্যবিধির রূপরেখা',
                ],
                'case_number' => 'Procedural Guide CPC 1908',
                'court' => 'Subordinate Civil Courts & Appellate Division',
                'case_type' => 'Civil Procedure',
                'year' => 2024,
                'legal_area' => [
                    'en' => 'Civil Law',
                    'bn' => 'দেওয়ানি আইন',
                ],
                'role' => [
                    'en' => 'Educational Procedure Guide',
                    'bn' => 'আইনি কার্যপ্রণালী নির্দেশিকা',
                ],
                'summary' => [
                    'en' => 'Comprehensive analysis of the civil adjudication workflow from plaint presentation and summons service to framing of issues, evidence recording, and decree execution under the Code of Civil Procedure 1908.',
                    'bn' => '১৯০৮ সালের দেওয়ানি কার্যবিধি অনুসারে আরজি দাখিল ও সমন জারি থেকে শুরু করে বিচার্য বিষয় নির্ধারণ, সাক্ষ্য গ্রহণ এবং ডিক্রি জারি পর্যন্ত দেওয়ানি মামলার ধারাবাহিক ধাপের বিবরণ।',
                ],
                'description' => [
                    'en' => "<p>Civil litigation in Bangladesh follows structured statutory stages governed by the Code of Civil Procedure (Act V of 1908). From the presentation of the plaint under Order VII to the execution of decrees under Order XXI, strict procedural diligence governs every proceeding.</p><p>Understanding each stage—written statement filing, discovery, framing of issues, oral and documentary evidence, and preliminary and final decrees—is vital for litigants seeking lawful protection of civil rights.</p>",
                    'bn' => "<p>বাংলাদেশে দেওয়ানি মোকদ্দমা ১৯০৮ সালের দেওয়ানি কার্যবিধির সুনির্দিষ্ট ধাপ অনুযায়ী পরিচালিত হয়। অর্ডার ৭ অনুসারে আরজি দাখিল থেকে শুরু করে অর্ডার ২১ অনুসারে ডিক্রি জারি পর্যন্ত প্রতিটি পদক্ষেপে নির্ধারিত কার্যবিধি অনুসরণ আবশ্যক।</p><p>জবাব দাখিল, বিচার্য বিষয় নির্ধারণ, সাক্ষ্য গ্রহণ এবং প্রাথমিক ও চূড়ান্ত ডিক্রি প্রদান সহ দেওয়ানি মামলার সমগ্র গতিধারা এই শিক্ষামূলক গাইডে তুলে ধরা হয়েছে।</p>",
                ],
                'issues' => [
                    'en' => ['Framing of issues under Order XIV', 'Admissibility of documentary evidence', 'Execution of decree under Order XXI'],
                    'bn' => ['অর্ডার ১৪ অনুসারে বিচার্য বিষয় নির্ধারণ', 'দালিলিক সাক্ষ্যের গ্রহণযোগ্যতা যাচাই', 'অর্ডার ২১ অনুসারে ডিক্রি জারি কার্যপ্রণালী'],
                ],
                'arguments' => [
                    'en' => ['Burden of proof lies on plaintiff under Section 101 Evidence Act', 'Doctrine of res judicata bars re-litigation under Section 11 CPC'],
                    'bn' => ['সাক্ষ্য আইনের ১০১ ধারা অনুসারে বাদীর ওপর প্রমাণের মূল দায়', 'দেওয়ানি কার্যবিধির ১১ ধারা অনুযায়ী একই বিষয়ে পুনঃমামলা নিষিদ্ধ (রেস জুডিকেটা)'],
                ],
                'outcome' => [
                    'en' => 'Standardized civil litigation workflow reference for legal study and research.',
                    'bn' => 'দেওয়ানি বিচারপ্রার্থীদের জন্য আদর্শ কার্যপ্রণালীর পদ্ধতিগত সারসংক্ষেপ।',
                ],
                'judgment_date' => '2024-02-10',
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'criminal-trial-procedure-and-bail-provisions-crpc',
                'title' => [
                    'en' => 'Criminal Proceedings & Due Process: Bail and Trial Stages Under CrPC 1898',
                    'bn' => 'ফৌজদারি বিচার ও ন্যায়বিচার প্রক্রিয়া: সিআরপিসি অনুযায়ী জামিন ও বিচারের স্তর',
                ],
                'case_number' => 'Procedural Guide CrPC 1898',
                'court' => 'Sessions Courts & High Court Division',
                'case_type' => 'Criminal Procedure',
                'year' => 2024,
                'legal_area' => [
                    'en' => 'Criminal Law',
                    'bn' => 'ফৌজদারি আইন',
                ],
                'role' => [
                    'en' => 'Educational Procedure Guide',
                    'bn' => 'আইনি কার্যপ্রণালী নির্দেশিকা',
                ],
                'summary' => [
                    'en' => 'An educational overview outlining statutory bail provisions under Sections 497 and 498, charge framing, burden of proof, and evidentiary rules governing criminal trials under Bangladesh law.',
                    'bn' => '১৮৯৮ সালের ফৌজদারি কার্যবিধির ৪৯৭ ও ৪৯৮ ধারা অনুযায়ী জামিনের আইনি বিধান, অভিযোগ গঠন, প্রমাণের দায় এবং ফৌজদারি বিচারের মূল নীতিসমূহ সংক্রান্ত পর্যালোচনা।',
                ],
                'description' => [
                    'en' => "<p>The administration of criminal justice in Bangladesh is governed by the Code of Criminal Procedure 1898 and the Penal Code 1860. The constitutional presumption of innocence remains paramount throughout police investigation, magisterial remand, and formal trial.</p><p>This educational overview examines statutory bail considerations, the distinction between bailable and non-bailable offences, the parameters of Section 498 anticipatory bail, and trial procedure before the Court of Session.</p>",
                    'bn' => "<p>বাংলাদেশে ফৌজদারি বিচারব্যবস্থা ১৮৯৮ সালের ফৌজদারি কার্যবিধি এবং ১৮৬০ সালের দণ্ডবিধির আওতায় পরিচালিত হয়। সংবিধান অনুসারে অভিযোগ প্রমাণিত না হওয়া পর্যন্ত প্রত্যেক অভিযুক্ত ব্যক্তি নির্দোষ বিবেচিত হন।</p><p>এই শিক্ষামূলক বিশ্লেষণে জামিনযোগ্য ও জামিন-অযোগ্য অপরাধের পার্থক্য, ৪৯৭ ও ৪৯৮ ধারা অনুসারে জামিন বিবেচনার মূল শর্তাবলী এবং দায়রা আদালতের বিচারিক পর্যায় বিশদভাবে আলোচনা করা হয়েছে।</p>",
                ],
                'issues' => [
                    'en' => ['Parameters of anticipatory bail under Section 498', 'Charge framing requirements under Section 242/265D', 'Presumption of innocence under Constitution'],
                    'bn' => ['৪৯৮ ধারা অনুসারে আগাম জামিন বিবেচনার নীতিমালা', '২৪২ ও ২৬৫ঘ ধারা অনুসারে সুনির্দিষ্ট অভিযোগ গঠন', 'সংবিধানে নিশ্চিত নির্দোষিতার পূর্বানুমান'],
                ],
                'arguments' => [
                    'en' => ['Personal liberty is protected under Article 31 and 32', 'Bail is rule and jail is exception in eligible bailable circumstances'],
                    'bn' => ['সংবিধানের ৩১ ও ৩২ অনুচ্ছেদে নাগরিকের ব্যক্তি স্বাধীনতার নিশ্চয়তা', 'উপযুক্ত শর্তাধীনে জামিন প্রদান আদালতের আইনসম্মত বিচারিক অধিকার'],
                ],
                'outcome' => [
                    'en' => 'Educational treatise on statutory criminal safeguards in Bangladesh courts.',
                    'bn' => 'বাংলাদেশের ফৌজদারি আদালতে নাগরিকের সংবিধিবদ্ধ সুরক্ষা সংক্রান্ত নির্দেশিকা।',
                ],
                'judgment_date' => '2024-03-05',
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($items as $data) {
            CourtroomExperience::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }

    /**
     * 3. Section 6: Landmark Judgment Reviews — Verifiable Bangladesh Supreme Court Precedents.
     */
    protected function seedLandmarkJudgmentReviews(): void
    {
        $reviews = [
            [
                'slug' => 'masdar-hossain-case-52-dlr-ad-82',
                'case_name' => [
                    'en' => 'Secretary, Ministry of Finance v. Masdar Hossain',
                    'bn' => 'অর্থ সচিব বনাম মাসদার হোসেন',
                ],
                'citation' => '52 DLR (AD) 82',
                'court' => 'Appellate Division, Supreme Court of Bangladesh',
                'judgment_date' => '1999-12-02',
                'legal_area' => [
                    'en' => 'Constitutional Law & Judicial Independence',
                    'bn' => 'সাংবিধানিক আইন ও বিচার বিভাগের স্বাধীনতা',
                ],
                'summary' => [
                    'en' => 'Landmark constitutional precedent concerning the separation of the judiciary from the executive organ of the State pursuant to Article 22 of the Constitution of Bangladesh.',
                    'bn' => 'বাংলাদেশ সংবিধানের ২২ অনুচ্ছেদ অনুসারে নির্বাহী বিভাগ থেকে বিচার বিভাগ পৃথকীকরণ সংক্রান্ত সুপ্রিম কোর্টের ঐতিহাসিক সাংবিধানিক নজির।',
                ],
                'key_issues' => [
                    'en' => ['Separation of the judiciary under Article 22', 'Independence of subordinate judiciary from executive control', 'Constitutional mandate for judicial service rules'],
                    'bn' => ['সংবিধানের ২২ অনুচ্ছেদ অনুযায়ী বিচার বিভাগ পৃথকীকরণ', 'নির্বাহী নিয়ন্ত্রণ থেকে অধস্তন বিচার বিভাগের প্রাতিষ্ঠানিক স্বাধীনতা', 'বিচার বিভাগীয় সার্ভিস বিধিমালার সাংবিধানিক বাধ্যবাধকতা'],
                ],
                'court_decision' => [
                    'en' => 'The Appellate Division issued 12 historic directives requiring the establishment of a separate Judicial Service Commission and ensuring independent service rules for judicial officers free from executive control.',
                    'bn' => 'আপিল বিভাগ পৃথক জুডিশিয়াল সার্ভিস কমিশন গঠন এবং বিচার বিভাগীয় কর্মকর্তাদের জন্য স্বাধীন সার্ভিস বিধিমালা প্রণয়ন সহ ১২ দফা ঐতিহাসিক নির্দেশনা প্রদান করে।',
                ],
                'author_analysis' => [
                    'en' => 'This judgment represents the cornerstone of judicial independence in Bangladesh, establishing that the rule of law requires the judicial branch to function free from executive discretion.',
                    'bn' => 'এই রায়টি বাংলাদেশে বিচার বিভাগের স্বাধীনতার মূল স্তম্ভ, যা নিশ্চিত করেছে যে আইনের শাসন বজায় রাখতে বিচারিক ক্ষমতা প্রয়োগে নির্বাহী নিয়ন্ত্রণ গ্রহণযোগ্য নয়।',
                ],
                'practical_significance' => [
                    'en' => 'Directly led to the formal separation of the judiciary on 1 November 2007 and institutional autonomy for subordinate court judges across Bangladesh.',
                    'bn' => '২০০৭ সালের ১ নভেম্বরে বিচার বিভাগের আনুষ্ঠানিক পৃথকীকরণ এবং বিচারকদের জন্য স্বতন্ত্র সার্ভিস কাঠামোর ভিত্তি তৈরি করে।',
                ],
                'author' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'anwar-hossain-chowdhury-8th-amendment-case',
                'case_name' => [
                    'en' => 'Anwar Hossain Chowdhury v. Bangladesh (8th Amendment Case)',
                    'bn' => 'আনোয়ার হোসেন চৌধুরী বনাম বাংলাদেশ (অষ্টম সংশোধনী মামলা)',
                ],
                'citation' => '1989 BLD (Spl) 1',
                'court' => 'Appellate Division, Supreme Court of Bangladesh',
                'judgment_date' => '1989-09-02',
                'legal_area' => [
                    'en' => 'Constitutional Law & Basic Structure',
                    'bn' => 'সাংবিধানিক আইন ও মৌলিক কাঠামো',
                ],
                'summary' => [
                    'en' => 'The landmark decision that incorporated the Basic Structure Doctrine into Bangladesh constitutional jurisprudence, invalidating permanent High Court Division benches created outside the capital.',
                    'bn' => 'বাংলাদেশের সাংবিধানিক আইনে বেসিক স্ট্রাকচার ডকট্রিন প্রতিষ্ঠা করা ঐতিহাসিক রায়, যার মাধ্যমে সংবিধানের মৌলিক কাঠামো পরিবর্তনের অসাংবিধানিকতা নির্ধারিত হয়।',
                ],
                'key_issues' => [
                    'en' => ["Scope of Parliament's amending power under Article 142", "Inviolability of the Supreme Court's unitary character", 'Application of the Basic Structure doctrine in Bangladesh'],
                    'bn' => ['সংবিধানের ১৪২ অনুচ্ছেদের অধীনে সংশোধন ক্ষমতার পরিধি', 'সুপ্রিম কোর্টের একক চরিত্রের অলঙ্ঘনীয়তা', 'বাংলাদেশে মৌলিক কাঠামো নীতির প্রয়োগ'],
                ],
                'court_decision' => [
                    'en' => "The Appellate Division held by majority that Parliament's amending power under Article 142 cannot alter the structural pillars and unitary character of the Supreme Court.",
                    'bn' => 'আপিল বিভাগ রায় দেয় যে সংবিধানের ১৪২ অনুচ্ছেদের অধীন সংসদের সংশোধনী ক্ষমতা সুপ্রিম কোর্টের একক চরিত্র ও মৌলিক কাঠামোগত স্তম্ভ ধ্বংস করতে পারে না।',
                ],
                'author_analysis' => [
                    'en' => 'Affirmed judicial review of constitutional amendments, guaranteeing that core democratic institutions and the unified Supreme Court cannot be dissolved through ordinary legislative amendment.',
                    'bn' => 'সংবিধান সংশোধনের ওপর বিচারিক পর্যালোচনার ক্ষমতা সুদৃঢ় করে এবং প্রমাণ করে যে সংবিধানের মৌলিক চরিত্র আইনসভার সাধারণ ইচ্ছার দ্বারা ক্ষুণ্ণ করা যাবে না।',
                ],
                'practical_significance' => [
                    'en' => 'Foundational precedent establishing that constitutional supremacy limits legislative power and protects the structural integrity of the judiciary.',
                    'bn' => 'সংবিধানের শ্রেষ্ঠত্ব সংরক্ষণ এবং সংসদীয় সংশোধনী ক্ষমতার আইনি সীমাবদ্ধতা নির্ধারণের প্রধানতম নজির।',
                ],
                'author' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'dr-mohiuddin-farooque-fap-20-49-dlr-ad-1',
                'case_name' => [
                    'en' => 'Dr. Mohiuddin Farooque v. Bangladesh (FAP 20 Case)',
                    'bn' => 'ড. মহিউদ্দিন ফারুক বনাম বাংলাদেশ (এফএপি ২০ মামলা)',
                ],
                'citation' => '49 DLR (AD) 1',
                'court' => 'Appellate Division, Supreme Court of Bangladesh',
                'judgment_date' => '1997-07-25',
                'legal_area' => [
                    'en' => 'Environmental & Public Interest Litigation',
                    'bn' => 'পরিবেশ ও জনস্বার্থ মামলা',
                ],
                'summary' => [
                    'en' => 'Pioneering public interest litigation (PIL) precedent expanding the interpretation of "any person aggrieved" under Article 102 of the Constitution of Bangladesh.',
                    'bn' => 'বাংলাদেশ সংবিধানের ১০২ অনুচ্ছেদে সংক্ষুব্ধ ব্যক্তি (person aggrieved) ধারণার উদার ব্যাখ্যা প্রদানকারী যুগান্তকারী জনস্বার্থমূলক মামলা।',
                ],
                'key_issues' => [
                    'en' => ['Locus standi of environmental advocates and public organizations', 'Expansive interpretation of Article 102', 'Right to a wholesome environment as part of right to life under Article 32'],
                    'bn' => ['পরিবেশ ও নাগরিক সংস্থার আইনি অবস্থানের অধিকার (Locus Standi)', '১০২ অনুচ্ছেদে সংক্ষুব্ধ ব্যক্তির উদার সংজ্ঞা', 'সংবিধানের ৩২ অনুচ্ছেদে জীবনের অধিকারের অংশ হিসেবে সুস্থ পরিবেশ'],
                ],
                'court_decision' => [
                    'en' => 'The Appellate Division ruled that bona fide organizations and citizens acting pro bono publico on behalf of affected communities have locus standi to maintain writ petitions.',
                    'bn' => 'আপিল বিভাগ সিদ্ধান্ত দেয় যে জনস্বার্থে কাজ করা দায়িত্বশীল নাগরিক ও সংস্থা ক্ষতিগ্রস্ত জনগোষ্ঠীর পক্ষে রিট আবেদন দাখিল করার বৈধ অধিকার রাখে।',
                ],
                'author_analysis' => [
                    'en' => 'Removed restrictive standing barriers in environmental and social justice matters, enabling effective judicial protection for vulnerable communities.',
                    'bn' => 'পরিবেশ ও সামাজিক ন্যায়বিচারের প্রশ্নে আইনি অবস্থানের কঠোর প্রতিবন্ধকতা দূর করে এবং সাধারণ নাগরিকদের অধিকার সুরক্ষায় আদালতকে কার্যকর মাধ্যম হিসেবে গড়ে তোলে।',
                ],
                'practical_significance' => [
                    'en' => 'Established modern public interest litigation in Bangladesh, allowing legal redress against environmental degradation, institutional negligence, and human rights violations.',
                    'bn' => 'বাংলাদেশে আধুনিক জনস্বার্থ মামলার দিগন্ত উন্মোচন করে, যা পরিবেশ দূষণ ও প্রাতিষ্ঠানিক অনিয়মের বিরুদ্ধে আইনি সুরক্ষার পথ প্রশস্ত করেছে।',
                ],
                'author' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($reviews as $rev) {
            JudgmentReview::updateOrCreate(
                ['slug' => $rev['slug']],
                $rev
            );
        }
    }

    /**
     * 4. Section 7: Legal Research & Papers.
     * (Paper 1: CV-verified postgraduate research by Advocate Nijam Uddin; Papers 2-3: Chamber educational studies).
     */
    protected function seedLegalResearchPapers(): void
    {
        $categoryConst = Category::where('slug', 'constitutional-law')->first();
        $categoryCivil = Category::where('slug', 'civil-jurisprudence')->first();
        $categoryVillage = Category::where('slug', 'village-justice')->first();

        $papers = [
            [
                'slug' => 'comparative-study-village-courts-bangladesh',
                'category_id' => $categoryVillage?->id,
                'research_type' => 'research_paper',
                'title' => [
                    'en' => 'A Comparative Study of the Village Court System in Bangladesh: Statutory Powers and Grassroots Dispute Settlement',
                    'bn' => 'বাংলাদেশে গ্রাম আদালত ব্যবস্থার তুলনামূলক পর্যালোচনা: সংবিধিবদ্ধ এখতিয়ার ও তৃণমূল বিরোধ নিষ্পত্তি',
                ],
                'author' => [
                    'en' => 'Advocate Nijam Uddin (LL.M. Field Research)',
                    'bn' => 'এডভোকেট নিজাম উদ্দিন (এলএল.এম. মাঠপর্যায়ের গবেষণা)',
                ],
                'excerpt' => [
                    'en' => 'A year-long postgraduate socio-legal field research conducted under the Faculty of Law, University of Chittagong, examining statutory village court powers, functions, dispute settlement dynamics, and practical challenges at the grassroots in Noakhali.',
                    'bn' => 'চট্টগ্রাম বিশ্ববিদ্যালয়ের আইন অনুষদের অধীনে পরিচালিত বছরব্যাপী মাঠপর্যায়ের গবেষণা, যেখানে নোয়াখালী অঞ্চলে গ্রাম আদালতের সংবিধিবদ্ধ এখতিয়ার, ক্ষমতা এবং তৃণমূল পর্যায়ে বিরোধ নিষ্পত্তির বাস্তবসম্মত গতিপ্রকৃতি ও চ্যালেঞ্জসমূহ মূল্যায়ন করা হয়েছে।',
                ],
                'content' => [
                    'en' => "<p>The Village Courts Act 2006 (as amended) establishes a statutory forum at the Union Parishad level intended to resolve petty civil and criminal disputes swiftly and affordably. In 2012, as part of Master of Laws (LL.M.) postgraduate legal studies at the University of Chittagong, year-long empirical field research was conducted across Noakhali examining the grassroots functioning of these courts.</p><p>Key areas investigated included: the extent of community awareness regarding village court jurisdiction; the procedural interface between formal police administration and Union Parishad benches; enforcement challenges of village court decrees; and the comparative efficacy of traditional shalish versus statutory village adjudication.</p><p>The findings highlighted that while village courts offer immense potential to reduce backlog in subordinate civil and criminal courts, their long-term efficacy depends upon trained secretarial support, impartial constitution of the five-member bench, and clear public understanding of jurisdictional pecuniary limits.</p>",
                    'bn' => "<p>২০০৬ সালের গ্রাম আদালত আইন (সংশোধিত) ইউনিয়ন পরিষদ পর্যায়ে ক্ষুদ্র দেওয়ানি ও ফৌজদারি বিরোধ দ্রুত ও স্বল্পব্যয়ে নিষ্পত্তির লক্ষ্যে একটি সংবিধিবদ্ধ কাঠামো প্রতিষ্ঠা করেছে। ২০১২ সালে চট্টগ্রাম বিশ্ববিদ্যালয়ের আইন অনুষদে স্নাতকোত্তর (এলএল.এম.) শিক্ষা কার্যক্রমের অংশ হিসেবে নোয়াখালী জেলায় গ্রাম আদালতের সার্বিক কার্যকারিতার ওপর বছরব্যাপী মাঠপর্যায়ের গবেষণা পরিচালিত হয়।</p><p>গবেষণার আওতায় মূলত অনুসন্ধান করা হয়: গ্রাম আদালতের এখতিয়ার ও ক্ষমতা সম্পর্কে সাধারণ মানুষের সচেতনতার মাত্রা; থানা পুলিশ ও ইউনিয়ন পরিষদ এজলাসের পদ্ধতিগত সংযোগ; গ্রাম আদালতের সিদ্ধান্ত বাস্তবায়নের বাস্তবিক সীমাবদ্ধতা; এবং প্রচলিত ঐতিহ্যবাহী সালিশের সাথে বিধিবদ্ধ গ্রাম আদালতের তুলনামূলক কার্যকারিতা।</p><p>গবেষণার ফলাফলে দেখা যায়, গ্রাম আদালত অধস্তন আদালতের মামলার জট হ্রাসে অপরিসীম অবদান রাখতে সক্ষম হলেও এর স্থায়িত্বশীল সফলতার জন্য প্রশিক্ষিত সচিবীয় সহায়তা, নিরপেক্ষ পাঁচ সদস্যবিশিষ্ট বেঞ্চ গঠন এবং সংবিধিবদ্ধ আর্থিক এখতিয়ার সম্পর্কে সাধারণ নাগরিকের স্বচ্ছ ধারণা থাকা অপরিহার্য।</p>",
                ],
                'research_date' => '2012-10-15',
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'enforcement-fundamental-rights-article-102',
                'category_id' => $categoryConst?->id,
                'research_type' => 'constitutional_analysis',
                'title' => [
                    'en' => 'Enforcement of Fundamental Rights Under Article 102(1) of the Bangladesh Constitution',
                    'bn' => 'বাংলাদেশ সংবিধানের ১০২(১) অনুচ্ছেদ অনুসারে মৌলিক অধিকার বলবৎকরণ পদ্ধতি',
                ],
                'author' => [
                    'en' => 'Chamber Legal Research Desk',
                    'bn' => 'চেম্বার আইনি গবেষণা সেল',
                ],
                'excerpt' => [
                    'en' => 'An exhaustive analysis of the constitutional machinery for enforcing fundamental rights guaranteed under Part III of the Constitution of Bangladesh, examining judicial review standards and locus standi developments.',
                    'bn' => 'বাংলাদেশ সংবিধানের তৃতীয় ভাগে উল্লেখিত মৌলিক অধিকারসমূহ বলবৎকরণে বিচারিক পর্যালোচনার পরিধি, রিট আবেদন দাখিলের শর্তাবলী এবং আদালতের নির্দেশনার কার্যকারিতা বিষয়ক গবেষণামূলক প্রবন্ধ।',
                ],
                'content' => [
                    'en' => "<p>Part III of the Constitution of the People's Republic of Bangladesh (Articles 26 to 47A) guarantees fundamental human rights, including equality before law (Article 27), protection of right to life and personal liberty (Article 32), safeguards as to arrest and detention (Article 33), and freedom of movement, assembly, and speech (Articles 36 to 39).</p><p>Article 44 guarantees the right to move the High Court Division under Article 102(1) for the enforcement of these rights. Unlike clause (2), which requires an applicant to be a person aggrieved, clause (1) allows direct application for fundamental rights enforcement.</p><p>This research paper examines how the Supreme Court of Bangladesh has harmonized fundamental rights with public order and state security while ensuring executive accountability.</p>",
                    'bn' => "<p>গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানের তৃতীয় ভাগে (২৬ থেকে ৪৭ক অনুচ্ছেদ) নাগরিকদের মৌলিক অধিকারের নিশ্চয়তা দেওয়া হয়েছে। এর মধ্যে রয়েছে আইনের দৃষ্টিতে সমতা (২৭ অনুচ্ছেদ), জীবন ও ব্যক্তি স্বাধীনতার অধিকার (৩২ অনুচ্ছেদ), গ্রেপ্তার ও আটক সম্পর্কিত সুরক্ষা (৩৩ অনুচ্ছেদ) এবং চলাফেরা, সমাবেশ ও বাক-স্বাধীনতা (৩৬ থেকে ৩৯ অনুচ্ছেদ)।</p><p>সংবিধানের ৪৪ অনুচ্ছেদ অনুসারে মৌলিক অধিকার বলবৎ করার জন্য ১০২(১) অনুচ্ছেদের অধীনে হাইকোর্ট বিভাগে আবেদন করার অধিকার নিশ্চিত করা হয়েছে। এই গবেষণায় মৌলিক অধিকার সুরক্ষা এবং নির্বাহী বিভাগের ক্ষমতার ভারসাম্য রক্ষায় সুপ্রিম কোর্টের দৃষ্টিভঙ্গি বিশদভাবে পর্যালোচনা করা হয়েছে।</p>",
                ],
                'research_date' => '2024-01-20',
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'adr-arbitration-act-2001-bangladesh',
                'category_id' => $categoryCivil?->id,
                'research_type' => 'statutory_analysis',
                'title' => [
                    'en' => 'The Role of Alternative Dispute Resolution Under the Arbitration Act 2001',
                    'bn' => '২০০১ সালের সালিশি আইন এবং বিকল্প বিরোধ নিষ্পত্তির কার্যকারিতা',
                ],
                'author' => [
                    'en' => 'Chamber Legal Research Desk',
                    'bn' => 'চেম্বার আইনি গবেষণা সেল',
                ],
                'excerpt' => [
                    'en' => 'Evaluating statutory mechanisms for domestic commercial arbitration, enforcement of foreign arbitral awards, and judicial restraint under the Arbitration Act 2001 (Act No. I of 2001).',
                    'bn' => '২০০১ সালের সালিশ আইনের (আইন নং ১, ২০০১) আওতায় বাণিজ্যিক বিরোধ সালিশির মাধ্যমে নিষ্পত্তি, আদালতের হস্তক্ষেপের সীমাবদ্ধতা এবং আন্তর্জাতিক রোয়েদাদ কার্যকর করার আইনি রূপরেখা।',
                ],
                'content' => [
                    'en' => "<p>Commercial dispute resolution in Bangladesh underwent significant modernization with the enactment of the Arbitration Act 2001 (Act I of 2001), modeled substantially upon the UNCITRAL Model Law on International Commercial Arbitration.</p><p>Section 7 requires courts to refer parties to arbitration when a valid arbitration agreement exists, cementing judicial restraint. Furthermore, Sections 45 to 48 govern the recognition and enforcement of foreign arbitral awards under the New York Convention 1958.</p><p>This paper assesses the procedural stages of arbitral proceedings in Bangladesh, the grounds for setting aside awards under Section 42, and strategic considerations for commercial entities.</p>",
                    'bn' => "<p>২০০১ সালের সালিশ আইন প্রণয়নের মাধ্যমে বাংলাদেশে বাণিজ্যিক বিরোধ নিষ্পত্তির ক্ষেত্রে আধুনিক আইনি কাঠামো প্রতিষ্ঠিত হয়, যা আন্তর্জাতিক বাণিজ্যিক সালিশির ক্ষেত্রে জাতিসংঘের আনসিট্রাল মডেল ল (UNCITRAL Model Law)-এর ওপর ভিত্তি করে রচিত।</p><p>চুক্তিতে সালিশি ক্লজ থাকলে আদালতের হস্তক্ষেপের সীমাবদ্ধতা (ধারা ৭) এবং নিউইয়র্ক কনভেনশনের অধীনে আন্তর্জাতিক আরবিট্রেশন অ্যাওয়ার্ড কার্যকর করার প্রক্রিয়া এই প্রবন্ধে বিশ্লেষণ করা হয়েছে।</p>",
                ],
                'research_date' => '2024-02-15',
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($papers as $paper) {
            LegalResearch::updateOrCreate(
                ['slug' => $paper['slug']],
                $paper
            );
        }
    }

    /**
     * 5. Section 11: Judicial & Chamber Gallery — Institutional Legal Heritage Album.
     * (Uses only verified photographs of Advocate Nijam Uddin in storage).
     */
    protected function seedInstitutionalGalleryAlbum(): void
    {
        $categoryGal = Category::where('slug', 'judicial-architecture')->first();
        $userId = \App\Models\User::value('id');

        // Ensure Media records exist for the 4 verified photographs
        $mediaRobes = Media::firstOrCreate(
            ['filename' => 'lawyer-court-robes.jpg', 'directory' => 'lawyer'],
            [
                'uuid' => (string) Str::uuid(),
                'disk' => 'public',
                'directory' => 'lawyer',
                'filename' => 'lawyer-court-robes.jpg',
                'original_name' => 'advocate-nijam-uddin-court-robes.jpg',
                'mime_type' => 'image/jpeg',
                'extension' => 'jpg',
                'size_bytes' => 121871,
                'width' => 800,
                'height' => 1066,
                'alt_text' => [
                    'en' => 'Advocate Nijam Uddin (Haq), Supreme Court of Bangladesh in Court Robes',
                    'bn' => 'এডভোকেট নিজাম উদ্দিন (হক), বাংলাদেশ সুপ্রিম কোর্ট — আইনজীবী পোশাকে',
                ],
                'caption' => [
                    'en' => 'Official Supreme Court Advocate Portrait',
                    'bn' => 'সুপ্রিম কোর্ট তালিকাভুক্ত আইনজীবী প্রতিকৃতি',
                ],
                'variants' => [
                    'thumbnail' => '/storage/lawyer/lawyer-court-robes.jpg',
                    'medium' => '/storage/lawyer/lawyer-court-robes.jpg',
                    'large' => '/storage/lawyer/lawyer-court-robes.jpg',
                ],
                'uploaded_by' => $userId,
            ]
        );

        $mediaLibrary = Media::firstOrCreate(
            ['filename' => 'lawyer-chamber-library.jpg', 'directory' => 'lawyer'],
            [
                'uuid' => (string) Str::uuid(),
                'disk' => 'public',
                'directory' => 'lawyer',
                'filename' => 'lawyer-chamber-library.jpg',
                'original_name' => 'advocate-nijam-uddin-chamber-library.jpg',
                'mime_type' => 'image/jpeg',
                'extension' => 'jpg',
                'size_bytes' => 158863,
                'width' => 1024,
                'height' => 768,
                'alt_text' => [
                    'en' => 'Advocate Nijam Uddin studying precedents in law chamber library',
                    'bn' => 'চেম্বার লাইব্রেরিতে নজির ও আইনশাস্ত্র অধ্যয়নে এডভোকেট নিজাম উদ্দিন',
                ],
                'caption' => [
                    'en' => 'Studying legal volumes and judicial precedents in chamber library',
                    'bn' => 'সুপ্রিম কোর্ট চেম্বার লাইব্রেরিতে গবেষণারত',
                ],
                'variants' => [
                    'thumbnail' => '/storage/lawyer/lawyer-chamber-library.jpg',
                    'medium' => '/storage/lawyer/lawyer-chamber-library.jpg',
                    'large' => '/storage/lawyer/lawyer-chamber-library.jpg',
                ],
                'uploaded_by' => $userId,
            ]
        );

        $mediaDesk = Media::firstOrCreate(
            ['filename' => 'lawyer-chamber-desk.jpg', 'directory' => 'lawyer'],
            [
                'uuid' => (string) Str::uuid(),
                'disk' => 'public',
                'directory' => 'lawyer',
                'filename' => 'lawyer-chamber-desk.jpg',
                'original_name' => 'advocate-nijam-uddin-chamber-desk.jpg',
                'mime_type' => 'image/jpeg',
                'extension' => 'jpg',
                'size_bytes' => 110904,
                'width' => 800,
                'height' => 800,
                'alt_text' => [
                    'en' => 'Advocate Nijam Uddin at legal chamber conference desk',
                    'bn' => 'আইনি পরামর্শ ডেস্কে এডভোকেট নিজাম উদ্দিন',
                ],
                'caption' => [
                    'en' => 'Chamber Conference Desk at Supreme Court',
                    'bn' => 'সুপ্রিম কোর্ট চেম্বার পরামর্শ টেবিল',
                ],
                'variants' => [
                    'thumbnail' => '/storage/lawyer/lawyer-chamber-desk.jpg',
                    'medium' => '/storage/lawyer/lawyer-chamber-desk.jpg',
                    'large' => '/storage/lawyer/lawyer-chamber-desk.jpg',
                ],
                'uploaded_by' => $userId,
            ]
        );

        $mediaExec = Media::firstOrCreate(
            ['filename' => 'lawyer-executive.jpg', 'directory' => 'lawyer'],
            [
                'uuid' => (string) Str::uuid(),
                'disk' => 'public',
                'directory' => 'lawyer',
                'filename' => 'lawyer-executive.jpg',
                'original_name' => 'advocate-nijam-uddin-executive.jpg',
                'mime_type' => 'image/jpeg',
                'extension' => 'jpg',
                'size_bytes' => 130898,
                'width' => 800,
                'height' => 1013,
                'alt_text' => [
                    'en' => 'Advocate Nijam Uddin (Haq) Executive Portrait',
                    'bn' => 'এডভোকেট নিজাম উদ্দিন (হক) প্রফেশনাল পোর্ট্রেট',
                ],
                'caption' => [
                    'en' => 'Advocate Nijam Uddin (Haq), Supreme Court of Bangladesh',
                    'bn' => 'এডভোকেট নিজাম উদ্দিন (হক), বাংলাদেশ সুপ্রিম কোর্ট',
                ],
                'variants' => [
                    'thumbnail' => '/storage/lawyer/lawyer-executive.jpg',
                    'medium' => '/storage/lawyer/lawyer-executive.jpg',
                    'large' => '/storage/lawyer/lawyer-executive.jpg',
                ],
                'uploaded_by' => $userId,
            ]
        );

        $album = GalleryAlbum::updateOrCreate(
            ['slug' => 'supreme-court-bangladesh-legal-heritage'],
            [
                'category_id' => $categoryGal?->id,
                'cover_image_id' => $mediaLibrary->id,
                'title' => [
                    'en' => 'Supreme Court of Bangladesh & Chamber Heritage',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট ও চেম্বার ঐতিহ্য',
                ],
                'description' => [
                    'en' => 'Photographic documentation of Supreme Court advocacy practice, chamber law library precedent research, and consultation desks.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্টে পেশাগত অনুশীলন, চেম্বার লাইব্রেরিতে নজির ও আইন পর্যালোচনা এবং পরামর্শ সংক্রান্ত প্রামাণ্য স্থিরচিত্র।',
                ],
                'event_date' => '2024-01-01',
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 1,
            ]
        );

        // Attach images to the album
        $albumImages = [
            ['media' => $mediaRobes, 'order' => 1, 'caption' => ['en' => 'Supreme Court Advocate Robes Portrait', 'bn' => 'সুপ্রিম কোর্ট গাউন পরিহিত প্রাতিষ্ঠানিক প্রতিকৃতি']],
            ['media' => $mediaLibrary, 'order' => 2, 'caption' => ['en' => 'Chamber Legal Library & Precedent Research', 'bn' => 'চেম্বার লাইব্রেরিতে আইন গ্রন্থ ও নজির পর্যালোচনা']],
            ['media' => $mediaDesk, 'order' => 3, 'caption' => ['en' => 'Chamber Consultation Desk', 'bn' => 'চেম্বার কনসালটেশন ও মক্কেল পরামর্শ টেবিল']],
            ['media' => $mediaExec, 'order' => 4, 'caption' => ['en' => 'Executive Legal Counsel Portrait', 'bn' => 'সিনিয়র লিগ্যাল কনসালটেন্ট পোর্ট্রেট']],
        ];

        foreach ($albumImages as $img) {
            GalleryImage::updateOrCreate(
                [
                    'album_id' => $album->id,
                    'media_id' => $img['media']->id,
                ],
                [
                    'sort_order' => $img['order'],
                    'caption' => $img['caption'],
                    'alt_text' => $img['caption'],
                    'visibility' => 'public',
                ]
            );
        }
    }

    /**
     * 6. Update Homepage Sections.
     * Preserves existing approved hero, credentials, and about_preview content.
     * Enables sections with valid content; disables evidence-dependent sections that lack verified sources.
     */
    protected function updateHomepageSectionsAndCta(): void
    {
        $sectionsToUpdate = [
            'practice_areas' => [
                'title' => [
                    'en' => 'Core Practice Areas',
                    'bn' => 'প্রধান আইনি কর্মক্ষেত্র',
                ],
                'subtitle' => [
                    'en' => 'Comprehensive Legal Solutions in Bangladesh',
                    'bn' => 'সুনির্দিষ্ট ও নির্ভরযোগ্য আইনি সহায়তা',
                ],
                'content' => [
                    'en' => 'Providing structured legal counsel, representation, and strategic advisory across major domains of Bangladesh law.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট ও সংশ্লিষ্ট আদালতে প্রচলিত প্রধান প্রধান শাখায় আইনি পরামর্শ ও কার্যকর প্রতিনিধিত্ব।',
                ],
                'is_enabled' => true,
                'settings' => ['limit' => 6],
            ],
            'courtroom' => [
                'title' => [
                    'en' => 'Courtroom Procedure & Practice Guides',
                    'bn' => 'আদালতের কার্যপ্রণালী ও আইনি গাইড',
                ],
                'subtitle' => [
                    'en' => 'Procedural Steps in the Supreme Court & Subordinate Courts',
                    'bn' => 'মামলা পরিচালনা ও শুনানির ধারাবাহিক পর্যায়',
                ],
                'content' => [
                    'en' => 'Clear, practical guidance on how legal matters proceed through the High Court Division and subordinate courts under Bangladesh law.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট ও অধস্তন আদালতে মামলা দায়ের, অন্তর্বর্তীকালীন আদেশ এবং যুক্তিতর্কের নিয়মাবলি সংক্রান্ত নির্দেশিকা।',
                ],
                'is_enabled' => true,
                'settings' => ['limit' => 3],
            ],
            'judgment_reviews' => [
                'title' => [
                    'en' => 'Landmark Judgment Reviews',
                    'bn' => 'ঐতিহাসিক রায় ও বিচারিক নজির',
                ],
                'subtitle' => [
                    'en' => 'Analytical Insights into Leading Supreme Court Decisions',
                    'bn' => 'সুপ্রিম কোর্টের যুগান্তকারী রায়ের প্রাতিষ্ঠানিক পর্যালোচনা',
                ],
                'content' => [
                    'en' => 'In-depth briefings examining constitutional principles, statutory interpretations, and established ratios in landmark decisions.',
                    'bn' => 'মৌলিক অধিকার সুরক্ষা ও আইনের শাসন প্রতিষ্ঠায় বাংলাদেশ সুপ্রিম কোর্টের ঐতিহাসিক রায়ের বিশ্লেষণমূলক পর্যালোচনা।',
                ],
                'is_enabled' => true,
                'settings' => ['limit' => 3],
            ],
            'research' => [
                'title' => [
                    'en' => 'Legal Research & Treatises',
                    'bn' => 'আইনি গবেষণা ও সন্দর্ভ',
                ],
                'subtitle' => [
                    'en' => 'Scholarly Inquiries & Statutory Analyses',
                    'bn' => 'আইনশাস্ত্র ও সংবিধিবদ্ধ আইনের বিশ্লেষণ',
                ],
                'content' => [
                    'en' => 'Legal research examining grassroots dispute resolution, constitutional review under Article 102, and statutory arbitration frameworks in Bangladesh.',
                    'bn' => 'তৃণমূল পর্যায়ে গ্রাম আদালতের কার্যকারিতা, সংবিধানের ১০২ অনুচ্ছেদ এবং সালিশি আইন সংক্রান্ত গবেষণা ও আইনি পর্যালোচনা।',
                ],
                'is_enabled' => true,
                'settings' => ['limit' => 3],
            ],
            'gallery' => [
                'title' => [
                    'en' => 'Chamber & Institutional Heritage',
                    'bn' => 'চেম্বার ও প্রাতিষ্ঠানিক ঐতিহ্য',
                ],
                'subtitle' => [
                    'en' => 'Photographic Documentation of Supreme Court Chambers',
                    'bn' => 'সুপ্রিম কোর্ট চেম্বার ও আইনচর্চার আলোকচিত্র',
                ],
                'content' => [
                    'en' => 'Photographs of the advocate in Supreme Court practice robes, chamber law library, and legal conference workspace.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট, চেম্বার লাইব্রেরি এবং পরামর্শ ডেস্কের প্রামাণ্য স্থিরচিত্র।',
                ],
                'is_enabled' => true,
                'settings' => ['limit' => 6],
            ],
            // Sections requiring source evidence that are not yet verified: safely keep disabled
            'publications' => [
                'is_enabled' => false,
            ],
            'videos' => [
                'is_enabled' => false,
            ],
            'media' => [
                'is_enabled' => false,
            ],
        ];

        foreach ($sectionsToUpdate as $key => $conf) {
            $section = HomepageSection::where('section_key', $key)->first();
            if ($section) {
                if (isset($conf['title'])) {
                    $section->title = $conf['title'];
                }
                if (isset($conf['subtitle'])) {
                    $section->subtitle = $conf['subtitle'];
                }
                if (isset($conf['content'])) {
                    $section->content = $conf['content'];
                }
                if (isset($conf['settings'])) {
                    $section->settings = array_merge($section->settings ?? [], $conf['settings']);
                }
                $section->is_enabled = $conf['is_enabled'];
                $section->save();
            }
        }
    }
}

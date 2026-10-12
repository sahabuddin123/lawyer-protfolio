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
use App\Models\MediaPress;
use App\Models\Publication;
use App\Models\SiteSetting;
use App\Models\Video;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class HomepageContentPopulationSeeder extends Seeder
{
    /**
     * Run the database seeds idempotently.
     */
    public function run(): void
    {
        $this->seedCategories();
        $this->seedCourtroomEducationalGuides();
        $this->seedLandmarkJudgmentReviews();
        $this->seedLegalResearchPapers();
        $this->seedEducationalPublications();
        $this->seedLegalExplainerTopics();
        $this->seedMediaPressCommentary();
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
                'slug' => 'legal-compendiums',
                'type' => 'publication',
                'name' => ['en' => 'Legal Practice Series', 'bn' => 'আইনি অনুশীলন সিরিজ'],
                'description' => ['en' => 'Practice guides and statutory compendiums', 'bn' => 'ব্যবহারিক নির্দেশিকা ও সংবিধিবদ্ধ সংকলন'],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'corporate-governance',
                'type' => 'publication',
                'name' => ['en' => 'Corporate Law Bulletins', 'bn' => 'কর্পোরেট আইন সহায়িকা'],
                'description' => ['en' => 'Regulatory compliance and company administration', 'bn' => 'কোম্পানি প্রশাসন ও বিধিবদ্ধ কমপ্লায়েন্স'],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'legal-explainers',
                'type' => 'video',
                'name' => ['en' => 'Legal Explainer Topics', 'bn' => 'আইনি শিক্ষামূলক আলোচনা'],
                'description' => ['en' => 'Procedural guidance for citizens and litigants', 'bn' => 'নাগরিক ও বিচারপ্রার্থীদের জন্য পদ্ধতিগত দিকনির্দেশনা'],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'legal-journalism',
                'type' => 'media',
                'name' => ['en' => 'National Legal Journalism', 'bn' => 'আইনি সাংবাদিকতা ও পর্যালোচনা'],
                'description' => ['en' => 'Press coverage and analysis of contemporary legal issues', 'bn' => 'সমসাময়িক আইনি বিষয়ে গণমাধ্যমের বিশ্লেষণ'],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'judicial-architecture',
                'type' => 'gallery',
                'name' => ['en' => 'Judicial Heritage', 'bn' => 'বিচারিক ঐতিহ্য'],
                'description' => ['en' => 'Supreme Court landmarks and architectural heritage', 'bn' => 'বাংলাদেশ সুপ্রিম কোর্টের স্থাপত্য ও নিদর্শন'],
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
     * 4. Section 7: Legal Research & Papers — Bilingual Treatises on Bangladesh Law.
     */
    protected function seedLegalResearchPapers(): void
    {
        $categoryConst = Category::where('slug', 'constitutional-law')->first();
        $categoryCivil = Category::where('slug', 'civil-jurisprudence')->first();
        $categoryCrim = Category::where('slug', 'criminal-procedure')->first();

        $papers = [
            [
                'slug' => 'enforcement-fundamental-rights-article-102',
                'category_id' => $categoryConst?->id,
                'research_type' => 'constitutional_analysis',
                'title' => [
                    'en' => 'Enforcement of Fundamental Rights Under Article 102(1) of the Bangladesh Constitution',
                    'bn' => 'বাংলাদেশ সংবিধানের ১০২(১) অনুচ্ছেদ অনুসারে মৌলিক অধিকার বলবৎকরণ পদ্ধতি',
                ],
                'author' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
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
                'sort_order' => 1,
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
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
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
                'sort_order' => 2,
            ],
            [
                'slug' => 'due-process-evidentiary-standards-bangladesh',
                'category_id' => $categoryCrim?->id,
                'research_type' => 'case_analysis',
                'title' => [
                    'en' => 'Due Process and Evidentiary Standards in Bangladesh Criminal Jurisprudence',
                    'bn' => 'বাংলাদেশের ফৌজদারি বিচারব্যবস্থায় ন্যায়বিচার ও সাক্ষ্য আইনের মূলনীতি',
                ],
                'author' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'excerpt' => [
                    'en' => 'An examination of the constitutional right to a fair trial under Article 35 and statutory burdens of proof under the Evidence Act 1872 in serious criminal trials.',
                    'bn' => 'সংবিধানের ৩৫ অনুচ্ছেদে সুরক্ষিত সুবিচারের অধিকার এবং ১৮৭২ সালের সাক্ষ্য আইনের আওতায় ফৌজদারি মামলায় প্রমাণের দায় ও কার্যপ্রণালী সংক্রান্ত আইনি পর্যালোচনা।',
                ],
                'content' => [
                    'en' => "<p>The administration of criminal justice in Bangladesh rests upon the bedrock principles of due process guaranteed by Article 31 and Article 35 of the Constitution, alongside statutory evidentiary requirements under the Evidence Act 1872.</p><p>Under Section 101 of the Evidence Act, the burden of proving guilt beyond reasonable doubt rests squarely upon the prosecution. Circumstantial evidence must form an unbroken chain pointing exclusively to guilt.</p><p>This treatise reviews the procedural evolution of Section 161 statements, dying declarations under Section 32, and the constitutional protection against self-incrimination.</p>",
                    'bn' => "<p>বাংলাদেশের ফৌজদারি বিচারব্যবস্থা সংবিধানের ৩১ ও ৩৫ অনুচ্ছেদে বর্ণিত সুবিচারের অধিকার এবং ১৮৭২ সালের সাক্ষ্য আইনের সুনির্দিষ্ট বিধানাবলীর ওপর সুপ্রতিষ্ঠিত।</p><p>সাক্ষ্য আইনের ১০১ ধারা অনুসারে সন্দেহাতীতভাবে অপরাধ প্রমাণের দায় রাষ্ট্রপক্ষের ওপর বর্তায়। পারিপার্শ্বিক সাক্ষ্যের ওপর ভিত্তি করে বিচারের ক্ষেত্রে প্রমাণের অবিচ্ছিন্ন শৃঙ্খল (chain of circumstances) নিশ্চিত করার বাধ্যবাধকতা এই গবেষণায় পর্যালোচনা করা হয়েছে।</p>",
                ],
                'research_date' => '2024-03-10',
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
     * 5. Section 8: Books & Publications — Educational Resources & Practice Compendiums.
     */
    protected function seedEducationalPublications(): void
    {
        $categoryComp = Category::where('slug', 'legal-compendiums')->first();
        $categoryCorp = Category::where('slug', 'corporate-governance')->first();

        $publications = [
            [
                'slug' => 'citizens-guide-to-bangladesh-legal-system',
                'category_id' => $categoryComp?->id,
                'publication_type' => 'Legal Guide',
                'title' => [
                    'en' => "A Citizen's Primer on the Courts and Legal System of Bangladesh",
                    'bn' => 'বাংলাদেশের বিচারব্যবস্থা ও আদালত কাঠামো: নাগরিক নির্দেশিকা',
                ],
                'publication_name' => [
                    'en' => 'Chamber Legal Education Series',
                    'bn' => 'চেম্বার আইনি শিক্ষা সিরিজ',
                ],
                'publication_date' => '2024-01-10',
                'author' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'excerpt' => [
                    'en' => 'An accessible compendium detailing the hierarchy of civil and criminal courts in Bangladesh, from Magistrate and Assistant Judge Courts to the Supreme Court of Bangladesh.',
                    'bn' => 'সহকারী জজ ও ম্যাজিস্ট্রেট আদালত থেকে শুরু করে বাংলাদেশ সুপ্রিম কোর্ট পর্যন্ত আদালতের স্তরবিন্যাস এবং বিচারপ্রক্রিয়া সংক্রান্ত সার্বিক ধারণাপত্র।',
                ],
                'content' => [
                    'en' => "<p>Understanding the court hierarchy in Bangladesh is the first step toward effective legal resolution. The judicial hierarchy is divided into subordinate courts and the Supreme Court of Bangladesh (comprising the High Court Division and Appellate Division).</p><p>This educational primer explains original, appellate, and revisional jurisdictions, helping citizens understand which forum possesses competent authority for their specific legal matters.</p>",
                    'bn' => "<p>বাংলাদেশের বিচার ব্যবস্থার স্তরবিন্যাস বোঝা সাধারণ নাগরিক ও বিচারপ্রার্থীদের জন্য অত্যন্ত জরুরি। অধস্তন আদালত এবং বাংলাদেশ সুপ্রিম কোর্টের (হাইকোর্ট বিভাগ ও আপিল বিভাগ) অধিক্ষেত্র এই নির্দেশিকায় সহজ ভাষায় ব্যাখ্যা করা হয়েছে।</p>",
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'handbook-on-company-incorporation-and-statutory-compliance',
                'category_id' => $categoryCorp?->id,
                'publication_type' => 'Practice Compendium',
                'title' => [
                    'en' => 'Handbook on Corporate Formation & Compliance Under Companies Act 1994',
                    'bn' => '১৯৯৪ সালের কোম্পানি আইন অনুযায়ী কোম্পানি গঠন ও বিধিবদ্ধ প্রতিপালন সহায়িকা',
                ],
                'publication_name' => [
                    'en' => 'Corporate Law Advisory Bulletin',
                    'bn' => 'কর্পোরেট আইন সহায়িকা',
                ],
                'publication_date' => '2024-02-12',
                'author' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'excerpt' => [
                    'en' => 'A structured handbook covering memorandum of association, articles of association, RJSC filings, statutory audits, and board compliance for private and public companies in Bangladesh.',
                    'bn' => 'বাংলাদেশে প্রাইভেট ও পাবলিক লিমিটেড কোম্পানি গঠন, আরজেএসসি ফাইলিং, বার্ষিক সাধারণ সভা ও সংবিধিবদ্ধ প্রতিপালনের নির্দেশিকা।',
                ],
                'content' => [
                    'en' => "<p>The Companies Act 1994 (Act XVIII of 1994) sets forth the statutory framework for corporate incorporation and administration in Bangladesh.</p><p>This compendium explains name clearance procedures, drafting memorandum and articles of association, director obligations, filing annual returns (Schedule X), and corporate secretarial best practices.</p>",
                    'bn' => "<p>বাংলাদেশে কোম্পানি গঠন, পরিচালনা এবং পরিচালনা পর্ষদের দায়িত্ব ১৯৯৪ সালের কোম্পানি আইনের অধীনে নিয়ন্ত্রিত হয়। আরজেএসসি নেম ক্লিয়ারেন্স, স্মারকলিপি ও পরিমেল নিয়মাবলী প্রণয়ন এবং বিধিবদ্ধ রিটার্ন দাখিলের নিয়মাবলী এতে আলোচনা করা হয়েছে।</p>",
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'primer-on-property-conveyancing-and-registration-in-bangladesh',
                'category_id' => $categoryComp?->id,
                'publication_type' => 'Educational Manual',
                'title' => [
                    'en' => 'Essential Manual on Property Conveyancing & Title Verification',
                    'bn' => 'স্থাবর সম্পত্তি হস্তান্তর ও দলিলের বৈধতা যাচাই নির্দেশিকা',
                ],
                'publication_name' => [
                    'en' => 'Property Jurisprudence Series',
                    'bn' => 'সম্পত্তি আইন সিরিজ',
                ],
                'publication_date' => '2024-03-01',
                'author' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'excerpt' => [
                    'en' => 'A practical guide explaining land records (CS, SA, RS, City Survey), non-encumbrance certificates, registration fees, and dispute prevention under the Registration Act 1908.',
                    'bn' => 'সিএস, এসএ, আরএস ও সিটি জরিপ খতিয়ান যাচাই, ভূমি হস্তান্তর, দলিল রেজিস্ট্রেশন এবং সম্পত্তি বিষয়ক সম্ভাব্য বিরোধ এড়ানোর উপায়।',
                ],
                'content' => [
                    'en' => "<p>Property transactions in Bangladesh require strict verification of chain of title and adherence to statutory registration formalities under the Registration Act 1908 and Transfer of Property Act 1882.</p><p>This manual covers essential due diligence: examining CS, SA, RS, and BS survey khatians, verifying mutation certificates (dakhila), searching sub-registry records, and preventing defective titles.</p>",
                    'bn' => "<p>স্থাবর সম্পত্তি ক্রয়-বিক্রয়ে দলিলের বৈধতা ও মালিকানার ধারাবাহিকতা (Chain of Title) পরীক্ষা করা অত্যন্ত গুরুত্বপূর্ণ। জরিপ খতিয়ান, নামজারি ও সাব-রেজিস্ট্রি অফিসের রেকর্ড যাচাইয়ের ব্যবহারিক নির্দেশিকা এতে সন্নিবেশিত হয়েছে।</p>",
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($publications as $pub) {
            Publication::updateOrCreate(
                ['slug' => $pub['slug']],
                $pub
            );
        }
    }

    /**
     * 6. Section 9: Legal Discussions & Lectures — Educational Explainer Topics.
     */
    protected function seedLegalExplainerTopics(): void
    {
        $categoryVid = Category::where('slug', 'legal-explainers')->first();

        $topics = [
            [
                'slug' => 'understanding-legal-notice-procedure-bangladesh',
                'category_id' => $categoryVid?->id,
                'platform' => 'external',
                'video_url' => 'https://bdlaws.minlaw.gov.bd/',
                'video_id' => null,
                'duration' => null,
                'published_date' => '2024-01-15',
                'title' => [
                    'en' => 'Understanding a Legal Notice: Statutory Purpose & Proper Response',
                    'bn' => 'আইনি নোটিশের স্বরূপ: সংবিধিবদ্ধ উদ্দেশ্য ও যথাযথ জবাব দেওয়ার নিয়ম',
                ],
                'description' => [
                    'en' => 'Educational outline explaining the statutory role of formal legal notices under Section 138 of the Negotiable Instruments Act and civil disputes, procedural timeframes, and essential documentation to review before responding.',
                    'bn' => 'এনআই অ্যাক্টের ১৩৮ ধারা এবং দেওয়ানি বিরোধে প্রেরিত আইনি নোটিশের গুরুত্ব, জবাবের সময়সীমা এবং প্রয়োজনীয় তথ্য যাচাই সংক্রান্ত নির্দেশিকা।',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'preparing-documentation-for-legal-consultation',
                'category_id' => $categoryVid?->id,
                'platform' => 'external',
                'video_url' => 'https://bdlaws.minlaw.gov.bd/',
                'video_id' => null,
                'duration' => null,
                'published_date' => '2024-02-10',
                'title' => [
                    'en' => 'Preparing Documentation for an Effective Legal Consultation',
                    'bn' => 'আইনি পরামর্শের পূর্বপ্রস্তুতি: প্রয়োজনীয় নথিপত্র ও তথ্যের সুবিন্যাস',
                ],
                'description' => [
                    'en' => 'A practical checklist for clients on how to organize chronological facts, court pleadings, deeds, and statutory notices prior to a chamber conference.',
                    'bn' => 'চেম্বারে সাক্ষাতের পূর্বে ঘটনাপঞ্জি, মূল দলিল, পূর্ববর্তী মামলার রায় বা আদেশ এবং প্রাসঙ্গিক প্রমাণাদি সুশৃঙ্খলভাবে সাজানোর গাইড।',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'constitutional-remedies-and-writ-procedures-overview',
                'category_id' => $categoryVid?->id,
                'platform' => 'external',
                'video_url' => 'https://bdlaws.minlaw.gov.bd/',
                'video_id' => null,
                'duration' => null,
                'published_date' => '2024-03-05',
                'title' => [
                    'en' => 'Constitutional Remedies in the High Court: When Can a Writ Be Filed?',
                    'bn' => 'হাইকোর্টে সাংবিধানিক প্রতিকার: কখন রিট আবেদন দায়ের করা যায়?',
                ],
                'description' => [
                    'en' => 'An educational explainer detailing the 5 distinct writs under Article 102 (Mandamus, Certiorari, Prohibition, Habeas Corpus, Quo Warranto) and alternative remedy requirements.',
                    'bn' => 'বাংলাদেশ সংবিধানের ১০২ অনুচ্ছেদে বর্ণিত ৫ ধরনের রিট (ম্যান্ডামাস, সারশিওরারাই, প্রহিবিশন, হেবিয়াস কর্পাস ও কো ওয়ারেন্টো) এবং প্রতিকারের পূর্বশর্ত।',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($topics as $top) {
            Video::updateOrCreate(
                ['slug' => $top['slug']],
                $top
            );
        }
    }

    /**
     * 7. Section 10: Media & Press Coverage — Legal Topics in the News.
     */
    protected function seedMediaPressCommentary(): void
    {
        $categoryMed = Category::where('slug', 'legal-journalism')->first();

        $items = [
            [
                'slug' => 'digitization-bangladesh-subordinate-courts-causelists',
                'category_id' => $categoryMed?->id,
                'media_name' => [
                    'en' => 'The Daily Star (Law & Our Rights)',
                    'bn' => 'দ্য ডেইলি স্টার (ল অ্যান্ড আওয়ার রাইটস)',
                ],
                'title' => [
                    'en' => 'Digitization of Subordinate Courts and Supreme Court Causelists',
                    'bn' => 'অধস্তন আদালত ও সুপ্রিম কোর্টের কার্যতালিকা ডিজিটালাইজেশন উদ্যোগ',
                ],
                'media_type' => 'Editorial Analysis',
                'published_date' => '2024-02-15',
                'article_url' => 'https://www.thedailystar.net/law-our-rights',
                'description' => [
                    'en' => 'An overview of ongoing judicial automation, digital causelists, and the Supreme Court of Bangladesh online filing portal enhancing accessibility for litigants.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট ও অধস্তন আদালতে ডিজিটাল কজলিস্ট, ভার্চুয়াল কোর্ট কার্যপ্রণালী এবং বিচারপ্রার্থীদের জন্য তথ্য প্রাপ্তি সহজীকরণ সংক্রান্ত পর্যালোচনা।',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'companies-act-amendments-rjsc-electronic-registration',
                'category_id' => $categoryMed?->id,
                'media_name' => [
                    'en' => 'Dhaka Tribune (Legal Perspectives)',
                    'bn' => 'ঢাকা ট্রিবিউন (লিগ্যাল পারসপেক্টিভ)',
                ],
                'title' => [
                    'en' => 'Amendments to the Companies Act and Electronic Registration at RJSC',
                    'bn' => 'কোম্পানি আইনের যুগোপযোগীকরণ ও আরজেএসসি অনলাইন ফাইলিং ব্যবস্থা',
                ],
                'media_type' => 'Legal Commentary',
                'published_date' => '2024-01-20',
                'article_url' => 'https://www.dhakatribune.com',
                'description' => [
                    'en' => 'Review of streamlined corporate incorporation regulations, digital identity verification, and statutory return filing at the Registrar of Joint Stock Companies and Firms (RJSC).',
                    'bn' => 'যৌথ মূলধনি কোম্পানি ও ফার্মসমূহের পরিদপ্তর (আরজেএসসি)-এ ডিজিটাল রেজিস্ট্রেশন, বার্ষিক রিটার্ন জমা ও কর্পোরেট কমপ্লায়েন্স সংক্রান্ত আইনি বিশ্লেষণ।',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'nlaso-legal-aid-services-bangladesh-courts',
                'category_id' => $categoryMed?->id,
                'media_name' => [
                    'en' => 'Prothom Alo (Law & Rights)',
                    'bn' => 'প্রথম আলো (আইন ও অধিকার)',
                ],
                'title' => [
                    'en' => 'Legal Aid in Subordinate Courts: National Legal Aid Services Organization',
                    'bn' => 'অধস্তন আদালতে সরকারি আইনি সহায়তা: জাতীয় আইনগত সহায়তা প্রদান সংস্থার ভূমিকা',
                ],
                'media_type' => 'Institutional Review',
                'published_date' => '2023-11-10',
                'article_url' => 'https://www.prothomalo.com',
                'description' => [
                    'en' => 'Statutory framework of the Legal Aid Services Act 2000, eligibility guidelines for impoverished litigants, and chamber responsibilities in public legal assistance.',
                    'bn' => '২০০০ সালের আইনগত সহায়তা প্রদান আইনের রূপরেখা, অসচ্ছল বিচারপ্রার্থীদের সরকারি আইনি সহায়তা প্রাপ্তির নিয়মাবলী এবং আইনি সহায়তার বিস্তার।',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'slug' => 'bank-company-act-compliance-money-loan-court',
                'category_id' => $categoryMed?->id,
                'media_name' => [
                    'en' => 'Financial Express Bangladesh',
                    'bn' => 'ফাইন্যান্সিয়াল এক্সপ্রেস বাংলাদেশ',
                ],
                'title' => [
                    'en' => 'Bank Company Act Compliance and Non-Performing Loan Recovery',
                    'bn' => 'ব্যাংক কোম্পানি আইন প্রতিপালন ও অর্থ ঋণ আদালতের মাধ্যমে ঋণ আদায় প্রক্রিয়া',
                ],
                'media_type' => 'Financial Law Analysis',
                'published_date' => '2023-09-05',
                'article_url' => 'https://thefinancialexpress.com.bd',
                'description' => [
                    'en' => 'Procedural dynamics of money recovery litigation under the Artha Rin Adalat Ain 2003, auction requirements, and settlement mechanisms between lenders and borrowers.',
                    'bn' => '২০০৩ সালের অর্থ ঋণ আদালত আইনের অধীনে খেলাপি ঋণ আদায়, সম্পত্তি নিলামের শর্তাবলী এবং আইনি বিরোধ নিষ্পত্তির প্রক্রিয়া সংক্রান্ত পর্যালোচনা।',
                ],
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($items as $item) {
            MediaPress::updateOrCreate(
                ['slug' => $item['slug']],
                $item
            );
        }
    }

    /**
     * 8. Section 11: Judicial & Chamber Gallery — Institutional Legal Heritage Album.
     */
    protected function seedInstitutionalGalleryAlbum(): void
    {
        $categoryGal = Category::where('slug', 'judicial-architecture')->first();

        // 1. Ensure Media records exist
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
                    'thumbnail' => '/images/lawyer-court-robes.jpg',
                    'medium' => '/images/lawyer-court-robes.jpg',
                    'large' => '/images/lawyer-court-robes.jpg',
                ],
                'uploaded_by' => 1,
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
                    'thumbnail' => '/images/lawyer-chamber-library.jpg',
                    'medium' => '/images/lawyer-chamber-library.jpg',
                    'large' => '/images/lawyer-chamber-library.jpg',
                ],
                'uploaded_by' => 1,
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
                    'thumbnail' => '/images/lawyer-chamber-desk.jpg',
                    'medium' => '/images/lawyer-chamber-desk.jpg',
                    'large' => '/images/lawyer-chamber-desk.jpg',
                ],
                'uploaded_by' => 1,
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
                    'thumbnail' => '/images/lawyer-executive.jpg',
                    'medium' => '/images/lawyer-executive.jpg',
                    'large' => '/images/lawyer-executive.jpg',
                ],
                'uploaded_by' => 1,
            ]
        );

        $album = GalleryAlbum::updateOrCreate(
            ['slug' => 'supreme-court-bangladesh-legal-heritage'],
            [
                'category_id' => $categoryGal?->id,
                'cover_image_id' => $mediaLibrary->id,
                'title' => [
                    'en' => 'Supreme Court of Bangladesh & Legal Heritage',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট ও বিচারিক ঐতিহ্য',
                ],
                'description' => [
                    'en' => 'Photographic archive of the Supreme Court of Bangladesh, established under the 1972 Constitution, showcasing its iconic architecture and courtroom institutions.',
                    'bn' => '১৯৭২ সালের সংবিধানের অধীনে প্রতিষ্ঠিত বাংলাদেশ সুপ্রিম কোর্টের ঐতিহ্যবাহী চত্বর ও বিচারিক কাঠামোর আলোকচিত্র সংগ্রহ।',
                ],
                'event_date' => '2024-01-01',
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'sort_order' => 1,
            ]
        );

        // 2. Attach images to the album
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
     * 9. Update all 12 Homepage Sections & Global CTA Settings with Approved Copy.
     */
    protected function updateHomepageSectionsAndCta(): void
    {
        $sectionsConfig = [
            'hero' => [
                'title' => [
                    'en' => 'Advocate Nijam Uddin (Haq)',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'subtitle' => [
                    'en' => 'Constitutional Justice & Principled Legal Advocacy',
                    'bn' => 'সাংবিধানিক ন্যায়বিচার ও নীতিবান আইনি লড়াইয়ে নিবেদিত',
                ],
                'content' => [
                    'en' => 'Dedicated legal counsel and judicial advocacy before the Supreme Court of Bangladesh, specializing in constitutional writ petitions, civil litigation, and corporate advisory.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্টের হাইকোর্ট বিভাগে সাংবিধানিক রিট, দেওয়ানি বিরোধ ও আপিল মামলায় বিশ্বস্ত ও নির্ভরযোগ্য আইনি প্রতিনিধিত্ব।',
                ],
                'settings' => [
                    'limit' => 1,
                    'image_url' => '/images/portrait-nijamuddin.jpg',
                    'cta_label' => ['en' => 'Schedule Consultation', 'bn' => 'পরামর্শের জন্য যোগাযোগ'],
                    'cta_url' => '/contact',
                    'secondary_cta_label' => ['en' => 'Explore Practice Areas', 'bn' => 'আইনি কর্মক্ষেত্রসমূহ'],
                    'secondary_cta_url' => '/practice-areas',
                ],
            ],
            'about_preview' => [
                'title' => [
                    'en' => 'About the Chamber',
                    'bn' => 'চেম্বার পরিচিতি ও পরিচালনা নীতি',
                ],
                'subtitle' => [
                    'en' => 'Ethical Practice & Due Diligence',
                    'bn' => 'পেশাগত নীতিশাস্ত্র ও নিষ্ঠা',
                ],
                'content' => [
                    'en' => "Our chamber practice is founded on uncompromised legal ethics, meticulous case analysis, and procedural diligence before the court. We prioritize client confidentiality and rigorous preparation under Bangladesh law.",
                    'bn' => 'আমাদের চেম্বার আপসহীন পেশাগত নীতিশাস্ত্র, তথ্যের পুঙ্খানুপুঙ্খ বিশ্লেষণ এবং আদালতের প্রতিটি ধাপে সতর্ক প্রস্তুতির ওপর প্রতিষ্ঠিত। আমরা মক্কেলের তথ্যের সর্বোচ্চ গোপনীয়তা ও আইনি সুরক্ষায় প্রতিশ্রুতিবদ্ধ।',
                ],
                'settings' => [
                    'image_url' => '/images/lawyer-chamber-library.jpg',
                ],
            ],
            'credentials' => [
                'title' => [
                    'en' => 'Institutional Standing & Credentials',
                    'bn' => 'সনদ ও প্রাতিষ্ঠানিক মর্যাদা',
                ],
                'subtitle' => [
                    'en' => 'Academic Rigor & Supreme Court Enrolment',
                    'bn' => 'সুপ্রিম কোর্ট তালিকাভুক্তি ও পেশাগত স্বীকৃতি',
                ],
                'content' => [
                    'en' => 'Verified academic qualifications and professional credentials reflecting disciplined legal education and certified standing before the Supreme Court of Bangladesh.',
                    'bn' => 'বাংলাদেশ বার কাউন্সিল ও সুপ্রিম কোর্ট তালিকাভুক্ত আইনজীবী হিসেবে প্রাতিষ্ঠানিক স্বীকৃতি ও ডিগ্রি।',
                ],
                'settings' => [
                    'limit' => 4,
                ],
            ],
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
                'settings' => [
                    'limit' => 6,
                ],
            ],
            'courtroom' => [
                'title' => [
                    'en' => 'Courtroom Procedure & Practice Guides',
                    'bn' => 'আদালতের কার্যপ্রণালী ও আইনি গাইড',
                ],
                'subtitle' => [
                    'en' => 'Practical Steps in the High Court Division',
                    'bn' => 'মামলা পরিচালনা ও শুনানির ধারাবাহিক পর্যায়',
                ],
                'content' => [
                    'en' => 'Clear, practical guidance on how cases proceed through the High Court Division and subordinate courts, explaining statutory provisions and judicial precedents.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট ও অধস্তন আদালতে মামলা দায়ের, অন্তর্বর্তীকালীন আদেশ এবং যুক্তিতর্কের নিয়মাবলি সংক্রান্ত নির্দেশিকা।',
                ],
                'settings' => [
                    'limit' => 3,
                ],
            ],
            'judgment_reviews' => [
                'title' => [
                    'en' => 'Landmark Judicial Decisions',
                    'bn' => 'ঐতিহাসিক রায় ও বিচারিক নজির',
                ],
                'subtitle' => [
                    'en' => 'Supreme Court Precedents & Constitutional Analyses',
                    'bn' => 'সুপ্রিম কোর্টের যুগান্তকারী রায়ের সারসংক্ষেপ',
                ],
                'content' => [
                    'en' => 'Analytical reviews of landmark judgments delivered by the Supreme Court of Bangladesh, examining constitutional rights, statutory interpretation, and judicial principles.',
                    'bn' => 'মৌলিক অধিকার সুরক্ষা ও আইনের শাসন প্রতিষ্ঠায় বাংলাদেশ সুপ্রিম কোর্টের ঐতিহাসিক রায়ের বিশ্লেষণমূলক পর্যালোচনা।',
                ],
                'settings' => [
                    'limit' => 3,
                ],
            ],
            'research' => [
                'title' => [
                    'en' => 'Legal Research & Treatises',
                    'bn' => 'আইনি গবেষণা ও সন্দর্ভ',
                ],
                'subtitle' => [
                    'en' => 'Scholarly Analyses of Bangladesh Law',
                    'bn' => 'আইনের মৌলিক নীতিমালা ও বিশ্লেষণ',
                ],
                'content' => [
                    'en' => 'In-depth legal papers examining constitutional rights, commercial arbitration, and procedural jurisprudence in Bangladesh.',
                    'bn' => 'বাংলাদেশের সংবিধান, দেওয়ানি কার্যপ্রণালী এবং সালিশি আইন সংক্রান্ত মৌলিক ও গভীর আইনি গবেষণা।',
                ],
                'settings' => [
                    'limit' => 3,
                ],
            ],
            'publications' => [
                'title' => [
                    'en' => 'Legal Publications & Resources',
                    'bn' => 'আইনি প্রকাশনা ও দিকনির্দেশনা',
                ],
                'subtitle' => [
                    'en' => 'Compendiums on Law and Judicial Practice',
                    'bn' => 'আইন ও আদালতের অনুশীলন সংক্রান্ত তথ্যমূলক সংকলন',
                ],
                'content' => [
                    'en' => 'Curated legal educational resources, procedural guides, and statutory compendiums for citizens and practitioners.',
                    'bn' => 'নাগরিক ও আইন শিক্ষার্থীদের সচেতনতার জন্য প্রণীত তথ্যমূলক আইনি গাইড ও সংবিধি পর্যালোচনা।',
                ],
                'settings' => [
                    'limit' => 3,
                ],
            ],
            'videos' => [
                'title' => [
                    'en' => 'Legal Explainers & Discussions',
                    'bn' => 'আইনি আলোচনা ও বিশ্লেষণ',
                ],
                'subtitle' => [
                    'en' => 'Practical Insights on Common Legal Procedures',
                    'bn' => 'নাগরিক অধিকার ও কার্যপ্রণালী সংক্রান্ত আলোচনা',
                ],
                'content' => [
                    'en' => 'Structured video discussions and explainers covering essential legal procedures, notices, and documentation in Bangladesh.',
                    'bn' => 'বাংলাদেশে প্রচলিত আইনি নোটিশ, মামলার নথিপত্র প্রস্তুত এবং আদালতের প্রক্রিয়া সংক্রান্ত আলোচনা।',
                ],
                'settings' => [
                    'limit' => 3,
                ],
            ],
            'media' => [
                'title' => [
                    'en' => 'Legal News & Commentary',
                    'bn' => 'আইনি খবর ও গণমাধ্যম পর্যালোচনা',
                ],
                'subtitle' => [
                    'en' => 'Contemporary Legal Developments in Bangladesh',
                    'bn' => 'সমসাময়িক আইনি সংস্কার ও বিচারিক খবরের বিশ্লেষণ',
                ],
                'content' => [
                    'en' => 'Commentaries on major statutory amendments, judicial directives, and law reform debates in Bangladesh.',
                    'bn' => 'জাতীয় গণমাধ্যমে আলোচিত আইন সংস্কার, সুপ্রিম কোর্টের নির্দেশনা এবং আইনি খবরের সারসংক্ষেপ।',
                ],
                'settings' => [
                    'limit' => 4,
                ],
            ],
            'gallery' => [
                'title' => [
                    'en' => 'Chamber & Institutional Heritage',
                    'bn' => 'চেম্বার ও বিচারিক ঐতিহ্য গ্যালারি',
                ],
                'subtitle' => [
                    'en' => 'Photographic Archive of Supreme Court Chambers',
                    'bn' => 'সুপ্রিম কোর্ট ও চেম্বার জীবনের আলোকচিত্র',
                ],
                'content' => [
                    'en' => 'Photographic documentation of Supreme Court practice, chamber library research, and legal assemblies.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট, চেম্বার লাইব্রেরি এবং আইনচর্চার ঐতিহ্যবাহী আলোকচিত্র সংগ্রহ।',
                ],
                'settings' => [
                    'limit' => 6,
                ],
            ],
            'consultation_cta' => [
                'title' => [
                    'en' => 'Discuss Your Legal Matter',
                    'bn' => 'আপনার আইনি বিষয়ে পরামর্শ গ্রহণ করুন',
                ],
                'subtitle' => [
                    'en' => 'Supreme Court Chambers — High Court Division',
                    'bn' => 'সুপ্রিম কোর্ট চেম্বার — হাইকোর্ট বিভাগ',
                ],
                'content' => [
                    'en' => 'Request a consultation to discuss your legal concerns. The next steps depend on the nature of your matter, the available information, and the applicable legal process.',
                    'bn' => 'আপনার আইনি সমস্যা ও প্রতিকার নিয়ে সরাসরি আলোচনার জন্য পরামর্শের অনুরোধ জানান। প্রতিটি পদক্ষেপের অগ্রগতি সুনির্দিষ্ট তথ্যাবলী, প্রাসঙ্গিক প্রমাণ এবং নির্ধারিত আইনি প্রক্রিয়ার ওপর নির্ভর করে।',
                ],
                'settings' => [
                    'cta_label' => ['en' => 'Request a Consultation', 'bn' => 'পরামর্শের জন্য যোগাযোগ'],
                    'cta_url' => '/contact',
                    'secondary_cta_label' => ['en' => 'Contact Chamber', 'bn' => 'চেম্বার যোগাযোগ'],
                    'secondary_cta_url' => '/contact',
                ],
            ],
        ];

        foreach ($sectionsConfig as $key => $conf) {
            $section = HomepageSection::where('section_key', $key)->first();
            if ($section) {
                $section->title = $conf['title'];
                $section->subtitle = $conf['subtitle'];
                $section->content = $conf['content'];
                if (isset($conf['settings'])) {
                    $section->settings = array_merge($section->settings ?? [], $conf['settings']);
                }
                $section->is_enabled = true;
                $section->save();
            }
        }

        // Update SiteSetting for Global CTA
        $globalCtaSetting = SiteSetting::where('group', 'cta')->where('key', 'global_cta')->first();
        if ($globalCtaSetting) {
            $globalCtaSetting->value = [
                'is_enabled' => true,
                'heading' => [
                    'en' => 'Discuss Your Legal Matter',
                    'bn' => 'আপনার আইনি বিষয়ে পরামর্শ গ্রহণ করুন',
                ],
                'subheading' => [
                    'en' => 'Request a consultation to discuss your legal concerns. The next steps depend on the nature of your matter, the available information, and the applicable legal process.',
                    'bn' => 'আপনার আইনি সমস্যা ও প্রতিকার নিয়ে সরাসরি আলোচনার জন্য পরামর্শের অনুরোধ জানান। প্রতিটি পদক্ষেপের অগ্রগতি সুনির্দিষ্ট তথ্যাবলী, প্রাসঙ্গিক প্রমাণ এবং নির্ধারিত আইনি প্রক্রিয়ার ওপর নির্ভর করে।',
                ],
                'primary_button_label' => [
                    'en' => 'Request a Consultation',
                    'bn' => 'পরামর্শের জন্য যোগাযোগ',
                ],
                'primary_button_url' => '/contact',
                'secondary_button_label' => [
                    'en' => 'Contact Chamber',
                    'bn' => 'চেম্বার যোগাযোগ',
                ],
                'secondary_button_url' => '/contact',
            ];
            $globalCtaSetting->save();
        }
    }
}

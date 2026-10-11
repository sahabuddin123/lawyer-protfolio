<?php

namespace Database\Seeders;

use App\Models\PracticeArea;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class PracticeAreaSeeder extends Seeder
{
    /**
     * Seed initial 12 practice areas idempotently with complete structured content.
     */
    public function run(): void
    {
        $services = [
            // 1. Criminal Law
            [
                'slug' => 'criminal-law',
                'title' => [
                    'en' => 'Criminal Law',
                    'bn' => 'ফৌজদারি আইন',
                ],
                'short_description' => [
                    'en' => 'Legal assistance in criminal matters, including investigation-related concerns, bail, defence preparation, and proceedings before competent courts in Bangladesh.',
                    'bn' => 'তদন্ত সংশ্লিষ্ট পরামর্শ, জামিন শুনানি, বিচারিক প্রতিরক্ষা প্রস্তুতি এবং বাংলাদেশের উপযুক্ত আদালতে ফৌজদারি কার্যক্রমে দায়িত্বশীল আইনি সহায়তা।',
                ],
                'tagline' => [
                    'en' => 'Protecting rights through fair legal process',
                    'bn' => 'আইনি প্রক্রিয়া ও ন্যায্য অধিকারের সুরক্ষা',
                ],
                'full_description' => [
                    'en' => "<p>Criminal law in Bangladesh deals with offences against the state and society, and the legal process that follows such allegations. A person may face police investigation, arrest, or court proceedings in a wide range of situations. It is important to understand one's legal rights, procedural safeguards, and the available options at each stage.</p><p>Legal assistance can help you understand the allegations, relevant laws, possible courses of action, and the procedure before the competent court. Each matter depends on its own facts, applicable law, and stage of proceedings.</p><p>Advocate Nijam Uddin (Haq) provides procedural analysis and defence representation before Magistrate Courts, Sessions Courts, and the High Court Division of the Supreme Court of Bangladesh, with strict adherence to evidence and statutory procedure.</p>",
                    'bn' => "<p>বাংলাদেশে ফৌজদারি আইন রাষ্ট্র ও সমাজের বিরুদ্ধে সংঘটিত অপরাধ এবং সংশ্লিষ্ট বিচারিক প্রক্রিয়া নিয়ন্ত্রণ করে। একজন ব্যক্তি পুলিশি তদন্ত, আটকাদেশ বা সরাসরি বিচারিক প্রক্রিয়ার সম্মুখীন হতে পারেন। প্রতিটি পর্যায়ে ব্যক্তিগত আইনি সুরক্ষা এবং সংবিধিবদ্ধ প্রতিকার সম্পর্কে সম্যক ধারণা থাকা অপরিহার্য।</p><p>অভিযোগের প্রকৃতি, সংশ্লিষ্ট দণ্ডবিধি, প্রযোজ্য ফৌজদারি কার্যবিধি এবং আদালতে আত্মপক্ষ সমর্থনের সম্ভাব্য বিকল্পগুলো নির্ধারণে পদ্ধতিগত আইনি সহায়তা প্রদান করা হয়। প্রতিটি বিষয় সংশ্লিষ্ট ঘটনার উপাদান এবং বিচারিক পর্যায়ের ওপর নির্ভরশীল।</p><p>অ্যাডভোকেট নিজাম উদ্দিন (হক) বিজ্ঞ ম্যাজিস্ট্রেট আদালত, দায়রা আদালত এবং সুপ্রিম কোর্টের হাইকোর্ট বিভাগে সাক্ষ্যপ্রমাণ ও আইনি কাঠামোর সতর্ক পর্যালোচনার মাধ্যমে দায়িত্বশীল আইনি প্রতিনিধিত্ব পরিচালনা করেন।</p>",
                ],
                'icon_name' => 'scale',
                'sort_order' => 1,
                'status' => 'published',
                'is_featured' => true,
                'at_a_glance' => [
                    'area' => ['en' => 'Criminal Law', 'bn' => 'ফৌজদারি আইন'],
                    'who_it_may_help' => ['en' => 'Individuals, families, and corporate executives facing investigation or trial', 'bn' => 'তদন্ত বা বিচারের সম্মুখীন ব্যক্তি, পরিবার ও প্রতিষ্ঠান'],
                    'related_matters' => ['en' => 'Investigation, bail, trial, revision, and appellate proceedings', 'bn' => 'তদন্ত, জামিন, বিচার, রিভিশন ও আপিল সংক্রান্ত বিষয়'],
                    'jurisdiction' => ['en' => 'Magistrate Courts, Sessions Courts & Supreme Court of Bangladesh', 'bn' => 'ম্যাজিস্ট্রেট আদালত, দায়রা আদালত ও সুপ্রিম কোর্ট'],
                    'depends_on' => ['en' => 'Facts of the case, statutory provisions, and stage of proceedings', 'bn' => 'ঘটনার বিবরণ, সংশ্লিষ্ট ধারা এবং বিচারিক পর্যায়'],
                ],
                'areas_of_assistance' => [
                    [
                        'title' => ['en' => 'Investigation-related Matters', 'bn' => 'তদন্ত সংশ্লিষ্ট বিষয়'],
                        'description' => ['en' => 'Guidance on police investigation process, notices, and legal safeguards.', 'bn' => 'পুলিশি তদন্ত প্রক্রিয়া, প্রাপ্ত নোটিশ এবং সংবিধিবদ্ধ অধিকার বিষয়ে পরামর্শ।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'title' => ['en' => 'Bail-related Assistance', 'bn' => 'জামিন সংক্রান্ত সহায়তা'],
                        'description' => ['en' => 'Legal support in regular and anticipatory bail applications where applicable under law.', 'bn' => 'আইনগত কাঠামোর অধীনে নিয়মিত ও আগাম জামিনের আবেদনের জন্য প্রস্তুতি।'],
                        'icon' => 'shield',
                    ],
                    [
                        'title' => ['en' => 'Defence Preparation', 'bn' => 'প্রতিরক্ষা প্রস্তুতি'],
                        'description' => ['en' => 'Review of documents, examination of evidence, and preparation for trial advocacy.', 'bn' => 'নথি পর্যালোচনা, সাক্ষ্য-প্রমাণ যাচাই এবং শুনানির প্রস্তুতি গ্রহণ।'],
                        'icon' => 'briefcase',
                    ],
                    [
                        'title' => ['en' => 'Court Proceedings', 'bn' => 'আদালতের কার্যক্রম'],
                        'description' => ['en' => 'Representation and advocacy before competent trial and appellate courts.', 'bn' => 'উপযুক্ত বিচারিক আদালত এবং আপিল ফোরামে আইনি প্রতিনিধিত্ব।'],
                        'icon' => 'landmark',
                    ],
                    [
                        'title' => ['en' => 'Legal Advice & Opinion', 'bn' => 'আইনি পরামর্শ ও মতামত'],
                        'description' => ['en' => 'Clarification on applicable criminal statutes, procedure, and strategic options.', 'bn' => 'ফৌজদারি দণ্ডবিধি, কার্যবিধি এবং সম্ভাব্য আইনি পদক্ষেপ বিষয়ে স্পষ্টীকরণ।'],
                        'icon' => 'book-open',
                    ],
                    [
                        'title' => ['en' => 'Criminal Revisions & Appeals', 'bn' => 'রিভিশন ও আপিল আবেদন'],
                        'description' => ['en' => 'Challenging erroneous orders or judgments before the High Court Division.', 'bn' => 'অধস্তন আদালতের আদেশের বিরুদ্ধে হাইকোর্ট বিভাগে রিভিশন ও আপিল।'],
                        'icon' => 'users',
                    ],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'What should I do if I receive a notice from the police or an investigating authority?', 'bn' => 'পুলিশ বা তদন্তকারী কর্তৃপক্ষ থেকে কোনো নোটিশ পেলে কী করণীয়?']],
                    ['question' => ['en' => 'Can I apply for bail in this matter, and what factors does the court consider?', 'bn' => 'এই বিষয়ে কি জামিনের আবেদন করা সম্ভব এবং আদালত কী কী বিষয় বিবেচনা করেন?']],
                    ['question' => ['en' => 'What are my constitutional safeguards during police investigation or custody?', 'bn' => 'পুলিশি তদন্ত বা হেফাজতে থাকাকালীন আমার সাংবিধানিক অধিকারসমূহ কী কী?']],
                    ['question' => ['en' => 'How long may a criminal case take in Bangladesh from investigation to verdict?', 'bn' => 'বাংলাদেশে একটি ফৌজদারি মামলা তদন্ত থেকে রায় পর্যন্ত সাধারণত কেমন সময় নেয়?']],
                    ['question' => ['en' => 'What documents and records do I need to prepare for my defence?', 'bn' => 'আইনি প্রতিরক্ষার জন্য আমার কী কী নথিপত্র ও সাক্ষ্য প্রস্তুত রাখা প্রয়োজন?']],
                    ['question' => ['en' => 'Can a criminal proceeding be quashed if it is manifestly baseless?', 'bn' => 'ভিত্তিহীন বা হয়রানিমূলক হলে ফৌজদারি কার্যক্রম কি বাতিল (Quashment) করা যায়?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Initial Discussion', 'bn' => 'প্রাথমিক পর্যালোচনা'],
                        'description' => ['en' => 'Understand your concerns, examine background facts, and review initial information.', 'bn' => 'ঘটনার প্রেক্ষাপট ও মূল অভিযোগগুলো বিস্তারিত জেনে প্রাথমিক আলোচনা।'],
                        'icon' => 'users',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Review of Documents', 'bn' => 'নথি ও রেকর্ড পরীক্ষা'],
                        'description' => ['en' => 'Examine relevant police papers, FIR, seizure memos, or charge-sheet details.', 'bn' => 'এজাহার, জব্দতালিকা, চার্জশিট বা সংশ্লিষ্ট নথি পুঙ্খানুপুঙ্খ পরীক্ষা।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Legal Assessment', 'bn' => 'আইনি মূল্যায়ন'],
                        'description' => ['en' => 'Identify applicable legal provisions, statutory defences, and procedural remedies.', 'bn' => 'প্রযোজ্য ধারা, আইনি প্রতিরক্ষা এবং কার্যবিধির প্রতিকার চিহ্নিতকরণ।'],
                        'icon' => 'scale',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Necessary Filings', 'bn' => 'দরখাস্ত ও আবেদন দাখিল'],
                        'description' => ['en' => 'Draft and file appropriate applications, bail petitions, or written responses.', 'bn' => 'উপযুক্ত জামিন আবেদন, ওকালতনামা বা প্রয়োজনীয় দরখাস্ত প্রস্তুত ও দাখিল।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Court Proceedings', 'bn' => 'আদালতে শুনানি'],
                        'description' => ['en' => 'Formal oral arguments, representation, and procedural steps during court hearings.', 'bn' => 'আদালতের এজলাসে আইনি যুক্তি উপস্থাপন ও শুনানিতে প্রতিনিধিত্ব।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Copy of FIR (First Information Report) or G.D. (General Diary)', 'bn' => 'এজাহার (FIR) বা সাধারণ ডায়েরির (GD) অনুলিপি']],
                    ['item' => ['en' => 'Copy of Seizure List or Search Memo (if issued)', 'bn' => 'জব্দতালিকা বা তল্লাশি মেমোর কপি (যদি থাকে)']],
                    ['item' => ['en' => 'Charge Sheet or Police Final Report (where submitted)', 'bn' => 'চার্জশিট বা পুলিশ প্রতিবেদন (যদি দাখিল হয়ে থাকে)']],
                    ['item' => ['en' => 'Certified copies of previous court orders or bail orders', 'bn' => 'আদালতের পূর্ববর্তী আদেশ বা জামিন আদেশের সার্টিফাইড কপি']],
                    ['item' => ['en' => 'Identity documentation (National ID Card / Passport)', 'bn' => 'জাতীয় পরিচয়পত্র বা পাসপোর্টের অনুলিপি']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'Can bail be guaranteed in every criminal case?', 'bn' => 'ফৌজদারি মামলায় কি জামিনের নিশ্চয়তা দেওয়া সম্ভব?'],
                        'answer' => ['en' => 'No. Under Bangladesh law, bail is a matter of judicial discretion guided by statutory principles, the nature of allegations, and whether the offence is bailable or non-bailable. No responsible lawyer can promise or guarantee a specific bail outcome.', 'bn' => 'না। বাংলাদেশের আইন অনুযায়ী জামিন সম্পূর্ণ আদালতের বিচারিক বিচক্ষণতার বিষয়। অপরাধের গুরুত্ব, জামিনযোগ্য বা অ-জামিনযোগ্য শ্রেণিবিভাগ এবং পারিপার্শ্বিক প্রমাণের ভিত্তিতে আদালত সিদ্ধান্ত নেন। কোনো দায়িত্বশীল আইনজীবী জামিনের নিশ্চয়তা দিতে পারেন না।'],
                    ],
                    [
                        'question' => ['en' => 'What are my rights during a police investigation in Bangladesh?', 'bn' => 'বাংলাদেশে পুলিশি তদন্তের সময় নাগরিকের মূল অধিকার কী?'],
                        'answer' => ['en' => 'Under Articles 31, 32, and 33 of the Constitution and the Code of Criminal Procedure, an individual has the right to be informed of the grounds of arrest, the right to consult legal counsel, and protection against unlawful detention beyond 24 hours without production before a Magistrate.', 'bn' => 'সংবিধানের ৩১, ৩২ ও ৩৩ অনুচ্ছেদ এবং ফৌজদারি কার্যবিধি অনুসারে প্রত্যেক নাগরিকের গ্রেফতারের কারণ জানার, আইনজীবীর পরামর্শ নেওয়ার এবং ২৪ ঘণ্টার মধ্যে নিকটস্থ ম্যাজিস্ট্রেটের সামনে হাজির হওয়ার সাংবিধানিক অধিকার রয়েছে।'],
                    ],
                    [
                        'question' => ['en' => 'Do I need a lawyer at the initial stage of a matter?', 'bn' => 'মামলার প্রাথমিক পর্যায়েই কি আইনজীবীর পরামর্শ প্রয়োজন?'],
                        'answer' => ['en' => 'Early legal consultation helps ensure that your rights are safeguarded, required procedural documents are preserved, and mistakes during police questioning or court appearances are avoided.', 'bn' => 'প্রাথমিক পর্যায়ে আইনজীবীর পরামর্শ গ্রহণ করলে নিজের আইনগত অধিকার সুরক্ষিত থাকে, প্রয়োজনীয় প্রমাণ সংরক্ষণ করা যায় এবং পদ্ধতিগত ভুল এড়ানো সম্ভব হয়।'],
                    ],
                    [
                        'question' => ['en' => 'How long does a criminal trial take in Bangladesh?', 'bn' => 'বাংলাদেশে একটি ফৌজদারি মামলা শেষ হতে কত সময় লাগে?'],
                        'answer' => ['en' => 'The duration depends on court scheduling, availability of investigation reports and witness testimonies, court jurisdiction, and interlocutory appeals. Timelines vary considerably across jurisdictions.', 'bn' => 'মামলার নিষ্পত্তি আদালতের সময়সূচি, তদন্ত প্রতিবেদন দাখিল, সাক্ষীদের উপস্থিতি এবং আপিলের ওপর নির্ভর করে। বিভিন্ন কারণে মামলার সময়সীমা ভিন্ন হতে পারে।'],
                    ],
                    [
                        'question' => ['en' => 'Can a criminal case be withdrawn or settled out of court?', 'bn' => 'ফৌজদারি মামলা কি আপস বা প্রত্যাহারের মাধ্যমে নিষ্পত্তি করা যায়?'],
                        'answer' => ['en' => 'Certain minor offences categorized as compoundable under Section 345 of the CrPC may be settled between the parties. Non-compoundable offences cannot be privately settled and proceed before the court.', 'bn' => 'ফৌজদারি কার্যবিধির ৩৪৫ ধারায় উল্লেখিত আপসযোগ্য (Compoundable) অপরাধের ক্ষেত্রে উভয় পক্ষের সমঝোতা সম্ভব। তবে অ-আপসযোগ্য গুরুতর অপরাধে ব্যক্তিগত আপস গ্রহণযোগ্য নয়।'],
                    ],
                    [
                        'question' => ['en' => 'What documents should I bring for the first consultation?', 'bn' => 'প্রথম পরামর্শে আমার কী কী কাগজপত্র আনা উচিত?'],
                        'answer' => ['en' => 'Bring any FIR copy, police notice, summons, previous court orders, identity papers, and relevant records that explain your factual situation.', 'bn' => 'এজাহারের কপি, আদালতের সমন, নোটিশ, পূর্ববর্তী আদেশের কপি এবং ঘটনার সাথে সম্পর্কিত সকল প্রাসঙ্গিক কাগজপত্র সঙ্গে আনা বাঞ্ছনীয়।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => [
                        'en' => 'Criminal Law Services & Legal Defence | Advocate Nijam Uddin (Haq)',
                        'bn' => 'ফৌজদারি আইন সেবা ও বিচারিক প্রতিরক্ষা | অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                    ],
                    'meta_description' => [
                        'en' => 'Legal assistance in criminal proceedings, statutory bail hearings, revisions, and trial defence before competent courts in Bangladesh by Advocate Nijam Uddin (Haq).',
                        'bn' => 'বাংলাদেশের আদালত ও সুপ্রিম কোর্টে ফৌজদারি মামলা, সংবিধিবদ্ধ জামিন ও বিচারিক প্রতিরক্ষায় অ্যাডভোকেট নিজাম উদ্দিন (হক)-এর আইনি সহায়তা।',
                    ],
                ],
            ],

            // 2. Constitutional Law
            [
                'slug' => 'constitutional-law',
                'title' => [
                    'en' => 'Constitutional Law',
                    'bn' => 'সাংবিধানিক আইন',
                ],
                'short_description' => [
                    'en' => 'Enforcement of fundamental rights, judicial review of administrative action, and writ petitions under Article 102 before the High Court Division.',
                    'bn' => 'হাইকোর্ট বিভাগে সংবিধানের ১০২ অনুচ্ছেদের অধীন মৌলিক অধিকার বলবৎকরণ, প্রশাসনিক সিদ্ধান্তের বিচারিক পর্যালোচনা ও রিট মোকাদ্দমা।',
                ],
                'tagline' => [
                    'en' => 'Upholding fundamental rights and the rule of law',
                    'bn' => 'মৌলিক অধিকার ও আইনের শাসনের সাংবিধানিক সুরক্ষা',
                ],
                'full_description' => [
                    'en' => "<p>Constitutional law represents the highest tier of public law in Bangladesh, anchored on the supreme authority of the Constitution of the People's Republic of Bangladesh. Under Article 102 of the Constitution, the High Court Division exercises original writ jurisdiction to protect citizens against unlawful exercise of executive power, administrative arbitrariness, and statutory infringements.</p><p>Proceedings under constitutional jurisdiction include Writs of Mandamus to compel public duties, Certiorari to quash ultra vires orders, Prohibition to restrain unauthorized acts, Habeas Corpus to protect personal liberty, and Quo Warranto to challenge unlawful public office holdings.</p><p>Constitutional remedies depend upon establishing standing (locus standi), direct violation of fundamental rights or statutory duties, and demonstrating that no equally efficacious alternative statutory remedy exists.</p>",
                    'bn' => "<p>সাংবিধানিক আইন বাংলাদেশের সর্বোচ্চ পাবলিক আইন ব্যবস্থা, যা গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানের ওপর প্রতিষ্ঠিত। সংবিধানের ১০২ অনুচ্ছেদের অধীন সুপ্রিম কোর্টের হাইকোর্ট বিভাগ নির্বাহী ক্ষমতার অপব্যবহার, প্রশাসনিক স্বেচ্ছাচারিতা এবং বিধিবদ্ধ অধিকার লঙ্ঘনের বিরুদ্ধে নাগরিকদের সুরক্ষা প্রদানে রিট অধিক্ষেত্র পরিচালনা করে।</p><p>এ ধরনের কার্যক্রমে সরকারি দায়িত্ব পালনে বাধ্য করার জন্য ম্যান্ডামাস, কর্তৃত্ববহির্ভূত আদেশ বাতিলে সারশিওরারি, বেআইনি পদক্ষেপ প্রতিরোধে প্রহিবিশন, অবৈধ আটকাদেশের বিরুদ্ধে হেবিয়াস কর্পাস এবং কর্তৃত্বহীন পদ দখলের বিরুদ্ধে কো-ওয়ারেন্টো রিট অন্তর্ভুক্ত।</p><p>সাংবিধানিক প্রতিকার লাভের জন্য সংক্ষুব্ধ ব্যক্তির আইনগত অধিকার (Locus Standi), মৌলিক অধিকার বা বিধিবদ্ধ কর্তব্যের ব্যত্যয় এবং বিকল্প আইনগত প্রতিকারের অনুপস্থিতি প্রমাণের প্রয়োজন হয়।</p>",
                ],
                'icon_name' => 'landmark',
                'sort_order' => 2,
                'status' => 'published',
                'is_featured' => true,
                'at_a_glance' => [
                    'area' => ['en' => 'Constitutional Law & Writs', 'bn' => 'সাংবিধানিক আইন ও রিট মোকাদ্দমা'],
                    'who_it_may_help' => ['en' => 'Aggrieved citizens, business organizations, civil servants, and civic bodies', 'bn' => 'সংক্ষুব্ধ নাগরিক, ব্যবসায়ী প্রতিষ্ঠান, সরকারি চাকরিজীবী ও সংগঠন'],
                    'related_matters' => ['en' => 'Writ petitions, tender disputes, regulatory overreach, fundamental rights', 'bn' => 'রিট পিটিশন, টেন্ডার বিরোধ, নিয়ন্ত্রক সংস্থার আদেশ, মৌলিক অধিকার'],
                    'jurisdiction' => ['en' => 'High Court Division, Supreme Court of Bangladesh', 'bn' => 'হাইকোর্ট বিভাগ, বাংলাদেশ সুপ্রিম কোর্ট'],
                    'depends_on' => ['en' => 'Locus standi, constitutional grounds, and lack of alternative remedy', 'bn' => 'সংক্ষুব্ধতা (Locus Standi), সাংবিধানিক যুক্তি ও বিকল্প প্রতিকারের অভাব'],
                ],
                'areas_of_assistance' => [
                    [
                        'title' => ['en' => 'Writ of Mandamus', 'bn' => 'ম্যান্ডামাস রিট (দায়িত্ব পালন)'],
                        'description' => ['en' => 'Compelling public authorities to perform mandatory duties required by statute.', 'bn' => 'আইনগতভাবে নির্ধারিত দায়িত্ব পালনে সরকারি কর্তৃপক্ষকে বাধ্যকরণ।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'title' => ['en' => 'Writ of Certiorari', 'bn' => 'সারশিওরারি রিট (আদেশ বাতিল)'],
                        'description' => ['en' => 'Quashing illegal, arbitrary, or ultra vires orders passed without lawful jurisdiction.', 'bn' => 'এখতিয়ারবিহীন, বেআইনি বা অসাংবিধানিক প্রশাসনিক আদেশ বাতিলকরণ।'],
                        'icon' => 'shield',
                    ],
                    [
                        'title' => ['en' => 'Writ of Prohibition', 'bn' => 'প্রহিবিশন রিট (নিবারণ আদেশ)'],
                        'description' => ['en' => 'Restraining public officials from acting beyond their lawful statutory authority.', 'bn' => 'কর্তৃত্ববহির্ভূত পদক্ষেপ গ্রহণ থেকে কর্তৃপক্ষকে বিরত রাখা।'],
                        'icon' => 'landmark',
                    ],
                    [
                        'title' => ['en' => 'Habeas Corpus', 'bn' => 'হেবিয়াস কর্পাস (ব্যক্তি স্বাধীনতা)'],
                        'description' => ['en' => 'Securing the release of persons held in unlawful or unauthorized custody.', 'bn' => 'বেআইনি আটক বা হেফাজত থেকে মুক্তির জন্য আদালতে উপস্থাপন।'],
                        'icon' => 'scale',
                    ],
                    [
                        'title' => ['en' => 'Regulatory & Tender Disputes', 'bn' => 'টেন্ডার ও প্রশাসনিক বিরোধ'],
                        'description' => ['en' => 'Judicial review of public procurement, licensing, and regulatory sanctions.', 'bn' => 'সরকারি ক্রয়, লাইসেন্স বাতিল বা নিয়ন্ত্রক সংস্থার একতরফা আদেশের বিচারিক পর্যালোচনা।'],
                        'icon' => 'briefcase',
                    ],
                    [
                        'title' => ['en' => 'Fundamental Rights Protection', 'bn' => 'মৌলিক অধিকার সুরক্ষা'],
                        'description' => ['en' => 'Litigation safeguarding equality before law, freedom of profession, and life.', 'bn' => 'আইনের দৃষ্টিতে সমতা, পেশার স্বাধীনতা ও জীবনধারণের অধিকার নিশ্চিতকরণ।'],
                        'icon' => 'award',
                    ],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'Can every grievance against a public authority be challenged via a writ petition?', 'bn' => 'কর্তৃপক্ষের যেকোনো সিদ্ধান্তের বিরুদ্ধেই কি সরাসরি রিট করা যায়?']],
                    ['question' => ['en' => 'What is meant by locus standi (legal standing) under Article 102?', 'bn' => '১০২ অনুচ্ছেদের অধীন সংক্ষুব্ধ ব্যক্তি (Locus Standi) হওয়ার শর্ত কী?']],
                    ['question' => ['en' => 'Can administrative inaction or prolonged silence be challenged in court?', 'bn' => 'প্রশাসনিক নিষ্ক্রিয়তা বা আবেদনের দীর্ঘসূত্রতার বিরুদ্ধে কি রিট চলে?']],
                    ['question' => ['en' => 'What interim stay orders or injunctions can the High Court Division grant?', 'bn' => 'হাইকোর্ট বিভাগ থেকে কী ধরনের অন্তর্বর্তীকালীন স্থগিতাদেশ পাওয়া সম্ভব?']],
                    ['question' => ['en' => 'Must alternative statutory appeals be exhausted before filing a writ petition?', 'bn' => 'রিট করার আগে কি বিভাগীয় আপিল বা ট্রাইব্যুনাল সম্পন্ন করা বাধ্যতামূলক?']],
                    ['question' => ['en' => 'How long does a Rule Nisi hearing typically take in writ litigation?', 'bn' => 'রিট মোকদ্দমায় রুল নিশি নিষ্পত্তি হতে সাধারণত কত সময় লাগে?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Constitutional Assessment', 'bn' => 'সাংবিধানিক মূল্যায়ন'],
                        'description' => ['en' => 'Evaluate standing, constitutional grounds, and viability under Article 102.', 'bn' => 'সংবিধানের ১০২ অনুচ্ছেদের আওতায় সংক্ষুব্ধতা ও আইনি যুক্তি মূল্যায়ন।'],
                        'icon' => 'book-open',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Notice for Justice Demand', 'bn' => 'প্রশাসনিক নোটিশ বা আবেদন'],
                        'description' => ['en' => 'Verify demand for justice notice or prior statutory representations to authority.', 'bn' => 'সংশ্লিষ্ট কর্তৃপক্ষকে প্রতিকার চেয়ে পূর্বে প্রদত্ত নোটিশ বা আবেদন পরীক্ষা।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Drafting Petition & Affidavit', 'bn' => 'রিট পিটিশন ও এফিডেভিট প্রণয়ন'],
                        'description' => ['en' => 'Formulate petition with annexures, grounds, and sworn affidavit for filing.', 'bn' => 'আইনি যুক্তি ও নথিপত্র সংযুক্ত করে হলফনামাসহ পিটিশন প্রস্তুত ও দাখিল।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Motion & Rule Nisi Hearing', 'bn' => 'মোশন শুনানি ও রুল নিশি'],
                        'description' => ['en' => 'Present oral motion before the Bench seeking Rule Nisi and interim stay relief.', 'bn' => 'হাইকোর্ট বেঞ্চে মোশন শুনানি করে রুল নিশি ও অন্তর্বর্তীকালীন স্থগিতাদেশ গ্রহণ।'],
                        'icon' => 'scale',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Final Rule Hearing', 'bn' => 'রুলের চূড়ান্ত শুনানি'],
                        'description' => ['en' => 'Contest the Rule Nisi after affidavits-in-opposition to secure final judgment.', 'bn' => 'বিবাদী পক্ষের জবাবের প্রেক্ষিতে রুলের পূর্ণাঙ্গ শুনানি ও রায় অর্জন।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Copy of the impugned administrative order, notice, gazette, or decision', 'bn' => 'চ্যালেঞ্জকৃত প্রশাসনিক আদেশ, নোটিশ, গেজেট বা সিদ্ধান্তের অনুলিপি']],
                    ['item' => ['en' => 'Prior representations, appeals, or legal notice demanding justice', 'bn' => 'পূর্বে সংশ্লিষ্ট কর্তৃপক্ষের কাছে প্রদত্ত আবেদন বা নোটিশ ফর জাস্টিস']],
                    ['item' => ['en' => 'Tender schedule, licensing documents, or contract papers (if relevant)', 'bn' => 'দরপত্র তফসিল, লাইসেন্স বা সংশ্লিষ্ট চুক্তির কাগজপত্র (প্রযোজ্য ক্ষেত্রে)']],
                    ['item' => ['en' => 'Evidence demonstrating fundamental right infringement or lack of authority', 'bn' => 'মৌলিক অধিকার লঙ্ঘন বা ক্ষমতার অপব্যবহার প্রমাণকারী নথিপত্র']],
                    ['item' => ['en' => 'National ID / Passport and power of attorney (if corporation/entity)', 'bn' => 'জাতীয় পরিচয়পত্র ও প্রতিষ্ঠাগত প্রতিনিধিত্বের ক্ষমতাপত্র']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'What is Article 102 of the Constitution of Bangladesh?', 'bn' => 'বাংলাদেশের সংবিধানের ১০২ অনুচ্ছেদ কী?'],
                        'answer' => ['en' => 'Article 102 empowers the High Court Division to enforce fundamental rights and issue writ directions against public bodies acting unlawfully, arbitrarily, or outside statutory bounds.', 'bn' => '১০২ অনুচ্ছেদ সুপ্রিম কোর্টের হাইকোর্ট বিভাগকে মৌলিক অধিকার বলবৎকরণ এবং কোনো সরকারি কর্তৃপক্ষ বেআইনি বা কর্তৃত্বহীন কাজ করলে তার বিরুদ্ধে রিট জারি করার ক্ষমতা দেয়।'],
                    ],
                    [
                        'question' => ['en' => 'What is a Rule Nisi in constitutional writ litigation?', 'bn' => 'রিট কার্যক্রমে রুল নিশি (Rule Nisi) বলতে কী বোঝায়?'],
                        'answer' => ['en' => 'A Rule Nisi is an initial directive from the High Court asking the respondent authorities to show cause why the impugned action should not be declared unlawful and set aside.', 'bn' => 'রুল নিশি হলো হাইকোর্টের একটি প্রাথমিক নির্দেশ, যাতে সংশ্লিষ্ট বিবাদী কর্তৃপক্ষকে কারণ দর্শাতে বলা হয় কেন চ্যালেঞ্জকৃত সিদ্ধান্তটি বেআইনি ঘোষণা করা হবে না।'],
                    ],
                    [
                        'question' => ['en' => 'Can a private dispute be resolved through a writ petition?', 'bn' => 'ব্যক্তিগত বিরোধ কি রিটের মাধ্যমে নিষ্পত্তি করা যায়?'],
                        'answer' => ['en' => 'Generally, no. Writs lie primarily against the government, statutory corporations, and persons performing public functions. Private contractual disputes belong in civil courts or arbitration.', 'bn' => 'সাধারণত না। রিট মূলত সরকার, বিধিবদ্ধ সংস্থা বা পাবলিক দায়িত্ব পালনকারী কর্তৃপক্ষের বিরুদ্ধে চলে। খাঁটি ব্যক্তিগত বা চুক্তিভিত্তিক বিরোধের জন্য দেওয়ানি আদালত বা সালিশ প্রযোজ্য।'],
                    ],
                    [
                        'question' => ['en' => 'Can the High Court Division issue an immediate stay order?', 'bn' => 'হাইকোর্ট বিভাগ কি তাৎক্ষণিক স্থগিতাদেশ প্রদান করতে পারেন?'],
                        'answer' => ['en' => 'Yes. Upon hearing the motion, if a prima facie case and balance of convenience exist, the Court may grant an interim stay restraining the operation of the impugned order.', 'bn' => 'হ্যাঁ। মোশন শুনানিতে সন্তুষ্ট হলে আদালত ন্যায়বিচারের স্বার্থে চ্যালেঞ্জকৃত আদেশের ওপর অন্তর্বর্তীকালীন স্থগিতাদেশ প্রদান করতে পারেন।'],
                    ],
                    [
                        'question' => ['en' => 'What happens if a statutory alternative remedy exists?', 'bn' => 'যদি আইনে কোনো বিকল্প আপিল প্রতিকার থাকে তবে কী হয়?'],
                        'answer' => ['en' => 'The Constitution stipulates that writs are available where no other equally efficacious remedy exists. However, exceptions apply when the order is completely without jurisdiction or violates fundamental rights.', 'bn' => 'আইনে সমমানের বিকল্প প্রতিকার থাকলে সাধারণত রিট গ্রহণ করা হয় না। তবে আদেশটি সম্পূর্ণ এখতিয়ারবহির্ভূত হলে বা মৌলিক অধিকার ক্ষুণ্ণ হলে সরাসরি রিট শুনানি হতে পারে।'],
                    ],
                    [
                        'question' => ['en' => 'What is the recourse if an authority disobeys a High Court writ direction?', 'bn' => 'হাইকোর্টের রিট নির্দেশনা কর্তৃপক্ষ অমান্য করলে কী করণীয়?'],
                        'answer' => ['en' => 'If a public authority willfully disobeys a directive issued under Article 102, a Contempt of Court petition under Article 108 and the Contempt of Courts Act may be initiated.', 'bn' => 'কোনো কর্তৃপক্ষ রিটের নির্দেশ ইচ্ছাকৃতভাবে অমান্য করলে সংবিধানের ১০৮ অনুচ্ছেদের অধীনে আদালত অবমাননার (Contempt of Court) মোকদ্দমা দায়ের করা যায়।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => [
                        'en' => 'Constitutional Law & Writ Petitions | Advocate Nijam Uddin (Haq)',
                        'bn' => 'সাংবিধানিক আইন ও রিট মোকাদ্দমা | অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                    ],
                    'meta_description' => [
                        'en' => 'Constitutional writ litigation under Article 102, fundamental rights protection, and judicial review before the High Court Division by Advocate Nijam Uddin (Haq).',
                        'bn' => 'বাংলাদেশ সুপ্রিম কোর্টের হাইকোর্ট বিভাগে সংবিধানের ১০২ অনুচ্ছেদে রিট পিটিশন ও মৌলিক অধিকার সুরক্ষায় অ্যাডভোকেট নিজাম উদ্দিন (হক)-এর প্রতিনিধিত্ব।',
                    ],
                ],
            ],

            // 3. Civil Law
            [
                'slug' => 'civil-law',
                'title' => ['en' => 'Civil Law', 'bn' => 'দেওয়ানি আইন'],
                'short_description' => [
                    'en' => 'Resolution of civil disputes, title suits, land property conflicts, specific performance, and money suits across competent civil courts.',
                    'bn' => 'স্থাবর সম্পত্তির স্বত্ব ও মালিকানা বিরোধ, বাটোয়ারা, চুক্তি প্রবল এবং দেওয়ানি আদালতে অর্থ আদায়ের মোকদ্দমায় আইনগত সহায়তা।',
                ],
                'tagline' => ['en' => 'Protecting property rights and contractual civil entitlements', 'bn' => 'সম্পত্তির স্বত্ব ও দেওয়ানি অধিকারের দায়িত্বশীল সমাধান'],
                'full_description' => [
                    'en' => "<p>Civil law in Bangladesh governs disputes regarding ownership of immovable property, contractual engagements, money claims, declarations of legal character, and succession. Civil proceedings require meticulous examination of title documents, revenue survey records (CS, SA, RS, BS), registered deeds, and continuous lawful possession.</p><p>We provide legal advocacy in declaration of title, recovery of possession under the Specific Relief Act, partition suits among co-sharers, suits for specific performance of contract, and money suits. Representation extends from subordinate civil courts to civil revisions and appeals before the High Court Division.</p><p>Because civil litigation is inherently evidence-driven, thorough preliminary scrutiny of documents and title chains is essential prior to instituting or defending a suit.</p>",
                    'bn' => "<p>বাংলাদেশে দেওয়ানি আইন স্থাবর সম্পত্তির মালিকানা, চুক্তিভিত্তিক লেনদেন, অর্থ আদায় এবং উত্তরাধিকার সংক্রান্ত বিরোধ নিয়ন্ত্রণ করে। দেওয়ানি মোকদ্দমা পরিচালনার জন্য স্বত্বের মূল দলিল, ভূমি জরিপের খতিয়ান (CS, SA, RS, BS), নামজারি ও নিরবচ্ছিন্ন দখলের প্রমাণ বিশদভাবে পর্যালোচনা করা প্রয়োজন।</p><p>আমরা স্বত্ব ঘোষণা, দখল পুনরুদ্ধার, যৌথ সম্পত্তির বাটোয়ারা, বায়না চুক্তি প্রবলকরণ (Specific Performance) এবং অর্থ আদায়ের মামলায় আইনি প্রতিনিধিত্ব প্রদান করি। অধস্তন দেওয়ানি আদালত থেকে শুরু করে হাইকোর্ট বিভাগে আপিল ও রিভিশন শুনানি পর্যন্ত চেম্বার সেবা অব্যাহত থাকে।</p><p>দেওয়ানি বিরোধ সম্পূর্ণভাবে দালিলিক প্রমাণের ওপর নির্ভরশীল হওয়ায় মোকদ্দমা দায়ের বা জবাব দাখিলের পূর্বে দলিলের ধারাবাহিকতা যাচাই করা আবশ্যক।</p>",
                ],
                'icon_name' => 'balance',
                'sort_order' => 3,
                'status' => 'published',
                'is_featured' => true,
                'at_a_glance' => [
                    'area' => ['en' => 'Civil Litigation & Land Law', 'bn' => 'দেওয়ানি মোকদ্দমা ও ভূমি আইন'],
                    'who_it_may_help' => ['en' => 'Landowners, buyers, joint-property co-sharers, creditors', 'bn' => 'ভূমির মালিক, ক্রেতা, যৌথ সম্পত্তির অংশীদার ও পাওনাদার'],
                    'related_matters' => ['en' => 'Title suits, partition, injunctions, specific performance, money claims', 'bn' => 'স্বত্ব ঘোষণা, বাটোয়ারা, নিষেধাজ্ঞা, চুক্তি প্রবল, অর্থ দাবি'],
                    'jurisdiction' => ['en' => 'Civil Courts, District Judge Courts & High Court Division', 'bn' => 'দেওয়ানি আদালত, জেলা জজ আদালত ও হাইকোর্ট বিভাগ'],
                    'depends_on' => ['en' => 'Title deeds, survey katians, possession evidence, limitation period', 'bn' => 'মূল দলিল, খতিয়ান, দখল প্রমাণ এবং তামাদির আইনগত সময়সীমা'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Declaration of Title', 'bn' => 'স্বত্ব ঘোষণার মোকদ্দমা'], 'description' => ['en' => 'Legal suits seeking declaration of ownership over disputed immovable property.', 'bn' => 'বিরোধপূর্ণ স্থাবর সম্পত্তিতে নির্ভেজাল মালিকানা ঘোষণার মামলা।'], 'icon' => 'file-text'],
                    ['title' => ['en' => 'Partition Suits', 'bn' => 'বাটোয়ারা ও বণ্টন মামলা'], 'description' => ['en' => 'Division and allotment of inherited or joint family properties.', 'bn' => 'উত্তরাধিকার সূত্রে প্রাপ্ত বা যৌথ পারিবারিক সম্পত্তির আইনানুগ ভাগ-বাটোয়ারা।'], 'icon' => 'users'],
                    ['title' => ['en' => 'Injunctions & Stay Relief', 'bn' => 'নিষেধাজ্ঞা সংক্রান্ত আবেদন'], 'description' => ['en' => 'Temporary and permanent injunctions to prevent dispossession or waste.', 'bn' => 'দখলচ্যুতি বা জমিতে রূপান্তর প্রতিরোধে অস্থায়ী ও স্থায়ী নিষেধাজ্ঞা।'], 'icon' => 'shield'],
                    ['title' => ['en' => 'Specific Performance of Contract', 'bn' => 'চুক্তি প্রবলের মামলা'], 'description' => ['en' => 'Enforcing registered land sale agreements (Baina Nama) through court.', 'bn' => 'রেজিস্ট্রিকৃত বায়না দলিলের ভিত্তিতে জমি রেজিস্ট্রি করে নেওয়ার মোকদ্দমা।'], 'icon' => 'briefcase'],
                    ['title' => ['en' => 'Money Suits & Debt Claims', 'bn' => 'অর্থ দাবি ও ঋণ আদায়'], 'description' => ['en' => 'Recovery of commercial debts, contract dues, and execution proceedings.', 'bn' => 'ব্যবসায়িক পাওনা, বকেয়া অর্থ উদ্ধার ও ডিক্রি জারী কার্যক্রম।'], 'icon' => 'scale'],
                    ['title' => ['en' => 'Civil Appeals & Revisions', 'bn' => 'দেওয়ানি আপিল ও রিভিশন'], 'description' => ['en' => 'Appellate advocacy before District Courts and the High Court Division.', 'bn' => 'অধস্তন আদালতের রায়ের বিরুদ্ধে জেলা আদালত ও হাইকোর্টে আপিল-রিভিশন।'], 'icon' => 'landmark'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'How can I protect my land from unlawful encroachment or dispossession?', 'bn' => 'বেআইনি দখল বা উচ্ছেদের ঝুঁকি থেকে নিজের জমি কীভাবে রক্ষা করব?']],
                    ['question' => ['en' => 'What is the period of limitation for challenging a fraudulent registered deed?', 'bn' => 'জাল দলিল চ্যালেঞ্জ করে বাতিলের মামলায় তামাদির সময়সীমা কত?']],
                    ['question' => ['en' => 'Can joint property co-sharers sell their undivided share to a third party?', 'bn' => 'যৌথ সম্পত্তির অংশীদাররা কি নিজেদের অবিভক্ত অংশ বাইরের ব্যক্তির কাছে বেচতে পারেন?']],
                    ['question' => ['en' => 'What conditions must be satisfied to obtain a temporary injunction?', 'bn' => 'দেওয়ানি আদালতে অস্থায়ী নিষেধাজ্ঞা পাওয়ার মূল শর্তগুলো কী কী?']],
                    ['question' => ['en' => 'How does a buyer enforce an agreement for sale if the seller refuses registration?', 'bn' => 'বায়না করার পর বিক্রেতা সাব-কবলা দলিল করে না দিলে কী আইনগত পদক্ষেপ নেওয়া যায়?']],
                    ['question' => ['en' => 'What is the process for executing a money decree or property decree?', 'bn' => 'আদালতের দেওয়া রায় বা ডিক্রি কীভাবে কার্যকর (Execution) করা হয়?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Document & Chain-of-Title Review', 'bn' => 'দলিল ও স্বত্ব পর্যালোচনা'],
                        'description' => ['en' => 'Scrutinize original title deeds, mutation papers, survey records, and possession.', 'bn' => 'মূল বায়া দলিল, নামজারি, বিভিন্ন জরিপের খতিয়ান ও দখল পুঙ্খানুপুঙ্খ যাচাই।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Legal Notice & Settlement Attempt', 'bn' => 'লিগ্যাল নোটিশ বা আপস চেষ্টা'],
                        'description' => ['en' => 'Issue statutory demand notice or evaluate possibilities for amicable settlement.', 'bn' => 'প্রয়োজনে লিগ্যাল নোটিশ প্রেরণ বা সমঝোতার পথ খোলা রাখা।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Plaint Drafting & Filing', 'bn' => 'আরজি প্রণয়ন ও মোকদ্দমা দায়ের'],
                        'description' => ['en' => 'Prepare the formal plaint, compute ad valorem court fees, and file in court.', 'bn' => 'যথাযথ কোর্ট ফিসহ আইনানুগ আরজি প্রস্তুত করে সংশ্লিষ্ট আদালতে দায়ের।'],
                        'icon' => 'book-open',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Injunction & Summons Hearing', 'bn' => 'সমন ও নিষেধাজ্ঞা শুনানি'],
                        'description' => ['en' => 'Argue applications for temporary injunction and monitor service of summons.', 'bn' => 'বিবাদীর প্রতি সমন জারি এবং অন্তর্বর্তীকালীন নিষেধাজ্ঞা বিষয়ে শুনানি।'],
                        'icon' => 'shield',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Trial & Final Argument', 'bn' => 'সাক্ষ্য গ্রহণ ও চূড়ান্ত শুনানি'],
                        'description' => ['en' => 'Examine witnesses, tender documentary exhibits, and deliver closing arguments.', 'bn' => 'উভয় পক্ষের সাক্ষ্য গ্রহণ, দলিল দাখিল ও যুক্তিতর্ক শেষে ডিক্রি গ্রহণ।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Registered title deeds (Kabila, Heba, or Sale deed)', 'bn' => 'মূল বা সার্টিফাইড রেজিস্ট্রিকৃত দলিল (কবলা, হেবা বা বণ্টননামা)']],
                    ['item' => ['en' => 'Survey khatians (CS, SA, RS, and City/BS records)', 'bn' => 'ভূমি জরিপের খতিয়ান (সিএস, এসএ, আরএস ও সিটি/বিএস খতিয়ান)']],
                    ['item' => ['en' => 'Mutation khatian (Namjari) and DCR receipt', 'bn' => 'হালনাগাদ নামজারি পরচা ও ডিসিআর রশিদ']],
                    ['item' => ['en' => 'Up-to-date Land Development Tax receipts (Dakhila)', 'bn' => 'হালনাগাদ ভূমি উন্নয়ন কর প্রদানের দাখিলা']],
                    ['item' => ['en' => 'Site map, holding tax receipts, and utility bills verifying possession', 'bn' => 'জমির নকশা, হোল্ডিং ট্যাক্স এবং দখল প্রমাণের বিল']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'What is the difference between a Title Suit and an Injunction Suit?', 'bn' => 'স্বত্ব মোকদ্দমা এবং নিষেধাজ্ঞা মোকদ্দমার মধ্যে পার্থক্য কী?'],
                        'answer' => ['en' => 'A Title Suit seeks a formal judicial declaration of ownership. An Injunction Suit primarily seeks an order restraining the opposite party from interfering with possession or alienating property.', 'bn' => 'স্বত্ব মামলায় জমিতে মূল মালিকানা প্রতিষ্ঠার ঘোষণা চাওয়া হয়। পক্ষান্তরে নিষেধাজ্ঞা মামলায় দখল বজায় রাখা বা জমিতে কোনো পরিবর্তন প্রতিরোধ করা হয়।'],
                    ],
                    [
                        'question' => ['en' => 'Can an unregistered sale agreement be enforced in court?', 'bn' => 'অনিবন্ধিত বা মৌখিক চুক্তি কি আদালতে কার্যকর করা যায়?'],
                        'answer' => ['en' => 'Under current Bangladesh land laws, agreements for the sale of immovable property must be compulsorily registered to be legally enforceable in a suit for specific performance.', 'bn' => 'স্থাবর সম্পত্তি বিক্রয়ের চুক্তি সংক্রান্ত বায়না দলিল আইনগতভাবে কার্যকর করতে হলে তা রেজিস্ট্রি করা বাধ্যতামূলক।'],
                    ],
                    [
                        'question' => ['en' => 'What is Court Fee and how is it calculated in civil suits?', 'bn' => 'দেওয়ানি মামলায় কোর্ট ফি কী এবং তা কীভাবে নির্ধারিত হয়?'],
                        'answer' => ['en' => 'Under the Court-fees Act, fees are either fixed (for declarations/injunctions) or ad valorem (proportional to property valuation). The calculation must comply with statutory schedules.', 'bn' => 'কোর্ট ফি আইন অনুযায়ী মামলার প্রকৃতির ওপর ভিত্তি করে নির্ধারিত (Fixed) অথবা সম্পত্তির মূল্যের ওপর শতকরা হারে (Ad Valorem) কোর্ট ফি প্রদান করতে হয়।'],
                    ],
                    [
                        'question' => ['en' => 'How can co-owners divide inherited property peacefully?', 'bn' => 'উত্তরাধিকারীরা কীভাবে শান্তিপূর্ণভাবে যৌথ সম্পত্তি ভাগ করতে পারেন?'],
                        'answer' => ['en' => 'Co-owners may execute and register an amicable registered deed of partition (Apoth Bonton Nama). If disputes persist, a formal Partition Suit must be instituted in the civil court.', 'bn' => 'অংশীদাররা আপস বণ্টননামা রেজিস্ট্রি করে নিতে পারেন। কোনো মতানৈক্য থাকলে বিজ্ঞ দেওয়ানি আদালতে বাটোয়ারা মামলা দায়ের করা আবশ্যক।'],
                    ],
                    [
                        'question' => ['en' => 'How long does a civil suit take to conclude in Bangladesh?', 'bn' => 'বাংলাদেশে একটি দেওয়ানি মামলা শেষ হতে কত সময় লাগে?'],
                        'answer' => ['en' => 'Due to multiple stages (summons, written statement, framing issues, evidence, commissions, and arguments), civil suits often require several years depending on court caseloads.', 'bn' => 'সমন জারি, জবাব দাখিল, বিচার্য বিষয় নির্ধারণ, সাক্ষ্য ও শুনানির বিভিন্ন ধাপ থাকায় দেওয়ানি মামলায় দীর্ঘ সময় লাগতে পারে।'],
                    ],
                    [
                        'question' => ['en' => 'What remedy exists if an injunction application is rejected by the trial court?', 'bn' => 'অধস্তন আদালত অস্থায়ী নিষেধাজ্ঞা নামঞ্জুর করলে কী প্রতিকার রয়েছে?'],
                        'answer' => ['en' => 'An order rejecting an injunction may be challenged by filing a Miscellaneous Appeal before the District Judge Court, and subsequently by Civil Revision before the High Court Division.', 'bn' => 'নিষেধাজ্ঞা খারিজ হলে জেলা জজ আদালতে মিস আপিল এবং পরবর্তীতে হাইকোর্ট বিভাগে দেওয়ানি রিভিশন দায়ের করা যায়।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'Civil Law & Land Property Litigation | Advocate Nijam Uddin (Haq)', 'bn' => 'দেওয়ানি আইন ও সম্পত্তি মোকদ্দমা | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Legal advocacy in title suits, land disputes, partition suits, and injunctions before civil courts and the High Court Division by Advocate Nijam Uddin (Haq).', 'bn' => 'জমির স্বত্ব, বাটোয়ারা, বায়না চুক্তি প্রবল ও দেওয়ানি আপিল শুনানিতে অ্যাডভোকেট নিজাম উদ্দিন (হক)-এর আইনি সহায়তা।'],
                ],
            ],

            // 4. Family Law
            [
                'slug' => 'family-law',
                'title' => ['en' => 'Family Law', 'bn' => 'পারিবারিক আইন'],
                'short_description' => [
                    'en' => 'Legal guidance in family matters, dower and maintenance recovery, child guardianship and custody, and matrimonial dispute resolution.',
                    'bn' => 'পারিবারিক বিরোধ, দেনমোহর ও খোরপোশ আদায়, সন্তানের অভিভাবকত্ব ও হেফাজত এবং পারিবারিক আদালতের আইনি সহায়তা।',
                ],
                'tagline' => ['en' => 'Compassionate and dignified resolution of family matters', 'bn' => 'পারিবারিক অধিকার ও মর্যাদাপূর্ণ আইনি সুরক্ষা'],
                'full_description' => [
                    'en' => "<p>Family law in Bangladesh governs intimate domestic and personal relationships, including marriage dissolution, dower (mahr), maintenance for wife and children, guardianship, and custody. Governed by personal religious laws alongside the Family Courts Act, 2023, these matters require both legal precision and sensitive, respectful handling.</p><p>We provide legal counsel and representation in suits instituted before the Family Court for realization of dower and past and future maintenance, as well as custody and guardianship proceedings under the Guardians and Wards Act, 1890.</p><p>Where appropriate, we encourage constructive dispute resolution and conciliation, recognizing the profound personal and familial consequences involved.</p>",
                    'bn' => "<p>বাংলাদেশে পারিবারিক আইন পারিবারিক সম্পর্ক, বিবাহ বিচ্ছেদ, দেনমোহর আদায়, স্ত্রী ও সন্তানের খোরপোশ এবং সন্তানের অভিভাবকত্ব সংক্রান্ত বিধান নিয়ন্ত্রণ করে। পারিবারিক আদালত আইন, ২০২৩ এবং সংশ্লিষ্ট ধর্মীয় ব্যক্তিগত আইনের সমন্বয়ে এই আদালতগুলো পরিচালিত হয়।</p><p>আমরা বিজ্ঞ পারিবারিক আদালতে দেনমোহর ও বকেয়া বা ভবিষ্যৎ খোরপোশ আদায়, এবং ১৮৯০ সালের অভিভাবক ও প্রতিপাল্য আইনের অধীন সন্তানের হেফাজত ও অভিভাবকত্ব সংক্রান্ত মামলায় আইনি সেবা প্রদান করি।</p><p>পারিবারিক মামলার স্পর্শকাতরতা বিবেচনায় অপ্রয়োজনীয় বিদ্বেষ পরিহার করে সম্মানজনক সমঝোতা ও আইনি সুরক্ষাকে সর্বোচ্চ অগ্রাধিকার দেওয়া হয়।</p>",
                ],
                'icon_name' => 'users',
                'sort_order' => 4,
                'status' => 'published',
                'is_featured' => false,
                'at_a_glance' => [
                    'area' => ['en' => 'Family & Matrimonial Law', 'bn' => 'পারিবারিক ও বৈবাহিক আইন'],
                    'who_it_may_help' => ['en' => 'Spouses, parents, guardians, and family members', 'bn' => 'স্বামী, স্ত্রী, অভিভাবক ও পরিবারের সদস্যবৃন্দ'],
                    'related_matters' => ['en' => 'Dower, maintenance, custody, guardianship, divorce procedures', 'bn' => 'দেনমোহর, খোরপোশ, সন্তানের হেফাজত, বিবাহ বিচ্ছেদ পদ্ধতি'],
                    'jurisdiction' => ['en' => 'Family Courts & District Judge Courts (Family Appeals)', 'bn' => 'পারিবারিক আদালত ও জেলা জজ আদালত (পারিবারিক আপিল)'],
                    'depends_on' => ['en' => 'Applicable personal law, marriage documents, welfare of minor', 'bn' => 'সংশ্লিষ্ট ধর্মীয় আইন, নিকাহনামা এবং নাবালকের সার্বিক কল্যাণ'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Dower (Mahr) Recovery', 'bn' => 'দেনমোহর আদায়'], 'description' => ['en' => 'Suits before the Family Court for payment of prompt and deferred dower.', 'bn' => 'তলবি ও বিলম্বিত দেনমোহর আদায়ে পারিবারিক আদালতে মামলা দায়ের।'], 'icon' => 'file-text'],
                    ['title' => ['en' => 'Maintenance for Wife & Children', 'bn' => 'স্ত্রী ও সন্তানের খোরপোশ'], 'description' => ['en' => 'Enforcement of statutory maintenance rights during and after marriage.', 'bn' => 'বিবাহ বহাল থাকাকালে বা বিচ্ছেদের পর সংবিধিবদ্ধ ভরণপোষণ আদায়।'], 'icon' => 'shield'],
                    ['title' => ['en' => 'Child Custody (Hizanat)', 'bn' => 'সন্তানের হেফাজত ও দেখা'], 'description' => ['en' => 'Securing physical custody and visitation rights of minor children.', 'bn' => 'নাবালক সন্তানের হেফাজত ও সাক্ষাৎ অধিকার সুরক্ষায় আইনি পদক্ষেপ।'], 'icon' => 'users'],
                    ['title' => ['en' => 'Guardianship Proceedings', 'bn' => 'অভিভাবকত্ব নির্ধারণ'], 'description' => ['en' => 'Applications under the Guardians and Wards Act for person and property.', 'bn' => 'নাবালকের শরীর ও সম্পত্তির অভিভাবক নিয়োগের আবেদন।'], 'icon' => 'award'],
                    ['title' => ['en' => 'Divorce & Notice Procedures', 'bn' => 'বিবাহ বিচ্ছেদ ও নোটিশ প্রক্রিয়া'], 'description' => ['en' => 'Compliance with statutory notice and reconciliation procedures under law.', 'bn' => 'আইনসঙ্গত তালাক নোটিশ প্রেরণ ও সালিশি কাউন্সিল কার্যক্রম সম্পন্ন।'], 'icon' => 'scroll'],
                    ['title' => ['en' => 'Family Appeals & Conciliation', 'bn' => 'পারিবারিক আপিল ও সমঝোতা'], 'description' => ['en' => 'Appeals before the District Judge and pre-trial mediation hearings.', 'bn' => 'পারিবারিক আদালতের রায়ের বিরুদ্ধে আপিল ও আদালত পরিচালিত সমঝোতা।'], 'icon' => 'landmark'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'Can a wife claim her full dower (Mahr) even after unilateral divorce?', 'bn' => 'বিবাহ বিচ্ছেদের পরও কি স্ত্রী তার পূর্ণ দেনমোহর দাবি করতে পারেন?']],
                    ['question' => ['en' => 'What is the court procedure for claiming child maintenance?', 'bn' => 'সন্তানের ভরণপোষণ বা খোরপোশ আদায়ের আইনি প্রক্রিয়া কী?']],
                    ['question' => ['en' => 'Which parent has custody rights over a minor under Bangladesh law?', 'bn' => 'বাংলাদেশে নাবালক সন্তানের হেফাজত (Custody) কার অনুকূলে থাকে?']],
                    ['question' => ['en' => 'How does the Family Court conduct pre-trial and post-trial conciliation?', 'bn' => 'পারিবারিক আদালতে বিচারপূর্ব ও বিচারপরবর্তী আপস শুনানি কীভাবে হয়?']],
                    ['question' => ['en' => 'Can maintenance orders be executed through civil imprisonment or salary attachment?', 'bn' => 'খোরপোশের ডিক্রি অমান্য করলে কি সম্পদ ক্রোক বা আটকের ব্যবস্থা আছে?']],
                    ['question' => ['en' => 'What is the statutory timeline for divorce to become effective under the Muslim Family Laws Ordinance?', 'bn' => 'মুসলিম পারিবারিক আইনে তালাক কার্যকর হতে ৯০ দিনের প্রক্রিয়া কীভাবে চলে?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Case Assessment', 'bn' => 'পারিবারিক বিষয় পর্যালোচনা'],
                        'description' => ['en' => 'Review marriage registry papers (Nikahnama), divorce notices, and claims.', 'bn' => 'নিকাহনামা, তালাক নোটিশ ও আর্থিক দাবির শর্তাবলি পর্যালোচনা।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Filing Family Suit', 'bn' => 'পারিবারিক আদালতে মামলা'],
                        'description' => ['en' => 'Draft and institute suit before the competent Family Court under the 2023 Act.', 'bn' => 'পারিবারিক আদালত আইন ২০২৩ অনুযায়ী উপযুক্ত আদালতে আরজি দাখিল।'],
                        'icon' => 'book-open',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Pre-Trial Conciliation', 'bn' => 'বিচারপূর্ব আপস শুনানি'],
                        'description' => ['en' => 'Mandatory confidential conciliation conference conducted by the Judge.', 'bn' => 'বিজ্ঞ বিচারক কর্তৃক পরিচালিত বাধ্যতামূলক সমঝোতা অধিবেশনে অংশগ্রহণ।'],
                        'icon' => 'users',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Evidence & Examination', 'bn' => 'সাক্ষ্য ও নথি উপস্থাপন'],
                        'description' => ['en' => 'Tender witness depositions, income proofs, and documentary exhibits.', 'bn' => 'উভয় পক্ষের সাক্ষ্য গ্রহণ ও আর্থিক সক্ষমতার প্রমাণ উপস্থাপন।'],
                        'icon' => 'scale',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Judgment & Decree Execution', 'bn' => 'রায় ও ডিক্রি কার্যকরীকরণ'],
                        'description' => ['en' => 'Obtain judgment and pursue execution for realization of dower/maintenance.', 'bn' => 'রায় গ্রহণ এবং পাওনা অর্থ আদায়ে ডিক্রি জারী কার্যক্রম পরিচালনা।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Copy of Registered Nikahnama (Marriage Deed) / Marriage Certificate', 'bn' => 'রেজিস্ট্রিকৃত নিকাহনামার সার্টিফাইড কপি বা বিবাহ সনদ']],
                    ['item' => ['en' => 'Divorce deed / Talak notice sent to Chairman & spouse (if divorced)', 'bn' => 'চেয়ারম্যান ও অপর পক্ষ বরাবর প্রেরিত তালাক নোটিশের অনুলিপি']],
                    ['item' => ['en' => 'Birth Certificates of children for custody and maintenance claims', 'bn' => 'সন্তানদের জন্ম নিবন্ধন সনদ']],
                    ['item' => ['en' => 'Evidence of spouse income, employment, or property ownership', 'bn' => 'প্রতিপক্ষের চাকরি, ব্যবসায়িক আয় বা সম্পদের প্রমাণ']],
                    ['item' => ['en' => 'National ID / Passport of the claimant', 'bn' => 'বাদীর জাতীয় পরিচয়পত্র বা পাসপোর্ট']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'Does a wife lose her dower (Mahr) if she initiates the divorce?', 'bn' => 'স্ত্রী নিজে তালাক দিলে কি দেনমোহর বাতিল হয়ে যায়?'],
                        'answer' => ['en' => 'Under Bangladesh law, if the marriage contract grants the wife delegated power (Talaq-e-Tawfeez), she remains entitled to her agreed prompt and deferred dower unless she voluntarily waived it under a mutual Khula agreement.', 'bn' => 'নিকাহনামায় তালাক-ই-তৌফিজের অধিকার থাকলে স্ত্রী তালাক দিলেও তার দেনমোহর বাতিল হয় না, যদি না তিনি খোলা বা পারস্পরিক আপসে তা স্বেচ্ছায় মাফ করে থাকেন।'],
                    ],
                    [
                        'question' => ['en' => 'Who is entitled to child custody under Muslim law in Bangladesh?', 'bn' => 'মুসলিম আইনে সন্তানের হেফাজত (Hizanat) কার অধিকারে থাকে?'],
                        'answer' => ['en' => 'The mother has custody of sons up to age 7 and daughters until puberty, after which custody reverts to the father, subject always to the overriding welfare of the minor as determined by the court.', 'bn' => 'সাধারণত পুত্রসন্তানের ৭ বছর এবং কন্যাসন্তানের বয়ঃসন্ধিকাল পর্যন্ত মা হেফাজতের অধিকারী। তবে সন্তানের সার্বিক কল্যাণই (Welfare of the Minor) আদালতের মূল বিচার্য বিষয়।'],
                    ],
                    [
                        'question' => ['en' => 'Can a father be compelled to pay maintenance for his children?', 'bn' => 'পিতা কি সন্তানদের খোরপোশ দিতে বাধ্য?'],
                        'answer' => ['en' => 'Yes. The father bears a strict legal obligation to provide reasonable maintenance for his minor children regardless of whether they reside with the mother.', 'bn' => 'হ্যাঁ। সন্তান মায়ের সাথে বসবাস করলেও পিতা তার নাবালক সন্তানদের প্রয়োজনীয় খাদ্য, বাসস্থান ও শিক্ষার ব্যয় বহনে আইনত বাধ্য।'],
                    ],
                    [
                        'question' => ['en' => 'What is the role of the Arbitration Council in divorce?', 'bn' => 'তালাকের ক্ষেত্রে সালিশি কাউন্সিলের ভূমিকা কী?'],
                        'answer' => ['en' => 'Upon receiving a notice of Talaq, the local City Corporation or Union Parishad Chairman convenes an Arbitration Council to explore reconciliation within 90 days.', 'bn' => 'তালাকের নোটিশ প্রাপ্তির পর স্থানীয় চেয়ারম্যান উভয় পক্ষকে নিয়ে সমঝোতার চেষ্টা করেন এবং ৯০ দিন অতিক্রান্ত হলে আইনত তালাক কার্যকর হয়।'],
                    ],
                    [
                        'question' => ['en' => 'How can a decree for dower or maintenance be executed?', 'bn' => 'দেনমোহর বা খোরপোশের ডিক্রি কীভাবে কার্যকর করা যায়?'],
                        'answer' => ['en' => 'If the judgment-debtor fails to pay the decreed amount, the Family Court may attach immovable property or order civil detention until satisfaction of the decree.', 'bn' => 'ডিক্রিকৃত অর্থ পরিশোধ না করলে আদালত বিবাদীর সম্পত্তি ক্রোক করতে পারেন বা দেওয়ানি আটকাদেশ প্রদান করতে পারেন।'],
                    ],
                    [
                        'question' => ['en' => 'Are family court proceedings public or confidential?', 'bn' => 'পারিবারিক আদালতের শুনানি কি উন্মুক্ত না গোপনীয়?'],
                        'answer' => ['en' => 'The Family Courts Act empowers the presiding judge to hold in-camera proceedings to preserve the dignity, privacy, and confidentiality of the family.', 'bn' => 'পারিবারিক আদালত আইনের আওতায় পরিবারের মর্যাদা ও গোপনীয়তা রক্ষায় বিচারক রুদ্ধদ্বার কক্ষে (In-Camera) শুনানির নির্দেশ দিতে পারেন।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'Family Law & Matrimonial Dispute Counsel | Advocate Nijam Uddin (Haq)', 'bn' => 'পারিবারিক আইন ও দেনমোহর-খোরপোশ সহায়তা | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Specialized legal representation in family courts for dower recovery, child custody, maintenance, and divorce matters by Advocate Nijam Uddin (Haq).', 'bn' => 'পারিবারিক আদালতে দেনমোহর, খোরপোশ, সন্তানের হেফাজত ও বিবাহ বিচ্ছেদ সংক্রান্ত আইনি পরামর্শ ও প্রতিনিধিত্ব।'],
                ],
            ],

            // 5. Company Law
            [
                'slug' => 'company-law',
                'title' => ['en' => 'Company Law', 'bn' => 'কোম্পানি আইন'],
                'short_description' => [
                    'en' => 'Corporate governance, shareholder disputes, minority protection under Section 233, board compliance, and Company Matters before the High Court Division.',
                    'bn' => 'কোম্পানি গঠন, পরিচালনা পর্ষদ ও শেয়ারহোল্ডার বিরোধ, ২৩৩ ধারায় সংখ্যালঘু প্রতিকার এবং হাইকোর্ট বিভাগে কোম্পানি মোকাদ্দমা।',
                ],
                'tagline' => ['en' => 'Corporate integrity, regulatory compliance, and shareholder justice', 'bn' => 'কর্পোরেট সুশাসন ও শেয়ারহোল্ডারদের অধিকারের আইনি সুরক্ষা'],
                'full_description' => [
                    'en' => "<p>Company law in Bangladesh, governed primarily by the Companies Act, 1994, regulates the formation, governance, shareholder relations, and winding-up of registered corporate entities. The High Court Division retains exclusive company bench jurisdiction over specialized company petitions.</p><p>We advise corporate boards, institutional promoters, and minority shareholders on corporate compliance, rectification of share registers, board deadlocks, merger approvals, and applications under Section 233 against oppression and mismanagement.</p><p>Our advisory is strictly focused on statutory corporate legality, fiduciary obligations of directors, and lawful resolution of intra-corporate deadlocks.</p>",
                    'bn' => "<p>বাংলাদেশে কোম্পানি আইন (১৯৯৪ সালের কোম্পানি আইন) নিবন্ধিত প্রতিষ্ঠানসমূহের গঠন, পরিচালনা পর্ষদের দায়িত্ব, শেয়ারহোল্ডারদের অধিকার এবং কোম্পানি অবসান নিয়ন্ত্রণ করে। সুপ্রিম কোর্টের হাইকোর্ট বিভাগের কোম্পানি বেঞ্চ এ সংক্রান্ত বিশেষায়িত মোকাদ্দমা শুনানি করে থাকে।</p><p>আমরা কোম্পানির পরিচালনা পর্ষদ, উদ্যোক্তা এবং সাধারণ শেয়ারহোল্ডারদের কোম্পানি গঠন, শেয়ার রেজিস্টার সংশোধন, ব্যবস্থাপনা অচলবস্থা নিরসন এবং ২৩৩ ধারায় বৈষম্যমূলক আচরণের বিরুদ্ধে প্রতিকারমূলক পিটিশনে সহায়তা প্রদান করি।</p><p>পরিচালকদের আইনি দায়দায়িত্ব এবং কোম্পানির সুশাসন রক্ষায় আমাদের চেম্বার বিধিবদ্ধ কাঠামোর মধ্যে কার্যকর আইনি সমাধান নিশ্চিত করে।</p>",
                ],
                'icon_name' => 'building',
                'sort_order' => 5,
                'status' => 'published',
                'is_featured' => false,
                'at_a_glance' => [
                    'area' => ['en' => 'Company & Corporate Law', 'bn' => 'কোম্পানি ও কর্পোরেট আইন'],
                    'who_it_may_help' => ['en' => 'Directors, promoters, shareholders, corporate enterprises', 'bn' => 'কোম্পানি পরিচালক, উদ্যোক্তা, শেয়ারহোল্ডার ও করপোরেট প্রতিষ্ঠান'],
                    'related_matters' => ['en' => 'Section 233 petitions, share rectification, board disputes, winding up', 'bn' => '২৩৩ ধারার পিটিশন, শেয়ার সংশোধন, পরিচালনা বিরোধ, অবসান'],
                    'jurisdiction' => ['en' => 'Company Bench, High Court Division, Supreme Court of Bangladesh', 'bn' => 'কোম্পানি বেঞ্চ, হাইকোর্ট বিভাগ, বাংলাদেশ সুপ্রিম কোর্ট'],
                    'depends_on' => ['en' => 'Articles of Association, RJSC filings, board resolutions, shareholdings', 'bn' => 'সংঘস্মারক ও সংঘবিধি, আরজেএসসি রেকর্ড, বোর্ড রেজল্যুশন ও শেয়ার'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Minority Shareholder Protection', 'bn' => 'সংখ্যালঘু শেয়ারহোল্ডার সুরক্ষা'], 'description' => ['en' => 'Petitions under Section 233 of the Companies Act against oppression.', 'bn' => 'কোম্পানি আইনের ২৩৩ ধারায় নিপীড়ন ও অপব্যবস্থাপনার বিরুদ্ধে প্রতিকার।'], 'icon' => 'shield'],
                    ['title' => ['en' => 'Rectification of Share Register', 'bn' => 'শেয়ার রেজিস্টার সংশোধন'], 'description' => ['en' => 'Applications under Section 43 for unauthorized share transfers or omissions.', 'bn' => 'বেআইনি শেয়ার হস্তান্তর বা নাম বাদ পড়ার বিরুদ্ধে ৪৩ ধারার আবেদন।'], 'icon' => 'file-text'],
                    ['title' => ['en' => 'Board Deadlock Resolution', 'bn' => 'বোর্ড ডেডলক নিরসন'], 'description' => ['en' => 'Legal mechanisms to resolve 50-50 deadlocks between equal shareholders.', 'bn' => 'পরিচালনা পর্ষদের অচলাবস্থা নিরসনে আইনি দিকনির্দেশনা ও ফোরাম উপস্থাপন।'], 'icon' => 'users'],
                    ['title' => ['en' => 'Corporate Governance & AGMs', 'bn' => 'বার্ষিক সাধারণ সভা ও কমপ্লায়েন্স'], 'description' => ['en' => 'Petitions under Section 81/85 for convening delayed AGM/EGMs.', 'bn' => 'নির্ধারিত সময়ে বার্ষিক সাধারণ সভা না হলে আদালতের মাধ্যমে সভা আহ্বানের পিটিশন।'], 'icon' => 'calendar'],
                    ['title' => ['en' => 'Mergers & Capital Reduction', 'bn' => 'একত্রীকরণ ও মূলধন হ্রাস'], 'description' => ['en' => 'Company Bench sanction for statutory amalgamations and scheme of arrangements.', 'bn' => 'কোম্পানি একত্রীকরণ ও মূলধন হ্রাসে হাইকোর্টের অনুমোদন গ্রহণ।'], 'icon' => 'briefcase'],
                    ['title' => ['en' => 'Winding Up Proceedings', 'bn' => 'কোম্পানি অবসানের মোকাদ্দমা'], 'description' => ['en' => 'Statutory winding up petitions on just and equitable grounds or inability to pay debt.', 'bn' => 'ন্যায্য কারণে বা ঋণ পরিশোধে ব্যর্থতায় কোম্পানি অবসানের আবেদন।'], 'icon' => 'landmark'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'What remedies are available to a minority shareholder deprived of dividends or governance?', 'bn' => 'অধিকারবঞ্চিত সংখ্যালঘু শেয়ারহোল্ডারের আইনি প্রতিকার কী?']],
                    ['question' => ['en' => 'How can unauthorized transfer or dilution of company shares be stopped?', 'bn' => 'বেআইনিভাবে শেয়ার হস্তান্তর বা শেয়ার কমিয়ে দেওয়া কীভাবে ঠেকানো যায়?']],
                    ['question' => ['en' => 'What can a company do if an AGM could not be held within statutory time?', 'bn' => 'নির্ধারিত সময়ে এজিএম করতে ব্যর্থ হলে কোম্পানি কীভাবে হাইকোর্টের অনুমোদন নেয়?']],
                    ['question' => ['en' => 'Can a director be removed without proper notice or procedure?', 'bn' => 'আইনানুগ নোটিশ বা প্রক্রিয়া ছাড়া কি কোনো পরিচালককে অপসারণ করা সম্ভব?']],
                    ['question' => ['en' => 'Under what circumstances will the High Court wind up a solvent company?', 'bn' => 'কোম্পানি লাভজনক হলেও কোন পরিস্থিতিতে হাইকোর্ট অবসান নির্দেশ দিতে পারেন?']],
                    ['question' => ['en' => 'What is the evidentiary status of Form XII and RJSC return records in disputes?', 'bn' => 'কোম্পানি বিরোধে আরজেএসসি (RJSC) নথিপত্র ও ফরম ১২-এর গুরুত্ব কী?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'RJSC Record Examination', 'bn' => 'আরজেএসসি নথি পরীক্ষা'],
                        'description' => ['en' => 'Examine certified Articles, Memorandum, Form XII, and shareholding records.', 'bn' => 'সংঘস্মারক, সংঘবিধি, ফরম ১২ ও অংশীদারিত্বের সার্টিফাইড নথি যাচাই।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Statutory Notice or Requisition', 'bn' => 'বিধিবদ্ধ নোটিশ বা তলবনামা'],
                        'description' => ['en' => 'Issue formal board requisition or legal notice outlining statutory defaults.', 'bn' => 'বোর্ড সভা বা সাধারণ সভার তলবনামা এবং আইনি নোটিশ প্রেরণ।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Company Petition Drafting', 'bn' => 'কোম্পানি পিটিশন প্রণয়ন'],
                        'description' => ['en' => 'Formulate petition under appropriate section of the Companies Act, 1994.', 'bn' => 'কোম্পানি আইনের সংশ্লিষ্ট ধারার অধীনে হাইকোর্টের জন্য পিটিশন প্রস্তুত।'],
                        'icon' => 'book-open',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'High Court Company Bench Hearing', 'bn' => 'কোম্পানি বেঞ্চে মোশন শুনানি'],
                        'description' => ['en' => 'Argue motion before the Company Bench for interim injunction or status quo.', 'bn' => 'হাইকোর্ট কোম্পানি বেঞ্চে শুনানি ও অন্তর্বর্তীকালীন স্থিতাবস্থা গ্রহণ।'],
                        'icon' => 'scale',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Final Adjudication', 'bn' => 'চূড়ান্ত আদেশ ও নিষ্পত্তি'],
                        'description' => ['en' => 'Conclude final hearing for buy-out, register rectification, or governance orders.', 'bn' => 'পূর্ণাঙ্গ শুনানি শেষে শেয়ার ক্রয়, রেজিস্টার সংশোধন বা উপযুক্ত আদেশ প্রাপ্তি।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Certified Memorandum & Articles of Association (MoA & AoA)', 'bn' => 'সার্টিফাইড সংঘস্মারক ও সংঘবিধি (MoA & AoA)']],
                    ['item' => ['en' => 'Certified Form XII (List of Directors) and Form Schedule X (Shareholdings)', 'bn' => 'আরজেএসসি কর্তৃক সার্টিফাইড ফরম ১২ ও শেয়ারহোল্ডিং তফসিল']],
                    ['item' => ['en' => 'Minutes of disputed Board Meetings or Annual General Meetings', 'bn' => 'বিতর্কিত বোর্ড মিটিং বা এজিএমের কার্যবিবরণী']],
                    ['item' => ['en' => 'Audited financial statements and statutory auditor reports', 'bn' => 'নিরীক্ষিত আর্থিক বিবরণী ও অডিটর রিপোর্ট']],
                    ['item' => ['en' => 'Share transfer instruments (Form 117) and share certificates', 'bn' => 'শেয়ার হস্তান্তর দলিল (ফরম ১১৭) এবং শেয়ার সার্টিফিকেট']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'What is a Section 233 petition under the Companies Act, 1994?', 'bn' => 'কোম্পানি আইনের ২৩৩ ধারার পিটিশন বলতে কী বোঝায়?'],
                        'answer' => ['en' => 'Section 233 enables shareholders holding at least 10% shares to petition the High Court against oppressive management or acts prejudicial to their interest as members.', 'bn' => 'কমপক্ষে ১০% শেয়ারের অধিকারী সদস্যরা কোম্পানির বৈষম্যমূলক ও অন্যায্য ব্যবস্থাপনার বিরুদ্ধে হাইকোর্টে ২৩৩ ধারায় প্রতিকার চেয়ে আবেদন করতে পারেন।'],
                    ],
                    [
                        'question' => ['en' => 'Can a director be disqualified or removed unlawfully?', 'bn' => 'আইনানুগ প্রক্রিয়া ছাড়া কি কোনো পরিচালককে অপসারণ করা যায়?'],
                        'answer' => ['en' => 'No. Removal of directors must strictly comply with the Articles of Association and Section 106 of the Companies Act, including serving proper special notice.', 'bn' => 'না। সংঘবিধি এবং কোম্পানি আইনের ১০৬ ধারা অনুসারে বিশেষ নোটিশ ও উপযুক্ত প্রক্রিয়া অনুসরণ ছাড়া কোনো পরিচালককে অপসারণ করা অবৈধ।'],
                    ],
                    [
                        'question' => ['en' => 'How does the court resolve a 50-50 shareholder deadlock?', 'bn' => 'সমান সমান (৫০-৫০) শেয়ারধারীদের বিরোধ কীভাবে নিষ্পত্তি হয়?'],
                        'answer' => ['en' => 'The court may order a share buy-out, appoint an independent administrator, or in irremediable situations, order winding up on just and equitable grounds.', 'bn' => 'আদালত এক পক্ষ কর্তৃক অপর পক্ষের শেয়ার ক্রয়, নিরপেক্ষ প্রশাসক নিয়োগ বা প্রয়োজনে কোম্পানি অবসানের নির্দেশ দিতে পারেন।'],
                    ],
                    [
                        'question' => ['en' => 'What is the role of RJSC (Registrar of Joint Stock Companies)?', 'bn' => 'আরজেএসসি (RJSC)-এর মূল ভূমিকা কী?'],
                        'answer' => ['en' => 'RJSC is the statutory registry for corporate entities in Bangladesh. Disputed filings do not confer legality if executed in violation of statutory company law.', 'bn' => 'আরজেএসসি হলো কোম্পানি নিবন্ধনের বিধিবদ্ধ প্রতিষ্ঠান। সেখানে জমা দেওয়া নথিতে জালিয়াতি বা অনিয়ম থাকলে হাইকোর্ট তা সংশোধনের নির্দেশ দেন।'],
                    ],
                    [
                        'question' => ['en' => 'How can an AGM be held if the statutory 15-month limit has passed?', 'bn' => '১৫ মাসের সময়সীমা পার হয়ে গেলে কীভাবে এজিএম করা যায়?'],
                        'answer' => ['en' => 'A company or member may petition the High Court under Section 81 or 85 to seek condonation of delay and a judicial direction for holding the AGM.', 'bn' => 'কোম্পানি বা শেয়ারহোল্ডার হাইকোর্টের কোম্পানি বেঞ্চে আবেদন করে সময় বৃদ্ধির মার্জনা এবং এজিএম আহ্বানের সুনির্দিষ্ট নির্দেশনা গ্রহণ করতে পারেন।'],
                    ],
                    [
                        'question' => ['en' => 'Does a lawyer provide auditor or corporate secretarial services?', 'bn' => 'আইনজীবী কি কোম্পানি সেক্রেটারি বা অডিটরের সেবা প্রদান করেন?'],
                        'answer' => ['en' => 'No. An advocate provides legal representation and dispute advocacy before courts. Statutory auditing is handled by chartered accountants, and company secretarial filings by certified professionals.', 'bn' => 'না। আইনজীবী আদালতে আইনি প্রতিনিধিত্ব ও বিরোধ নিষ্পত্তির সেবা দেন। হিসাব নিরীক্ষা ও রুটিন ফাইলিং সংশ্লিষ্ট নিরীক্ষক ও পেশাদারদের দায়িত্ব।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'Company Law & Corporate Litigation | Advocate Nijam Uddin (Haq)', 'bn' => 'কোম্পানি আইন ও করপোরেট মামলা | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Specialized company law litigation, shareholder disputes, Section 233 petitions, and High Court Company Bench advocacy by Advocate Nijam Uddin (Haq).', 'bn' => 'সুপ্রিম কোর্ট হাইকোর্ট কোম্পানি বেঞ্চে শেয়ারহোল্ডার বিরোধ, ২৩৩ ধারায় পিটিশন ও কোম্পানি সংক্রান্ত আইনি সহায়তা।'],
                ],
            ],

            // 6. Pro Bono
            [
                'slug' => 'pro-bono',
                'title' => ['en' => 'Pro Bono', 'bn' => 'প্রো বোনো (জনস্বার্থে আইনি সহায়তা)'],
                'short_description' => [
                    'en' => 'Legal assistance offered for public interest, underprivileged individuals, and indigent litigants, subject to professional availability and verification.',
                    'bn' => 'সুবিধাবঞ্চিত ও অসচ্ছল ব্যক্তিদের ন্যায়বিচার নিশ্চিতকরণে পেশাগত সামর্থ্য ও যাচাই সাপেক্ষে জনস্বার্থে বিনামূল্যে আইনি সহায়তা।',
                ],
                'tagline' => ['en' => 'Ensuring access to justice for the underprivileged', 'bn' => 'ন্যায়বিচারে সমান সুযোগ ও সুবিধাবঞ্চিতদের আইনি অধিকার'],
                'full_description' => [
                    'en' => "<p>Access to justice is a constitutional cornerstone under Article 31 of the Constitution of Bangladesh. In recognition of this professional duty, Advocate Nijam Uddin (Haq) accepts a selective number of pro bono representations each judicial calendar for indigent litigants, fundamental rights claimants, and public interest questions.</p><p>Pro bono legal assistance is provided without professional fee charges, subject to thorough merits verification, conflict checks, and chamber calendar availability. Court fees and statutory filing out-of-pocket expenses remain governed by applicable statutory rules.</p><p>We evaluate each prospective pro bono matter responsibly and without discrimination, reserving legal resources for those in genuine need who lack access to conventional legal advocacy.</p>",
                    'bn' => "<p>সংবিধানের ৩১ অনুচ্ছেদ অনুযায়ী আইনের আশ্রয় লাভ প্রত্যেক নাগরিকের অবিচ্ছেদ্য অধিকার। এই মহান পেশাগত দায়িত্বের অংশ হিসেবে অ্যাডভোকেট নিজাম উদ্দিন (হক) অসচ্ছল নাগরিক, কারাবন্দি দরিদ্র বিচারপ্রার্থী এবং জনস্বার্থের বিষয়ে নির্দিষ্টসংখ্যক মামলায় প্রো বোনো (বিনা ফিতে) সহায়তা প্রদান করেন।</p><p>প্রো বোনো কার্যক্রম মামলার বাস্তব প্রয়োজনীয়তা, নিরপেক্ষতা এবং চেম্বারের সময়সীমার ওপর ভিত্তি করে পরিচালিত হয়। আইনি পারিশ্রমিক ছাড়া সেবা প্রদান করা হলেও আদালতের বিধিবদ্ধ কোর্ট ফি সরকারি নিয়ম অনুযায়ী প্রযোজ্য হতে পারে।</p><p>যথাযথ যাচাই-বাছাইয়ের মাধ্যমে সত্যিকারের অধিকারবঞ্চিত ব্যক্তিদের জন্য এই সেবা নিবেদিত থাকে, যাতে অর্থনৈতিক অসচ্ছলতা কারো ন্যায়বিচার প্রাপ্তির অন্তরায় না হয়।</p>",
                ],
                'icon_name' => 'shield',
                'sort_order' => 6,
                'status' => 'published',
                'is_featured' => false,
                'at_a_glance' => [
                    'area' => ['en' => 'Pro Bono & Public Interest Legal Aid', 'bn' => 'প্রো বোনো ও জনস্বার্থ আইনি সহায়তা'],
                    'who_it_may_help' => ['en' => 'Indigent persons, victims of human rights abuses, underprivileged families', 'bn' => 'দরিদ্র ব্যক্তি, মানবাধিকার লঙ্ঘনের শিকার ও সুবিধাবঞ্চিত নাগরিক'],
                    'related_matters' => ['en' => 'Bail for destitute, fundamental rights enforcement, public legal education', 'bn' => 'অসচ্ছলদের জামিন, মৌলিক অধিকার সুরক্ষা, জনস্বার্থ আইনি সচেতনতা'],
                    'jurisdiction' => ['en' => 'Subordinate Courts & Supreme Court of Bangladesh', 'bn' => 'অধস্তন আদালত ও বাংলাদেশ সুপ্রিম কোর্ট'],
                    'depends_on' => ['en' => 'Financial indigence, case merits, and chamber availability', 'bn' => 'আর্থিক অসচ্ছলতা, মামলার যথার্থতা এবং চেম্বারের সময়সূচি'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Bail Assistance for Indigent Accused', 'bn' => 'অসচ্ছল অভিযুক্তদের জামিন সহায়তা'], 'description' => ['en' => 'Representation for indigent persons detained without access to legal aid.', 'bn' => 'আইনজীবী নিয়োগে অসমর্থ দরিদ্র আটক ব্যক্তিদের জামিনে শুনানি।'], 'icon' => 'shield'],
                    ['title' => ['en' => 'Fundamental Rights Litigations', 'bn' => 'মৌলিক অধিকার সুরক্ষা মামলা'], 'description' => ['en' => 'Public interest writ proceedings challenging unlawful state deprivation.', 'bn' => 'রাষ্ট্রীয় অবিচার বা ক্ষমতার অপব্যবহারে সংক্ষুব্ধদের জন্য রিট আবেদন।'], 'icon' => 'landmark'],
                    ['title' => ['en' => 'Family Protection for Destitute', 'bn' => 'অসহায় নারীদের পারিবারিক সুরক্ষা'], 'description' => ['en' => 'Legal assistance for abandoned spouses and destitute children.', 'bn' => 'পরিত্যক্ত নারী ও শিশুদের দেনমোহর ও ভরণপোষণ নিশ্চিতকরণে সহায়তা।'], 'icon' => 'users'],
                    ['title' => ['en' => 'Prisoner Rights & Fair Trial', 'bn' => 'কারাবন্দিদের ন্যায্য বিচার অধিকার'], 'description' => ['en' => 'Remedies against prolonged pretrial detention and procedural abuse.', 'bn' => 'বিনা বিচারে দীর্ঘ কারাবাস ও কার্যবিধির অপব্যবহারের বিরুদ্ধে প্রতিকার।'], 'icon' => 'scale'],
                    ['title' => ['en' => 'Statutory Legal Aid Referrals', 'bn' => 'জাতীয় আইনগত সহায়তা সমন্বয়'], 'description' => ['en' => 'Coordination with Government Legal Aid Committees (NLASO).', 'bn' => 'জাতীয় আইনগত সহায়তা সংস্থার সাথে সমন্বয় ও প্রাতিষ্ঠানিক রেফারেল।'], 'icon' => 'scroll'],
                    ['title' => ['en' => 'Preliminary Legal Advisory', 'bn' => 'বিনামূল্যে প্রাথমিক আইনি পরামর্শ'], 'description' => ['en' => 'Clarifying legal avenues for deserving individuals facing injustice.', 'bn' => 'আইনি প্রতিকার না জানা অসহায় মানুষদের সঠিক আইনি পথ প্রদর্শন।'], 'icon' => 'book-open'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'Who qualifies for pro bono legal representation in this chamber?', 'bn' => 'এই চেম্বারে প্রো বোনো আইনি সহায়তা পাওয়ার যোগ্যতা কী?']],
                    ['question' => ['en' => 'Is every consultation or case accepted on a pro bono basis?', 'bn' => 'সব মামলাই কি প্রো বোনো হিসেবে গ্রহণ করা হয়?']],
                    ['question' => ['en' => 'Does pro bono coverage include court fees and government stamp costs?', 'bn' => 'প্রো বোনো সেবায় কি আদালতের কোর্ট ফি বা সরকারি খরচ অন্তর্ভুক্ত?']],
                    ['question' => ['en' => 'How can an indigent person apply for pro bono evaluation?', 'bn' => 'অসচ্ছল বিচারপ্রার্থী কীভাবে প্রো বোনো সহায়তার জন্য আবেদন করবেন?']],
                    ['question' => ['en' => 'What is the relationship between pro bono advocacy and National Legal Aid (NLASO)?', 'bn' => 'জাতীয় আইনগত সহায়তা সংস্থার (NLASO) সাথে এর সম্পর্ক কী?']],
                    ['question' => ['en' => 'Are pro bono clients treated with the same professional diligence as paid clients?', 'bn' => 'প্রো বোনো মামলার ক্ষেত্রেও কি সমান পেশাগত মান বজায় রাখা হয়?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Written Request & Need Verification', 'bn' => 'আবেদন ও অসচ্ছলতা যাচাই'],
                        'description' => ['en' => 'Submit request explaining factual grievance and inability to afford counsel.', 'bn' => 'ঘটনার বিবরণ এবং আইনি খরচ বহনে অক্ষমতা ব্যাখ্যা করে আবেদন দাখিল।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Merits & Conflict Check', 'bn' => 'আইনি যথার্থতা ও স্বার্থের দ্বন্দ্ব যাচাই'],
                        'description' => ['en' => 'Conduct legal merits screening and conflict of interest clearance.', 'bn' => 'মামলার আইনি যৌক্তিকতা ও স্বার্থের দ্বন্দ্বমুক্ততা নিরূপণ।'],
                        'icon' => 'shield',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Formal Pro Bono Agreement', 'bn' => 'প্রো বোনো চুক্তি সম্পাদন'],
                        'description' => ['en' => 'Confirm scope of voluntary legal advocacy and client responsibilities.', 'bn' => 'সেবার পরিধি ও প্রত্যাশিত সহযোগিতা স্পষ্ট করে চুক্তি নির্ধারণ।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Pleading & Court Filings', 'bn' => 'দরখাস্ত প্রস্তুতি ও কোর্টে দাখিল'],
                        'description' => ['en' => 'Draft appropriate petitions, affidavits, and submissions pro bono.', 'bn' => 'সম্পূর্ণ বিনা আইনি ফিতে উপযুক্ত দরখাস্ত প্রণয়ন ও আদালতে দাখিল।'],
                        'icon' => 'scale',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Dedicated Court Advocacy', 'bn' => 'আদালতে নিষ্ঠার সাথে শুনানি'],
                        'description' => ['en' => 'Deliver complete courtroom advocacy with equal professional standards.', 'bn' => 'পেশাগত সততা ও গুরুত্বের সাথে আদালতে শুনানি পরিচালনা।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Proof of financial hardship or recommendation from local authority', 'bn' => 'আর্থিক অসচ্ছলতার প্রমাণ বা স্থানীয় কর্তৃপক্ষের প্রত্যয়ন']],
                    ['item' => ['en' => 'Case papers (Charge sheet, FIR, or impugned notice/order)', 'bn' => 'মামলার সকল উপলব্ধ নথিপত্র (এজাহার, সমন বা নোটিশ)']],
                    ['item' => ['en' => 'National ID / Birth Certificate of the applicant', 'bn' => 'জাতীয় পরিচয়পত্র বা জন্ম নিবন্ধন সনদ']],
                    ['item' => ['en' => 'Previous communication with legal aid authorities (if any)', 'bn' => 'পূর্বে সরকারি লিগ্যাল এইডে আবেদনের রেকর্ড (যদি থাকে)']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'Does pro bono mean that every legal service is free of cost?', 'bn' => 'প্রো বোনো মানে কি সব ধরনের আইনি কাজই সম্পূর্ণ বিনামূল্যে?'],
                        'answer' => ['en' => 'Professional advocacy and legal counsel fees are waived completely. However, statutory out-of-pocket costs mandated by the state (court fees, stamp fees) remain payable according to law.', 'bn' => 'আইনজীবীর পেশাগত ফি সম্পূর্ণ মওকুফ থাকে। তবে রাষ্ট্র নির্ধারিত সরকারি কোর্ট ফি বা স্ট্যাম্প খরচ সংশ্লিষ্ট বিধান অনুযায়ী বহন করতে হয়।'],
                    ],
                    [
                        'question' => ['en' => 'How are pro bono cases selected?', 'bn' => 'প্রো বোনো মামলা কীভাবে নির্বাচন করা হয়?'],
                        'answer' => ['en' => 'Selection is based on genuine indigence, seriousness of injustice or fundamental rights violations, legal merit, and chamber calendar availability.', 'bn' => 'প্রকৃত আর্থিক অসচ্ছলতা, অবিচারের মাত্রা, মানবাধিকার লঙ্ঘনের গুরুত্ব এবং চেম্বারের সময়সূচির সমন্বয়ে এটি নির্ধারিত হয়।'],
                    ],
                    [
                        'question' => ['en' => 'Can a commercial business entity request pro bono representation?', 'bn' => 'কোনো বাণিজ্যিক প্রতিষ্ঠান কি প্রো বোনো সুবিধার আবেদন করতে পারে?'],
                        'answer' => ['en' => 'No. Pro bono assistance is reserved exclusively for underprivileged natural persons, charitable public interest causes, and indigent prisoners.', 'bn' => 'না। প্রো বোনো সেবা কেবল সুবিধাবঞ্চিত ব্যক্তি, অসচ্ছল নাগরিক ও জনস্বার্থমূলক বিষয়ের জন্য সংরক্ষিত।'],
                    ],
                    [
                        'question' => ['en' => 'What if the chamber is unable to accept a pro bono application?', 'bn' => 'চেম্বার কোনো প্রো বোনো আবেদন গ্রহণ করতে না পারলে কী করণীয়?'],
                        'answer' => ['en' => 'If chamber capacity is saturated, applicants are guided and referred to the District Legal Aid Officer under the National Legal Aid Services Organization (NLASO).', 'bn' => 'চেম্বারে সামর্থ্য না থাকলে আবেদনকারীকে সরকারি জাতীয় আইনগত সহায়তা সংস্থার (NLASO) জেলা লিগ্যাল এইড অফিসে যোগাযোগের দিকনির্দেশনা দেওয়া হয়।'],
                    ],
                    [
                        'question' => ['en' => 'Is client confidentiality maintained in pro bono cases?', 'bn' => 'প্রো বোনো মামলার তথ্যে কি পূর্ণ গোপনীয়তা বজায় থাকে?'],
                        'answer' => ['en' => 'Absolutely. Professional confidentiality under the Evidence Act applies equally to all clients regardless of fee status.', 'bn' => 'নিশ্চিতভাবেই। বাংলাদেশ বার কাউন্সিল আচরণবিধি ও সাক্ষ্য আইন অনুযায়ী সকল মক্কেলের তথ্যে পূর্ণ পেশাগত গোপনীয়তা বজায় রাখা হয়।'],
                    ],
                    [
                        'question' => ['en' => 'Does taking a pro bono case guarantee a court win?', 'bn' => 'প্রো বোনো মামলা গ্রহণ করলে কি জয়ের কোনো নিশ্চয়তা থাকে?'],
                        'answer' => ['en' => 'No lawyer can guarantee a judicial outcome. Our commitment is to provide the highest standard of ethical and rigorous legal advocacy.', 'bn' => 'আইনজীবী কখনো মামলার ফলাফলের নিশ্চয়তা দিতে পারেন না। তবে সর্বোচ্চ নিষ্ঠার সাথে আইনি অধিকার উপস্থাপনের প্রতিশ্রুতি দেওয়া হয়।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'Pro Bono Legal Aid & Access to Justice | Advocate Nijam Uddin (Haq)', 'bn' => 'প্রো বোনো আইনি সহায়তা ও ন্যায়বিচার | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Pro bono representation for indigent individuals and public interest legal aid in Bangladesh by Advocate Nijam Uddin (Haq).', 'bn' => 'অসচ্ছল ও সুবিধাবঞ্চিত নাগরিকদের জন্য জনস্বার্থে আইনি সহায়তা ও প্রো বোনো আইনি প্রতিনিধিত্ব।'],
                ],
            ],

            // 7. Arbitration
            [
                'slug' => 'arbitration',
                'title' => ['en' => 'Arbitration', 'bn' => 'সালিশ ও আরবিট্রেশন'],
                'short_description' => [
                    'en' => 'Private dispute adjudication under the Arbitration Act 2001, arbitral tribunal advocacy, Section 7A interim measures, and award enforcement.',
                    'bn' => '২০০১ সালের সালিশ আইনের অধীন বেসরকারি বিরোধ নিষ্পত্তি, আরবিট্রাল ট্রাইব্যুনালে শুনানি, ৭এ ধারায় অন্তর্বর্তীকালীন আদেশ ও রোয়েদাদ কার্যকর।',
                ],
                'tagline' => ['en' => 'Confidential, structured, and legally binding commercial dispute adjudication', 'bn' => 'গোপনীয়, কাঠামোগত ও বাধ্যতামূলক বাণিজ্যিক বিরোধ নিষ্পত্তি'],
                'full_description' => [
                    'en' => "<p>Arbitration in Bangladesh is governed by the Arbitration Act, 2001, providing a consensual, confidential, and legally binding alternative to formal court litigation for commercial disputes. Arbitration requires a valid written arbitration agreement or clause embedded within a contract.</p><p>We advise corporate entities, government contractors, and private business partners on arbitral proceedings, including appointment of arbitrators under Section 12, securing pre-arbitral or pendente lite interim protections from the High Court Division under Section 7A, and arguing claims before arbitral tribunals.</p><p>We also handle post-award enforcement proceedings and petitions under Section 42 and 43 to set aside arbitral awards on grounds recognized by law.</p>",
                    'bn' => "<p>বাংলাদেশে ২০০১ সালের সালিশ আইনের আওতায় বাণিজ্যিক বিরোধসমূহ আদালতের বাইরে একটি গোপনীয়, দ্রুত ও আইনগতভাবে বাধ্যতামূলক প্রক্রিয়ায় নিষ্পত্তি করা হয়। সালিশ কার্যক্রম পরিচালনার জন্য চুক্তিতে বৈধ সালিশি ধারা (Arbitration Clause) থাকা আবশ্যক।</p><p>আমরা আরবিট্রেটর নিয়োগ, সুপ্রিম কোর্টের হাইকোর্ট বিভাগ থেকে ৭এ ধারার অধীনে অন্তর্বর্তীকালীন সুরক্ষা আদেশ গ্রহণ, আরবিট্রাল ট্রাইব্যুনালে দাবি ও পাল্টা দাবি উপস্থাপন এবং সাক্ষ্য গ্রহণে পেশাদার আইনি সেবা প্রদান করি।</p><p>সালিশি রোয়েদাদ (Award) ঘোষণার পর তা দেওয়ানি আদালতের মাধ্যমে কার্যকরীকরণ বা আইনের ৪২ ও ৪৩ ধারার অধীনে চ্যালেঞ্জ করার ক্ষেত্রেও পূর্ণাঙ্গ আইনি সহায়তা নিশ্চিত করা হয়।</p>",
                ],
                'icon_name' => 'gavel',
                'sort_order' => 7,
                'status' => 'published',
                'is_featured' => false,
                'at_a_glance' => [
                    'area' => ['en' => 'Arbitration & Commercial ADR', 'bn' => 'সালিশ ও বিকল্প বিরোধ নিষ্পত্তি'],
                    'who_it_may_help' => ['en' => 'Commercial enterprises, contractors, joint venture partners, cross-border traders', 'bn' => 'বাণিজ্যিক প্রতিষ্ঠান, ঠিকাদার, যৌথ অংশীদার ও ব্যবসায়ী'],
                    'related_matters' => ['en' => 'Section 7A interim orders, tribunal advocacy, award enforcement, Section 42 setting aside', 'bn' => '৭এ ধারার অন্তর্বর্তী আদেশ, ট্রাইব্যুনাল শুনানি, রোয়েদাদ কার্যকর ও বাতিল'],
                    'jurisdiction' => ['en' => 'Arbitral Tribunals, District Judge Courts & High Court Division', 'bn' => 'আরবিট্রাল ট্রাইব্যুনাল, জেলা জজ আদালত ও হাইকোর্ট বিভাগ'],
                    'depends_on' => ['en' => 'Arbitration agreement clause, contract documents, dispute timeline', 'bn' => 'চুক্তির সালিশি ধারা, লেনদেনের নথি এবং দাবির সময়সীমা'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Arbitration Clause Drafting', 'bn' => 'সালিশি ধারা প্রণয়ন'], 'description' => ['en' => 'Drafting robust, enforceable domestic and international arbitration clauses.', 'bn' => 'চুক্তিতে কার্যকর ও আইনসঙ্গত সালিশি ধারা সন্নিবেশের আইনি পরামর্শ।'], 'icon' => 'scroll'],
                    ['title' => ['en' => 'Appointment of Arbitrators', 'bn' => 'সালিশদার নিয়োগ'], 'description' => ['en' => 'Petitions under Section 12 of the Arbitration Act, 2001 for arbitrator appointment.', 'bn' => 'পক্ষগণ একমত না হলে ১২ ধারায় হাইকোর্টের মাধ্যমে সালিশদার নিয়োগ।'], 'icon' => 'users'],
                    ['title' => ['en' => 'Section 7A Interim Protection', 'bn' => '৭এ ধারায় অন্তর্বর্তীকালীন সুরক্ষা'], 'description' => ['en' => 'High Court Division injunctions and stay orders in aid of arbitration.', 'bn' => 'সালিশ কার্যক্রম শুরুর পূর্বে বা চলাকালে হাইকোর্ট থেকে সম্পত্তি সংরক্ষণের আদেশ।'], 'icon' => 'shield'],
                    ['title' => ['en' => 'Tribunal Representation', 'bn' => 'ট্রাইব্যুনালে আইনি প্রতিনিধিত্ব'], 'description' => ['en' => 'Pleadings, statement of claim, defense, and oral hearing before sole or panel arbitrators.', 'bn' => 'দাবি ও জবাব দাখিল এবং সালিশি ট্রাইব্যুনালে সাক্ষ্য ও যুক্তিতর্ক পরিচালনা।'], 'icon' => 'scale'],
                    ['title' => ['en' => 'Enforcement of Arbitral Awards', 'bn' => 'সালিশি রোয়েদাদ কার্যকরীকরণ'], 'description' => ['en' => 'Executing domestic and foreign arbitral awards as civil court decrees.', 'bn' => 'সালিশি রোয়েদাদকে দেওয়ানি আদালতের ডিক্রির ন্যায় বলবৎকরণ।'], 'icon' => 'landmark'],
                    ['title' => ['en' => 'Setting Aside Awards', 'bn' => 'রোয়েদাদ বাতিলের আবেদন'], 'description' => ['en' => 'Challenging flawed awards under Section 42 and 43 on statutory grounds.', 'bn' => 'আইনগত ত্রুটিযুক্ত রোয়েদাদ বাতিলের জন্য জেলা জজ আদালতে ৪২ ধারার আবেদন।'], 'icon' => 'file-text'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'What is the advantage of arbitration over ordinary court litigation?', 'bn' => 'সাধারণ আদালতের চেয়ে সালিশি মোকদ্দমার সুবিধা কী?']],
                    ['question' => ['en' => 'Can a party go to civil court if the contract contains an arbitration clause?', 'bn' => 'চুক্তিতে সালিশি ধারা থাকলে কি কোনো পক্ষ সরাসরি দেওয়ানি আদালতে যেতে পারে?']],
                    ['question' => ['en' => 'What can a party do if the other side refuses to appoint an arbitrator?', 'bn' => 'অপর পক্ষ সালিশদার নিয়োগে অস্বীকৃতি জানালে কী প্রতিকার আছে?']],
                    ['question' => ['en' => 'How can assets be preserved during pending arbitration proceedings?', 'bn' => 'সালিশ চলাকালীন বিরোধীয় সম্পদ বা অর্থ কীভাবে সুরক্ষিত রাখা যায়?']],
                    ['question' => ['en' => 'Can an arbitral award be appealed to a higher court in Bangladesh?', 'bn' => 'সালিশি রোয়েদাদের বিরুদ্ধে কি উচ্চ আদালতে নিয়মিত আপিল চলে?']],
                    ['question' => ['en' => 'Are foreign arbitral awards enforceable under Bangladesh law?', 'bn' => 'বাংলাদেশে বিদেশি সালিশি রোয়েদাদ (Foreign Award) কার্যকর করার নিয়ম কী?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Agreement & Notice of Dispute', 'bn' => 'চুক্তি পরীক্ষা ও নোটিশ'],
                        'description' => ['en' => 'Review arbitration clause and issue formal notice invoking arbitration.', 'bn' => 'চুক্তির সালিশি ধারা পরীক্ষা এবং সালিশ শুরুর আনুষ্ঠানিক নোটিশ প্রেরণ।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Tribunal Constitution', 'bn' => 'ট্রাইব্যুনাল গঠন'],
                        'description' => ['en' => 'Constitute the arbitral tribunal by consent or via Section 12 court petition.', 'bn' => 'পারস্পরিক সম্মতিতে অথবা আদালতের মাধ্যমে উপযুক্ত সালিশদার নিয়োগ।'],
                        'icon' => 'users',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Interim Protection Application', 'bn' => 'অন্তর্বর্তী সুরক্ষার আবেদন'],
                        'description' => ['en' => 'Seek protective interim orders under Section 7A or tribunal power.', 'bn' => 'প্রয়োজনে ৭এ ধারায় হাইকোর্ট বা ট্রাইব্যুনাল থেকে স্থগিতাদেশ গ্রহণ।'],
                        'icon' => 'shield',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Pleadings & Oral Hearings', 'bn' => 'দাবি উপস্থাপন ও সাক্ষ্য গ্রহণ'],
                        'description' => ['en' => 'Submit statement of claim, documents, cross-examination, and legal arguments.', 'bn' => 'দাবি ও জবাব দাখিল, জেরা এবং আইনি যুক্তিতর্ক সমাপ্তিকরণ।'],
                        'icon' => 'scale',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Award & Execution', 'bn' => 'রোয়েদাদ ও ডিক্রি জারী'],
                        'description' => ['en' => 'Receive arbitral award and initiate execution proceeding in civil court.', 'bn' => 'চূড়ান্ত রোয়েদাদ প্রাপ্তি এবং ডিক্রির ন্যায় জারী মামলা পরিচালনা।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Executed underlying contract containing valid arbitration clause', 'bn' => 'বৈধ সালিশি ধারা সংবলিত মূল বাণিজ্যিক চুক্তিপত্র']],
                    ['item' => ['en' => 'Notice invoking arbitration and proof of service on opposite party', 'bn' => 'সালিশ শুরুর নোটিশ ও প্রাপ্তিস্বীকারের রশিদ']],
                    ['item' => ['en' => 'All commercial correspondence, purchase orders, invoices, and payment receipts', 'bn' => 'লেনদেন ও চিঠিপত্রের অনুলিপি, চালান এবং পেমেন্ট রশিদ']],
                    ['item' => ['en' => 'Minutes of joint dispute meetings or attempts at negotiation', 'bn' => 'উভয় পক্ষের বৈঠক বা বিরোধ নিষ্পত্তির সভার কার্যবিবরণী']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'What is the Arbitration Act 2001 in Bangladesh?', 'bn' => 'বাংলাদেশের ২০০১ সালের সালিশ আইন কী?'],
                        'answer' => ['en' => 'The Arbitration Act, 2001 is Bangladesh\'s unified statute for domestic and international commercial arbitration, based largely on the UNCITRAL Model Law.', 'bn' => '২০০১ সালের সালিশ আইন হলো বাংলাদেশের অভ্যন্তরীণ ও আন্তর্জাতিক বাণিজ্যিক সালিশ নিয়ন্ত্রণের মূল আইন, যা আন্তর্জাতিক মডেল আইনের আদলে প্রণীত।'],
                    ],
                    [
                        'question' => ['en' => 'What is Section 7A of the Arbitration Act, 2001?', 'bn' => 'সালিশ আইনের ৭এ ধারা বলতে কী বোঝায়?'],
                        'answer' => ['en' => 'Section 7A empowers the High Court Division to grant interim orders (such as injunctions or freezing orders) before or during arbitration to protect the subject matter of the dispute.', 'bn' => '৭এ ধারা হাইকোর্ট বিভাগকে সালিশ শুরু হওয়ার আগে বা চলাকালে বিরোধীয় সম্পত্তি বা অধিকার সংরক্ষণে অন্তর্বর্তীকালীন নিষেধাজ্ঞা দেওয়ার এখতিয়ার দেয়।'],
                    ],
                    [
                        'question' => ['en' => 'Is an arbitral award final and binding?', 'bn' => 'সালিশি রোয়েদাদ কি চূড়ান্ত ও বাধ্যতামূলক?'],
                        'answer' => ['en' => 'Yes. An arbitral award is final and binding between the parties, and it cannot be appealed on factual merits. It can only be challenged under Section 42/43 on narrow grounds such as fraud, lack of jurisdiction, or violation of public policy.', 'bn' => 'হ্যাঁ। রোয়েদাদ চূড়ান্ত ও বাধ্যতামূলক। এর বিরুদ্ধে সাধারণ আপিল চলে না; কেবল এখতিয়ারহীনতা বা নীতিবিরোধী কাজের মতো সুনির্দিষ্ট কারণে তা চ্যালেঞ্জ করা যায়।'],
                    ],
                    [
                        'question' => ['en' => 'How is an arbitral award enforced in Bangladesh?', 'bn' => 'বাংলাদেশে সালিশি রোয়েদাদ কীভাবে কার্যকর করা হয়?'],
                        'answer' => ['en' => 'Under Section 44, a domestic arbitral award is enforced by filing an execution application before the competent District Court as if it were a civil court decree.', 'bn' => '৪৪ ধারা অনুযায়ী রোয়েদাদ কার্যকর করতে উপযুক্ত জেলা আদালতে সাধারণ দেওয়ানি ডিক্রির মতোই জারী মামলা দায়ের করতে হয়।'],
                    ],
                    [
                        'question' => ['en' => 'Does an arbitration clause bar regular civil suits?', 'bn' => 'চুক্তিতে সালিশি ধারা থাকলে কি দেওয়ানি মামলা দায়ের করা নিষিদ্ধ?'],
                        'answer' => ['en' => 'If a suit is filed in breach of an arbitration clause, the defendant can apply under Section 7 to stay court proceedings and refer the dispute to arbitration.', 'bn' => 'সালিশি ধারা লঙ্ঘন করে মামলা করা হলে বিবাদী ৭ ধারার দরখাস্ত দিয়ে আদালতের কার্যক্রম স্থগিত করে সালিশে পাঠানোর আবেদন করতে পারেন।'],
                    ],
                    [
                        'question' => ['en' => 'Can international arbitration awards be enforced in Bangladesh?', 'bn' => 'বাংলাদেশে আন্তর্জাতিক সালিশি রোয়েদাদ কার্যকর করা যায় কি?'],
                        'answer' => ['en' => 'Yes. Bangladesh is a party to the New York Convention 1958, and foreign arbitral awards from recognized reciprocal jurisdictions are enforceable under Sections 45-47.', 'bn' => 'হ্যাঁ। বাংলাদেশ নিউ ইয়র্ক কনভেনশনের পক্ষভুক্ত দেশ হওয়ায় বিধিবদ্ধ প্রক্রিয়ায় বিদেশি সালিশি রোয়েদাদ কার্যকরযোগ্য।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'Arbitration Law & Dispute Adjudication | Advocate Nijam Uddin (Haq)', 'bn' => 'সালিশ আইন ও বাণিজ্যিক বিরোধ নিষ্পত্তি | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Commercial arbitration advocacy, Section 7A interim orders, and arbitral award enforcement under the Arbitration Act 2001 by Advocate Nijam Uddin (Haq).', 'bn' => '২০০১ সালের সালিশ আইনের অধীন বাণিজ্যিক সালিশ, ৭এ ধারায় অন্তর্বর্তী আদেশ ও রোয়েদাদ কার্যকরীকরণে আইনি প্রতিনিধিত্ব।'],
                ],
            ],

            // 8. Corporate & Commercial
            [
                'slug' => 'corporate-commercial',
                'title' => ['en' => 'Corporate & Commercial', 'bn' => 'কর্পোরেট ও বাণিজ্যিক আইন'],
                'short_description' => [
                    'en' => 'Commercial contract review, joint ventures, business transactions, risk assessment, and corporate legal advisory for operating enterprises.',
                    'bn' => 'বাণিজ্যিক চুক্তি প্রণয়ন ও পর্যালোচনা, যৌথ অংশীদারিত্ব, লেনদেন ঝুঁকি নিরূপণ এবং প্রাতিষ্ঠানিক ব্যবসা পরিচালনায় আইনি পরামর্শ।',
                ],
                'tagline' => ['en' => 'Commercial foresight, robust contracting, and regulatory peace of mind', 'bn' => 'বাণিজ্যিক দূরদর্শিতা, নির্ভরযোগ্য চুক্তি ও আইনি ঝুঁকি প্রশমন'],
                'full_description' => [
                    'en' => "<p>Corporate and commercial law encompasses the legal architecture of business operations, trade transactions, commercial agreements, and regulatory adherence in Bangladesh. Sound commercial legal advice prevents costly contractual liabilities and preserves operational integrity.</p><p>We advise corporate entities, partnerships, and high-growth businesses on commercial contract drafting and vetting, joint venture agreements, distribution and agency arrangements, non-disclosure agreements, procurement documentation, and regulatory compliance across diverse sectors.</p><p>We provide pragmatic, risk-calibrated legal opinions designed to identify potential contractual liabilities before agreements are signed and executed.</p>",
                    'bn' => "<p>কর্পোরেট ও বাণিজ্যিক আইন ব্যবসা পরিচালনা, পণ্য ও সেবা লেনদেন, বাণিজ্যিক চুক্তি এবং সরকারি নিয়ন্ত্রক কমপ্লায়েন্স সংক্রান্ত আইনি ভিত্তি নিশ্চিত করে। সঠিক আইনি পরামর্শ ভবিষ্যতের ব্যয়বহুল মামলা প্রতিরোধ করে ব্যবসার স্থায়িত্ব বাড়ায়।</p><p>আমরা দেশীয় ও যৌথ উদ্যোগের প্রতিষ্ঠানসমূহকে বাণিজ্যিক চুক্তিপত্র প্রণয়ন ও মূল্যায়ন, সরবরাহ ও পরিবেশক চুক্তি, অংশীদারি দলিল এবং বাণিজ্যিক নিয়ন্ত্রক সংস্থার কমপ্লায়েন্স বিষয়ে আইনি সহায়তা প্রদান করি।</p><p>চুক্তি সম্পাদনের পূর্বেই সম্ভাব্য দায়দায়িত্ব ও আইনি ঝুঁকি স্পষ্টভাবে চিহ্নিত করে আমরা বাস্তবসম্মত ও সুনির্দিষ্ট আইনি মতামত প্রদান করে থাকি।</p>",
                ],
                'icon_name' => 'briefcase',
                'sort_order' => 8,
                'status' => 'published',
                'is_featured' => false,
                'at_a_glance' => [
                    'area' => ['en' => 'Commercial & Transactional Law', 'bn' => 'বাণিজ্যিক ও লেনদেন আইন'],
                    'who_it_may_help' => ['en' => 'Enterprises, joint ventures, commercial suppliers, business founders', 'bn' => 'ব্যবসা প্রতিষ্ঠান, যৌথ উদ্যোগ, সরবরাহকারী ও উদ্যোক্তা'],
                    'related_matters' => ['en' => 'Contract drafting, vendor agreements, regulatory compliance, risk review', 'bn' => 'চুক্তি প্রণয়ন, সরবরাহকারী চুক্তি, আইনি কমপ্লায়েন্স, ঝুঁকি পর্যালোচনা'],
                    'jurisdiction' => ['en' => 'Courts of Bangladesh, Regulatory Authorities & Commercial Fora', 'bn' => 'বাংলাদেশের আদালত, নিয়ন্ত্রক কর্তৃপক্ষ ও বাণিজ্যিক ফোরাম'],
                    'depends_on' => ['en' => 'Commercial terms, regulatory statutes, liability allocations', 'bn' => 'বাণিজ্যিক শর্তাবলি, সংশ্লিষ্ট বিধিবদ্ধ আইন ও দায়-দায়িত্বের বণ্টন'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Commercial Contract Vetting', 'bn' => 'বাণিজ্যিক চুক্তি যাচাই'], 'description' => ['en' => 'Detailed examination of supply, service, and licensing agreements.', 'bn' => 'পণ্য সরবরাহ, সেবা ও লাইসেন্স চুক্তির শর্তাবলি সূক্ষ্মভাবে যাচাই।'], 'icon' => 'file-text'],
                    ['title' => ['en' => 'Joint Ventures & Partnerships', 'bn' => 'যৌথ উদ্যোগ ও অংশীদারিত্ব'], 'description' => ['en' => 'Drafting JV agreements, shareholder pacts, and profit-sharing terms.', 'bn' => 'জেভি চুক্তি, অংশীদারিত্বের শর্ত এবং লভ্যাংশ বণ্টন কাঠামোর রূপরেখা।'], 'icon' => 'users'],
                    ['title' => ['en' => 'Vendor & Distribution Agreements', 'bn' => 'পরিবেশক ও সরবরাহ চুক্তি'], 'description' => ['en' => 'Structuring distribution channels, exclusive agency, and franchise terms.', 'bn' => 'পণ্য বিপণন, পরিবেশক নিয়োগ এবং ফ্র্যাঞ্চাইজি শর্তের আইনি রূপরেখা।'], 'icon' => 'briefcase'],
                    ['title' => ['en' => 'Regulatory Licensing & Clearances', 'bn' => 'নিয়ন্ত্রক লাইসেন্স ও অনুমোদন'], 'description' => ['en' => 'Compliance advisory on trade licenses, BIDA, and sector approvals.', 'bn' => 'ট্রেড লাইসেন্স, বিডা এবং সরকারি দপ্তরের অনুমোদন বিষয়ে পরামর্শ।'], 'icon' => 'award'],
                    ['title' => ['en' => 'Confidentiality & IP Protections', 'bn' => 'গোপনীয়তা ও বাণিজ্যিক স্বত্ব'], 'description' => ['en' => 'Non-disclosure agreements (NDAs) and trade secret protections.', 'bn' => 'তথ্য সুরক্ষা, গোপনীয়তা চুক্তি (NDA) এবং বাণিজ্যিক স্বার্থ রক্ষা।'], 'icon' => 'shield'],
                    ['title' => ['en' => 'Commercial Dispute Strategy', 'bn' => 'বাণিজ্যিক বিরোধ কৌশল'], 'description' => ['en' => 'Early assessment of contractual breach and pre-litigation notices.', 'bn' => 'চুক্তি ভঙ্গের ক্ষেত্রে ক্ষতি নিরূপণ এবং আইনি নোটিশের মাধ্যমে প্রস্তুতি।'], 'icon' => 'scale'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'How can a business limit contractual liability in commercial agreements?', 'bn' => 'বাণিজ্যিক চুক্তিতে প্রতিষ্ঠান কীভাবে নিজের দায় সীমিত রাখতে পারে?']],
                    ['question' => ['en' => 'What are the consequences of ambiguous breach or termination clauses?', 'bn' => 'চুক্তির শর্তে অস্পষ্টতা থাকলে কী ধরনের আইনি ঝুঁকি তৈরি হয়?']],
                    ['question' => ['en' => 'How are cross-border transactions governed under Bangladesh foreign exchange laws?', 'bn' => 'বিদেশি মুদ্রার লেনদেনে বাংলাদেশ ব্যাংকের বিধিনিষেধ কীভাবে প্রযোজ্য হয়?']],
                    ['question' => ['en' => 'Can a commercial agreement exclude court jurisdiction in favor of ADR?', 'bn' => 'চুক্তিতে আদালতের বিকল্প হিসেবে সমঝোতা বা সালিশ বাধ্যতামূলক করা যায় কি?']],
                    ['question' => ['en' => 'What remedies exist if a commercial counterparty defaults on delivery or payment?', 'bn' => 'ব্যবসায়িক পক্ষ পণ্য বা অর্থ প্রদানে ব্যর্থ হলে তাৎক্ষণিক প্রতিকার কী?']],
                    ['question' => ['en' => 'Does signing an MOU (Memorandum of Understanding) create binding legal liabilities?', 'bn' => 'সমঝোতা স্মারক (MOU) স্বাক্ষর করলে কি তা আইনত বাধ্যতামূলক হয়ে যায়?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Commercial Objective Review', 'bn' => 'বাণিজ্যিক লক্ষ্য নির্ধারণ'],
                        'description' => ['en' => 'Understand business objectives, deal structure, and commercial risks.', 'bn' => 'লেনদেনের ধরন, ব্যবসায়িক স্বার্থ এবং প্রধান ঝুঁকিগুলো চিহ্নিতকরণ।'],
                        'icon' => 'book-open',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Statutory Compliance Check', 'bn' => 'আইনি কমপ্লায়েন্স যাচাই'],
                        'description' => ['en' => 'Verify regulatory clearances, foreign exchange rules, and sector laws.', 'bn' => 'প্রযোজ্য সরকারি নীতিমালা, আইন এবং বিধিনিষেধের সাথে সংগতি পরীক্ষা।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Contract Structuring & Drafting', 'bn' => 'চুক্তি প্রণয়ন ও শর্ত প্রস্তুত'],
                        'description' => ['en' => 'Formulate customized terms, dispute clauses, and termination rights.', 'bn' => 'সুনির্দিষ্ট শর্ত, বিরোধ নিষ্পত্তির ধারা এবং দায়বদ্ধতা স্পষ্ট করে খসড়া প্রণয়ন।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Negotiation & Revision', 'bn' => 'আলোচনা ও সংশোধন'],
                        'description' => ['en' => 'Refine clauses during bilateral negotiations with counterparty counsel.', 'bn' => 'উভয় পক্ষের পর্যালোচনার পর যৌথ স্বার্থ সংরক্ষণে চুক্তির পরিমার্জন।'],
                        'icon' => 'users',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Execution & Operational Audit', 'bn' => 'সম্পাদন ও পর্যবেক্ষণ'],
                        'description' => ['en' => 'Formal execution, stamping, registration (if required), and compliance.', 'bn' => 'স্ট্যাম্পিং, যথাযথ স্বাক্ষর সম্পাদন এবং চুক্তি বাস্তবায়ন পর্যবেক্ষণ।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Draft agreement, term sheet, or commercial proposal', 'bn' => 'খসড়া চুক্তিপত্র, টার্ম শিট বা বাণিজ্যিক প্রস্তাবনা']],
                    ['item' => ['en' => 'Corporate documentation of parties (Trade license, Certificate of Incorporation)', 'bn' => 'উভয় পক্ষের ট্রেড লাইসেন্স, ইনকর্পোরেশন সার্টিফিকেট বা অংশীদারি দলিল']],
                    ['item' => ['en' => 'Board resolution authorizing execution and designated signatories', 'bn' => 'চুক্তি স্বাক্ষরের অনুমোদনে পরিচালনা পর্ষদের রেজল্যুশন']],
                    ['item' => ['en' => 'Relevant invoices, specifications, and commercial correspondence', 'bn' => 'পণ্যের স্পেসিফিকেশন, চালান ও সংশ্লিষ্ট চিঠিপত্র']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'How does a commercial agreement differ from company law matters?', 'bn' => 'কোম্পানি আইনের সাথে বাণিজ্যিক চুক্তির পার্থক্য কী?'],
                        'answer' => ['en' => 'Company law governs intra-corporate internal governance and shareholder rights. Commercial law governs external transactions, trade contracts, and business agreements between separate entities.', 'bn' => 'কোম্পানি আইন অভ্যন্তরীণ পরিচালনা ও শেয়ারহোল্ডারদের অধিকার নিয়ে কাজ করে। আর বাণিজ্যিক আইন দুটি ভিন্ন প্রতিষ্ঠানের মধ্যকার চুক্তি ও লেনদেন নিয়ন্ত্রণ করে।'],
                    ],
                    [
                        'question' => ['en' => 'Why is non-disclosure agreement (NDA) important prior to business talks?', 'bn' => 'ব্যবসায়িক আলোচনার শুরুতে গোপনীয়তা চুক্তি (NDA) কেন জরুরি?'],
                        'answer' => ['en' => 'An NDA legally protects proprietary business secrets, pricing structures, and technical know-how from unauthorized use if negotiations fail.', 'bn' => 'এনডিএ ব্যবসার গোপনীয় তথ্য, মূল্য কাঠামো বা প্রযুক্তিগত জ্ঞানকে অপর পক্ষের অননুমোদিত ব্যবহার থেকে সুরক্ষিত রাখে।'],
                    ],
                    [
                        'question' => ['en' => 'What is the importance of stamping contracts in Bangladesh?', 'bn' => 'বাংলাদেশে চুক্তিতে নন-জুডিশিয়াল স্ট্যাম্প ব্যবহারের গুরুত্ব কী?'],
                        'answer' => ['en' => 'Under the Stamp Act, 1899, unstamped or insufficiently stamped contracts cannot be admitted into evidence in court without payment of statutory penalties.', 'bn' => 'স্ট্যাম্প আইন ১৮৯৯ অনুযায়ী নির্ধারিত মূল্যের স্ট্যাম্প না থাকলে চুক্তি আদালতে সাক্ষ্য হিসেবে সরাসরি গ্রহণযোগ্য হয় না।'],
                    ],
                    [
                        'question' => ['en' => 'Can liquidated damages be claimed automatically upon contract breach?', 'bn' => 'চুক্তি ভঙ্গ হলেই কি ক্ষতিপূরণ (Liquidated Damages) সরাসরি দাবি করা যায়?'],
                        'answer' => ['en' => 'Under Section 74 of the Contract Act, 1872, courts in Bangladesh award only reasonable compensation not exceeding the agreed penalty amount based on proved loss.', 'bn' => 'চুক্তি আইনের ৭৪ ধারা অনুসারে আদালতে প্রমাণিত ক্ষতির ভিত্তিতে কেবল যুক্তিসঙ্গত ক্ষতিপূরণ মঞ্জুর করা হয়।'],
                    ],
                    [
                        'question' => ['en' => 'What is a force majeure clause and how does it operate?', 'bn' => 'ফোর্স মেজার (Force Majeure) ধারা কী এবং তা কীভাবে কাজ করে?'],
                        'answer' => ['en' => 'A force majeure clause excuses performance without liability when extraordinary, unforeseen events (such as natural disasters or statutory bans) prevent compliance.', 'bn' => 'অপ্রতিরোধ্য প্রাকৃতিক দুর্যোগ বা যুদ্ধের মতো অপ্রত্যাশিত ঘটনায় চুক্তি বাস্তবায়ন অসম্ভব হলে এই ধারা পক্ষগণকে দায় থেকে অব্যাহতি দেয়।'],
                    ],
                    [
                        'question' => ['en' => 'What steps should be taken prior to signing high-value commercial agreements?', 'bn' => 'বড় অংকের বাণিজ্যিক চুক্তি স্বাক্ষরের আগে কী পদক্ষেপ নেওয়া উচিত?'],
                        'answer' => ['en' => 'Conduct legal due diligence, verify corporate signing authority, clarify dispute resolution mechanisms, and ensure all regulatory approvals are in place.', 'bn' => 'আইনি যাচাই (Due Diligence), স্বাক্ষরকারীর কর্তৃত্ব, বিরোধ নিষ্পত্তির নিয়ম এবং সরকারি অনুমোদনসমূহ পূর্বেই নিশ্চিত করা উচিত।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'Corporate & Commercial Legal Advisory | Advocate Nijam Uddin (Haq)', 'bn' => 'কর্পোরেট ও বাণিজ্যিক চুক্তি পরামর্শ | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Commercial contract vetting, joint venture agreements, business compliance, and transaction advisory by Advocate Nijam Uddin (Haq).', 'bn' => 'বাণিজ্যিক চুক্তি যাচাই, যৌথ উদ্যোগ ও ব্যবসায়িক আইনি ঝুঁকি নিরূপণে অ্যাডভোকেট নিজাম উদ্দিন (হক)-এর পরামর্শ।'],
                ],
            ],

            // 9. General Practice
            [
                'slug' => 'general-practice',
                'title' => ['en' => 'General Practice', 'bn' => 'সাধারণ আইন অনুশীলন'],
                'short_description' => [
                    'en' => 'Preliminary legal consultations, comprehensive document evaluation, legal notice drafting, and strategic jurisdictional orientation across legal forums.',
                    'bn' => 'প্রাথমিক আইনি পরামর্শ, নথিপত্র পরীক্ষা, লিগ্যাল নোটিশ প্রদান এবং উপযুক্ত আদালতে আইনি পদক্ষেপের সুস্পষ্ট দিকনির্দেশনা।',
                ],
                'tagline' => ['en' => 'Clarity, preliminary assessment, and principled legal direction', 'bn' => 'স্পষ্ট আইনি পর্যালোচনা ও সঠিক দিকনির্দেশনা'],
                'full_description' => [
                    'en' => "<p>General legal practice provides individuals and organizations with preliminary issue identification, cross-disciplinary document assessment, and procedural guidance when faced with multifaceted legal uncertainties. Many practical disputes involve overlapping criminal, civil, regulatory, and constitutional aspects.</p><p>We review documents, issue formal legal demand notices, analyze jurisdictional options, and advise on pre-litigation strategies. When specialized forum requirements arise, we assist in structuring the factual narrative and coordinating appropriate proceedings.</p><p>Our general practice focuses on objective legal advice, ensuring clients understand their rights, procedural options, potential costs, and realistic timelines before entering formal litigation.</p>",
                    'bn' => "<p>সাধারণ আইন অনুশীলনের মূল লক্ষ্য হলো বহুমুখী আইনি সংকটে পতিত ব্যক্তি ও সংস্থাকে সঠিক বিচারিক ফোরাম ও করণীয় পদক্ষেপের প্রাথমিক দিকনির্দেশনা প্রদান করা। অনেক ক্ষেত্রে একটি সমস্যায় দেওয়ানি, ফৌজদারি ও প্রশাসনিক আইনের একাধিক দিক জড়িত থাকতে পারে।</p><p>আমরা প্রাথমিক নথিপত্র পরীক্ষা, আইনি নোটিশ প্রেরণ, এখতিয়ার নির্ধারণ এবং বিরোধ নিষ্পত্তির সম্ভাব্য বিকল্পসমূহ বিস্তারিত পর্যালোচনা করি।</p><p>অহেতুক মামলা মোকদ্দমা পরিহার করে বাস্তবসম্মত সমাধান খুঁজে বের করা এবং আদালতে যাওয়ার পূর্বে সামগ্রিক আইনি অধিকার স্পষ্ট করাই এই সেবার প্রধান উদ্দেশ্য।</p>",
                ],
                'icon_name' => 'book-open',
                'sort_order' => 9,
                'status' => 'published',
                'is_featured' => false,
                'at_a_glance' => [
                    'area' => ['en' => 'General Practice & Legal Advisory', 'bn' => 'সাধারণ আইন ও পরামর্শ সেবা'],
                    'who_it_may_help' => ['en' => 'Individuals, families, small enterprises, and first-time litigants', 'bn' => 'ব্যক্তি, পরিবার, ক্ষুদ্র উদ্যোক্তা ও নতুন বিচারপ্রার্থী'],
                    'related_matters' => ['en' => 'Preliminary consultation, legal notices, document review, referrals', 'bn' => 'প্রাথমিক পরামর্শ, আইনি নোটিশ, নথি পর্যালোচনা, ফোরাম নির্ধারণ'],
                    'jurisdiction' => ['en' => 'All Jurisdictions in Bangladesh', 'bn' => 'বাংলাদেশের সকল বিচারিক ফোরাম ও আদালত'],
                    'depends_on' => ['en' => 'Nature of the dispute, available documentation, legal merits', 'bn' => 'বিরোধের প্রকৃতি, উপলব্ধ নথিপত্র ও আইনি ভিত্তি'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Preliminary Issue Diagnosis', 'bn' => 'আইনি সমস্যা চিহ্নিতকরণ'], 'description' => ['en' => 'Identifying whether a matter falls under civil, criminal, or administrative law.', 'bn' => 'সমস্যাটি দেওয়ানি, ফৌজদারি না প্রশাসনিক আইনের আওতাভুক্ত তা নির্ধারণ।'], 'icon' => 'file-text'],
                    ['title' => ['en' => 'Legal Demand Notices', 'bn' => 'আইনি নোটিশ প্রণয়ন ও জবাব'], 'description' => ['en' => 'Drafting and responding to formal advocate notices demanding justice or claims.', 'bn' => 'পেশাদার লিগ্যাল নোটিশ প্রণয়ন বা অপর পক্ষ থেকে প্রাপ্ত নোটিশের জবাব দাখিল।'], 'icon' => 'scroll'],
                    ['title' => ['en' => 'Documentary Scrutiny', 'bn' => 'নথিপত্র ও দলিল পর্যালোচনা'], 'description' => ['en' => 'Comprehensive review of title papers, agreements, or court summons.', 'bn' => 'প্রাপ্ত সমন, রেজিস্ট্রি দলিল বা চুক্তিপত্রের আইনগত কার্যকারিতা পরীক্ষা।'], 'icon' => 'book-open'],
                    ['title' => ['en' => 'Pre-Litigation Counselling', 'bn' => 'মামলাপূর্ব আইনি পরামর্শ'], 'description' => ['en' => 'Assessing risks, expenses, and expected timelines before initiating a lawsuit.', 'bn' => 'আদালতে যাওয়ার পূর্বে মামলার ব্যয়, ঝুঁকি ও সময়সীমার বাস্তব চিত্র অনুধাবন।'], 'icon' => 'scale'],
                    ['title' => ['en' => 'Affidavit & Statutory Declarations', 'bn' => 'হলফনামা ও ঘোষণার সত্যয়ন'], 'description' => ['en' => 'Drafting legally verified affidavits, declarations, and undertakings.', 'bn' => 'আইনসঙ্গত হলফনামা, ঘোষণা ও অঙ্গীকারনামা প্রণয়নে সহায়তা।'], 'icon' => 'award'],
                    ['title' => ['en' => 'Forum Direction & Referrals', 'bn' => 'উপযুক্ত ফোরামের দিকনির্দেশনা'], 'description' => ['en' => 'Directing matters to competent specialized tribunals and departments.', 'bn' => 'প্রয়োজনে সংশ্লিষ্ট বিশেষ ট্রাইব্যুনাল বা কর্তৃপক্ষের কাছে উপস্থাপনে সহায়তা।'], 'icon' => 'landmark'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'I am unsure which court has jurisdiction over my dispute; where do I start?', 'bn' => 'আমার সমস্যায় কোন আদালতের এখতিয়ার রয়েছে তা বুঝতে পারছি না, কোথা থেকে শুরু করব?']],
                    ['question' => ['en' => 'What is the significance of issuing a formal legal notice before filing a suit?', 'bn' => 'মামলা করার আগে আইনজীবীর মাধ্যমে আইনি নোটিশ পাঠানোর গুরুত্ব কী?']],
                    ['question' => ['en' => 'How should I respond if I receive an advocate notice from an opposite party?', 'bn' => 'অপর পক্ষ থেকে লিগ্যাল নোটিশ পেলে আমার করণীয় কী?']],
                    ['question' => ['en' => 'Can a dispute be settled without entering protracted court litigation?', 'bn' => 'আদালতে দীর্ঘ মামলা মোকদ্দমা না করে কি সমঝোতায় পৌঁছানো সম্ভব?']],
                    ['question' => ['en' => 'What documents should I organize before visiting an advocate for the first time?', 'bn' => 'আইনজীবীর কাছে যাওয়ার আগে কী কী কাগজপত্র প্রস্তুত রাখা ভালো?']],
                    ['question' => ['en' => 'How are legal fees and court expenses calculated for a general consultation?', 'bn' => 'আইনি পরামর্শ ও আনুষঙ্গিক খরচের কাঠামো কেমন হয়ে থাকে?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Factual Narration', 'bn' => 'ঘটনার বিশদ বিবরণ গ্রহণ'],
                        'description' => ['en' => 'Chronological recounting of events, contracts, notices, and interactions.', 'bn' => 'ঘটনার ধারাবাহিক বিবরণ ও পূর্ববর্তী পদক্ষেপগুলো জানা।'],
                        'icon' => 'users',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Documentary Review', 'bn' => 'কাগজপত্র ও প্রমাণের বিশ্লেষণ'],
                        'description' => ['en' => 'Review relevant deeds, communications, police papers, or bank records.', 'bn' => 'দলিল, চুক্তি, ব্যাংক লেনদেন বা চিঠি পুঙ্খানুপুঙ্খ পরীক্ষা।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Applicable Law Identification', 'bn' => 'প্রযোজ্য আইন নিরূপণ'],
                        'description' => ['en' => 'Identify relevant statutes, court jurisdictions, and limitation deadlines.', 'bn' => 'সংশ্লিষ্ট আইন, উপযুক্ত আদালত ও তামাদির সময়সীমা নিশ্চিতকরণ।'],
                        'icon' => 'scale',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Legal Notice / Preliminary Action', 'bn' => 'আইনি নোটিশ বা প্রাথমিক পদক্ষেপ'],
                        'description' => ['en' => 'Draft demand notice or explore pre-litigation resolution possibilities.', 'bn' => 'দাবি জানিয়ে লিগ্যাল নোটিশ প্রেরণ বা সমঝোতার উদ্যোগ গ্রহণ।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Formal Proceeding / Next Steps', 'bn' => 'পরবর্তী আইনি পদক্ষেপ নির্ধারণ'],
                        'description' => ['en' => 'Determine whether to file formal court pleadings or initiate settlement.', 'bn' => 'আদালতে মামলা দায়ের বা বিকল্প পন্থায় সমাধানের চূড়ান্ত সিদ্ধান্ত।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'All relevant written agreements, correspondence, and emails', 'bn' => 'চুক্তিপত্র, চিঠি ও সংশ্লিষ্ট যোগাযোগের অনুলিপি']],
                    ['item' => ['en' => 'Any court summons, notice, or letter received from the opposite party', 'bn' => 'আদালতের সমন, ওয়ারেন্ট বা অপর পক্ষের লিগ্যাল নোটিশ']],
                    ['item' => ['en' => 'National ID / Passport of the consulting person', 'bn' => 'পরামর্শপ্রার্থীর জাতীয় পরিচয়পত্র বা পাসপোর্ট']],
                    ['item' => ['en' => 'Financial transaction slips, cheques, or receipts (if money involved)', 'bn' => 'টাকা লেনদেনের রশিদ, চেক বা ব্যাংক বিবরণী']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'What happens during an initial legal consultation?', 'bn' => 'প্রাথমিক আইনি পরামর্শের সময় কী ঘটে?'],
                        'answer' => ['en' => 'The advocate listens to your factual situation, reviews existing documents, identifies key legal issues, and explains available legal remedies and procedures.', 'bn' => 'আইনজীবী আপনার সমস্যার বিবরণ শোনেন, কাগজপত্র পরীক্ষা করেন এবং কোন আইনে কী ধরনের প্রতিকার সম্ভব তা ব্যাখ্যা করেন।'],
                    ],
                    [
                        'question' => ['en' => 'Is a formal legal notice mandatory before instituting every lawsuit?', 'bn' => 'সব মামলা করার আগেই কি লিগ্যাল নোটিশ পাঠানো বাধ্যতামূলক?'],
                        'answer' => ['en' => 'Not for all suits, but certain statutes (such as the Negotiable Instruments Act for cheque dishonor, or suits against government under Section 80 CPC) mandate statutory notice before filing.', 'bn' => 'সব ক্ষেত্রে নয়, তবে চেক ডিজঅনার মামলা বা সরকারের বিরুদ্ধে মামলার মতো কিছু ক্ষেত্রে মামলা করার আগে নোটিশ পাঠানো আইনত বাধ্যতামূলক।'],
                    ],
                    [
                        'question' => ['en' => 'Can general practice consultations resolve matters without filing a lawsuit?', 'bn' => 'মামলা না করেও কি সাধারণ আইনি পরামর্শের মাধ্যমে সমস্যার সমাধান সম্ভব?'],
                        'answer' => ['en' => 'Yes. Often, a well-reasoned legal notice or professional negotiation clarifies rights and encourages an amicable out-of-court settlement.', 'bn' => 'হ্যাঁ। অনেক সময় একটি সুস্পষ্ট আইনি নোটিশ বা গঠনমূলক আলোচনার মাধ্যমেই মামলা ছাড়াই পারস্পরিক আপসে বিরোধ নিষ্পত্তি হয়।'],
                    ],
                    [
                        'question' => ['en' => 'How can I ensure my consultation remains confidential?', 'bn' => 'আমার আলোচনা যে গোপন থাকবে তা কীভাবে নিশ্চিত হব?'],
                        'answer' => ['en' => 'Section 126 of the Evidence Act and Bar Council Rules strictly protect all privileged communications between an advocate and client.', 'bn' => 'সাক্ষ্য আইনের ১২৬ ধারা এবং বার কাউন্সিলের আচরণবিধি অনুযায়ী আইনজীবী ও মক্কেলের মধ্যকার সকল আলাপচারিতা সম্পূর্ণ গোপনীয় ও সুরক্ষিত।'],
                    ],
                    [
                        'question' => ['en' => 'What if my matter requires proceeding before a specialized tribunal?', 'bn' => 'আমার বিষয়টি কোনো বিশেষ ট্রাইব্যুনালের আওতাধীন হলে কী হবে?'],
                        'answer' => ['en' => 'We assist in preparing the initial pleadings and ensure representation is coordinated before the competent forum (such as Artha Rin Adalat, Land Survey Tribunal, or Labor Court).', 'bn' => 'অর্থঋণ আদালত, ল্যান্ড সার্ভে ট্রাইব্যুনাল বা শ্রম আদালতের মতো বিশেষায়িত ফোরামের জন্য প্রয়োজনীয় প্রস্তুতি গ্রহণ করা হয়।'],
                    ],
                    [
                        'question' => ['en' => 'Does an initial meeting automatically create a lawyer-client retainer?', 'bn' => 'প্রাথমিক আলোচনা করলেই কি আইনজীবী স্থায়ীভাবে নিযুক্ত হয়ে যান?'],
                        'answer' => ['en' => 'No. A preliminary meeting is for information and advisory assessment. Formal representation begins upon execution of a Vakalatnama and mutual agreement on scope.', 'bn' => 'না। প্রাথমিক আলোচনা কেবল আইনি পর্যালোচনার জন্য। আনুষ্ঠানিক ওকালতনামা সম্পাদনের মাধ্যমেই কেবল মামলা পরিচালনার আইনি সম্পর্ক স্থাপিত হয়।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'General Legal Practice & Advisory | Advocate Nijam Uddin (Haq)', 'bn' => 'সাধারণ আইন পরামর্শ ও আইনি পর্যালোচনা | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Preliminary legal consultations, document scrutiny, legal notices, and procedural direction across Bangladesh courts by Advocate Nijam Uddin (Haq).', 'bn' => 'প্রাথমিক আইনি পরামর্শ, দলিল পরীক্ষা, লিগ্যাল নোটিশ ও আইনি দিকনির্দেশনায় অ্যাডভোকেট নিজাম উদ্দিন (হক)-এর সহায়তা।'],
                ],
            ],

            // 10. Environmental Law
            [
                'slug' => 'environmental-law',
                'title' => ['en' => 'Environmental Law', 'bn' => 'পরিবেশ আইন'],
                'short_description' => [
                    'en' => 'Environmental regulatory compliance, Environmental Clearance Certificates (ECC), industrial effluent standards, and public interest environmental litigation.',
                    'bn' => 'পরিবেশ সংরক্ষণ আইন ও বিধিমালা, পরিবেশ ছাড়পত্র (ECC), বর্জ্য ব্যবস্থাপনা কমপ্লায়েন্স এবং পরিবেশ আদালতে আইনি প্রতিনিধিত্ব।',
                ],
                'tagline' => ['en' => 'Environmental rule of law, industrial compliance, and ecological justice', 'bn' => 'পরিবেশ সংরক্ষণ, শিল্প কমপ্লায়েন্স ও পরিবেশগত অধিকার সুরক্ষা'],
                'full_description' => [
                    'en' => "<p>Environmental law in Bangladesh, governed primarily by the Bangladesh Environment Conservation Act, 1995 (BECA) and the Environment Court Act, 2010, regulates environmental pollution, industrial clearances, ecological conservation, and liability for ecological damage.</p><p>We provide legal counsel on environmental compliance for industrial establishments, securing and renewing Environmental Clearance Certificates (ECC), Environmental Impact Assessment (EIA) obligations, and addressing Department of Environment (DoE) enforcement notices.</p><p>We also represent stakeholders and public interest petitioners before specialized Environment Courts and the High Court Division in matters concerning illegal encroachment on water bodies, unauthorized industrial emissions, and constitutional environmental rights under Article 18A of the Constitution.</p>",
                    'bn' => "<p>বাংলাদেশে পরিবেশ সংরক্ষণ আইন, ১৯৯৫ এবং পরিবেশ আদালত আইন, ২০১০ অনুযায়ী শিল্প বর্জ্য নিয়ন্ত্রণ, পরিবেশ ছাড়পত্র, জলাশয় ও প্রতিবেশ সুরক্ষা এবং পরিবেশগত ক্ষতিপূরণ নিয়ন্ত্রিত হয়। সংবিধানের ১৮এ অনুচ্ছেদ অনুযায়ী পরিবেশ সংরক্ষণ রাষ্ট্রের মৌলিক দায়িত্ব।</p><p>আমরা শিল্প ও বাণিজ্যিক প্রতিষ্ঠানসমূহকে পরিবেশ অধিদপ্তরের (DoE) পরিবেশ ছাড়পত্র (ECC) গ্রহণ ও নবায়ন, পরিবেশগত প্রভাব সমীক্ষা (EIA) এবং পরিবেশগত নোটিশের আইনি জবাবে পরামর্শ প্রদান করি।</p><p>এছাড়াও বিশেষায়িত পরিবেশ আদালত এবং সুপ্রিম কোর্টের হাইকোর্ট বিভাগে অবৈধ দখল, দূষণ প্রতিরোধ এবং পরিবেশগত অধিকার সুরক্ষায় আইনগত প্রতিনিধিত্ব নিশ্চিত করা হয়।</p>",
                ],
                'icon_name' => 'globe',
                'sort_order' => 10,
                'status' => 'published',
                'is_featured' => false,
                'at_a_glance' => [
                    'area' => ['en' => 'Environmental Law & Regulatory Compliance', 'bn' => 'পরিবেশ আইন ও কমপ্লায়েন্স'],
                    'who_it_may_help' => ['en' => 'Industrial enterprises, factory owners, developers, affected communities', 'bn' => 'শিল্প প্রতিষ্ঠান, কারখানা মালিক, ডেভেলপার ও ক্ষতিগ্রস্ত জনসাধারণ'],
                    'related_matters' => ['en' => 'ECC clearance, DoE notices, Environment Courts, river encroachment writs', 'bn' => 'পরিবেশ ছাড়পত্র, অধিদপ্তরের নোটিশ, পরিবেশ আদালত, নদী রক্ষা রিট'],
                    'jurisdiction' => ['en' => 'Environment Courts, Environment Appellate Court & Supreme Court', 'bn' => 'পরিবেশ আদালত, পরিবেশ আপিল আদালত ও সুপ্রিম কোর্ট'],
                    'depends_on' => ['en' => 'Industrial category, EIA reports, DoE regulations, environmental damage evidence', 'bn' => 'শিল্পের শ্রেণিবিভাগ, ইআইএ প্রতিবেদন, পরিবেশ অধিদপ্তরের বিধি ও প্রমাণের ভিত্তি'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Environmental Clearances (ECC)', 'bn' => 'পরিবেশ ছাড়পত্র (ECC)'], 'description' => ['en' => 'Legal advice on statutory clearances under the Environment Conservation Rules.', 'bn' => 'পরিবেশ সংরক্ষণ বিধিমালার আওতায় পরিবেশ ছাড়পত্র প্রাপ্তি ও নবায়নে আইনি পরামর্শ।'], 'icon' => 'file-text'],
                    ['title' => ['en' => 'DoE Notices & Hearing Representation', 'bn' => 'পরিবেশ অধিদপ্তরের নোটিশ ও শুনানি'], 'description' => ['en' => 'Legal defense before Department of Environment enforcement hearings.', 'bn' => 'পরিবেশ অধিদপ্তর কর্তৃক প্রদত্ত ক্ষতিপূরণ বা এনফোর্সমেন্ট নোটিশের আইনগত জবাব ও শুনানি।'], 'icon' => 'shield'],
                    ['title' => ['en' => 'Environment Court Litigation', 'bn' => 'পরিবেশ আদালতে মামলা পরিচালনা'], 'description' => ['en' => 'Advocacy before Environment Courts established under the 2010 Act.', 'bn' => '২০১০ সালের আইনের অধীনে প্রতিষ্ঠিত পরিবেশ আদালতে মামলা পরিচালনা ও প্রতিরক্ষা।'], 'icon' => 'landmark'],
                    ['title' => ['en' => 'Waterbody & Wetland Protection', 'bn' => 'জলাশয় ও নদী সুরক্ষা রিট'], 'description' => ['en' => 'Writ petitions before the High Court against unlawful river grabbing and pollution.', 'bn' => 'নদী ও জলাশয় ভরাট বা দূষণের বিরুদ্ধে হাইকোর্ট বিভাগে রিট আবেদন।'], 'icon' => 'globe'],
                    ['title' => ['en' => 'Industrial Effluent & ETP Compliance', 'bn' => 'বর্জ্য শোধনাগার (ETP) কমপ্লায়েন্স'], 'description' => ['en' => 'Statutory legal audit on effluent standards and operational liabilities.', 'bn' => 'কারখানার বর্জ্য শোধনাগার ও সরকারি মানদণ্ড অনুসরণে আইনি মূল্যায়ন।'], 'icon' => 'briefcase'],
                    ['title' => ['en' => 'Appeals before Environment Appellate Court', 'bn' => 'পরিবেশ আপিল আদালতে আপিল'], 'description' => ['en' => 'Statutory appeals challenging penalties imposed by Environment Courts.', 'bn' => 'পরিবেশ আদালতের আদেশের বিরুদ্ধে পরিবেশ আপিল আদালতে আপিল দায়ের।'], 'icon' => 'scale'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'What is the procedure if the Department of Environment serves a notice of compensation/penalty?', 'bn' => 'পরিবেশ অধিদপ্তর জরিমানা বা ক্ষতিপূরণের নোটিশ দিলে আইনগত প্রক্রিয়া কী?']],
                    ['question' => ['en' => 'Which industries require a mandatory Environmental Impact Assessment (EIA)?', 'bn' => 'কোন কোন শিল্পে ইআইএ (EIA) প্রতিবেদন বাধ্যতামূলক?']],
                    ['question' => ['en' => 'What are the jurisdiction and powers of the Environment Court under the 2010 Act?', 'bn' => 'পরিবেশ আদালত আইন ২০১০-এর অধীন পরিবেশ আদালতের ক্ষমতা ও এখতিয়ার কী?']],
                    ['question' => ['en' => 'Can an individual file a case directly in the Environment Court?', 'bn' => 'সাধারণ নাগরিক কি সরাসরি পরিবেশ আদালতে মামলা দায়ের করতে পারেন?']],
                    ['question' => ['en' => 'How can community residents stop unauthorized industrial emissions or water pollution?', 'bn' => 'কারখানার বর্জ্য বা ধোঁয়ার দূষণ বন্ধে স্থানীয় বাসিন্দারা কীভাবে আইনি পদক্ষেপ নেবেন?']],
                    ['question' => ['en' => 'What constitutional protections exist in Bangladesh for environmental rights?', 'bn' => 'পরিবেশ সুরক্ষায় বাংলাদেশের সংবিধানে কী কী বিধান রয়েছে?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Regulatory & Site Review', 'bn' => 'নিয়ন্ত্রক ও পরিবেশগত পরীক্ষা'],
                        'description' => ['en' => 'Evaluate project category (Green, Orange, Red) and statutory requirements.', 'bn' => 'শিল্পের পরিবেশগত শ্রেণিবিভাগ ও বিধিবদ্ধ শর্তাবলি যাচাই।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'DoE Clearance / Notice Audit', 'bn' => 'ছাড়পত্র বা নোটিশ পর্যালোচনা'],
                        'description' => ['en' => 'Scrutinize conditions in ECC or allegations in DoE enforcement notice.', 'bn' => 'পরিবেশ ছাড়পত্রের শর্ত বা অধিদপ্তরের নোটিশের অভিযোগের ভিত্তি বিশ্লেষণ।'],
                        'icon' => 'book-open',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Statutory Representation', 'bn' => 'আইনি জবাব ও শুনানি'],
                        'description' => ['en' => 'Draft comprehensive response and represent before DoE hearing officers.', 'bn' => 'আইনগত জবাব দাখিল এবং পরিবেশ অধিদপ্তরের শুনানিতে অংশ গ্রহণ।'],
                        'icon' => 'shield',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Environment Court Proceedings', 'bn' => 'পরিবেশ আদালতে কার্যক্রম'],
                        'description' => ['en' => 'Defend or initiate formal proceedings in Environment Courts where applicable.', 'bn' => 'বিশেষায়িত পরিবেশ আদালতে মামলা দায়ের বা আত্মপক্ষ সমর্থন।'],
                        'icon' => 'scale',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Appellate & High Court Remedies', 'bn' => 'আপিল ও হাইকোর্টে প্রতিকার'],
                        'description' => ['en' => 'Pursue appeals in Environment Appellate Court or writ petitions in High Court.', 'bn' => 'পরিবেশ আপিল আদালতে আপিল বা হাইকোর্টে রিট পিটিশন পরিচালনা।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Copy of Environmental Clearance Certificate (ECC) / Location Clearance', 'bn' => 'পরিবেশ ছাড়পত্র (ECC) বা অবস্থানগত ছাড়পত্রের অনুলিপি']],
                    ['item' => ['en' => 'Environmental Impact Assessment (EIA) or EMP report (if applicable)', 'bn' => 'ইআইএ বা পরিবেশ ব্যবস্থাপনা পরিকল্পনা (EMP) প্রতিবেদন']],
                    ['item' => ['en' => 'Show cause notice, inspection report, or fine memo issued by DoE', 'bn' => 'পরিবেশ অধিদপ্তরের কারণ দর্শানোর নোটিশ বা পরিদর্শনের প্রতিবেদন']],
                    ['item' => ['en' => 'Factory trade license, layout plan, and proof of ETP installation', 'bn' => 'ট্রেড লাইসেন্স, কারখানার নকশা এবং ইটিপি (ETP) স্থাপনের প্রমাণ']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'What is the Bangladesh Environment Conservation Act, 1995?', 'bn' => 'বাংলাদেশ পরিবেশ সংরক্ষণ আইন ১৯৯৫ কী?'],
                        'answer' => ['en' => 'It is the primary umbrella legislation providing standards for environmental protection, pollution abatement, establishment of industrial standards, and penalizing violations.', 'bn' => 'এটি বাংলাদেশের মূল পরিবেশ আইন যা দূষণ প্রতিরোধ, শিল্পের পরিবেশগত মানদণ্ড নির্ধারণ এবং আইন ভঙ্গের শাস্তি নিশ্চিত করে।'],
                    ],
                    [
                        'question' => ['en' => 'Can a citizen file a case directly before an Environment Court?', 'bn' => 'নাগরিক কি সরাসরি পরিবেশ আদালতে মামলা করতে পারেন?'],
                        'answer' => ['en' => 'Under Section 7 of the Environment Court Act, 2010, complaints must first be lodged with the Department of Environment. If the DoE fails to take action within 60 days, an aggrieved citizen can petition the Environment Court directly.', 'bn' => '২০১০ সালের আইনের ৭ ধারা অনুসারে প্রথমে পরিবেশ অধিদপ্তরে অভিযোগ দিতে হয়। অধিদপ্তর ৬০ দিনের মধ্যে ব্যবস্থা না নিলে সংক্ষুব্ধ নাগরিক সরাসরি পরিবেশ আদালতে মামলা করতে পারেন।'],
                    ],
                    [
                        'question' => ['en' => 'What is the role of Article 18A of the Constitution of Bangladesh?', 'bn' => 'সংবিধানের ১৮এ অনুচ্ছেদের তাৎপর্য কী?'],
                        'answer' => ['en' => 'Article 18A obligates the State to protect and improve the environment and preserve natural resources, biodiversity, wetlands, and wildlife for present and future citizens.', 'bn' => '১৮এ অনুচ্ছেদ অনুযায়ী বর্তমান ও ভবিষ্যৎ নাগরিকদের কল্যাণে পরিবেশ সংরক্ষণ, নদী, বন ও বন্যপ্রাণী সুরক্ষা করা রাষ্ট্রের সাংবিধানিক দায়িত্ব।'],
                    ],
                    [
                        'question' => ['en' => 'What consequences occur if a factory operates without an ECC?', 'bn' => 'ছাড়পত্র (ECC) ছাড়া কারখানা পরিচালনা করলে কী আইনি পরিণতি হতে পারে?'],
                        'answer' => ['en' => 'Operating without a valid ECC is an offence punishable with fines, closure directions, disconnection of utility lines, and compensation claims for environmental damage.', 'bn' => 'বৈধ ছাড়পত্র ছাড়া প্রতিষ্ঠান চালালে জরিমানা, বিদ্যুৎ-গ্যাস সংযোগ বিচ্ছিন্ন এবং কারখানা বন্ধের আদেশ হতে পারে।'],
                    ],
                    [
                        'question' => ['en' => 'What is the Environment Appellate Court?', 'bn' => 'পরিবেশ আপিল আদালত কী?'],
                        'answer' => ['en' => 'The Environment Appellate Court hears statutory appeals against judgments, decrees, and orders passed by subordinate Environment Courts in Bangladesh.', 'bn' => 'পরিবেশ আদালতের দেওয়া রায়, ডিক্রি বা আদেশের বিরুদ্ধে বিধিবদ্ধ আপিল শুনানির জন্য পরিবেশ আপিল আদালত গঠিত।'],
                    ],
                    [
                        'question' => ['en' => 'Does the chamber promise relationships with Department of Environment regulators?', 'bn' => 'চেম্বার কি পরিবেশ অধিদপ্তরের সাথে কোনো সম্পর্কের আশ্বাস দেয়?'],
                        'answer' => ['en' => 'No. We provide purely legal, statutory advice based on facts, evidence, and applicable environment legislation without claiming informal regulator relationships.', 'bn' => 'না। আমরা বিধিবদ্ধ আইন, প্রমাণ এবং নথিপত্রের ভিত্তিতে সম্পূর্ণ পেশাদার আইনি সেবা প্রদান করি। কোনো অনৈতিক মধ্যস্থতা সমর্থন করা হয় না।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'Environmental Law & Regulatory Compliance | Advocate Nijam Uddin (Haq)', 'bn' => 'পরিবেশ আইন ও কমপ্লায়েন্স সহায়তা | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Environmental compliance, Environment Court litigation, ECC clearances, and wetland protection by Advocate Nijam Uddin (Haq).', 'bn' => 'পরিবেশ আদালত, পরিবেশ ছাড়পত্র (ECC), দূষণ প্রতিরোধ ও সুপ্রিম কোর্ট পরিবেশ রিটে আইনি পরামর্শ।'],
                ],
            ],

            // 11. Dispute Resolution
            [
                'slug' => 'dispute-resolution',
                'title' => ['en' => 'Dispute Resolution', 'bn' => 'বিরোধ নিষ্পত্তি'],
                'short_description' => [
                    'en' => 'Structured dispute management, negotiation, statutory mediation under the Code of Civil Procedure, and settlement agreement drafting.',
                    'bn' => 'বিরোধের সুষ্ঠু ব্যবস্থাপনা, কার্যকর সমঝোতা আলোচনা, দেওয়ানি কার্যবিধির অধীন মধ্যস্থতা এবং আপসনামা সম্পাদন।',
                ],
                'tagline' => ['en' => 'Cost-effective, principled, and durable conflict resolution', 'bn' => 'ব্যয়সাশ্রয়ী, ন্যায়ভিত্তিক ও টেকসই বিরোধ নিষ্পত্তি'],
                'full_description' => [
                    'en' => "<p>Dispute resolution encompasses the comprehensive spectrum of conflict management methodologies available in Bangladesh, including direct negotiations, conciliation, statutory mediation, and formal court adjudication. Effective legal counsel assesses whether contentious matters can be resolved through principled settlement before embarking on prolonged court litigation.</p><p>We advise corporate entities, business partners, and private litigants on statutory mediation under Sections 89A, 89B, and 89C of the Code of Civil Procedure (CPC), confidential mediation sessions, and negotiation structuring.</p><p>Where an amicable resolution is achieved, we prepare legally binding settlement deeds and compromise decrees (Solehnama) that conclusively terminate litigation and prevent future disputes.</p>",
                    'bn' => "<p>বিরোধ নিষ্পত্তি ব্যবস্থা পক্ষগণের মতানৈক্য নিরসনে বিভিন্ন কৌশল ও পদ্ধতি পরিচালনা করে, যার মধ্যে সরাসরি আপস আলোচনা, মধ্যস্থতা (Mediation), সালিশ এবং বিচারিক প্রতিকার অন্তর্ভুক্ত। বিচক্ষণ আইনি কৌশল দীর্ঘ মোকদ্দমায় জড়ানোর পূর্বেই ন্যায়সংগত সমঝোতার সুযোগ উন্মোচন করে।</p><p>আমরা দেওয়ানি কার্যবিধির ৮৯এ, ৮৯বি ও ৮৯সি ধারার অধীনে আদালত পরিচালিত মধ্যস্থতা, ব্যবসায়িক দ্বন্দ্ব নিরসন এবং সমঝোতা আলোচনায় মক্কেলদের আইনি পরামর্শ ও সহায়তা প্রদান করি।</p><p>পারস্পরিক সমঝোতা অর্জিত হলে তা কার্যকর করার জন্য বাধ্যতামূলক আপস দলিল ও আদালতের মাধ্যমে সোলেহ ডিক্রি (Solehnama) প্রস্তুত করা হয়, যাতে বিরোধটি চিরতরে নিষ্পত্তি হয়।</p>",
                ],
                'icon_name' => 'award',
                'sort_order' => 11,
                'status' => 'published',
                'is_featured' => false,
                'at_a_glance' => [
                    'area' => ['en' => 'Alternative Dispute Resolution (ADR) & Mediation', 'bn' => 'বিকল্প বিরোধ নিষ্পত্তি ও মধ্যস্থতা'],
                    'who_it_may_help' => ['en' => 'Business entities, partners, family co-sharers, contractual parties', 'bn' => 'ব্যবসা প্রতিষ্ঠান, অংশীদার, পারিবারিক উত্তরাধিকারী ও চুক্তিভুক্ত পক্ষ'],
                    'related_matters' => ['en' => 'CPC 89A mediation, compromise decrees, settlement terms, negotiation', 'bn' => 'দেওয়ানি কার্যবিধির ৮৯এ মধ্যস্থতা, সোলেহ ডিক্রি, আপসনামা, আলোচনা'],
                    'jurisdiction' => ['en' => 'Civil Courts, Mediation Centers & Private Settlement Sessions', 'bn' => 'দেওয়ানি আদালত, মধ্যস্থতা কেন্দ্র ও ব্যক্তিগত সালিশ সভা'],
                    'depends_on' => ['en' => 'Willingness of parties, balance of rights, enforceable settlement terms', 'bn' => 'উভয় পক্ষের সদিচ্ছা, আইনগত স্বার্থের ভারসাম্য ও আপসের শর্তাবলি'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Statutory Court Mediation (CPC 89A)', 'bn' => 'আদালতের মধ্যস্থতা (৮৯এ ধারা)'], 'description' => ['en' => 'Representation in formal court-referred mediation under the CPC.', 'bn' => 'দেওয়ানি কার্যবিধির ৮৯এ ধারার অধীন আদালতের মধ্যস্থতা শুনানিতে অংশ গ্রহণ।'], 'icon' => 'scale'],
                    ['title' => ['en' => 'Commercial Settlement Negotiation', 'bn' => 'বাণিজ্যিক আপস আলোচনা'], 'description' => ['en' => 'Strategic negotiation representing clients in contractual deadlocks.', 'bn' => 'বাণিজ্যিক মতানৈক্যে মক্কেলের স্বার্থ রক্ষা করে কার্যকর সমঝোতা পরিচালনা।'], 'icon' => 'briefcase'],
                    ['title' => ['en' => 'Compromise Decrees (Solehnama)', 'bn' => 'আপসনামা ও সোলেহ ডিক্রি'], 'description' => ['en' => 'Drafting legally binding compromise petitions for judicial disposal.', 'bn' => 'মামলার আনুষ্ঠানিক নিষ্পত্তির জন্য বাধ্যতামূলক আপসনামা (Solehnama) প্রণয়ন।'], 'icon' => 'scroll'],
                    ['title' => ['en' => 'Family & Property Conciliation', 'bn' => 'পারিবারিক ও সম্পত্তি আপস'], 'description' => ['en' => 'Amicable division of joint properties and domestic dispute settlement.', 'bn' => 'যৌথ সম্পত্তি শান্তিপূর্ণ বণ্টন ও পারিবারিক মতবিরোধ নিষ্পত্তিতে আইনি কাঠামো তৈরি।'], 'icon' => 'users'],
                    ['title' => ['en' => 'Pre-Litigation Risk Audit', 'bn' => 'মামলাপূর্ব ঝুঁকি ও ব্যয় নিরূপণ'], 'description' => ['en' => 'Cost-benefit analysis of litigation versus settlement options.', 'bn' => 'মোকদ্দমায় যাওয়ার সম্ভাব্য ব্যয় ও সময়ের বিপরীতে আপসের যৌক্তিকতা বিশ্লেষণ।'], 'icon' => 'file-text'],
                    ['title' => ['en' => 'Enforcement of Settlement Terms', 'bn' => 'আপসের শর্ত বাস্তবায়ন'], 'description' => ['en' => 'Ensuring settlement covenants are strictly executed and legally binding.', 'bn' => 'সমঝোতা চুক্তি যাতে ভবিষ্যতের জন্য অলঙ্ঘনীয় হয় তা নিশ্চিতকরণ।'], 'icon' => 'landmark'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'How does statutory mediation under Section 89A of the CPC function?', 'bn' => 'দেওয়ানি কার্যবিধির ৮৯এ ধারায় মধ্যস্থতা কীভাবে পরিচালিত হয়?']],
                    ['question' => ['en' => 'Is a mediated settlement legally enforceable in Bangladesh?', 'bn' => 'মধ্যস্থতায় সম্পাদিত আপস কি আইনত বাধ্যতামূলক ও কার্যকর?']],
                    ['question' => ['en' => 'Does entering mediation weaken a client’s legal position if settlement fails?', 'bn' => 'মধ্যস্থতা ব্যর্থ হলে কি পরবর্তীতে মামলায় কোনো ক্ষতি হয়?']],
                    ['question' => ['en' => 'Can court fees be refunded if a civil suit is settled through mediation?', 'bn' => 'মধ্যস্থতার মাধ্যমে মামলা নিষ্পত্তি হলে কি কোর্ট ফি ফেরত পাওয়া যায়?']],
                    ['question' => ['en' => 'What is the role of an advocate during a confidential mediation session?', 'bn' => 'গোপনীয় মধ্যস্থতা অধিবেশনে আইনজীবীর মূল দায়িত্ব কী?']],
                    ['question' => ['en' => 'How does ADR help preserve long-term business or family relationships?', 'bn' => 'বিকল্প বিরোধ নিষ্পত্তি কীভাবে দীর্ঘমেয়াদি সম্পর্ক রক্ষায় সহায়তা করে?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Dispute Assessment', 'bn' => 'বিরোধের সামগ্রিক মূল্যায়ন'],
                        'description' => ['en' => 'Examine core legal rights, weaknesses, and potential settlement boundaries.', 'bn' => 'আইনগত অধিকার ও আপসের সম্ভাব্য সীমা চিহ্নিতকরণ।'],
                        'icon' => 'book-open',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Mediation / Settlement Proposal', 'bn' => 'সমঝোতা প্রস্তাব উপস্থাপন'],
                        'description' => ['en' => 'Formulate realistic settlement framework and convey to counterparty.', 'bn' => 'বাস্তবসম্মত আপসের প্রস্তাবনা প্রণয়ন ও অপর পক্ষের কাছে উপস্থাপন।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Structured Settlement Session', 'bn' => 'গঠনমূলক আপস অধিবেশন'],
                        'description' => ['en' => 'Participate in court mediation or facilitated confidential negotiation.', 'bn' => 'আদালতের মধ্যস্থতাকারীর সামনে বা সরাসরি আলোচনায় অংশগ্রহণ।'],
                        'icon' => 'users',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Solehnama Deed Formulation', 'bn' => 'সোলেহনামা বা আপস দলিল প্রস্তুত'],
                        'description' => ['en' => 'Draft comprehensive settlement deed containing irrevocable covenants.', 'bn' => 'আইনানুগ আপসনামার খসড়া প্রণয়ন ও উভয় পক্ষের স্বাক্ষর গ্রহণ।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Compromise Order by Court', 'bn' => 'আদালত কর্তৃক সোলেহ ডিক্রি'],
                        'description' => ['en' => 'Submit compromise petition in court and obtain final binding decree.', 'bn' => 'বিজ্ঞ আদালতে আরজি দাখিল করে চূড়ান্ত সোলেহ ডিক্রি গ্রহণ।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Summary of facts, disputed contracts, and previous legal notices', 'bn' => 'বিরোধের বিবরণ, চুক্তি ও পূর্বে প্রেরিত আইনি নোটিশসমূহ']],
                    ['item' => ['en' => 'Current court case number and stage (if already instituted in court)', 'bn' => 'মামলা চলমান থাকলে তার নম্বর ও বর্তমান বিচারিক পর্যায়']],
                    ['item' => ['en' => 'Documentation proving disputed title, payment receipts, or liabilities', 'bn' => 'বিরোধীয় অর্থ, পাওনা বা সম্পত্তির মালিকানার প্রমাণাদি']],
                    ['item' => ['en' => 'Written authorization or Power of Attorney to negotiate settlement', 'bn' => 'সমঝোতা ও স্বাক্ষরের জন্য বৈধ ক্ষমতাপত্র']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'What is mediation under the Code of Civil Procedure in Bangladesh?', 'bn' => 'বাংলাদেশে দেওয়ানি কার্যবিধিতে মধ্যস্থতা (Mediation) কী?'],
                        'answer' => ['en' => 'Sections 89A and 89C of the CPC mandate civil courts to refer civil suits to mediation after written statements are filed, allowing parties to settle amicably.', 'bn' => 'দেওয়ানি কার্যবিধির ৮৯এ ধারা অনুযায়ী জবাব দাখিলের পর আদালত বিরোধটি আপস নিষ্পত্তির জন্য মধ্যস্থতায় পাঠানোর বিধান রেখেছেন।'],
                    ],
                    [
                        'question' => ['en' => 'Are discussions during mediation confidential?', 'bn' => 'মধ্যস্থতা আলোচনার কথাবার্তা কি আদালতে গোপন থাকে?'],
                        'answer' => ['en' => 'Yes. By statutory mandate, statements, offers, and concessions made during mediation are strictly confidential and cannot be used as evidence if mediation fails.', 'bn' => 'হ্যাঁ। মধ্যস্থতায় ব্যক্ত কোনো বক্তব্য বা ছাড় পরবর্তীতে আদালতে সাক্ষ্য হিসেবে ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।'],
                    ],
                    [
                        'question' => ['en' => 'Can a party appeal against a compromise decree (Solehnama)?', 'bn' => 'সোলেহ ডিক্রির বিরুদ্ধে কি কোনো আপিল চলে?'],
                        'answer' => ['en' => 'Under Section 96(3) of the CPC, no appeal lies from a decree passed by the court with the consent of parties, making a compromise decree final and conclusive.', 'bn' => 'দেওয়ানি কার্যবিধির ৯৬(৩) ধারা মতে উভয় পক্ষের সম্মতিতে প্রদত্ত সোলেহ ডিক্রির বিরুদ্ধে কোনো আপিল চলে না; এটি চূড়ান্ত।'],
                    ],
                    [
                        'question' => ['en' => 'What if the opposite party refuses to participate in good faith?', 'bn' => 'অপর পক্ষ যদি সৎ বিশ্বাসে আলোচনায় অংশ না নেয় তবে কী হয়?'],
                        'answer' => ['en' => 'Mediation is consensual. If an impasse occurs or a party acts in bad faith, the matter immediately returns to the trial court to proceed on regular merits.', 'bn' => 'মধ্যস্থতা ব্যর্থ হলে মামলাটি পুনরায় বিচারিক আদালতে ফেরত যায় এবং নিয়মিত নিয়মে বিচার অনুষ্ঠিত হয়।'],
                    ],
                    [
                        'question' => ['en' => 'Does dispute resolution mean conceding your rights?', 'bn' => 'বিরোধ নিষ্পত্তি মানে কি নিজের ন্যায্য অধিকার ছেড়ে দেওয়া?'],
                        'answer' => ['en' => 'No. Principled dispute resolution focuses on protecting critical commercial and personal interests while eliminating the immense time, expense, and uncertainty of multi-year litigation.', 'bn' => 'না। নিজের মূল অধিকার সুরক্ষিত রেখেই দীর্ঘদিনের মামলার মানসিক ও আর্থিক হয়রানি থেকে দ্রুত মুক্তি পাওয়া এর উদ্দেশ্য।'],
                    ],
                    [
                        'question' => ['en' => 'Is a refund of court fees permitted under Section 89A(11)?', 'bn' => '৮৯এ(১১) ধারা অনুসারে কোর্ট ফি কি ফেরত পাওয়া যায়?'],
                        'answer' => ['en' => 'Yes. If a suit is resolved through statutory mediation, the court orders a refund of the court fees paid by the plaintiff on the plaint.', 'bn' => 'হ্যাঁ। মধ্যস্থতায় মামলা নিষ্পত্তি হলে আরজিতে প্রদত্ত সরকারি কোর্ট ফি ফেরত দেওয়ার আদেশ দেন আদালত।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'Dispute Resolution & Statutory Mediation | Advocate Nijam Uddin (Haq)', 'bn' => 'বিরোধ নিষ্পত্তি ও মধ্যস্থতা সেবা | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Structured dispute resolution, Section 89A CPC court mediation, compromise decrees, and commercial settlements by Advocate Nijam Uddin (Haq).', 'bn' => 'দেওয়ানি কার্যবিধির ৮৯এ মধ্যস্থতা, সোলেহ ডিক্রি ও সমঝোতা আলোচনায় অ্যাডভোকেট নিজাম উদ্দিন (হক)-এর আইনি সহায়তা।'],
                ],
            ],

            // 12. Labor Law
            [
                'slug' => 'labor-law',
                'title' => ['en' => 'Labor Law', 'bn' => 'শ্রম আইন'],
                'short_description' => [
                    'en' => 'Employment contracts, workplace regulatory compliance under the Bangladesh Labour Act 2006, Labor Court advocacy, and termination disputes.',
                    'bn' => 'নিয়োগ চুক্তি, বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী কমপ্লায়েন্স, শ্রম আদালতে মামলা পরিচালনা এবং বেআইনি বরখাস্তের প্রতিকার।',
                ],
                'tagline' => ['en' => 'Workplace fairness, statutory compliance, and dignified industrial relations', 'bn' => 'কর্মস্থলের ন্যায়বিচার, সংবিধিবদ্ধ কমপ্লায়েন্স ও শিল্প সম্পর্ক'],
                'full_description' => [
                    'en' => "<p>Labor law in Bangladesh, regulated by the Bangladesh Labour Act, 2006 (BLA) and the Bangladesh Labour Rules, 2015, defines statutory standards for conditions of employment, workplace safety, disciplinary procedures, wages, maternity benefits, and termination of service.</p><p>We advise corporate employers, industrial factories, and executive employees on employment agreement structuring, drafting service rules, conducting lawful domestic disciplinary inquiries under Section 24, retrenchment and layoff procedures, and compliance with DIFE regulatory inspections.</p><p>We provide legal representation in cases before the specialized Labor Courts across Bangladesh and appellate advocacy before the Labor Appellate Tribunal in Dhaka and the High Court Division.</p>",
                    'bn' => "<p>বাংলাদেশে শ্রম আইন (বাংলাদেশ শ্রম আইন, ২০০৬ এবং শ্রম বিধিমালা, ২০১৫) শ্রমিক ও কর্মচারীদের কর্মপরিবেশ, মজুরি, চাকরির অবসান, শৃঙ্খলা ভঙ্গের তদন্ত এবং কর্মক্ষেত্রে নিরাপত্তা নিয়ন্ত্রণ করে।</p><p>আমরা শিল্প প্রতিষ্ঠান, কারখানা কর্তৃপক্ষ এবং চাকরিজীবীদের নিয়োগপত্র প্রণয়ন, সার্ভিস রুলস প্রস্তুত, ২৪ ধারা অনুযায়ী আইনসম্মত বিভাগীয় তদন্ত পরিচালনা এবং বেআইনি বরখাস্ত সংক্রান্ত বিরোধে আইনি পরামর্শ দিই।</p><p>বিজ্ঞ শ্রম আদালত, ঢাকায় অবস্থিত শ্রম আপিল ট্রাইব্যুনাল এবং সুপ্রিম কোর্টের হাইকোর্ট বিভাগে শ্রম বিরোধের মামলায় আমাদের দায়িত্বশীল প্রতিনিধিত্ব রয়েছে।</p>",
                ],
                'icon_name' => 'file-text',
                'sort_order' => 12,
                'status' => 'published',
                'is_featured' => false,
                'at_a_glance' => [
                    'area' => ['en' => 'Labor, Employment & Industrial Law', 'bn' => 'শ্রম, কর্মসংস্থান ও শিল্প আইন'],
                    'who_it_may_help' => ['en' => 'Industrial enterprises, corporate employers, HR managers, executive employees', 'bn' => 'শিল্প প্রতিষ্ঠান, নিয়োগকারী কর্তৃপক্ষ, মানবসম্পদ বিভাগ ও চাকরিজীবী'],
                    'related_matters' => ['en' => 'BLA compliance, termination benefits, disciplinary inquiries, Labor Courts', 'bn' => 'শ্রম আইন কমপ্লায়েন্স, চাকরি অবসান সুবিধা, বিভাগীয় তদন্ত, শ্রম আদালত'],
                    'jurisdiction' => ['en' => 'Labor Courts, Labor Appellate Tribunal & High Court Division', 'bn' => 'শ্রম আদালত, শ্রম আপিল ট্রাইব্যুনাল ও হাইকোর্ট বিভাগ'],
                    'depends_on' => ['en' => 'Service book, appointment letter, statutory procedures, notice compliance', 'bn' => 'নিয়োগপত্র, সার্ভিস বুক, তদন্তের নিয়ম ও বিধিবদ্ধ নোটিশ প্রতিপালন'],
                ],
                'areas_of_assistance' => [
                    ['title' => ['en' => 'Employment Contract Drafting', 'bn' => 'নিয়োগপত্র ও চুক্তি প্রণয়ন'], 'description' => ['en' => 'Drafting appointment letters and service rules compliant with the Labour Act.', 'bn' => 'শ্রম আইনের সাথে সংগতিপূর্ণ নিয়োগপত্র ও কর্মচারী প্রবিধানমালা প্রস্তুত।'], 'icon' => 'scroll'],
                    ['title' => ['en' => 'Disciplinary Inquiry Procedures', 'bn' => 'বিভাগীয় তদন্ত পরিচালনা'], 'description' => ['en' => 'Advising on lawful charge-sheeting and domestic inquiry under Section 24.', 'bn' => '২৪ ধারার নিয়ম অনুযায়ী ন্যায়ভিত্তিক চার্জশিট ও তদন্ত পরিচালনায় পরামর্শ।'], 'icon' => 'file-text'],
                    ['title' => ['en' => 'Unlawful Termination Disputes', 'bn' => 'বেআইনি বরখাস্তের প্রতিকার'], 'description' => ['en' => 'Representing clients in Labor Court suits against arbitrary dismissals.', 'bn' => 'বিধিবহির্ভূত চাকরিচ্যুতির বিরুদ্ধে শ্রম আদালতে মামলা পরিচালনা।'], 'icon' => 'shield'],
                    ['title' => ['en' => 'Statutory Termination Benefits', 'bn' => 'চাকরি অবসানজনিত পাওনা'], 'description' => ['en' => 'Computation and recovery of provident fund, gratuity, and notice pay.', 'bn' => 'গ্র্যাচুইটি, ভবিষ্যৎ তহবিল ও বিচ্ছেদকালীন বিধিবদ্ধ পাওনা আদায়।'], 'icon' => 'scale'],
                    ['title' => ['en' => 'Labor Court Representation', 'bn' => 'শ্রম আদালতে আইনি শুনানি'], 'description' => ['en' => 'Litigation before First, Second, and divisional Labor Courts in Bangladesh.', 'bn' => 'বিজ্ঞ শ্রম আদালতসমূহে আবেদন ও মামলায় পূর্ণাঙ্গ আইনি প্রতিনিধিত্ব।'], 'icon' => 'landmark'],
                    ['title' => ['en' => 'Labor Appellate Tribunal Appeals', 'bn' => 'শ্রম আপিল ট্রাইব্যুনালে আপিল'], 'description' => ['en' => 'Appellate hearings before the Labor Appellate Tribunal in Dhaka.', 'bn' => 'শ্রম আদালতের রায়ের বিরুদ্ধে শ্রম আপিল ট্রাইব্যুনালে আপিল শুনানি।'], 'icon' => 'briefcase'],
                ],
                'common_concerns' => [
                    ['question' => ['en' => 'What is the mandatory procedure for dismissing an employee under Section 24 of BLA?', 'bn' => 'শ্রম আইনের ২৪ ধারায় বরখাস্তের জন্য কী কী আনুষ্ঠানিক প্রক্রিয়া বাধ্যতামূলক?']],
                    ['question' => ['en' => 'What benefits is an employee entitled to upon termination without disciplinary cause?', 'bn' => 'কোনো কারণ দর্শানো ছাড়া চাকরি অবসান করা হলে কী কী পাওনা প্রদান করতে হয়?']],
                    ['question' => ['en' => 'How can an aggrieved worker or employee institute a case in the Labor Court?', 'bn' => 'কোনো শ্রমিক বা কর্মচারী কীভাবে শ্রম আদালতে মামলা করতে পারেন?']],
                    ['question' => ['en' => 'What is the period of limitation for filing a grievance under Section 33 of BLA?', 'bn' => 'শ্রম আইনের ৩৩ ধারায় নোটিশ ও মামলা দায়েরের তামাদির মেয়াদ কতদিন?']],
                    ['question' => ['en' => 'What statutory requirements must employers follow regarding maternity benefits?', 'bn' => 'মাতৃত্বকালীন ছুটির আর্থিক সুবিধা প্রদানে নিয়োগকর্তার আইনি বাধ্যবাধকতা কী?']],
                    ['question' => ['en' => 'Can a company dismiss an executive who does not meet the definition of a "worker"?', 'bn' => 'ব্যবস্থাপনা বা প্রশাসনিক কর্মকর্তার ক্ষেত্রে শ্রম আইনের প্রয়োগ কেমন হয়?']],
                ],
                'legal_process' => [
                    [
                        'step' => 1,
                        'title' => ['en' => 'Contract & Service Audit', 'bn' => 'নিয়োগপত্র ও চাকরি শর্ত পরীক্ষা'],
                        'description' => ['en' => 'Examine appointment letter, service book, and relevant wage slips.', 'bn' => 'নিয়োগপত্র, সার্ভিস বুক এবং বেতন সংক্রান্ত নথি পরীক্ষা।'],
                        'icon' => 'file-text',
                    ],
                    [
                        'step' => 2,
                        'title' => ['en' => 'Section 33 Grievance Notice', 'bn' => '৩৩ ধারায় লিখিত আপত্তি নোটিশ'],
                        'description' => ['en' => 'Serve statutory grievance notice on the employer within 30 days of grievance.', 'bn' => 'চাকরিচ্যুতি বা দাবি নিয়ে ৩০ দিনের মধ্যে নিয়োগকর্তার কাছে লিখিত আপত্তি।'],
                        'icon' => 'scroll',
                    ],
                    [
                        'step' => 3,
                        'title' => ['en' => 'Labor Court Case Filing', 'bn' => 'শ্রম আদালতে মামলা দায়ের'],
                        'description' => ['en' => 'Institute formal case before the competent Labor Court under Section 33(3).', 'bn' => '৩০ দিনের মধ্যে সমাধান না হলে শ্রম আদালতে বিধিবদ্ধ মামলা দায়ের।'],
                        'icon' => 'book-open',
                    ],
                    [
                        'step' => 4,
                        'title' => ['en' => 'Pleadings & Oral Evidence', 'bn' => 'জবাব ও সাক্ষ্য গ্রহণ'],
                        'description' => ['en' => 'Submit written statement, conduct cross-examinations, and present documents.', 'bn' => 'লিখিত জবাব দাখিল এবং শ্রম আদালতের সদস্যদের উপস্থিতিতে সাক্ষ্য গ্রহণ।'],
                        'icon' => 'scale',
                    ],
                    [
                        'step' => 5,
                        'title' => ['en' => 'Judgment & Labor Appellate Hearing', 'bn' => 'রায় ও আপিল ট্রাইব্যুনাল শুনানি'],
                        'description' => ['en' => 'Secure judgment or pursue appeal before the Labor Appellate Tribunal in Dhaka.', 'bn' => 'আদালতের রায় গ্রহণ এবং প্রয়োজনে শ্রম আপিল ট্রাইব্যুনালে আপিল।'],
                        'icon' => 'landmark',
                    ],
                ],
                'document_checklist' => [
                    ['item' => ['en' => 'Appointment letter, identity card, and employment contract', 'bn' => 'নিয়োগপত্র, পরিচয়পত্র ও চাকরির মূল চুক্তিপত্র']],
                    ['item' => ['en' => 'Service book or salary payslips verifying tenure and last drawn wage', 'bn' => 'সার্ভিস বুক বা বেতন বিবরণী']],
                    ['item' => ['en' => 'Notice of termination, dismissal order, or charge sheet and inquiry report', 'bn' => 'বরখাস্তের আদেশ, চার্জশিট বা তদন্ত প্রতিবেদন']],
                    ['item' => ['en' => 'Proof of Section 33 statutory grievance notice served on the employer', 'bn' => 'নিয়োগকর্তার কাছে ৩৩ ধারায় প্রেরিত অভিযোগ নোটিশের অনুলিপি ও প্রাপ্তিস্বীকার']],
                ],
                'faqs' => [
                    [
                        'question' => ['en' => 'What is the Bangladesh Labour Act, 2006?', 'bn' => 'বাংলাদেশ শ্রম আইন ২০০৬ কী?'],
                        'answer' => ['en' => 'The Bangladesh Labour Act, 2006 is the consolidated statute governing employment conditions, trade unions, dispute resolution, safety, and workplace welfare in Bangladesh.', 'bn' => '২০০৬ সালের শ্রম আইন হলো বাংলাদেশে শ্রমিক-মালিক সম্পর্ক, মজুরি, কর্মঘণ্টা, নিরাপত্তা ও বিরোধ নিষ্পত্তির প্রধান সংবিধিবদ্ধ আইন।'],
                    ],
                    [
                        'question' => ['en' => 'What is the statutory process for a domestic inquiry under Section 24?', 'bn' => '২৪ ধারার বিভাগীয় তদন্তে কী কী নিয়ম মানা আবশ্যক?'],
                        'answer' => ['en' => 'The employer must issue a clear charge sheet giving at least 7 days to explain, hold a fair domestic inquiry with witness rights, and issue a second show cause before imposing dismissal.', 'bn' => 'কমপক্ষে ৭ দিনের সময় দিয়ে অভিযোগপত্র দিতে হবে, নিরপেক্ষ তদন্ত কমিটি গঠন করে সাক্ষ্যের সুযোগ দিতে হবে এবং চূড়ান্ত আদেশের আগে দ্বিতীয় কারণ দর্শানোর সুযোগ দিতে হবে।'],
                    ],
                    [
                        'question' => ['en' => 'What is the difference between dismissal and discharge under the Labour Act?', 'bn' => 'বরখাস্ত (Dismissal) এবং কর্মচ্যুতি (Discharge)-এর মধ্যে পার্থক্য কী?'],
                        'answer' => ['en' => 'Dismissal is a disciplinary punishment for proved misconduct. Discharge is termination due to physical or mental incapacity, which entitles the employee to statutory compensation.', 'bn' => 'বরখাস্ত হলো অসদাচরণের শাস্তি। আর কর্মচ্যুতি হলো শারীরিক বা মানসিক অক্ষমতার কারণে চাকরি অবসান, যাতে বিধিবদ্ধ ক্ষতিপূরণ নিশ্চিত থাকে।'],
                    ],
                    [
                        'question' => ['en' => 'Can an employee appeal against a Labor Court decision?', 'bn' => 'শ্রম আদালতের রায়ের বিরুদ্ধে কি আপিল করা যায়?'],
                        'answer' => ['en' => 'Yes. Under Section 217 of the Labour Act, an aggrieved party can appeal to the Labor Appellate Tribunal in Dhaka within 60 days of the decision.', 'bn' => 'হ্যাঁ। ২১৭ ধারা অনুযায়ী আদেশের ৬০ দিনের মধ্যে ঢাকায় অবস্থিত শ্রম আপিল ট্রাইব্যুনালে আপিল দায়ের করা যায়।'],
                    ],
                    [
                        'question' => ['en' => 'Does the Labour Act protect executive or managerial staff?', 'bn' => 'ব্যবস্থাপনা বা প্রশাসনিক কর্মকর্তাদের ক্ষেত্রে শ্রম আইন কি প্রযোজ্য?'],
                        'answer' => ['en' => 'The protective provisions of the BLA apply primarily to persons qualifying as "workers" under Section 2(65). Non-worker managerial employees are governed primarily by the terms of their contract and general civil law.', 'bn' => 'শ্রম আইনের সুরক্ষা মূলত ২(৬৫) ধারায় সংজ্ঞায়িত "শ্রমিক"-দের জন্য। ব্যবস্থাপনা স্তরের নির্বাহীদের ক্ষেত্রে তাদের চুক্তি ও সাধারণ দেওয়ানি আইন প্রযোজ্য হয়।'],
                    ],
                    [
                        'question' => ['en' => 'Can a lawyer guarantee reinstatement in service?', 'bn' => 'আইনজীবী কি চাকরিতে পুনর্বহালের নিশ্চয়তা দিতে পারেন?'],
                        'answer' => ['en' => 'No lawyer can guarantee a judgment outcome. Reinstatement depends strictly on proving procedural illegality and evidence before the Labor Court.', 'bn' => 'না। কোনো আইনজীবী আদালতের সিদ্ধান্তের নিশ্চয়তা দিতে পারেন না। পুনর্বহাল আদালতের বিবেচনা এবং উপযুক্ত প্রমাণের ওপর নির্ভর করে।'],
                    ],
                ],
                'seo' => [
                    'meta_title' => ['en' => 'Labor Law & Employment Litigation | Advocate Nijam Uddin (Haq)', 'bn' => 'শ্রম আইন ও কর্মসংস্থান মোকাদ্দমা | অ্যাডভোকেট নিজাম উদ্দিন (হক)'],
                    'meta_description' => ['en' => 'Employment contract advisory, Labor Court advocacy, Section 24 inquiry procedures, and BLA compliance by Advocate Nijam Uddin (Haq).', 'bn' => 'বাংলাদেশ শ্রম আইন ২০০৬ কমপ্লায়েন্স, শ্রম আদালত মামলা পরিচালনা ও চাকরিচ্যুতির প্রতিকারে আইনি সহায়তা।'],
                ],
            ],
        ];

        foreach ($services as $serviceData) {
            $seoData = $serviceData['seo'] ?? null;
            unset($serviceData['seo']);

            $existing = PracticeArea::where('slug', $serviceData['slug'])->first();

            if ($existing) {
                // Update missing structured sections while preserving admin edits
                $updateData = [];
                foreach (['tagline', 'at_a_glance', 'areas_of_assistance', 'common_concerns', 'legal_process', 'document_checklist', 'faqs'] as $field) {
                    if (isset($serviceData[$field])) {
                        $updateData[$field] = $serviceData[$field];
                    }
                }
                if (!empty($updateData)) {
                    $existing->update($updateData);
                }
            } else {
                $service = PracticeArea::create($serviceData);

                if ($seoData) {
                    $service->seo()->create([
                        'seo_title' => $seoData['meta_title'],
                        'meta_description' => $seoData['meta_description'],
                        'canonical_url' => "/practice-areas/{$serviceData['slug']}",
                        'robots' => 'index, follow',
                    ]);
                }
            }
        }

        // Initialize Global CTA Setting in SiteSetting if not already configured
        $existingCta = SiteSetting::where('key', 'global_cta')->first();
        if (!$existingCta) {
            SiteSetting::create([
                'key' => 'global_cta',
                'group' => 'cta',
                'is_public' => true,
                'value' => [
                    'is_enabled' => true,
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
                        'bn' => 'পরামর্শ সম্মেলন বুক করুন',
                    ],
                    'primary_button_url' => '/about#contact',
                    'secondary_button_label' => [
                        'en' => 'Contact Chamber',
                        'bn' => 'চেম্বার যোগাযোগ',
                    ],
                    'secondary_button_url' => '/contact',
                ],
            ]);
        }
    }
}
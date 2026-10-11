<?php

namespace Database\Seeders;

use App\Models\Credential;
use App\Models\Education;
use App\Models\Profile;
use App\Models\SeoMeta;
use Illuminate\Database\Seeder;

class ProfileAndCredentialsSeeder extends Seeder
{
    /**
     * Run the database seeds for Profile and Credentials.
     */
    public function run(): void
    {
        // 1. Authoritative Profile Baseline (Strictly verified facts only)
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
                    'en' => 'Advocate Nijam Uddin (Haq) is an enrolled Advocate of the Supreme Court of Bangladesh, dedicated to constitutional law, criminal litigation, and legal research.',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক) বাংলাদেশ সুপ্রিম কোর্টের একজন তালিকাভুক্ত আইনজীবী, যিনি সংবিধান, ফৌজদারি মামলা এবং আইনগত গবেষণায় নিবেদিত।',
                ],
                'long_bio' => [
                    'en' => '<p>Advocate Nijam Uddin (Haq) is an enrolled legal practitioner before the Supreme Court of Bangladesh. With rigorous academic training culminating in an LL.B. (Honours) and LL.M. from the prestigious University of Chittagong, he brings deep analytical jurisprudence and meticulous ethical practice to legal advocacy.</p><p>His legal practice focuses on upholding constitutional fidelity, procedural justice, and scholarly review of judicial precedents. Certified and enrolled under the Bangladesh Bar Council, he is committed to providing authoritative legal counsel while contributing actively to legal education and jurisprudence.</p>',
                    'bn' => '<p>অ্যাডভোকেট নিজাম উদ্দিন (হক) বাংলাদেশ সুপ্রিম কোর্টের একজন তালিকাভুক্ত আইনজীবী। চট্টগ্রাম বিশ্ববিদ্যালয় থেকে এলএল.বি. (অনার্স) এবং এলএল.এম. ডিগ্রি অর্জনের মাধ্যমে তিনি গভীর বিশ্লেষণধর্মী আইনশাস্ত্র ও নীতিবান আইনি লড়াইয়ে নিজেকে প্রতিষ্ঠিত করেছেন।</p><p>তাঁর আইনি কার্যক্রম সাংবিধানিক বিশ্বস্ততা, কার্যপ্রণালীগত ন্যায়বিচার এবং বিচারিক নজিরের তাত্ত্বিক পর্যালোচনার ওপর প্রতিষ্ঠিত। বাংলাদেশ বার কাউন্সিলে সনদপ্রাপ্ত ও তালিকাভুক্ত হয়ে তিনি দায়িত্বশীল আইনি পরামর্শ প্রদানের পাশাপাশি দেশের আইন সাহিত্যের সমৃদ্ধিতে সক্রিয় অবদান রেখে চলেছেন।</p>',
                ],
                'status' => 'published',
                'profile_photo_id' => null,
                'court_robes_photo_id' => null,
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
                    'en' => 'Upholding the rule of law with ethical commitment, judicial integrity, and meticulous legal analysis.',
                    'bn' => 'নৈতিক দায়বদ্ধতা, বিচারিক সততা এবং নির্ভুল আইনি বিশ্লেষণের মাধ্যমে আইনের শাসন সমুন্নত রাখা।',
                ],
                'legal_approach' => [
                    'en' => 'Rigorous jurisprudence, constitutional fidelity, and principled advocacy.',
                    'bn' => 'যথাযথ আইনশাস্ত্র, সাংবিধানিক আনুগত্য এবং নীতিবান আইনি লড়াই।',
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
                    'en' => 'Profile & Legal Credentials | Advocate Nijam Uddin (Haq)',
                    'bn' => 'জীবনবৃত্তান্ত ও সনদ | অ্যাডভোকেট নিজাম উদ্দিন (হক)',
                ],
                'meta_description' => [
                    'en' => 'Authoritative profile, academic pedigree, and verified credentials of Advocate Nijam Uddin (Haq), Advocate, Supreme Court of Bangladesh.',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক), আইনজীবী, বাংলাদেশ সুপ্রিম কোর্টের পেশাগত জীবনবৃত্তান্ত ও অনুমোদিত সনদ।',
                ],
                'canonical_url' => 'http://localhost:8000/about',
                'robots' => 'index, follow',
                'schema_type' => 'Person',
                'structured_data' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'Person',
                    'name' => 'Nijam Uddin (Haq)',
                    'jobTitle' => 'Advocate, Supreme Court of Bangladesh',
                    'alumniOf' => 'University of Chittagong',
                ],
            ]
        );

        // 2. Authoritative Baseline Credentials
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
                    'en' => 'Enrolled and authorized to practice before the Supreme Court of Bangladesh.',
                    'bn' => 'বাংলাদেশ সুপ্রিম কোর্টে আইন পেশা পরিচালনার জন্য তালিকাভুক্ত ও ক্ষমতাপ্রাপ্ত।',
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
                    'en' => 'Certified and enrolled advocate governed by the statutory legal regulatory body.',
                    'bn' => 'সংবিধিবদ্ধ আইনি নিয়ন্ত্রক সংস্থা কর্তৃক প্রত্যয়িত ও তালিকাভুক্ত আইনজীবী।',
                ],
                'year' => null,
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
                    'en' => 'Postgraduate degree in advanced jurisprudence and legal theory.',
                    'bn' => 'উচ্চতর আইনশাস্ত্র ও আইন তত্ত্ব বিষয়ে স্নাতকোত্তর ডিগ্রি।',
                ],
                'year' => null,
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
                    'en' => 'Undergraduate degree in fundamental legal principles and court procedure.',
                    'bn' => 'মৌলিক আইনি নীতিমালা ও আদালতের কার্যপ্রণালী বিষয়ে স্নাতক ডিগ্রি।',
                ],
                'year' => null,
                'credential_id' => null,
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($credentials as $credData) {
            Credential::updateOrCreate(
                ['title->en' => $credData['title']['en']],
                $credData
            );
        }

        // 3. Authoritative Baseline Educations
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
                'year_completed' => null,
                'distinction' => null,
                'description' => [
                    'en' => 'Specialized postgraduate research and studies in law.',
                    'bn' => 'আইনশাস্ত্রে বিশেষায়িত স্নাতকোত্তর গবেষণা ও পাঠ্যক্রম।',
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
                'year_completed' => null,
                'distinction' => null,
                'description' => [
                    'en' => 'Comprehensive study of statutory frameworks and procedural jurisprudence.',
                    'bn' => 'আইনি কাঠামো ও কার্যপ্রণালীগত আইনশাস্ত্রের সামগ্রিক অধ্যায়ন।',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($educations as $eduData) {
            Education::updateOrCreate(
                ['degree->en' => $eduData['degree']['en']],
                $eduData
            );
        }

        // NOTE: Career Timelines and Professional Memberships are left unpopulated in seeders
        // until verified records are explicitly supplied by the Project Director or Admin.
    }
}

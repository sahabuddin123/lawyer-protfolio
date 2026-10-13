import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';
import { profileApi } from '@/api/profile';
import { practiceAreaApi } from '@/api/practiceAreas';
import { ProfileData, AboutHighlightItem } from '@/types/profile';
import { PracticeArea } from '@/types/practiceArea';
import { Localized } from '@/types';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Scale,
  Award,
  GraduationCap,
  Briefcase,
  Users,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Lock,
  Clock,
  Compass,
  Landmark,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';

interface FallbackPracticeCategory {
  id: string;
  title: { en: string; bn: string };
  scope: { en: string; bn: string };
  subjects: { en: string[]; bn: string[] };
  link: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AboutPage: React.FC = () => {
  const { locale } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portraitImageFailed, setPortraitImageFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, practiceRes] = await Promise.allSettled([
          profileApi.getProfile(),
          practiceAreaApi.getPracticeAreas({ per_page: 12 }),
        ]);

        if (!isMounted) return;

        if (profileRes.status === 'fulfilled' && profileRes.value.success) {
          setProfile(profileRes.value.data);
        } else if (profileRes.status === 'rejected') {
          setError(profileRes.reason instanceof Error ? profileRes.reason.message : 'Failed to load profile.');
        }

        if (practiceRes.status === 'fulfilled' && practiceRes.value.success) {
          setPracticeAreas(practiceRes.value.data || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  const resolveText = (field: Localized | string | undefined | null): string => {
    if (!field) return '';
    if (typeof field === 'object' && field !== null) {
      return field[locale] || field.en || '';
    }
    return String(field);
  };

  const getIconComponent = (name?: string, fallback: React.ComponentType<{ className?: string }> = Scale) => {
    switch (name) {
      case 'Scale':
      case 'scale':
        return Scale;
      case 'ShieldCheck':
      case 'shield-check':
      case 'shield':
        return ShieldCheck;
      case 'Compass':
      case 'compass':
        return Compass;
      case 'Clock':
      case 'clock':
        return Clock;
      case 'Lock':
      case 'lock':
        return Lock;
      case 'Award':
      case 'award':
        return Award;
      case 'GraduationCap':
      case 'graduation-cap':
        return GraduationCap;
      case 'Briefcase':
      case 'briefcase':
        return Briefcase;
      case 'Building2':
      case 'building':
      case 'building-2':
        return Building2;
      case 'Landmark':
      case 'landmark':
        return Landmark;
      case 'Users':
      case 'users':
        return Users;
      default:
        return fallback;
    }
  };

  // Fallback Practice Area Categories if database practice areas are not loaded
  const fallbackPracticeCategories: FallbackPracticeCategory[] = [
    {
      id: 'civil-litigation',
      title: {
        en: 'Civil Litigation & Dispute Resolution',
        bn: 'দেওয়ানি মোকদ্দমা ও বিরোধ নিষ্পত্তি',
      },
      scope: {
        en: 'Handling civil suits, declaration of title, partition suits, recovery of khas possession, money suits, decree executions, civil appeals, and revisions across competent courts.',
        bn: 'দেওয়ানি আদালতের এখতিয়ারাধীন স্বত্ব ঘোষণা, বাটোয়ারা মোকদ্দমা, খাস দখল উদ্ধার, অর্থ জারি মামলা, নিষেধাজ্ঞা এবং দেওয়ানি আপিল ও রিভিশন পরিচালনা।',
      },
      subjects: {
        en: ['Title Suits & Partition Suits', 'Money Suits & Decree Execution', 'Recovery of Khas Possession', 'Permanent Injunctions', 'Civil Appeals & Revisions'],
        bn: ['স্বত্ব ও বাটোয়ারা মোকদ্দমা', 'অর্থ স্যুট ও ডিক্রি জারি মামলা', 'খাস দখল উদ্ধার মোকদ্দমা', 'স্থায়ী নিষেধাজ্ঞা দরখাস্ত', 'দেওয়ানি আপিল ও রিভিশন'],
      },
      link: '/practice-areas/civil-law',
      icon: Scale,
    },
    {
      id: 'criminal-proceedings',
      title: {
        en: 'Criminal Law & Proceedings',
        bn: 'ফৌজদারি আইন ও কার্যপ্রণালী',
      },
      scope: {
        en: 'Conducting and defending proceedings under general penal statutes and special criminal laws across Magistrates\' Courts, Sessions Courts, and Special Tribunals.',
        bn: 'সাধারণ ও বিশেষ ফৌজদারি আইনের আওতায় ম্যাজিস্ট্রেট আদালত, দায়রা আদালত এবং বিশেষ ট্রাইব্যুনালে নালিশি ও পুলিশি মামলার আইনি শুনানি ও পরিচালনা।',
      },
      subjects: {
        en: ['Complaint Cases (C.R. Cases)', 'Police Report Cases (G.R. Cases)', 'Sessions Court Trials', 'Special Tribunals & Paribesh Adalat', 'Criminal Appeals & Revisions'],
        bn: ['নালিশি মামলা (সি.আর. মামলা)', 'পুলিশি মামলা (জি.আর. মামলা)', 'দায়রা জজ আদালতে বিচার', 'বিশেষ ট্রাইব্যুনাল ও পরিবেশ আদালত', 'ফৌজদারি আপিল ও রিভিশন'],
      },
      link: '/practice-areas/criminal-law',
      icon: ShieldCheck,
    },
    {
      id: 'land-property',
      title: {
        en: 'Land, Property & Tenancy',
        bn: 'ভূমি, স্থাবর সম্পত্তি ও প্রজা স্বত্ব আইন',
      },
      scope: {
        en: 'Real estate ownership searches, property title vetting, transfer deeds, mortgage documentation, lease agreements, and settlement of land tenancy disputes.',
        bn: 'জমির মালিকানা স্বত্ব অনুসন্ধান ও যাচাইকরণ (Vetting), হস্তান্তরিত দলিল প্রস্তুত, বন্ধকি দলিল, লিজ চুক্তি এবং জমি সংক্রান্ত বিরোধ নিষ্পত্তি।',
      },
      subjects: {
        en: ['Property Title Vetting & Search', 'Purchase, Gift & Mortgage Deeds', 'Power of Attorney Deeds', 'State Acquisition & Tenancy Law', 'Non-Agricultural Tenancy Act'],
        bn: ['জমির স্বত্ব যাচাই ও অনুসন্ধান', 'বিক্রয়, হেবা ও বন্ধকি দলিল', 'আমমোক্তারনামা দলিল প্রণয়ন', 'রাষ্ট্রীয় অধিগ্রহণ ও প্রজাস্বত্ব আইন', 'অকৃষি প্রজাস্বত্ব আইন'],
      },
      link: '/practice-areas/civil-law',
      icon: Landmark,
    },
    {
      id: 'corporate-contract',
      title: {
        en: 'Corporate, Commercial & Contract Law',
        bn: 'করপোরেট, বাণিজ্যিক ও চুক্তি আইন',
      },
      scope: {
        en: 'Company legal advisory, Memorandum and Articles of Association, partnership deeds, commercial supply contracts, service agreements, and corporate legal opinions.',
        bn: 'কোম্পানি বিষয়ক আইনি পরামর্শ, সংঘস্মারক ও সংঘবিধি প্রস্তুত, অংশীদারি চুক্তি, সরবরাহ ও সেবা চুক্তি এবং করপোরেট আইনি মতামত প্রদান।',
      },
      subjects: {
        en: ['Company Incorporation & Governance', 'Partnership Deeds & Joint Ventures', 'Commercial Supply & Service Contracts', 'Corporate Legal Opinions', 'Contract Drafting & Amendments'],
        bn: ['কোম্পানি গঠন ও বিধিবিধান', 'অংশীদারি ও যৌথ উদ্যোগ চুক্তি', 'বাণিজ্যিক সরবরাহ ও সেবা চুক্তি', 'করপোরেট আইনি মতামত', 'চুক্তি খসড়া ও সংশোধনী'],
      },
      link: '/practice-areas/corporate-commercial',
      icon: Briefcase,
    },
    {
      id: 'banking-finance',
      title: {
        en: 'Banking & Financial Matters',
        bn: 'ব্যাংকিং ও আর্থিক বিরোধ',
      },
      scope: {
        en: 'Drafting loan and security documents, security sharing agreements, default notices, Artha Rin Adalat Ain proceedings, and Section 138 Negotiable Instruments Act matters.',
        bn: 'ব্যাংক ও আর্থিক প্রতিষ্ঠানের ঋণ নিরাপত্তা দলিল, জামানত চুক্তি, খেলাপি নোটিশ, অর্থ ঋণ আদালত আইনের মোকদ্দমা এবং নেগোশিয়েবল ইনস্ট্রুমেন্টস অ্যাক্টের মামলা।',
      },
      subjects: {
        en: ['Artha Rin Adalat Ain 2003 Suits', 'NI Act (Section 138) Proceedings', 'Loan Agreements & Security Vetting', 'Mortgage & Security Perfecting', 'Default Borrower Legal Notices'],
        bn: ['অর্থ ঋণ আদালত আইন ২০০৩', 'এনআই অ্যাক্ট (১৩৮ ধারা) মোকদ্দমা', 'ঋণ চুক্তি ও জামানত যাচাই', 'বন্ধক ও সিকিউরিটি ডকুমেন্টস', 'খেলাপি ঋণগ্রহীতাকে আইনি নোটিশ'],
      },
      link: '/practice-areas/corporate-commercial',
      icon: Building2,
    },
    {
      id: 'family-labor',
      title: {
        en: 'Family, Labour & Constitutional Law',
        bn: 'পারিবারিক, শ্রম ও সাংবিধানিক আইন',
      },
      scope: {
        en: 'Family Court proceedings, dower and maintenance, child custody, compliance under Bangladesh Labour Act 2006, and constitutional rights advocacy.',
        bn: 'পারিবারিক আদালত মোকদ্দমা, দেনমোহর ও ভরণপোষণ, সন্তানের অভিভাবকত্ব, বাংলাদেশ শ্রম আইন ২০০৬ সংক্রান্ত পরামর্শ এবং মৌলিক অধিকার সুরক্ষা।',
      },
      subjects: {
        en: ['Family Court Matters & Custody', 'Muslim Property Distribution', 'Labour Court Proceedings', 'Bangladesh Labour Act 2006', 'Public Interest Litigation (PIL)'],
        bn: ['পারিবারিক আদালত ও অভিভাবকত্ব', 'মুসলিম সম্পত্তি বণ্টন বিধি', 'শ্রম আদালত মোকদ্দমা পরিচালনা', 'বাংলাদেশ শ্রম আইন ২০০৬', 'জনস্বার্থ মামলা (পিআইএল)'],
      },
      link: '/practice-areas/family-law',
      icon: Users,
    },
    {
      id: 'adr-legal-aid',
      title: {
        en: 'ADR & Legal Aid Services',
        bn: 'বিকল্প বিরোধ নিষ্পত্তি ও আইনি সহায়তা',
      },
      scope: {
        en: 'Facilitating out-of-court conflict dissolution through structured mediation, institutional ADR, legal awareness programs, and support for indigent litigants.',
        bn: 'আদালতের বাইরে মধ্যস্থতা ও বিকল্প বিরোধ নিষ্পত্তি (এডিআর), প্রাতিষ্ঠানিক সালিশ, আইনি সচেতনতামূলক কার্যক্রম এবং সুবিধাবঞ্চিত বিচারপ্রার্থীদের আইনি সহায়তা।',
      },
      subjects: {
        en: ['Out-of-Court Dispute Resolution', 'Mediation & Structured Negotiation', 'Arbitration Act 2001 Advisory', 'BLAST Legal Aid Community Work', 'Litigant Rights Awareness'],
        bn: ['আদালত-বহির্ভূত বিরোধ নিষ্পত্তি', 'মধ্যস্থতা ও দ্বিপাক্ষিক আলোচনা', 'সালিশ আইন ২০০১ পরামর্শ', 'ব্লাস্ট আইনি সহায়তা কার্যক্রম', 'আইন সচেতনতা ও পরামর্শ'],
      },
      link: '/practice-areas/pro-bono',
      icon: Compass,
    },
  ];

  // Default Commitments Fallback
  const defaultCommitments = [
    {
      id: 'accessibility',
      pillar: { en: 'Accessibility', bn: 'সহজলভ্যতা' },
      title: { en: 'Clear Communication & Guidance', bn: 'সহজবোধ্য যোগাযোগ ও দিকনির্দেশনা' },
      description: {
        en: 'Straightforward orientation on statutory procedures and practical options without confusing jargon, ensuring every litigant understands the realistic trajectory of their matter.',
        bn: 'জটিল আইনি পরিভাষা পরিহার করে সেবাগ্রহীতাকে তাঁর আইনি অধিকার, আদালতের সম্ভাব্য কার্যপ্রণালী এবং বাস্তবসম্মত পদক্ষেপসমূহ স্পষ্টভাবে অবহিত করা।',
      },
      icon: 'Compass',
    },
    {
      id: 'availability',
      pillar: { en: 'Availability', bn: 'সময়ানুবর্তিতা' },
      title: { en: 'Disciplined Preparation & Follow-up', bn: 'সময়োপযোগী প্রস্তুতি ও দায়িত্বশীল তদারকি' },
      description: {
        en: 'Conscientious scheduling and steady case tracking. Diligent preparation of court pleadings ahead of critical procedural deadlines and scheduled hearing dates.',
        bn: 'নিয়মানুবর্তিতা ও সময়োপযোগী আইনি পদক্ষেপ। আদালতের ধার্য তারিখে মামলার নথিপত্র যথাযথভাবে প্রস্তুত রাখা এবং শুনানির পূর্বে পর্যাপ্ত প্রস্তুতি নিশ্চিতকরণ।',
      },
      icon: 'Clock',
    },
    {
      id: 'confidentiality',
      pillar: { en: 'Confidentiality', bn: 'গোপনীয়তা' },
      title: { en: 'Safeguarding Sensitive Records', bn: 'পেশাগত বিশ্বস্ততা ও নথিপত্রের নিরাপত্তা' },
      description: {
        en: 'Strict protection of client disclosures, property title deeds, commercial records, and strategic deliberations in full compliance with legal professional ethics.',
        bn: 'মক্কেলের ব্যক্তিগত তথ্য, আর্থিক বিবরণী, ভূমির মূল দলিলপত্র এবং মামলার কৌশলগত আলোচনার সর্বোচ্চ গোপনীয়তা ও পেশাগত বিশ্বস্ততা রক্ষা।',
      },
      icon: 'Lock',
    },
    {
      id: 'integrity',
      pillar: { en: 'Integrity', bn: 'পেশাগত সততা' },
      title: { en: 'Principled & Honest Advocacy', bn: 'নীতিবান মূল্যায়ন ও সততা' },
      description: {
        en: 'Fidelity to truth, accurate factual marshalling in court documents, and objective assessments without exaggerated assurances or misleading promises.',
        bn: 'আইনি নীতিশাস্ত্রের কঠোর অনুসরণ, আরজি ও জবাবে নির্ভুল তথ্য উপস্থাপন এবং কোনো অতিরঞ্জিত আশ্বাস না দিয়ে সততা ও আইনের শাসনের প্রতি অবিচল থাকা।',
      },
      icon: 'ShieldCheck',
    },
  ];

  // Default Professional Highlights Fallback
  const defaultHighlights: AboutHighlightItem[] = [
    {
      id: 'hl-1',
      title: { en: 'University of Chittagong:', bn: 'চট্টগ্রাম বিশ্ববিদ্যালয়:' },
      description: {
        en: 'First Class honors in both LL.B. (Honours, 2011) and LL.M. (2012).',
        bn: 'এলএল.বি. (অনার্স) ও এলএল.এম. উভয় ডিগ্রিতে প্রথম শ্রেণি।',
      },
    },
    {
      id: 'hl-2',
      title: { en: 'Bar Council Enrollment:', bn: 'বার কাউন্সিল তালিকাভুক্তি:' },
      description: {
        en: 'Statutory qualification and enrollment as an Advocate in 2016.',
        bn: '২০১৬ সালে সংবিধিবদ্ধ অ্যাডভোকেটশিপ পরীক্ষায় উত্তীর্ণ।',
      },
    },
    {
      id: 'hl-3',
      title: { en: 'Litigation & Deeds Vetting:', bn: 'আইনি দলিল ও আরজি খসড়া:' },
      description: {
        en: 'Comprehensive plaint drafting, land title vetting, and commercial contracts.',
        bn: 'দেওয়ানি ও ফৌজদারি মামলা, ভূমির স্বত্ব দলিল যাচাই ও বাণিজ্যিক চুক্তি।',
      },
    },
    {
      id: 'hl-4',
      title: { en: 'ADR & Access to Justice:', bn: 'আইনি সহায়তা ও এডিআর:' },
      description: {
        en: 'Institutional ADR, community legal awareness, and PIL coordination.',
        bn: 'ব্লাস্ট-এর মাধ্যমে মধ্যস্থতা, সচেতনতা ও জনস্বার্থ আইনি কার্যক্রম।',
      },
    },
  ];

  // Default Training Records Fallback
  const defaultVerifiedCvTrainings = [
    {
      id: 'tr-1',
      year: '2016',
      duration: { en: '3 Days', bn: '৩ দিন' },
      title: {
        en: 'Professional Skill Development Workshop for Young Lawyers',
        bn: 'তরুণ আইনজীবীদের পেশাগত দক্ষতা উন্নয়ন কর্মশালা',
      },
      institution: {
        en: "Chittagong District Bar Association — Chittagong Judge's Court",
        bn: 'চট্টগ্রাম জেলা বার অ্যাসোসিয়েশন — চট্টগ্রাম জজ কোর্ট',
      },
      description: {
        en: 'Comprehensive workshop on trial advocacy, witness examination techniques, procedural management, and courtroom decorum.',
        bn: 'আদালতের কার্যপ্রণালী, সাক্ষ্য গ্রহণ পদ্ধতি, শুনানির শিষ্টাচার ও পেশাগত দক্ষতার ওপর ৩ দিনব্যাপী নিবিড় প্রশিক্ষণ।',
      },
    },
    {
      id: 'tr-2',
      year: '2015',
      duration: { en: 'Day Long', bn: 'দিনব্যাপী' },
      title: {
        en: 'Workshop on Prosecution Under Overseas Employment & Migration Law 2013',
        bn: 'বৈদেশিক কর্মসংস্থান ও অভিবাসী আইন ২০১৩ বিষয়ক বিশেষায়িত কর্মশালা',
      },
      institution: {
        en: 'RMMRU (Refugee and Migratory Movements Research Unit) & Manusher Jonno Foundation, Dhaka',
        bn: 'রামরু (রিফিউজি অ্যান্ড মাইগ্রেটরি মুভমেন্টস রিসার্চ ইউনিট) ও মানুষের জন্য ফাউন্ডেশন, ঢাকা',
      },
      description: {
        en: 'Specialized training on the Overseas Employment and Migrants Act 2013, refugee protection concepts, and statutory prosecution remedies.',
        bn: 'বৈদেশিক কর্মসংস্থান আইন ২০১৩, অভিবাসী শ্রমিকদের অধিকার সুরক্ষা এবং সংশ্লিষ্ট অপরাধের বিচার প্রক্রিয়া ও আইনি প্রতিকার।',
      },
    },
    {
      id: 'tr-3',
      year: '2012',
      duration: { en: '13–15 Sept 2012', bn: '১৩–১৫ সেপ্টেম্বর ২০১২' },
      title: {
        en: '8th Henry Dunant Memorial Moot Court Competition (Genocide & War Crimes)',
        bn: '৮ম হেনরি ডুনান্ট মেমোরিয়াল মুট কোর্ট প্রতিযোগিতা (যুদ্ধাপরাধ ও আন্তর্জাতিক আইন)',
      },
      institution: {
        en: 'International Committee of the Red Cross (ICRC) & Faculty of Law, University of Dhaka',
        bn: 'আইসিআরসি এবং আইন অনুষদ, ঢাকা বিশ্ববিদ্যালয়',
      },
      description: {
        en: 'National moot court competition at Nawab Ali Chowdhury Senate Bhaban, University of Dhaka, addressing genocide, war crimes jurisprudence, and appellate oral arguments.',
        bn: 'ঢাকা বিশ্ববিদ্যালয় সিনেট ভবনে অনুষ্ঠিত জাতীয় মুট কোর্ট প্রতিযোগিতা; আন্তর্জাতিক মানবিক আইন, যুদ্ধাপরাধ এবং আপিল বিভাগীয় মৌখিক যুক্তি উপস্থাপন।',
      },
    },
    {
      id: 'tr-4',
      year: '2012',
      duration: { en: '1 Year Research', bn: '১ বছর মেয়াদী গবেষণা' },
      title: {
        en: 'Comparative Study of Village Courts — Research & Field Inquiry',
        bn: 'গ্রাম আদালতের ক্ষমতা ও কার্যাবলির তুলনামূলক গবেষণা',
      },
      institution: {
        en: 'University of Chittagong, Noakhali Field Study',
        bn: 'চট্টগ্রাম বিশ্ববিদ্যালয় — নোয়াখালী মাঠপর্যায়ের গবেষণা',
      },
      description: {
        en: 'Year-long socio-legal research analyzing statutory village court powers, functions, dispute settlement dynamics, and practical challenges at the grassroots.',
        bn: 'স্থানীয় পর্যায়ে বিরোধ নিষ্পত্তি, আইনি এখতিয়ার এবং গ্রাম আদালত ব্যবস্থার প্রায়োগিক সীমাবদ্ধতা ও সম্ভাবনার বছরব্যাপী মাঠপর্যায়ের বিশ্লেষণ।',
      },
    },
    {
      id: 'tr-5',
      year: '2011',
      duration: { en: 'Day Long', bn: 'দিনব্যাপী' },
      title: {
        en: 'Human Resources Development Workshop',
        bn: 'মানবসম্পদ উন্নয়ন ও প্রাতিষ্ঠানিক নেতৃত্ব কর্মশালা',
      },
      institution: {
        en: 'Rotaract Club of Chittagong University',
        bn: 'রোটার‍্যাক্ট ক্লাব অব চিটাগং ইউনিভার্সিটি',
      },
      description: {
        en: 'Workshop covering human resources management principles, organizational communication ethics, and professional collaboration.',
        bn: 'প্রাতিষ্ঠানিক যোগাযোগ, দলীয় নেতৃত্ব ও মানবসম্পদ ব্যবস্থাপনার মৌলিক নীতিমালা বিষয়ক দিনব্যাপী প্রশিক্ষণ।',
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-legal-midnight pt-32 pb-24 text-legal-slate-200">
        <Container>
          <div className="flex flex-col items-center justify-center space-y-4 py-32 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-legal-gold-500 border-t-transparent" />
            <p className="font-serif text-lg tracking-wide text-legal-gold-400">
              {locale === 'bn' ? 'তথ্য লোড হচ্ছে...' : 'Loading Professional Profile & Judicial Credentials...'}
            </p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-legal-midnight pt-32 pb-24 text-legal-slate-200">
        <Container>
          <div className="mx-auto max-w-xl rounded-lg border border-red-900/40 bg-red-950/20 p-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-red-400">
              {locale === 'bn' ? 'তথ্য প্রাপ্তি সম্ভব হয়নি' : 'Profile Unavailable'}
            </h2>
            <p className="mt-2 text-sm text-legal-slate-400">
              {error || (locale === 'bn' ? 'বর্তমানে কোনো প্রোফাইল তথ্য নেই।' : 'No profile information is published yet.')}
            </p>
          </div>
        </Container>
      </div>
    );
  }

  const aboutSettings = profile.about_settings;
  const sectionHeaders = aboutSettings?.about_section_headers || {};
  const heroSettings = aboutSettings?.about_hero;
  const ctaSettings = aboutSettings?.about_cta;

  const credentials = profile.credentials || [];
  const educations = profile.educations || [];
  const timeline = profile.timeline || [];
  const memberships = profile.memberships || [];

  // Training items: admin about_trainings, then certification credentials, then verified CV defaults
  const customTrainings = aboutSettings?.about_trainings && aboutSettings.about_trainings.length > 0
    ? aboutSettings.about_trainings
    : null;
  const credentialTrainings = credentials.filter((c) => c.category === 'certification');
  const displayTrainings = customTrainings || (credentialTrainings.length > 0 ? credentialTrainings : defaultVerifiedCvTrainings);

  // Commitments (4 Pillars): admin about_commitments, else defaults
  const displayCommitments = aboutSettings?.about_commitments && aboutSettings.about_commitments.length > 0
    ? aboutSettings.about_commitments
    : defaultCommitments;

  // Highlights: admin about_highlights, else defaults
  const displayHighlights = aboutSettings?.about_highlights && aboutSettings.about_highlights.length > 0
    ? aboutSettings.about_highlights
    : defaultHighlights;

  // Section Headers helper
  const getHeader = (key: string, defaults: { eyebrow: { en: string; bn: string }; title: { en: string; bn: string }; description?: { en: string; bn: string } }) => {
    const custom = sectionHeaders[key];
    return {
      eyebrow: resolveText(custom?.eyebrow) || defaults.eyebrow[locale],
      title: resolveText(custom?.title) || defaults.title[locale],
      description: resolveText(custom?.description) || (defaults.description ? defaults.description[locale] : ''),
    };
  };

  const bioHeader = getHeader('bio', {
    eyebrow: { en: 'Professional Profile', bn: 'পেশাগত পরিচিতি' },
    title: { en: 'Academic Pedigree, Advocacy Experience & Ethical Practice', bn: 'আইনি সাধনা, পেশাগত অভিজ্ঞতা ও নীতিবান কর্মপদ্ধতি' },
  });

  const timelineHeader = getHeader('timeline', {
    eyebrow: { en: 'Career Milestones', bn: 'পেশাগত সময়রেখা' },
    title: { en: 'Career Journey & Professional Milestones', bn: 'আইন অঙ্গনে পদচিহ্ন ও পেশাগত পথচলা' },
    description: {
      en: 'Chronological progression across university legal education, statutory Bar Council enrollment, corporate documentation, and litigation advocacy.',
      bn: 'বিশ্ববিদ্যালয়ের উচ্চতর আইন শিক্ষা, সংবিধিবদ্ধ বার কাউন্সিল তালিকাভুক্তি, করপোরেট প্র্যাকটিস ও আদালত অঙ্গনে অভিজ্ঞতার ধারাবাহিক রূপরেখা।',
    },
  });

  const practiceHeader = getHeader('practice_areas', {
    eyebrow: { en: 'Areas of Legal Practice', bn: 'আইনি অনুশীলনের ক্ষেত্রসমূহ' },
    title: { en: 'Categorized Legal Practice Disciplines', bn: 'অভিজ্ঞতার বিষয়ভিত্তিক আইনি ক্ষেত্র' },
    description: {
      en: 'A structured overview of legal experience documented in the CV across litigation, real property vetting, commercial contracts, and dispute resolution.',
      bn: 'দেওয়ানি ও ফৌজদারি মামলা, ভূমির স্বত্ব যাচাই ও দলিলপত্র, ব্যাংকিং বিরোধ, করপোরেট চুক্তি এবং বিকল্প বিরোধ নিষ্পত্তির সমন্বিত রূপরেখা।',
    },
  });

  const educationHeader = getHeader('education', {
    eyebrow: { en: 'Academic Pedigree & Qualifications', bn: 'আইন শিক্ষাগত যোগ্যতা' },
    title: { en: 'Formal Legal Degrees & Academic Standing', bn: 'প্রাতিষ্ঠানিক আইন ডিগ্রি ও ফলাফল' },
    description: {
      en: 'Degrees and academic distinctions conferred by the University of Chittagong and statutory boards as documented in the CV.',
      bn: 'চট্টগ্রাম বিশ্ববিদ্যালয় ও সংবিধিবদ্ধ বোর্ডের ফলাফল ও সনদ।',
    },
  });

  const trainingHeader = getHeader('trainings', {
    eyebrow: { en: 'Professional Development & Training', bn: 'পেশাগত উন্নয়ন ও প্রশিক্ষণ' },
    title: { en: 'Workshops, Moot Court & Specialized Inquiries', bn: 'আইনি কর্মশালা, মুট কোর্ট এবং মাঠপর্যায়ের গবেষণা' },
    description: {
      en: 'Participation in legal advocacy workshops, international humanitarian mooting, and field research documented in the CV.',
      bn: 'বার অ্যাসোসিয়েশন, মানবাধিকার সংস্থা ও ঢাকা বিশ্ববিদ্যালয় আইন অনুষদ আয়োজিত প্রশিক্ষণ ও গবেষণার বিবরণ।',
    },
  });

  const commitmentHeader = getHeader('commitments', {
    eyebrow: { en: 'Professional Commitment', bn: 'আইনি অনুশীলনের চার স্তম্ভ' },
    title: { en: 'Accessibility, Availability, Confidentiality & Integrity', bn: 'সহজলভ্যতা, সময়ানুবর্তিতা, গোপনীয়তা ও সততা' },
    description: {
      en: "The four non-negotiable professional principles explicitly declared in the lawyer's CV guiding all client engagements.",
      bn: 'আইনজীবীর সিভিতে সুস্পষ্টভাবে ঘোষিত চার মূলনীতি, যা প্রতিটি মক্কেল ও বিচারিক বিষয়ে নিষ্ঠার সাথে অনুশীলিত হয়।',
    },
  });

  const membershipHeader = getHeader('memberships', {
    eyebrow: { en: 'Bar & Chamber Affiliations', bn: 'বার ও চেম্বার অন্তর্ভুক্তি' },
    title: { en: 'Professional Bar Memberships', bn: 'পেশাগত বার অ্যাসোসিয়েশন সদস্যপদ' },
  });

  const ctaHeader = getHeader('consultation_cta', {
    eyebrow: { en: 'Chamber Consultation', bn: 'চেম্বার ও কার্যালয়' },
    title: { en: 'Discuss Your Legal Matter', bn: 'আপনার আইনি বিষয়ে পরামর্শ গ্রহণ করুন' },
    description: {
      en: 'Share a brief description of your legal concern to request a consultation. The appropriate next steps depend on the facts, available documents, and applicable law.',
      bn: 'আপনার আইনি সমস্যা ও প্রাসঙ্গিক নথিপত্র জানিয়ে পরামর্শের জন্য যোগাযোগ করুন। প্রতিটি বিষয়ের পরবর্তী পদক্ষেপ সুনির্দিষ্ট ঘটনা, প্রাপ্ত প্রমাণাদি এবং প্রচলিত আইনের ওপর নির্ভর করে।',
    },
  });

  return (
    <div className="min-h-screen bg-legal-midnight text-legal-slate-200">
      <SeoHead
        title={
          locale === 'bn'
            ? 'অ্যাডভোকেট নিজাম উদ্দিন (হক) সম্পর্কে | সুপ্রিম কোর্ট আইনজীবী'
            : 'About Advocate Nijam Uddin (Haq) | Supreme Court of Bangladesh'
        }
        description={
          resolveText(profile?.short_bio) ||
          (locale === 'bn'
            ? 'অ্যাডভোকেট নিজাম উদ্দিন (হক)-এর পূর্ণাঙ্গ আইনি প্রোফাইল, শিক্ষা, সুপ্রিম কোর্টের প্র্যাকটিস ও অভিজ্ঞতা।'
            : 'Comprehensive legal profile, judicial credentials, education, and practice of Advocate Nijam Uddin (Haq).')
        }
        canonical="/about"
        ogType="profile"
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'পরিচিতি' : 'About', path: '/about' },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: resolveText(profile.name) || 'Advocate Nijam Uddin (Haq)',
          jobTitle: resolveText(profile.title) || 'Advocate, Supreme Court of Bangladesh',
          alumniOf: 'University of Chittagong',
          url: 'https://nijamuddin.com/about',
        }}
      />

      {/* SECTION 1: Professional Hero */}
      <section className="relative overflow-hidden border-b border-legal-slate-800/80 bg-gradient-to-b from-legal-slate-900 via-legal-midnight to-legal-midnight pt-28 sm:pt-32 pb-16 lg:pt-36 lg:pb-24">
        <div className="pointer-events-none absolute -right-48 -top-48 h-96 w-96 rounded-full bg-legal-gold-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-legal-slate-800/40 blur-3xl" />

        <Container>
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Authority, Hero Heading & Copy (Mobile: Order 2, Desktop: Order 1) */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              {/* Advocate Name */}
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {resolveText(profile.name)}
              </h1>

              {/* Subtitle / Headline */}
              {profile.subtitle && (
                <p className="mt-3 font-serif text-xl italic text-legal-gold-400/90 sm:text-2xl">
                  {resolveText(profile.subtitle)}
                </p>
              )}

              {/* Hero Stated Heading */}
              <h2 className="mt-6 font-serif text-2xl font-semibold text-legal-slate-100 sm:text-3xl">
                {resolveText(heroSettings?.heading) ||
                  (locale === 'bn'
                    ? 'আইন ও ন্যায়ের শাসন প্রতিষ্ঠায় নীতিবান ও দায়বদ্ধ আইনি সেবা'
                    : 'Committed to Principled Legal Practice and Access to Justice')}
              </h2>

              {/* Stated Supporting Copy */}
              <p className="mt-4 text-base leading-relaxed text-legal-slate-300 sm:text-lg">
                {resolveText(profile.short_bio)}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={heroSettings?.primary_cta_url || '/contact'}
                  className="inline-flex items-center rounded bg-legal-gold-500 px-6 py-3 font-sans text-sm font-semibold tracking-wide text-legal-midnight transition hover:bg-legal-gold-400 focus:outline-none focus:ring-2 focus:ring-legal-gold-500 focus:ring-offset-2 focus:ring-offset-legal-midnight"
                >
                  {resolveText(heroSettings?.primary_cta_text) ||
                    (locale === 'bn' ? 'পরামর্শের জন্য যোগাযোগ' : 'Request a Consultation')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href={heroSettings?.secondary_cta_url || '#practice-areas'}
                  className="inline-flex items-center rounded border border-legal-slate-700 bg-legal-slate-900/60 px-5 py-3 font-sans text-sm font-medium text-legal-slate-200 transition hover:border-legal-gold-500/60 hover:text-white"
                >
                  <Scale className="mr-2 h-4 w-4 text-legal-gold-400" />
                  {resolveText(heroSettings?.secondary_cta_text) ||
                    (locale === 'bn' ? 'আইনি অনুশীলনের ক্ষেত্রসমূহ' : 'Explore Practice Areas')}
                </a>
              </div>

              {/* Contact Pills */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-legal-slate-400">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center transition hover:text-legal-gold-400"
                  >
                    <Mail className="mr-1.5 h-3.5 w-3.5 text-legal-gold-400" />
                    {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex items-center transition hover:text-legal-gold-400"
                  >
                    <Phone className="mr-1.5 h-3.5 w-3.5 text-legal-gold-400" />
                    {profile.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Profile Presentation Portrait (Mobile: Order 1, Desktop: Order 2) */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-2 rounded-xl bg-gradient-to-tr from-legal-gold-600/30 via-transparent to-legal-gold-500/20 blur-sm" />
                <div className="relative overflow-hidden rounded-lg border border-legal-gold-500/40 bg-legal-slate-900 shadow-2xl">
                  {(() => {
                    const candidateUrl =
                      profile.court_robes_photo?.variants?.large ||
                      profile.court_robes_photo?.variants?.medium ||
                      profile.court_robes_photo?.url ||
                      profile.profile_photo?.variants?.large ||
                      profile.profile_photo?.variants?.medium ||
                      profile.profile_photo?.url ||
                      '/images/lawyer-court-robes-600w.webp';

                    const normalizedUrl = candidateUrl
                      ? candidateUrl.replace(/^\/\/+/, '/')
                      : null;

                    if (normalizedUrl && !portraitImageFailed) {
                      return (
                        <img
                          src={normalizedUrl}
                          alt={resolveText(profile.name)}
                          width={600}
                          height={800}
                          loading="lazy"
                          decoding="async"
                          onError={() => setPortraitImageFailed(true)}
                          className="h-auto w-full aspect-[3/4] object-cover object-top transition duration-300"
                        />
                      );
                    }

                    return (
                      <div className="flex h-96 flex-col items-center justify-center bg-gradient-to-b from-legal-slate-800 to-legal-slate-900 p-8 text-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-legal-gold-500/60 bg-legal-midnight">
                          <Scale className="h-12 w-12 text-legal-gold-400" />
                        </div>
                        <h3 className="mt-6 font-serif text-2xl font-bold text-white">
                          {resolveText(profile.name)}
                        </h3>
                        <p className="mt-1 text-sm text-legal-gold-400">
                          {resolveText(profile.title)}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Bar Council Certification Badge */}
                  <div className="border-t border-legal-slate-800 bg-legal-slate-950/80 p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs font-medium text-legal-gold-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>
                        {resolveText(heroSettings?.portrait_badge_text) ||
                          (locale === 'bn'
                            ? 'বাংলাদেশ বার কাউন্সিল প্রত্যয়িত আইনজীবী (২০১৬)'
                            : 'Certified Practitioner — Bangladesh Bar Council (2016)')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 2: Professional Overview ("Professional Profile") */}
      <section className="border-b border-legal-slate-800/80 py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Authoritative Biography Narrative */}
            <div className="lg:col-span-7">
              <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                <BookOpen className="h-4 w-4" />
                <span>{bioHeader.eyebrow}</span>
              </div>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {bioHeader.title}
              </h2>

              <div
                className="prose prose-invert prose-gold mt-8 max-w-none font-sans text-base leading-relaxed text-legal-slate-300 space-y-4"
                dangerouslySetInnerHTML={{ __html: resolveText(profile.long_bio) }}
              />
            </div>

            {/* Right Column: Philosophy, Principled Advocacy & 4 Pillars Snapshot */}
            <div className="space-y-6 lg:col-span-5">
              {profile.philosophy && (
                <div className="rounded-xl border border-legal-gold-500/30 bg-legal-slate-900/70 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-legal-gold-500/10 text-legal-gold-400">
                      <Scale className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      {locale === 'bn' ? 'বিচারিক দর্শন' : 'Judicial Philosophy'}
                    </h3>
                  </div>
                  <p className="mt-4 font-serif text-base italic leading-relaxed text-legal-slate-200">
                    &ldquo;{resolveText(profile.philosophy)}&rdquo;
                  </p>
                </div>
              )}

              {profile.legal_approach && (
                <div className="rounded-xl border border-legal-slate-800 bg-legal-slate-900/60 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-legal-slate-800 text-legal-gold-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      {locale === 'bn' ? 'আইনি কর্মপদ্ধতি' : 'Principled Advocacy'}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-legal-slate-300">
                    {resolveText(profile.legal_approach)}
                  </p>
                </div>
              )}

              {/* 4 Professional Distinctions Summary */}
              <div className="rounded-xl border border-legal-slate-800/90 bg-legal-slate-950/60 p-6">
                <h4 className="text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                  {locale === 'bn' ? 'পেশাগত যোগ্যতার বিশেষ দিক' : 'Professional Highlights'}
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-legal-slate-300">
                  {displayHighlights.map((hl, index) => (
                    <li key={hl.id || index} className="flex items-start">
                      <CheckCircle2 className="mr-2.5 h-4 w-4 shrink-0 text-legal-gold-400 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          {resolveText(hl.title)}{' '}
                        </strong>
                        {resolveText(hl.description)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 3: Career Journey (Timeline) */}
      {timeline.length > 0 && (
        <section className="border-b border-legal-slate-800/80 bg-legal-slate-900/30 py-16 lg:py-24">
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                <Briefcase className="h-4 w-4" />
                <span>{timelineHeader.eyebrow}</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                {timelineHeader.title}
              </h2>
              {timelineHeader.description && (
                <p className="mx-auto mt-3 max-w-2xl text-sm text-legal-slate-400">
                  {timelineHeader.description}
                </p>
              )}
            </div>

            <div className="mx-auto mt-12 max-w-3xl space-y-6">
              {timeline.map((item, index) => (
                <div
                  key={item.id || index}
                  className="relative rounded-lg border border-legal-slate-800 bg-legal-slate-900/60 p-6 pl-8 transition hover:border-legal-gold-500/50"
                >
                  <div className="absolute left-3 top-7 h-2.5 w-2.5 rounded-full bg-legal-gold-400 shadow-sm" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-legal-gold-400 uppercase tracking-wider">
                      {item.period}
                    </span>
                    {item.is_current && (
                      <Badge variant="gold" size="sm">
                        {locale === 'bn' ? 'বর্তমান' : 'Current Practice'}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-2 font-serif text-lg font-bold text-white">
                    {resolveText(item.title)}
                  </h3>
                  <p className="text-sm font-medium text-legal-gold-400/90">
                    {resolveText(item.organization)}
                  </p>
                  {item.description && (
                    <p className="mt-2 text-xs leading-relaxed text-legal-slate-300">
                      {resolveText(item.description)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* SECTION 4: Areas of Legal Practice (Categorized Overview) */}
      <section id="practice-areas" className="scroll-mt-24 border-b border-legal-slate-800/80 py-16 lg:py-24">
        <Container>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
              <Scale className="h-4 w-4" />
              <span>{practiceHeader.eyebrow}</span>
            </div>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              {practiceHeader.title}
            </h2>
            {practiceHeader.description && (
              <p className="mx-auto mt-3 max-w-2xl text-sm text-legal-slate-400">
                {practiceHeader.description}
              </p>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {practiceAreas && practiceAreas.length > 0 ? (
              practiceAreas.map((pa) => {
                const IconComp = getIconComponent(pa.icon_name || undefined, Scale);
                const assistanceList = pa.areas_of_assistance && pa.areas_of_assistance.length > 0
                  ? pa.areas_of_assistance
                  : null;

                return (
                  <Card
                    key={pa.id}
                    className="flex flex-col justify-between border-legal-slate-800/90 bg-legal-slate-900/70 p-6 transition hover:border-legal-gold-500/50"
                  >
                    <div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-legal-gold-500/10 text-legal-gold-400">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-serif text-lg font-bold text-white">
                        {resolveText(pa.title)}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-legal-slate-300 line-clamp-3">
                        {resolveText(pa.short_description)}
                      </p>

                      {assistanceList && assistanceList.length > 0 && (
                        <div className="mt-4 border-t border-legal-slate-800/80 pt-3">
                          <span className="text-[11px] font-semibold text-legal-gold-400 uppercase tracking-wider">
                            {locale === 'bn' ? 'অন্তর্ভুক্ত আইনি বিষয়সমূহ:' : 'Key Subject Matters:'}
                          </span>
                          <ul className="mt-2 space-y-1 text-xs text-legal-slate-400">
                            {assistanceList.slice(0, 5).map((subj, idx) => (
                              <li key={idx} className="flex items-center">
                                <span className="mr-1.5 h-1 w-1 rounded-full bg-legal-gold-400/80" />
                                {resolveText(subj.title)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-3">
                      <Link
                        to={`/practice-areas/${pa.slug}`}
                        className="inline-flex items-center text-xs font-semibold text-legal-gold-400 transition hover:text-legal-gold-300"
                      >
                        {locale === 'bn' ? 'বিস্তারিত তথ্য দেখুন' : 'Explore Practice Area Details'}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </Card>
                );
              })
            ) : (
              fallbackPracticeCategories.map((category) => {
                const IconComp = category.icon;
                return (
                  <Card
                    key={category.id}
                    className="flex flex-col justify-between border-legal-slate-800/90 bg-legal-slate-900/70 p-6 transition hover:border-legal-gold-500/50"
                  >
                    <div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-legal-gold-500/10 text-legal-gold-400">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-serif text-lg font-bold text-white">
                        {category.title[locale]}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-legal-slate-300">
                        {category.scope[locale]}
                      </p>

                      <div className="mt-4 border-t border-legal-slate-800/80 pt-3">
                        <span className="text-[11px] font-semibold text-legal-gold-400 uppercase tracking-wider">
                          {locale === 'bn' ? 'অন্তর্ভুক্ত আইনি বিষয়সমূহ:' : 'Key Subject Matters:'}
                        </span>
                        <ul className="mt-2 space-y-1 text-xs text-legal-slate-400">
                          {category.subjects[locale].map((subj, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="mr-1.5 h-1 w-1 rounded-full bg-legal-gold-400/80" />
                              {subj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-3">
                      <Link
                        to={category.link}
                        className="inline-flex items-center text-xs font-semibold text-legal-gold-400 transition hover:text-legal-gold-300"
                      >
                        {locale === 'bn' ? 'বিস্তারিত তথ্য দেখুন' : 'Explore Practice Area Details'}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </Container>
      </section>

      {/* SECTION 5: Education & Qualifications */}
      {educations.length > 0 && (
        <section className="border-b border-legal-slate-800/80 bg-legal-slate-900/30 py-16 lg:py-24">
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                <GraduationCap className="h-4 w-4" />
                <span>{educationHeader.eyebrow}</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                {educationHeader.title}
              </h2>
              {educationHeader.description && (
                <p className="mx-auto mt-3 max-w-2xl text-sm text-legal-slate-400">
                  {educationHeader.description}
                </p>
              )}
            </div>

            <div className="mx-auto mt-12 max-w-3xl space-y-6">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="rounded-lg border border-legal-slate-800 bg-legal-slate-900/60 p-6 transition hover:border-legal-gold-500/50 sm:flex sm:items-start sm:justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-xl font-bold text-white">
                        {resolveText(edu.degree)}
                      </h3>
                      {edu.year_completed && (
                        <span className="rounded border border-legal-slate-700 bg-legal-slate-800 px-2 py-0.5 text-xs font-semibold text-legal-gold-400">
                          {edu.year_completed}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-legal-gold-400/90">
                      {resolveText(edu.institution)}
                      {edu.department && (
                        <span className="text-legal-slate-400"> — {resolveText(edu.department)}</span>
                      )}
                    </p>
                    {edu.distinction && (
                      <p className="text-xs font-semibold text-legal-gold-400/80">
                        {resolveText(edu.distinction)}
                      </p>
                    )}
                    {edu.description && (
                      <p className="text-xs leading-relaxed text-legal-slate-300">
                        {resolveText(edu.description)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* SECTION 6: Professional Development & Training */}
      {displayTrainings.length > 0 && (
        <section className="border-b border-legal-slate-800/80 py-16 lg:py-24">
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                <Award className="h-4 w-4" />
                <span>{trainingHeader.eyebrow}</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                {trainingHeader.title}
              </h2>
              {trainingHeader.description && (
                <p className="mx-auto mt-3 max-w-2xl text-sm text-legal-slate-400">
                  {trainingHeader.description}
                </p>
              )}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayTrainings.map((item, index) => {
                const yearText = item.year || (typeof (item as any).issued_date === 'string' ? (item as any).issued_date : '');
                const durationText = (item as any).duration ? resolveText((item as any).duration) : '';

                return (
                  <Card
                    key={item.id || index}
                    className="flex flex-col justify-between border-legal-slate-800/90 bg-legal-slate-900/60 p-6 transition hover:border-legal-gold-500/50"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-legal-gold-500/10 px-2 py-0.5 text-[11px] font-semibold text-legal-gold-400 uppercase">
                          {durationText || (locale === 'bn' ? 'প্রশিক্ষণ / কর্মশালা' : 'Workshop & Training')}
                        </span>
                        {yearText && (
                          <span className="font-mono text-xs font-medium text-legal-slate-400">{yearText}</span>
                        )}
                      </div>
                      <h3 className="mt-4 font-serif text-base font-bold text-white">
                        {resolveText(item.title)}
                      </h3>
                      <p className="mt-2 text-xs font-medium text-legal-gold-400/90">
                        {resolveText((item as any).institution || (item as any).issuing_authority)}
                      </p>
                      {item.description && (
                        <p className="mt-3 text-xs leading-relaxed text-legal-slate-300">
                          {resolveText(item.description)}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* SECTION 7: Professional Approach & Commitment (The 4 Pillars) */}
      <section className="border-b border-legal-slate-800/80 bg-legal-slate-900/40 py-16 lg:py-24">
        <Container>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
              <ShieldCheck className="h-4 w-4" />
              <span>{commitmentHeader.eyebrow}</span>
            </div>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              {commitmentHeader.title}
            </h2>
            {commitmentHeader.description && (
              <p className="mx-auto mt-3 max-w-2xl text-sm text-legal-slate-400">
                {commitmentHeader.description}
              </p>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayCommitments.map((com, index) => {
              const IconComp = getIconComponent(com.icon, Compass);
              return (
                <div
                  key={com.id || index}
                  className="rounded-xl border border-legal-slate-800 bg-legal-slate-900/80 p-6 transition hover:border-legal-gold-500/60 hover:bg-legal-slate-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-legal-gold-500/10 text-legal-gold-400">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <span className="mt-4 block font-serif text-lg font-bold text-legal-gold-400">
                    {resolveText(com.pillar)}
                  </span>
                  <h3 className="mt-1 font-serif text-base font-semibold text-white">
                    {resolveText(com.title)}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-legal-slate-300">
                    {resolveText(com.description)}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* SECTION 8: Professional Memberships (Bar & Chamber Affiliations) */}
      {memberships.length > 0 && (
        <section id="team" className="scroll-mt-24 border-b border-legal-slate-800/80 py-16 lg:py-24">
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                <Users className="h-4 w-4" />
                <span>{membershipHeader.eyebrow}</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                {membershipHeader.title}
              </h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
              {memberships.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-legal-slate-800 bg-legal-slate-900/60 p-6 transition hover:border-legal-gold-500/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-legal-gold-500/10 text-legal-gold-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-white">
                    {resolveText(m.organization)}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-legal-gold-400">{resolveText(m.role)}</p>
                  {m.year_joined && (
                    <p className="mt-2 font-mono text-xs text-legal-slate-400">
                      {locale === 'bn' ? 'যোগদানের সন:' : 'Year Joined:'} {m.year_joined}
                    </p>
                  )}
                  {m.description && (
                    <p className="mt-2 text-xs leading-relaxed text-legal-slate-300">{resolveText(m.description)}</p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* SECTION 9: Chamber Locations & Consultation CTA */}
      <section id="clients" className="scroll-mt-24 py-16 lg:py-24">
        <Container>
          <div className="rounded-xl border border-legal-gold-500/40 bg-gradient-to-r from-legal-slate-900 via-legal-midnight to-legal-slate-900 p-8 lg:p-12 shadow-2xl">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                  {ctaHeader.eyebrow}
                </span>
                <h3 className="mt-2 font-serif text-3xl font-bold text-white">
                  {ctaHeader.title}
                </h3>
                {ctaHeader.description && (
                  <p className="mt-3 text-sm text-legal-slate-300 max-w-2xl leading-relaxed">
                    {ctaHeader.description}
                  </p>
                )}

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="flex items-center text-xs font-semibold text-legal-gold-400 uppercase">
                      <Building2 className="mr-1.5 h-4 w-4" />
                      {resolveText(ctaSettings?.chamber_label_supreme_court) ||
                        (locale === 'bn' ? 'সুপ্রিম কোর্ট চেম্বার' : 'Supreme Court Chambers')}
                    </h4>
                    <p className="mt-2 text-sm text-legal-slate-300">
                      {resolveText(profile.chambers_address)}
                    </p>
                  </div>
                  <div>
                    <h4 className="flex items-center text-xs font-semibold text-legal-gold-400 uppercase">
                      <Building2 className="mr-1.5 h-4 w-4" />
                      {resolveText(ctaSettings?.chamber_label_office) ||
                        (locale === 'bn' ? 'প্রধান কার্যালয়' : 'Principal Office')}
                    </h4>
                    <p className="mt-2 text-sm text-legal-slate-300">
                      {resolveText(profile.office_address)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4 lg:col-span-4 lg:items-end">
                <Link
                  to={ctaSettings?.button_url || '/contact'}
                  className="inline-flex w-full items-center justify-center rounded bg-legal-gold-500 px-6 py-3 font-sans text-sm font-semibold text-legal-midnight transition hover:bg-legal-gold-400 sm:w-auto"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {resolveText(ctaSettings?.button_label) ||
                    (locale === 'bn' ? 'পরামর্শের অনুরোধ জানান' : 'Schedule Consultation')}
                </Link>
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex w-full items-center justify-center rounded border border-legal-slate-700 bg-legal-slate-800/80 px-6 py-3 font-sans text-sm font-medium text-white transition hover:border-legal-gold-500 sm:w-auto"
                  >
                    <Phone className="mr-2 h-4 w-4 text-legal-gold-400" />
                    {profile.phone}
                  </a>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex w-full items-center justify-center rounded border border-legal-slate-700 bg-legal-slate-800/80 px-6 py-3 font-sans text-sm font-medium text-white transition hover:border-legal-gold-500 sm:w-auto"
                  >
                    <Mail className="mr-2 h-4 w-4 text-legal-gold-400" />
                    {profile.email}
                  </a>
                )}
              </div>
            </div>

            {/* Regulatory Disclaimer Notice */}
            <div className="mt-8 border-t border-legal-slate-800/80 pt-4 text-center text-xs text-legal-slate-500">
              {resolveText(ctaSettings?.disclaimer) ||
                (locale === 'bn'
                  ? 'আইনি সতর্কবার্তা: এই ওয়েবসাইটের মাধ্যমে প্রাথমিক যোগাযোগের অনুরোধ কোনো আইনজীবী-মক্কেল সম্পর্ক স্থাপন করে না। আনুষ্ঠানিক সাক্ষাৎ ও সম্মতির মাধ্যমেই কেবল দায়িত্ব গ্রহণ করা হয়।'
                  : 'Regulatory Notice: Submitting a consultation inquiry through this platform does not create an automatic advocate-client relationship. Formal representation commences only upon mutual consent and direct chamber engagement.')}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default AboutPage;

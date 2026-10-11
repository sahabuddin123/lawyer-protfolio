import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n';
import { contactApi } from '@/api/contact';
import { PublicContactConfig, ContactFormPayload, ConsultationFormPayload } from '@/types/contact';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldAlert,
  ExternalLink,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';

export const ContactPage: React.FC = () => {
  const { locale } = useTranslation();

  // Active form tab: 'inquiry' or 'consultation'
  const [activeTab, setActiveTab] = useState<'inquiry' | 'consultation'>('inquiry');

  // Contact config state
  const [config, setConfig] = useState<PublicContactConfig | null>(null);

  // Form states
  const [inquiryForm, setInquiryForm] = useState<ContactFormPayload>({
    name: '',
    phone: '',
    email: '',
    subject: '',
    practice_area_id: null,
    message: '',
    consent: false,
    _honeypot: '',
  });

  const [consultationForm, setConsultationForm] = useState<ConsultationFormPayload>({
    name: '',
    phone: '',
    email: '',
    subject: '',
    practice_area_id: null,
    preferred_date: '',
    preferred_time: '',
    message: '',
    consent: false,
    _honeypot: '',
  });

  // Submission feedback states
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Sync document title
  useEffect(() => {
    document.title =
      locale === 'bn'
        ? 'যোগাযোগ ও আইনি পরামর্শ | অ্যাডভোকেট নিজাম উদ্দিন'
        : 'Contact & Legal Consultation | Advocate Nijam Uddin';
  }, [locale]);

  // Load public contact configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await contactApi.getPublicContactConfig();
        if (res.success && res.data) {
          setConfig(res.data);
        }
      } catch (err) {
        console.error('Failed to load contact configuration', err);
      }
    };

    fetchConfig();
  }, []);

  const resolveTrans = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[locale] || val['en'] || Object.values(val)[0] || '';
  };

  // Handle Contact Inquiry Submit
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);

    if (!inquiryForm.consent) {
      setErrorMessage(
        locale === 'bn'
          ? 'অনুগ্রহ করে আইনি শর্তাবলী ও সতর্কীকরণ স্বীকার করুন।'
          : 'Please acknowledge the legal notice to submit an inquiry.'
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await contactApi.submitContactForm(inquiryForm);
      if (res.success) {
        setSuccessMessage(
          locale === 'bn'
            ? 'আপনার বার্তাটি সফলভাবে গৃহীত হয়েছে। আমাদের চেম্বার পর্যালোচনা করে যথাশীঘ্র যোগাযোগ করবে।'
            : 'Your message has been received. Our office will review your inquiry and contact you if appropriate.'
        );
        setInquiryForm({
          name: '',
          phone: '',
          email: '',
          subject: '',
          practice_area_id: null,
          message: '',
          consent: false,
          _honeypot: '',
        });
      }
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setErrorMessage(
          locale === 'bn'
            ? 'ফর্মের ত্রুটিগুলো সংশোধন করে পুনরায় চেষ্টা করুন।'
            : 'Please correct the highlighted errors and try again.'
        );
      } else if (err.response?.status === 429) {
        setErrorMessage(
          locale === 'bn'
            ? 'অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।'
            : 'Too many requests. Please wait a few moments before trying again.'
        );
      } else {
        setErrorMessage(
          locale === 'bn'
            ? 'সার্ভার সংযোগে ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
            : 'An unexpected error occurred. Please try again later.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Consultation Booking Submit
  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);

    if (!consultationForm.consent) {
      setErrorMessage(
        locale === 'bn'
          ? 'অনুগ্রহ করে আইনি শর্তাবলী ও সতর্কীকরণ স্বীকার করুন।'
          : 'Please acknowledge the legal notice to submit a consultation request.'
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await contactApi.submitConsultationForm(consultationForm);
      if (res.success) {
        setSuccessMessage(
          locale === 'bn'
            ? 'আপনার পরামর্শ অনুরোধ গৃহীত হয়েছে। আমাদের চেম্বার অনুরোধ পর্যালোচনা করে সময়সূচি সম্পর্কে যোগাযোগ করবে।'
            : 'Your consultation request has been received. Our office will review the request and contact you if appropriate.'
        );
        setConsultationForm({
          name: '',
          phone: '',
          email: '',
          subject: '',
          practice_area_id: null,
          preferred_date: '',
          preferred_time: '',
          message: '',
          consent: false,
          _honeypot: '',
        });
      }
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setErrorMessage(
          locale === 'bn'
            ? 'ফর্মের ত্রুটিগুলো সংশোধন করে পুনরায় চেষ্টা করুন।'
            : 'Please correct the highlighted errors and try again.'
        );
      } else if (err.response?.status === 429) {
        setErrorMessage(
          locale === 'bn'
            ? 'অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।'
            : 'Too many requests. Please wait a few moments before trying again.'
        );
      } else {
        setErrorMessage(
          locale === 'bn'
            ? 'সার্ভার সংযোগে ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
            : 'An unexpected error occurred. Please try again later.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background-primary text-text-primary selection:bg-gold-primary/20 selection:text-gold-hover pb-24">
      <SeoHead
        title={
          locale === 'bn'
            ? 'যোগাযোগ ও আইনি পরামর্শ | অ্যাডভোকেট নিজাম উদ্দিন (হক)'
            : 'Contact Chambers | Advocate Nijam Uddin (Haq)'
        }
        description={
          locale === 'bn'
            ? 'সুপ্রিম কোর্ট অব বাংলাদেশ ও জেলা জজ আদালত চেম্বারে আইনি অনুসন্ধানের জন্য সরাসরি যোগাযোগ করুন বা পরামর্শ সভার অনুরোধ পাঠান।'
            : 'Direct communication channels and formal legal consultation scheduling with the chambers of Advocate Nijam Uddin in Dhaka and Chattogram.'
        }
        canonical="/contact"
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'যোগাযোগ' : 'Contact', path: '/contact' },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Chambers — Advocate Nijam Uddin (Haq)',
          url: 'https://nijamuddin.com/contact',
        }}
      />

      {/* 1. Full-Width Page Header with Breadcrumbs */}
      <PageHeader
        eyebrow={locale === 'bn' ? 'যোগাযোগ ও চেম্বার সচিবালয়' : 'Chamber Intake & Interaction'}
        title={locale === 'bn' ? 'যোগাযোগ ও আইনি পরামর্শ' : 'Contact & Chamber Consultation'}
        description={
          locale === 'bn'
            ? 'সুপ্রিম কোর্ট অব বাংলাদেশ ও জেলা জজ আদালত চেম্বারে আইনি অনুসন্ধানের জন্য সরাসরি যোগাযোগ করুন বা আনুষ্ঠানিক পরামর্শ সভার অনুরোধ পাঠান।'
            : 'Direct communication channels and formal legal consultation scheduling with the chambers of Advocate Nijam Uddin in Dhaka and Chattogram.'
        }
        breadcrumbs={
          <nav className="flex items-center space-x-2 text-xs text-text-muted" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gold-primary transition-colors">
              {locale === 'bn' ? 'হোম' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted/40" />
            <span className="text-gold-primary font-medium">
              {locale === 'bn' ? 'যোগাযোগ' : 'Contact'}
            </span>
          </nav>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Section 1: Contact Information Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Primary Telephone */}
          <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-sm hover:border-gold-border/80 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gold-subtle border border-gold-border/60 flex items-center justify-center text-gold-primary">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-serif-editorial font-bold text-text-primary">
                {locale === 'bn' ? 'টেলিফোন / হেল্পলাইন' : 'Telephone / Hotline'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                {locale === 'bn'
                  ? 'জরুরি আইনি তথ্যানুসন্ধান ও যোগাযোগের জন্য'
                  : 'Direct chamber inquiry and scheduling line'}
              </p>
            </div>
            <div className="mt-6">
              {config?.phone ? (
                <a
                  href={`tel:${config.phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-2 text-gold-primary hover:text-gold-hover font-semibold text-base transition-colors font-mono"
                >
                  <span>{config.phone}</span>
                </a>
              ) : (
                <span className="text-sm text-text-muted">
                  {locale === 'bn' ? 'যোগাযোগ নম্বর শীঘ্রই আসছে' : 'Official number via appointment'}
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Official Email */}
          <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-sm hover:border-gold-border/80 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gold-subtle border border-gold-border/60 flex items-center justify-center text-gold-primary">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-serif-editorial font-bold text-text-primary">
                {locale === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Chamber Email'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                {locale === 'bn'
                  ? 'মামলার নথি ও আইনি পত্রালাপের জন্য'
                  : 'Document submissions and formal correspondence'}
              </p>
            </div>
            <div className="mt-6">
              {config?.email ? (
                <a
                  href={`mailto:${config.email}`}
                  className="inline-flex items-center gap-2 text-gold-primary hover:text-gold-hover font-semibold text-sm break-all transition-colors"
                >
                  <span>{config.email}</span>
                </a>
              ) : (
                <span className="text-sm text-text-muted">info@nijamuddin.com</span>
              )}
            </div>
          </div>

          {/* Card 3: WhatsApp Direct */}
          <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-sm hover:border-gold-border/80 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-serif-editorial font-bold text-text-primary">
                {locale === 'bn' ? 'হোয়াটসঅ্যাপ মেসেজ' : 'WhatsApp Desk'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                {locale === 'bn'
                  ? 'সরকারি চেম্বার হোয়াটসঅ্যাপে বার্তা পাঠান'
                  : 'Chamber coordinator desk for appointment inquiries'}
              </p>
            </div>
            <div className="mt-6">
              {config?.whatsapp ? (
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors font-mono"
                >
                  <span>{config.whatsapp}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-sm text-text-muted">
                  {locale === 'bn' ? 'অনুরোধ সাপেক্ষে উপলব্ধ' : 'Available upon verification'}
                </span>
              )}
            </div>
          </div>

          {/* Card 4: Chambers Location */}
          <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-sm hover:border-gold-border/80 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gold-subtle border border-gold-border/60 flex items-center justify-center text-gold-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-serif-editorial font-bold text-text-primary">
                {locale === 'bn' ? 'চেম্বার অবস্থান' : 'Chamber Locations'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                {config?.city || 'Dhaka & Chattogram, Bangladesh'}
              </p>
            </div>
            <div className="mt-6">
              {config?.map_url ? (
                <a
                  href={config.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gold-primary hover:text-gold-hover font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>{locale === 'bn' ? 'মানচিত্র দেখুন' : 'View on Map'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs text-text-muted font-mono">
                  {resolveTrans(config?.address) || 'Supreme Court Bar Association, Dhaka'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Intake Form Container */}
        <div className="rounded-3xl bg-surface-card border border-border-subtle shadow-xl p-6 sm:p-10 relative overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border-subtle pb-6 gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif-editorial font-bold text-text-primary">
                {activeTab === 'inquiry'
                  ? locale === 'bn'
                    ? 'সাধারণ আইনি অনুসন্ধান'
                    : 'General Legal Inquiry'
                  : locale === 'bn'
                  ? 'আইনি পরামর্শ সভার অনুরোধ'
                  : 'Formal Consultation Booking Request'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                {activeTab === 'inquiry'
                  ? locale === 'bn'
                    ? 'চেম্বারের সাথে সরাসরি যোগাযোগ করতে নিচের ফর্মটি পূরণ করুন।'
                    : 'Submit preliminary case inquiries or chamber correspondence.'
                  : locale === 'bn'
                  ? 'মামলার নথি পর্যালোচনার জন্য নির্ধারিত সভার অনুরোধ পাঠান।'
                  : 'Request an in-person or chamber consultation regarding active legal matters.'}
              </p>
            </div>

            <div className="inline-flex p-1.5 rounded-xl bg-surface-elevated border border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inquiry');
                  setSuccessMessage(null);
                  setErrorMessage(null);
                  setFieldErrors({});
                }}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'inquiry'
                    ? 'bg-gold-primary text-background-primary font-bold shadow-md'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {locale === 'bn' ? 'সাধারণ বার্তা' : 'General Message'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('consultation');
                  setSuccessMessage(null);
                  setErrorMessage(null);
                  setFieldErrors({});
                }}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'consultation'
                    ? 'bg-gold-primary text-background-primary font-bold shadow-md'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {locale === 'bn' ? 'পরামর্শ অনুরোধ' : 'Book Consultation'}
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {successMessage && (
            <div className="mt-8 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start gap-4 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-emerald-300 text-base">
                  {locale === 'bn' ? 'সফলভাবে গৃহীত হয়েছে' : 'Submission Successfully Received'}
                </h4>
                <p className="text-sm mt-1 text-emerald-200/90 leading-relaxed">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-8 p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-4 animate-in fade-in">
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-rose-300 text-base">
                  {locale === 'bn' ? 'ত্রুটি পরিলক্ষিত হয়েছে' : 'Submission Alert'}
                </h4>
                <p className="text-sm mt-1 text-rose-200/90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* FORM 1: GENERAL INQUIRY */}
          {activeTab === 'inquiry' && (
            <form onSubmit={handleInquirySubmit} className="mt-8 space-y-6">
              {/* Invisible Honeypot */}
              <input
                type="text"
                name="_honeypot"
                value={inquiryForm._honeypot}
                onChange={(e) => setInquiryForm({ ...inquiryForm, _honeypot: e.target.value })}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="inquiry_name" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                  </label>
                  <input
                    id="inquiry_name"
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    placeholder={locale === 'bn' ? 'যেমন: মোহাম্মদ রহিম' : 'e.g. Adv. M. Rahman'}
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="inquiry_phone" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}
                  </label>
                  <input
                    id="inquiry_phone"
                    type="tel"
                    required
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    placeholder="+8801..."
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.phone[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="inquiry_email" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email Address (Optional)'}
                  </label>
                  <input
                    id="inquiry_email"
                    type="email"
                    value={inquiryForm.email || ''}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.email[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="inquiry_practice_area" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'আইনি অনুশীলনের ক্ষেত্র (ঐচ্ছিক)' : 'Practice Area (Optional)'}
                  </label>
                  <select
                    id="inquiry_practice_area"
                    value={inquiryForm.practice_area_id || ''}
                    onChange={(e) =>
                      setInquiryForm({
                        ...inquiryForm,
                        practice_area_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  >
                    <option value="">{locale === 'bn' ? '-- ক্ষেত্র নির্বাচন করুন --' : '-- Select Practice Area --'}</option>
                    {config?.practice_areas?.map((pa) => (
                      <option key={pa.id} value={pa.id}>
                        {resolveTrans(pa.title)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="inquiry_subject" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  {locale === 'bn' ? 'বিষয় *' : 'Subject *'}
                </label>
                <input
                  id="inquiry_subject"
                  type="text"
                  required
                  value={inquiryForm.subject}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                  placeholder={locale === 'bn' ? 'বার্তার সারসংক্ষেপ' : 'Brief subject of inquiry'}
                  className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                />
                {fieldErrors.subject && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.subject[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="inquiry_message" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  {locale === 'bn' ? 'বার্তা / বিবরণ *' : 'Message Details *'}
                </label>
                <textarea
                  id="inquiry_message"
                  required
                  rows={5}
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  placeholder={
                    locale === 'bn'
                      ? 'আপনার আইনি অনুসন্ধানের সংক্ষিপ্ত বিবরণ লিখুন...'
                      : 'Please describe the nature of your inquiry in detail...'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                />
                {fieldErrors.message && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.message[0]}</p>
                )}
              </div>

              {/* Legal Notice & Consent Checkbox */}
              <div className="p-4 rounded-xl bg-gold-subtle/30 border border-gold-border/50 flex items-start gap-3">
                <input
                  id="inquiry_consent"
                  type="checkbox"
                  required
                  checked={inquiryForm.consent}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, consent: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-gold-primary focus:ring-gold-primary border-border-medium bg-surface-elevated cursor-pointer"
                />
                <label htmlFor="inquiry_consent" className="text-xs text-text-muted leading-relaxed cursor-pointer select-none">
                  <span className="font-semibold text-gold-primary block mb-0.5">
                    {locale === 'bn' ? 'আইনি নোটিশ ও শর্তাবলী *' : 'Legal Notice & Non-Retainer Disclaimer *'}
                  </span>
                  {config?.legal_notice
                    ? resolveTrans(config.legal_notice)
                    : 'Submitting a message through this platform does not create an advocate-client relationship. Do not submit sensitive financial information, banking credentials, or passwords.'}
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting}
                  isLoading={submitting}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="px-8 shadow-xl cursor-pointer"
                >
                  {locale === 'bn' ? 'বার্তা পাঠান' : 'Transmit Inquiry'}
                </Button>
              </div>
            </form>
          )}

          {/* FORM 2: CONSULTATION REQUEST */}
          {activeTab === 'consultation' && (
            <form onSubmit={handleConsultationSubmit} className="mt-8 space-y-6">
              {/* Invisible Honeypot */}
              <input
                type="text"
                name="_honeypot"
                value={consultationForm._honeypot}
                onChange={(e) => setConsultationForm({ ...consultationForm, _honeypot: e.target.value })}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="consult_name" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                  </label>
                  <input
                    id="consult_name"
                    type="text"
                    required
                    value={consultationForm.name}
                    onChange={(e) => setConsultationForm({ ...consultationForm, name: e.target.value })}
                    placeholder={locale === 'bn' ? 'যেমন: মোহাম্মদ রহিম' : 'Full legal or corporate name'}
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="consult_phone" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}
                  </label>
                  <input
                    id="consult_phone"
                    type="tel"
                    required
                    value={consultationForm.phone}
                    onChange={(e) => setConsultationForm({ ...consultationForm, phone: e.target.value })}
                    placeholder="+8801..."
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.phone[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="consult_email" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email Address (Optional)'}
                  </label>
                  <input
                    id="consult_email"
                    type="email"
                    value={consultationForm.email || ''}
                    onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.email[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="consult_practice_area" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'আইনি অনুশীলনের ক্ষেত্র' : 'Legal Practice Area'}
                  </label>
                  <select
                    id="consult_practice_area"
                    value={consultationForm.practice_area_id || ''}
                    onChange={(e) =>
                      setConsultationForm({
                        ...consultationForm,
                        practice_area_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  >
                    <option value="">{locale === 'bn' ? '-- ক্ষেত্র নির্বাচন করুন --' : '-- Select Practice Area --'}</option>
                    {config?.practice_areas?.map((pa) => (
                      <option key={pa.id} value={pa.id}>
                        {resolveTrans(pa.title)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="consult_date" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'পছন্দনীয় তারিখ (অনুরোধ)' : 'Preferred Date (Requested Preference)'}
                  </label>
                  <input
                    id="consult_date"
                    type="date"
                    min={todayStr}
                    value={consultationForm.preferred_date || ''}
                    onChange={(e) => setConsultationForm({ ...consultationForm, preferred_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  />
                  {fieldErrors.preferred_date && (
                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.preferred_date[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="consult_time" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    {locale === 'bn' ? 'পছন্দনীয় সময়সূচি' : 'Preferred Time Window'}
                  </label>
                  <select
                    id="consult_time"
                    value={consultationForm.preferred_time || ''}
                    onChange={(e) => setConsultationForm({ ...consultationForm, preferred_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                  >
                    <option value="">{locale === 'bn' ? '-- সময়সীমা নির্বাচন করুন --' : '-- Select Preferred Window --'}</option>
                    <option value="Morning (10:00 AM - 1:00 PM)">
                      {locale === 'bn' ? 'সকাল (১০:০০ - ১:০০)' : 'Morning (10:00 AM - 1:00 PM)'}
                    </option>
                    <option value="Afternoon (2:00 PM - 5:00 PM)">
                      {locale === 'bn' ? 'দুপুর (২:০০ - ৫:০০)' : 'Afternoon (2:00 PM - 5:00 PM)'}
                    </option>
                    <option value="Evening (6:00 PM - 9:00 PM)">
                      {locale === 'bn' ? 'সন্ধ্যা (৬:০০ - ৯:০০)' : 'Evening (6:00 PM - 9:00 PM)'}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="consult_subject" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  {locale === 'bn' ? 'মামলার বিষয়বস্তু *' : 'Matter Subject *'}
                </label>
                <input
                  id="consult_subject"
                  type="text"
                  required
                  value={consultationForm.subject}
                  onChange={(e) => setConsultationForm({ ...consultationForm, subject: e.target.value })}
                  placeholder={locale === 'bn' ? 'যেমন: হাইকোর্ট ডিভিশন রিট পিটিশন' : 'e.g. Writ Petition / Civil Appeal'}
                  className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                />
                {fieldErrors.subject && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.subject[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="consult_message" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  {locale === 'bn' ? 'মামলার বিবরণ ও আইনি প্রেক্ষাপট *' : 'Case Background & Consultation Summary *'}
                </label>
                <textarea
                  id="consult_message"
                  required
                  rows={6}
                  value={consultationForm.message}
                  onChange={(e) => setConsultationForm({ ...consultationForm, message: e.target.value })}
                  placeholder={
                    locale === 'bn'
                      ? 'মামলার মূল প্রেক্ষাপট, বর্তমান পর্যায় ও আইনি প্রত্যাশা সংক্ষেপে তুলে ধরুন (কমপক্ষে ১৫ অক্ষর)...'
                      : 'Please outline the legal facts, current judicial forum, and desired relief in detail (minimum 15 characters)...'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-gold-primary/50 focus:border-gold-primary transition-all text-sm"
                />
                {fieldErrors.message && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.message[0]}</p>
                )}
              </div>

              {/* Legal Notice & Consent Checkbox */}
              <div className="p-4 rounded-xl bg-gold-subtle/30 border border-gold-border/50 flex items-start gap-3">
                <input
                  id="consult_consent"
                  type="checkbox"
                  required
                  checked={consultationForm.consent}
                  onChange={(e) => setConsultationForm({ ...consultationForm, consent: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-gold-primary focus:ring-gold-primary border-border-medium bg-surface-elevated cursor-pointer"
                />
                <label htmlFor="consult_consent" className="text-xs text-text-muted leading-relaxed cursor-pointer select-none">
                  <span className="font-semibold text-gold-primary block mb-0.5">
                    {locale === 'bn' ? 'পরামর্শ নীতি ও সতর্কীকরণ *' : 'Consultation Terms & Legal Disclaimer *'}
                  </span>
                  {config?.legal_notice
                    ? resolveTrans(config.legal_notice)
                    : 'I understand that submitting this consultation booking request does not constitute guaranteed appointment confirmation or an attorney-client relationship. Official chamber staff will review the file and contact you.'}
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting}
                  isLoading={submitting}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  className="px-8 shadow-xl cursor-pointer"
                >
                  {locale === 'bn' ? 'পরামর্শের অনুরোধ জমা দিন' : 'Submit Consultation Request'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Section 3: Prominent Chamber Ethics Notice */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-gold-subtle/40 via-surface-card to-surface-card border border-gold-border/50 text-text-secondary flex items-start gap-5">
          <ShieldAlert className="w-8 h-8 text-gold-primary shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-serif-editorial font-bold text-lg text-text-primary">
              {locale === 'bn' ? 'আইনি গোপনীয়তা ও যোগাযোগ নীতি' : 'Confidentiality & Ethical Intake Policy'}
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {locale === 'bn'
                ? 'আইনজীবী ও মক্কেলের পেশাগত মর্যাদা রক্ষার্থে সংবেদনশীল মামলার চূড়ান্ত নথি সরাসরি সাক্ষাৎ ব্যতিরেকে উন্মুক্ত পোর্টালে প্রকাশ করবেন না। প্রাথমিক পর্যালোচনার পর চেম্বার থেকে সময়সূচি ও চেম্বার নির্দেশিকা জানিয়ে দেয়া হবে।'
                : 'In accordance with Bangladesh Bar Council Canons of Professional Conduct, preliminary online intakes do not form formal representation. Confidential case files and evidence briefs should be presented in chamber upon scheduled appointment.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

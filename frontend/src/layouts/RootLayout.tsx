import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/navigation/Footer';
import { Modal } from '@/components/modals/Modal';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n';
import { useToast } from '@/components/feedback/Toast';

export const RootLayout: React.FC = () => {
  const { t, locale } = useTranslation();
  const { showToast } = useToast();
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const practiceAreaOptions = [
    { value: 'constitutional', label: locale === 'bn' ? 'সাংবিধানিক ও রিট মামলা' : 'Constitutional & Writ Matters' },
    { value: 'civil', label: locale === 'bn' ? 'দেওয়ানি ও বাণিজ্যিক মোকদ্দমা' : 'Civil & Commercial Disputes' },
    { value: 'appellate', label: locale === 'bn' ? 'সুপ্রিম কোর্ট আপিল ও রিভিশন' : 'Supreme Court Appellate Review' },
    { value: 'corporate', label: locale === 'bn' ? 'কোম্পানি ও কর্পোরেট পরামর্শ' : 'Corporate Governance & Advisory' },
    { value: 'banking', label: locale === 'bn' ? 'ব্যাংকিং ও অর্থঋণ ট্রাইব্যুনাল' : 'Banking & Artha Rin Adalat' },
  ];

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setConsultationModalOpen(false);
      showToast({
        type: 'success',
        title: locale === 'bn' ? 'অনুরোধ গৃহীত হয়েছে' : 'Request Transmitted',
        message:
          locale === 'bn'
            ? 'চেম্বার সচিবালয় শীঘ্রই আপনার সাথে যোগাযোগ করবে।'
            : 'Chamber Secretariat will contact you shortly to confirm the appointment.',
      });
    }, 900);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-primary text-text-primary">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-gold-primary text-background-primary font-bold text-xs uppercase tracking-wider rounded"
      >
        Skip to main judicial content
      </a>

      {/* Header */}
      <Header onConsultationClick={() => setConsultationModalOpen(true)} />

      {/* Main Viewport Content */}
      <main id="main-content" className="flex-1">
        <Outlet context={{ openConsultation: () => setConsultationModalOpen(true) }} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Reusable Consultation Intake Modal */}
      <Modal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        title={locale === 'bn' ? 'চেম্বার পরামর্শ সম্মেলন' : 'Supreme Court Chamber Consultation'}
        description={
          locale === 'bn'
            ? 'আইনি নথি পর্যালোচনা ও সরাসরি পরামর্শ বৈঠকের জন্য আবেদন করুন।'
            : 'Request a formal conference with Advocate Nijam Uddin (Haq) at the Supreme Court Bar.'
        }
        size="md"
      >
        <form onSubmit={handleConsultationSubmit} className="space-y-4">
          <Input
            label={t.forms.fullName}
            placeholder={t.forms.fullNamePlaceholder}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.forms.phone}
              placeholder={t.forms.phonePlaceholder}
              type="tel"
              required
            />
            <Input
              label={t.forms.email}
              placeholder={t.forms.emailPlaceholder}
              type="email"
              required
            />
          </div>

          <Select
            label={t.forms.selectPracticeArea}
            placeholder={locale === 'bn' ? 'কার্যক্ষেত্র নির্বাচন করুন' : 'Select Legal Specialization'}
            options={practiceAreaOptions}
            required
          />

          <Textarea
            label={t.forms.message}
            placeholder={t.forms.messagePlaceholder}
            rows={3}
            required
          />

          <p className="text-[11px] text-text-subtle italic">
            {t.forms.consultationNotice}
          </p>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConsultationModalOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
            >
              {t.forms.submitConsultation}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

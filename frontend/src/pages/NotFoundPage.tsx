import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { SeoHead } from '@/components/seo/SeoHead';
import { useTranslation } from '@/i18n';
import { Scale, Home, ArrowLeft, PhoneCall } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-20 bg-background-primary text-text-primary">
      <SeoHead
        title={locale === 'bn' ? 'পৃষ্ঠাটি পাওয়া যায়নি (৪০৪)' : 'Page Not Found (404)'}
        description={locale === 'bn' ? 'অনুরোধকৃত আইনি রেকর্ড বা পৃষ্ঠাটি পাওয়া যায়নি।' : 'The requested judicial record or page could not be located.'}
        robots="noindex, nofollow"
      />

      <Container size="prose">
        <div className="text-center space-y-8 max-w-xl mx-auto">
          {/* Judicial Emblem */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-elevated border border-gold-border/60 text-gold-primary shadow-gold-sm">
            <Scale className="w-10 h-10 stroke-[1.5]" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono tracking-widest uppercase text-gold-primary">
              Error 404 • Judicial Docket Notice
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-editorial font-bold text-text-primary tracking-tight">
              {locale === 'bn' ? 'পৃষ্ঠাটি বিদ্যমান নেই' : 'Record Not Found'}
            </h1>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              {locale === 'bn'
                ? 'আপনি যে নথি বা পৃষ্ঠাটি অনুসন্ধান করছেন তা স্থানান্তরিত, অপসারিত বা গোপনীয় হতে পারে।'
                : 'The legal brief, document, or archive path you requested may have been relocated, restricted, or archived.'}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Home className="w-4 h-4" />}
              onClick={() => navigate('/')}
            >
              {locale === 'bn' ? 'হোমপেজে ফিরে যান' : 'Return to Chamber Home'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/practice-areas')}
            >
              {locale === 'bn' ? 'আইনি ক্ষেত্রসমূহ' : 'Explore Practice Domains'}
            </Button>
          </div>

          <div className="pt-6 border-t border-border-subtle/80 flex items-center justify-center gap-2 text-xs text-text-subtle font-mono">
            <PhoneCall className="w-3.5 h-3.5 text-gold-primary" />
            <span>Chamber Registry Assistance: +880 1819-000000</span>
          </div>
        </div>
      </Container>
    </div>
  );
};

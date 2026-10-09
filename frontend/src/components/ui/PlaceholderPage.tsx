import React from 'react';
import { PageHeader } from './PageHeader';
import { Container } from './Container';
import { Section } from './Section';
import { Button } from './Button';
import { Shield, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n';

export interface PlaceholderPageProps {
  title: string;
  eyebrow?: string;
  description: string;
  phaseNote?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  eyebrow = 'Supreme Court Chamber',
  description,
  phaseNote = 'Module foundation established in Phase 2. Detailed domain implementation scheduled for subsequent phase.',
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <Section background="primary" spacing="lg">
        <Container>
          <div className="max-w-2xl mx-auto text-center p-8 sm:p-12 rounded-xl bg-surface border border-border-subtle space-y-6">
            <div className="w-16 h-16 rounded-full bg-surface-elevated border border-gold-border flex items-center justify-center text-gold-primary mx-auto">
              <Shield className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-serif-editorial font-bold text-text-primary">
                {title} Foundation Ready
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {phaseNote}
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <NavLink to="/">
                <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  {t.common.backToHome}
                </Button>
              </NavLink>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

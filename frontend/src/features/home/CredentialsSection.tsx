import React from 'react';
import { HomeSectionWrapper } from './HomeSectionWrapper';
import { CredentialCard } from '@/components/cards/CredentialCard';
import { useTranslation } from '@/i18n';
import { resolveLocalized } from '@/utils/localized';
import type { CredentialItem } from '@/types/profile';
import type { HomepageSection } from '@/types/cms';

export interface CredentialsSectionProps {
  credentials: CredentialItem[];
  sectionConfig?: HomepageSection;
}

export const CredentialsSection: React.FC<CredentialsSectionProps> = ({
  credentials,
  sectionConfig,
}) => {
  const { t, locale } = useTranslation();

  if (!credentials || credentials.length === 0) {
    return null;
  }

  const eyebrow = resolveLocalized(sectionConfig?.subtitle, locale) || t.sections.credentialsEyebrow;
  const title = resolveLocalized(sectionConfig?.title, locale) || t.sections.credentialsTitle;
  const description =
    resolveLocalized(sectionConfig?.content, locale) || t.sections.credentialsDescription;

  return (
    <HomeSectionWrapper
      id="credentials"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={t.sections.viewFullProfile}
      actionUrl="/about"
      className="bg-background-secondary"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {credentials.map((item) => (
          <CredentialCard
            key={item.id}
            category={item.category || 'professional'}
            title={resolveLocalized(item.title, locale)}
            institution={resolveLocalized(item.institution, locale)}
            year={item.year || undefined}
            credentialId={item.credential_id || undefined}
            isVerified={true}
          />
        ))}
      </div>
    </HomeSectionWrapper>
  );
};

import React from 'react';
import {
  Scale,
  Landmark,
  Shield,
  Briefcase,
  FileText,
  Scroll,
  Award,
  Users,
  Building,
  Gavel,
  BookOpen,
  Globe,
  LucideProps,
} from 'lucide-react';

export const APPROVED_PRACTICE_ICONS: Array<{ key: string; label: string }> = [
  { key: 'scale', label: 'Justice Scale' },
  { key: 'balance', label: 'Balance of Law' },
  { key: 'landmark', label: 'Court / Landmark' },
  { key: 'gavel', label: 'Judicial Gavel' },
  { key: 'shield', label: 'Constitutional Shield' },
  { key: 'briefcase', label: 'Corporate Briefcase' },
  { key: 'building', label: 'Commercial / Banking' },
  { key: 'file-text', label: 'Legal Document' },
  { key: 'scroll', label: 'Writ / Charter' },
  { key: 'award', label: 'Distinction / Merit' },
  { key: 'users', label: 'Family & Civil' },
  { key: 'book-open', label: 'Legal Treatise' },
  { key: 'globe', label: 'Cross-Border / Maritime' },
];

export interface PracticeAreaIconProps extends Omit<LucideProps, 'ref' | 'name'> {
  name?: string | null;
}

export const PracticeAreaIcon: React.FC<PracticeAreaIconProps> = ({
  name,
  className = 'w-5 h-5',
  ...props
}) => {
  const iconKey = (name || '').toLowerCase().trim();

  switch (iconKey) {
    case 'scale':
    case 'balance':
      return <Scale className={className} {...props} />;
    case 'landmark':
      return <Landmark className={className} {...props} />;
    case 'gavel':
      return <Gavel className={className} {...props} />;
    case 'shield':
      return <Shield className={className} {...props} />;
    case 'briefcase':
      return <Briefcase className={className} {...props} />;
    case 'building':
      return <Building className={className} {...props} />;
    case 'file-text':
      return <FileText className={className} {...props} />;
    case 'scroll':
      return <Scroll className={className} {...props} />;
    case 'award':
      return <Award className={className} {...props} />;
    case 'users':
      return <Users className={className} {...props} />;
    case 'book-open':
      return <BookOpen className={className} {...props} />;
    case 'globe':
      return <Globe className={className} {...props} />;
    default:
      return <Scale className={className} {...props} />;
  }
};

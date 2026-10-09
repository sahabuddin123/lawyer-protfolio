import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';
import { profileApi } from '@/api/profile';
import { ProfileData } from '@/types/profile';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';

export const AboutPage: React.FC = () => {
  const { locale } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await profileApi.getProfile();
        if (isMounted && res.success) {
          setProfile(res.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-legal-midnight py-24 text-legal-slate-200">
        <Container>
          <div className="flex flex-col items-center justify-center space-y-4 py-32 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-legal-gold-500 border-t-transparent" />
            <p className="font-serif text-lg tracking-wide text-legal-gold-400">
              {locale === 'bn' ? 'তথ্য লোড হচ্ছে...' : 'Loading Judicial Profile & Pedigree...'}
            </p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-legal-midnight py-24 text-legal-slate-200">
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

  const credentials = profile.credentials || [];
  const educations = profile.educations || [];
  const timeline = profile.timeline || [];
  const memberships = profile.memberships || [];

  return (
    <div className="min-h-screen bg-legal-midnight text-legal-slate-200">
      <SeoHead
        title={locale === 'bn' ? 'অ্যাডভোকেট নিজাম উদ্দিন (হক) সম্পর্কে | সুপ্রিম কোর্ট আইনজীবী' : 'About Advocate Nijam Uddin (Haq) | Supreme Court of Bangladesh'}
        description={resolveText(profile?.short_bio) || (locale === 'bn' ? 'অ্যাডভোকেট নিজাম উদ্দিন (হক)-এর পূর্ণাঙ্গ আইনি প্রোফাইল, শিক্ষা, সুপ্রিম কোর্টের প্র্যাকটিস ও অভিজ্ঞতা।' : 'Comprehensive legal profile, judicial credentials, education, and Supreme Court practice of Advocate Nijam Uddin (Haq).')}
        canonical="/about"
        ogType="profile"
        breadcrumbs={[
          { name: locale === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: locale === 'bn' ? 'পরিচিতি' : 'About', path: '/about' },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Advocate Nijam Uddin (Haq)',
          jobTitle: 'Advocate, Supreme Court of Bangladesh',
          alumniOf: 'University of Chittagong',
          url: 'https://nijamuddin.com/about',
        }}
      />
      {/* 1. Profile Hero Section */}
      <section className="relative overflow-hidden border-b border-legal-slate-800/80 bg-gradient-to-b from-legal-slate-900 via-legal-midnight to-legal-midnight py-16 lg:py-24">
        {/* Subtle Background Accent */}
        <div className="pointer-events-none absolute -right-48 -top-48 h-96 w-96 rounded-full bg-legal-gold-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-legal-slate-800/40 blur-3xl" />

        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Authority & Bio Overview */}
            <div className="lg:col-span-7">
              {/* Supreme Court Authority Eyebrow */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="gold" size="md">
                  <Scale className="mr-1.5 h-3.5 w-3.5" />
                  {resolveText(profile.title)}
                </Badge>
                {profile.bar_council_enrollment && (
                  <Badge variant="outline" size="md">
                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-legal-gold-400" />
                    {profile.bar_council_enrollment}
                  </Badge>
                )}
              </div>

              {/* Advocate Name */}
              <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {resolveText(profile.name)}
              </h1>

              {/* Subtitle / Headline */}
              {profile.subtitle && (
                <p className="mt-4 font-serif text-xl italic text-legal-gold-400/90 sm:text-2xl">
                  {resolveText(profile.subtitle)}
                </p>
              )}

              {/* Short Bio */}
              <p className="mt-6 text-base leading-relaxed text-legal-slate-300 sm:text-lg">
                {resolveText(profile.short_bio)}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center rounded bg-legal-gold-500 px-6 py-3 font-sans text-sm font-semibold tracking-wide text-legal-midnight transition hover:bg-legal-gold-400 focus:outline-none focus:ring-2 focus:ring-legal-gold-500 focus:ring-offset-2 focus:ring-offset-legal-midnight"
                >
                  {locale === 'bn' ? 'পরামর্শের জন্য যোগাযোগ' : 'Chamber Consultation'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center rounded border border-legal-slate-700 bg-legal-slate-900/60 px-5 py-3 font-sans text-sm font-medium text-legal-slate-200 transition hover:border-legal-gold-500/60 hover:text-white"
                  >
                    <Mail className="mr-2 h-4 w-4 text-legal-gold-400" />
                    {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex items-center rounded border border-legal-slate-700 bg-legal-slate-900/60 px-5 py-3 font-sans text-sm font-medium text-legal-slate-200 transition hover:border-legal-gold-500/60 hover:text-white"
                  >
                    <Phone className="mr-2 h-4 w-4 text-legal-gold-400" />
                    {profile.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Profile Presentation Portrait */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Decorative Gold Frame Accent */}
                <div className="absolute -inset-2 rounded-xl bg-gradient-to-tr from-legal-gold-600/30 via-transparent to-legal-gold-500/20 blur-sm" />
                <div className="relative overflow-hidden rounded-lg border border-legal-gold-500/40 bg-legal-slate-900 shadow-2xl">
                  {profile.profile_photo?.url ? (
                    <img
                      src={profile.profile_photo.url}
                      alt={resolveText(profile.name)}
                      className="h-auto w-full object-cover transition duration-300"
                    />
                  ) : (
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
                      <p className="mt-3 text-xs tracking-wider text-legal-slate-400 uppercase">
                        Supreme Court of Bangladesh
                      </p>
                    </div>
                  )}

                  {/* High Court Division / Bar Council Verification Badge */}
                  <div className="border-t border-legal-slate-800 bg-legal-slate-950/80 p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs font-medium text-legal-gold-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>
                        {locale === 'bn'
                          ? 'বাংলাদেশ বার কাউন্সিল প্রত্যয়িত আইনজীবী'
                          : 'Certified Practitioner — Bangladesh Bar Council'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Judicial Philosophy & Legal Approach Banner */}
      {(profile.philosophy || profile.legal_approach) && (
        <section className="border-b border-legal-slate-800/80 bg-legal-slate-900/40 py-12">
          <Container>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {profile.philosophy && (
                <div className="rounded-lg border border-legal-gold-500/20 bg-legal-slate-900/60 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-legal-gold-500/10 text-legal-gold-400">
                      <Scale className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      {locale === 'bn' ? 'বিচারিক দর্শন' : 'Judicial Philosophy'}
                    </h3>
                  </div>
                  <p className="mt-4 font-serif text-base italic leading-relaxed text-legal-slate-300">
                    &ldquo;{resolveText(profile.philosophy)}&rdquo;
                  </p>
                </div>
              )}

              {profile.legal_approach && (
                <div className="rounded-lg border border-legal-slate-800 bg-legal-slate-900/60 p-6">
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
            </div>
          </Container>
        </section>
      )}

      {/* 3. Authoritative Full Biography Section */}
      <section className="border-b border-legal-slate-800/80 py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
              <BookOpen className="h-4 w-4" />
              <span>{locale === 'bn' ? 'পূর্ণাঙ্গ জীবনবৃত্তান্ত' : 'Professional Biography'}</span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {locale === 'bn' ? 'আইনি সাধনা ও পেশাগত পথচলা' : 'Judicial Dedication & Advocacy'}
            </h2>

            {/* Rich Text Biography */}
            <div
              className="prose prose-invert prose-gold mt-8 max-w-none font-sans text-base leading-relaxed text-legal-slate-300"
              dangerouslySetInnerHTML={{ __html: resolveText(profile.long_bio) }}
            />
          </div>
        </Container>
      </section>

      {/* 4. Verified Credentials Section */}
      {credentials.length > 0 && (
        <section className="border-b border-legal-slate-800/80 bg-legal-slate-900/30 py-16 lg:py-20">
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                <Award className="h-4 w-4" />
                <span>{locale === 'bn' ? 'অনুমোদিত সনদ ও স্বীকৃতি' : 'Verified Credentials & Authorizations'}</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                {locale === 'bn' ? 'পেশাগত ও প্রাতিষ্ঠানিক সনদ' : 'Professional Distinctions'}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-legal-slate-400">
                {locale === 'bn'
                  ? 'বাংলাদেশ সুপ্রিম কোর্ট ও বার কাউন্সিল অনুমোদিত প্রাতিষ্ঠানিক সনদসমূহ।'
                  : 'Authoritative certifications and legal practice admissions.'}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {credentials.map((cred) => (
                <Card
                  key={cred.id}
                  className="flex flex-col justify-between border-legal-slate-800/90 bg-legal-slate-900/80 p-6 transition hover:border-legal-gold-500/50"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-legal-gold-500/10 px-2 py-1 text-xs font-semibold text-legal-gold-400 uppercase">
                        {cred.category}
                      </span>
                      {cred.year && <span className="text-xs text-legal-slate-400">{cred.year}</span>}
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-bold text-white">
                      {resolveText(cred.title)}
                    </h3>
                    <p className="mt-2 text-xs font-medium text-legal-gold-400/90">
                      {resolveText(cred.institution)}
                    </p>
                    {cred.description && (
                      <p className="mt-3 text-xs leading-relaxed text-legal-slate-400">
                        {resolveText(cred.description)}
                      </p>
                    )}
                  </div>
                  {cred.credential_id && (
                    <div className="mt-4 border-t border-legal-slate-800/80 pt-3 text-[11px] text-legal-slate-500">
                      ID: {cred.credential_id}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 5. Academic Pedigree (Education) */}
      {educations.length > 0 && (
        <section className="border-b border-legal-slate-800/80 py-16 lg:py-20">
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                <GraduationCap className="h-4 w-4" />
                <span>{locale === 'bn' ? 'শিক্ষা ও ডিগ্রি' : 'Academic Pedigree'}</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                {locale === 'bn' ? 'আইন শিক্ষাগত যোগ্যতা' : 'Legal Qualifications'}
              </h2>
            </div>

            <div className="mx-auto mt-12 max-w-3xl space-y-6">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="flex flex-col justify-between rounded-lg border border-legal-slate-800 bg-legal-slate-900/60 p-6 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-bold text-white">
                      {resolveText(edu.degree)}
                    </h3>
                    <p className="text-sm font-medium text-legal-gold-400">
                      {resolveText(edu.institution)}
                      {edu.department && (
                        <span className="text-legal-slate-400"> — {resolveText(edu.department)}</span>
                      )}
                    </p>
                    {edu.description && (
                      <p className="text-xs text-legal-slate-400">{resolveText(edu.description)}</p>
                    )}
                  </div>
                  {edu.year_completed && (
                    <div className="mt-4 sm:mt-0 sm:text-right">
                      <span className="rounded border border-legal-slate-700 bg-legal-slate-800 px-3 py-1 text-xs font-semibold text-legal-slate-300">
                        {edu.year_completed}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 6. Career Timeline (Rendered only if records exist) */}
      {timeline.length > 0 && (
        <section className="border-b border-legal-slate-800/80 bg-legal-slate-900/30 py-16 lg:py-20">
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                <Briefcase className="h-4 w-4" />
                <span>{locale === 'bn' ? 'পেশাগত সময়রেখা' : 'Career Milestones'}</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                {locale === 'bn' ? 'আইন অঙ্গনে পদচিহ্ন' : 'Professional Timeline'}
              </h2>
            </div>

            <div className="mx-auto mt-12 max-w-3xl space-y-6">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-lg border border-legal-slate-800 bg-legal-slate-900/60 p-6 pl-8"
                >
                  <div className="absolute left-3 top-7 h-2 w-2 rounded-full bg-legal-gold-400" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-legal-gold-400 uppercase">
                      {item.period}
                    </span>
                    {item.is_current && (
                      <Badge variant="gold" size="sm">
                        {locale === 'bn' ? 'বর্তমান' : 'Current'}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-2 font-serif text-lg font-bold text-white">
                    {resolveText(item.title)}
                  </h3>
                  <p className="text-sm font-medium text-legal-slate-300">
                    {resolveText(item.organization)}
                  </p>
                  {item.description && (
                    <p className="mt-2 text-xs text-legal-slate-400">
                      {resolveText(item.description)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 7. Professional Memberships (Rendered only if records exist) */}
      {memberships.length > 0 && (
        <section className="border-b border-legal-slate-800/80 py-16 lg:py-20">
          <Container>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                <Users className="h-4 w-4" />
                <span>{locale === 'bn' ? 'পেশাগত সদস্যপদ' : 'Professional Memberships'}</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                {locale === 'bn' ? 'বার ও সমিতি অন্তর্ভুক্তি' : 'Bar & Legal Associations'}
              </h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
              {memberships.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-legal-slate-800 bg-legal-slate-900/60 p-6"
                >
                  <h3 className="font-serif text-lg font-bold text-white">
                    {resolveText(m.organization)}
                  </h3>
                  <p className="mt-1 text-sm text-legal-gold-400">{resolveText(m.role)}</p>
                  {m.membership_number && (
                    <p className="mt-2 text-xs text-legal-slate-400">
                      No: {m.membership_number} {m.year_joined && `(${m.year_joined})`}
                    </p>
                  )}
                  {m.description && (
                    <p className="mt-2 text-xs text-legal-slate-400">{resolveText(m.description)}</p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 8. Chamber Locations & Contact Card */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="rounded-xl border border-legal-gold-500/30 bg-gradient-to-r from-legal-slate-900 via-legal-midnight to-legal-slate-900 p-8 lg:p-12">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="text-xs font-semibold tracking-wider text-legal-gold-400 uppercase">
                  {locale === 'bn' ? 'চেম্বার ও কার্যালয়' : 'Chamber Consultation'}
                </span>
                <h3 className="mt-2 font-serif text-3xl font-bold text-white">
                  {locale === 'bn' ? 'বিচারিক পরামর্শের জন্য যোগাযোগ' : 'Institutional Legal Chambers'}
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="flex items-center text-xs font-semibold text-legal-gold-400 uppercase">
                      <Building2 className="mr-1.5 h-4 w-4" />
                      {locale === 'bn' ? 'সুপ্রিম কোর্ট চেম্বার' : 'Supreme Court Chambers'}
                    </h4>
                    <p className="mt-2 text-sm text-legal-slate-300">
                      {resolveText(profile.chambers_address)}
                    </p>
                  </div>
                  <div>
                    <h4 className="flex items-center text-xs font-semibold text-legal-gold-400 uppercase">
                      <Building2 className="mr-1.5 h-4 w-4" />
                      {locale === 'bn' ? 'প্রধান কার্যালয়' : 'Principal Office'}
                    </h4>
                    <p className="mt-2 text-sm text-legal-slate-300">
                      {resolveText(profile.office_address)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-4 lg:col-span-4 lg:items-end">
                <Link
                  to="/contact"
                  className="inline-flex w-full items-center justify-center rounded bg-legal-gold-500 px-6 py-3 font-sans text-sm font-semibold text-legal-midnight transition hover:bg-legal-gold-400 sm:w-auto"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {locale === 'bn' ? 'সাক্ষাতের অনুরোধ' : 'Schedule Consultation'}
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
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

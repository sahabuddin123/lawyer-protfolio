import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { GoldDivider } from '@/components/ui/Divider';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { LazyImage } from '@/components/ui/LazyImage';

/* Cards */
import { PracticeAreaCard } from '@/components/cards/PracticeAreaCard';
import { CaseCard } from '@/components/cards/CaseCard';
import { ResearchCard } from '@/components/cards/ResearchCard';
import { PublicationCard } from '@/components/cards/PublicationCard';
import { MediaCard } from '@/components/cards/MediaCard';
import { VideoCard } from '@/components/cards/VideoCard';
import { GalleryCard } from '@/components/cards/GalleryCard';
import { CredentialCard } from '@/components/cards/CredentialCard';
import { EditorialCard } from '@/components/cards/EditorialCard';

/* Forms */
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { DatePicker } from '@/components/forms/DatePicker';
import { Checkbox } from '@/components/forms/Checkbox';
import { RadioGroup } from '@/components/forms/RadioGroup';
import { FileInput } from '@/components/forms/FileInput';
import { SearchInput } from '@/components/forms/SearchInput';

/* Navigation & Feedback */
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { Pagination } from '@/components/navigation/Pagination';
import { Filter } from '@/components/navigation/Filter';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { Skeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useToast } from '@/components/feedback/Toast';

/* Modals */
import { Modal } from '@/components/modals/Modal';
import { Lightbox, LightboxImage } from '@/components/modals/Lightbox';
import { VideoModal } from '@/components/modals/VideoModal';

/* Hero */
import { Hero } from '@/components/hero/Hero';

/* i18n */
import { useTranslation } from '@/i18n';

/* Icons */
import { Scale, Search } from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const { t, locale, toggleLocale, formatNumber } = useTranslation();
  const { showToast } = useToast();

  /* State for interactive testing */
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('Constitutional Writ');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [radioVal, setRadioVal] = useState('supreme');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const sampleGalleryImages: LightboxImage[] = [
    {
      src: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      alt: 'Supreme Court of Bangladesh Bench',
      caption: 'Appellate Division & High Court Division — Supreme Court of Bangladesh',
    },
    {
      src: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
      alt: 'Judicial Library Treatises',
      caption: 'Extensive Jurisprudential Reference Library & Legal Monographs',
    },
    {
      src: 'https://images.unsplash.com/photo-1453733190028-57a68841e40f?auto=format&fit=crop&w=1200&q=80',
      alt: 'Chambers Briefing Table',
      caption: 'Advocate Consultation Chambers & Formal Conference Desk',
    },
  ];

  return (
    <div className="w-full">
      {/* 1. Hero Foundation Showcase */}
      <Hero
        eyebrow={t.sections.heroEyebrow}
        title={t.sections.heroHeadline}
        subtitle={t.sections.heroSubheadline}
        description={t.sections.heroSummary}
        primaryCtaText={t.nav.bookConsultation}
        onPrimaryCtaClick={() => setModalOpen(true)}
        secondaryCtaText={locale === 'bn' ? 'ডিজাইন টোকেন পরিদর্শন' : 'Inspect Design System Tokens'}
        onSecondaryCtaClick={() => {
          document.getElementById('tokens-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        credentialsBadge="Advocate, Supreme Court of Bangladesh"
        experienceBadge="LL.B. (Hons), LL.M. (Univ. of Chittagong)"
        portraitUrl="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1000&q=80"
      />

      {/* 2. Overview Banner with Language Toggle */}
      <div id="tokens-section" className="bg-surface-elevated border-b border-border-subtle py-6">
        <Container wide>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
                <h2 className="text-base font-cinzel font-bold text-text-primary uppercase tracking-wider">
                  Phase 2 Verification Sandbox
                </h2>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Active Locale: <strong className="text-gold-primary uppercase font-mono">{locale}</strong> | 
                Case Count: <span className="font-mono text-gold-secondary">{formatNumber(42)}</span> | 
                Tokens: <span className="text-status-success">100% Centralized</span> | 
                Target: <span className="text-status-success">WCAG 2.1 AA</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleLocale}
              >
                Switch to {locale === 'en' ? 'বাংলা (Bengali)' : 'English'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  showToast({
                    type: 'info',
                    title: 'Design System Verified',
                    message: 'All 8 token specifications and component primitives are active.',
                  })
                }
              >
                Trigger System Toast
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* 3. Section: Color System Tokens */}
      <Section background="primary" spacing="md" hasBorderBottom>
        <Container>
          <SectionHeader
            eyebrow="Color Architecture"
            title="01. Centralized Semantic Color Tokens"
            description="Strict dark luxury palette with strategic metallic gold allocation (< 10% viewport surface) and high-contrast typography."
            align="left"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-lg bg-surface border border-border-subtle space-y-2">
              <div className="w-full h-12 rounded bg-background-primary border border-border-subtle" />
              <div className="text-xs">
                <span className="font-semibold block text-text-primary">Primary Canvas</span>
                <span className="font-mono text-text-subtle">#111111</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-border-subtle space-y-2">
              <div className="w-full h-12 rounded bg-background-secondary border border-border-subtle" />
              <div className="text-xs">
                <span className="font-semibold block text-text-primary">Secondary Canvas</span>
                <span className="font-mono text-text-subtle">#181818</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-border-subtle space-y-2">
              <div className="w-full h-12 rounded bg-surface border border-border-subtle" />
              <div className="text-xs">
                <span className="font-semibold block text-text-primary">Card Surface</span>
                <span className="font-mono text-text-subtle">#1E1E1E</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-border-subtle space-y-2">
              <div className="w-full h-12 rounded bg-surface-elevated border border-border-subtle" />
              <div className="text-xs">
                <span className="font-semibold block text-text-primary">Elevated Surface</span>
                <span className="font-mono text-text-subtle">#242424</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-border-subtle space-y-2">
              <div className="w-full h-12 rounded bg-gold-primary border border-gold-primary" />
              <div className="text-xs">
                <span className="font-semibold block text-gold-primary">Primary Gold</span>
                <span className="font-mono text-text-subtle">#D4A017</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-border-subtle space-y-2">
              <div className="w-full h-12 rounded bg-gold-secondary border border-gold-secondary" />
              <div className="text-xs">
                <span className="font-semibold block text-gold-secondary">Secondary Gold</span>
                <span className="font-mono text-text-subtle">#C59B27</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. Section: Typography Hierarchy & Avatars */}
      <Section background="secondary" spacing="md" hasBorderBottom>
        <Container>
          <SectionHeader
            eyebrow="Dual-Script Typography"
            title="02. Responsive Typography Scale & Font Families"
            description="Cinzel for judicial branding, Playfair Display for editorial headlines, Inter for modern interface readability, and Hind Siliguri for Bengali script."
            align="left"
          />

          <div className="space-y-6 bg-surface p-6 sm:p-8 rounded-lg border border-border-subtle">
            <div className="border-b border-border-subtle pb-4">
              <span className="text-xs font-mono text-gold-primary block mb-1">
                Display Title (Cinzel Bold, 56px / 36px)
              </span>
              <p className="text-3xl sm:text-5xl font-cinzel font-bold text-text-primary">
                {locale === 'bn' ? 'বাংলাদেশ সুপ্রিম কোর্ট আইনজীবী' : 'Supreme Court Jurisprudence'}
              </p>
            </div>

            <div className="border-b border-border-subtle pb-4">
              <span className="text-xs font-mono text-gold-primary block mb-1">
                H1 Heading (Playfair Display / Cinzel, 44px / 30px)
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif-editorial font-bold text-text-primary">
                {locale === 'bn' ? 'সাংবিধানিক সুরক্ষা ও ন্যায়বিচার প্রতিষ্ঠা' : 'Constitutional Review & Civil Litigation'}
              </h1>
            </div>

            <div className="border-b border-border-subtle pb-4">
              <span className="text-xs font-mono text-gold-primary block mb-1">
                H2 Section Header (Playfair Display, 32px / 24px)
              </span>
              <h2 className="text-xl sm:text-2xl font-serif-editorial font-semibold text-text-primary">
                {locale === 'bn' ? 'যুগান্তকারী রায়ের বিশ্লেষণ ও পর্যালোচনা' : 'Critical Analysis of Appellate Precedents'}
              </h2>
            </div>

            <div className="border-b border-border-subtle pb-4">
              <span className="text-xs font-mono text-gold-primary block mb-1">
                Body Large (Inter / Hind Siliguri, 18px / 16px)
              </span>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                {locale === 'bn'
                  ? 'অ্যাডভোকেট নিজাম উদ্দিন (হক) উচ্চ আদালতে জটিল আইনি প্রশ্নে দায়িত্বশীল এবং প্রজ্ঞাবান আইনি প্রতিনিধিত্ব নিশ্চিত করেন।'
                  : 'Advocate Nijam Uddin (Haq) provides meticulous legal representation across the Supreme Court of Bangladesh with authoritative constitutional briefing.'}
              </p>
            </div>

            <div className="border-b border-border-subtle pb-4">
              <span className="text-xs font-mono text-gold-primary block mb-1">
                Metadata & Footnotes (Inter / Hind Siliguri, 13px / 11px)
              </span>
              <p className="text-xs text-text-muted font-mono">
                {locale === 'bn'
                  ? 'বার কাউন্সিল তালিকাভুক্তি: অ্যাডভোকেট, সুপ্রিম কোর্ট • সনদ সংখ্যা: ৪১০২/২০১৬'
                  : 'Enrolled Advocate, Bangladesh Bar Council • Citation: (2024) 76 DLR (AD) 184'}
              </p>
            </div>

            {/* Avatar Scale Demo */}
            <div>
              <span className="text-xs font-mono text-gold-primary block mb-3">
                Avatar Hierarchy (with Gold Rims)
              </span>
              <div className="flex items-center gap-4">
                <Avatar size="sm" alt="Nijam Uddin" initials="NU" />
                <Avatar size="md" alt="Nijam Uddin" initials="NU" />
                <Avatar size="lg" alt="Nijam Uddin" initials="NU" />
                <Avatar size="xl" alt="Nijam Uddin" initials="NU" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. Section: Button System */}
      <Section background="primary" spacing="md" hasBorderBottom>
        <Container>
          <SectionHeader
            eyebrow="Interactive Elements"
            title="03. Button System & State Hierarchy"
            description="Polished metallic gold primary, hairline gold secondary outline, transparent ghost, and accessible text link."
            align="left"
          />

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg">
                Primary Gold (LG)
              </Button>
              <Button variant="primary" size="md">
                Primary Gold (MD)
              </Button>
              <Button variant="primary" size="sm">
                Primary Gold (SM)
              </Button>
              <Button variant="primary" size="md" isLoading>
                Loading State
              </Button>
              <Button variant="primary" size="md" disabled>
                Disabled
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button variant="secondary" size="lg">
                Secondary Outline (LG)
              </Button>
              <Button variant="secondary" size="md">
                Secondary Outline (MD)
              </Button>
              <Button variant="secondary" size="sm">
                Secondary Outline (SM)
              </Button>
              <Button variant="secondary" size="md" disabled>
                Secondary Disabled
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button variant="ghost" size="md">
                Ghost Button
              </Button>
              <Button variant="link" size="md">
                Editorial Text Link
              </Button>
              <IconButton
                aria-label="Scales of Justice"
                variant="secondary"
                size="md"
                icon={<Scale className="w-5 h-5 text-gold-primary" />}
              />
              <IconButton
                aria-label="Search records"
                variant="ghost"
                size="md"
                icon={<Search className="w-5 h-5" />}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* 6. Section: Card System Matrix */}
      <Section background="secondary" spacing="md" hasBorderBottom>
        <Container wide>
          <SectionHeader
            eyebrow="Card Taxonomy"
            title="04. Reusable Card System"
            description="Consistent dark surface ergonomics with subtle top gold accents, hairline borders, and specialized editorial metadata."
            align="left"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Practice Area Card */}
            <PracticeAreaCard
              number={1}
              title={locale === 'bn' ? 'সাংবিধানিক ও রিট মামলা' : 'Constitutional & Writ Jurisdiction'}
              description={locale === 'bn' ? 'মৌলিক অধিকার সুরক্ষা ও প্রশাসনিক ট্রাইব্যুনাল সংক্রান্ত বিষয়ে সুপ্রিম কোর্টে রিট পিটিশন।' : 'Challenging ultra vires statutory actions, administrative decisions, and enforcing fundamental constitutional guarantees.'}
              icon={<Scale className="w-5 h-5" />}
              onClick={() => showToast({ type: 'info', title: 'Practice Domain Selected' })}
            />

            {/* Case Card */}
            <CaseCard
              court="High Court Division"
              year={2023}
              legalArea="Writ Jurisdiction"
              caseNumber="Writ Petition No. 4102 of 2021"
              title={locale === 'bn' ? 'প্রশাসনিক ট্রাইব্যুনাল আদেশ পুনর্বিবেচনা' : 'Judicial Review of Administrative Tribunal Directives'}
              summary="Represented petitioners seeking mandamus directions regarding government service benefits and pension entitlements."
              onReadCase={() => showToast({ type: 'info', title: 'Opening Courtroom Brief' })}
            />

            {/* Research Card */}
            <ResearchCard
              category="Constitutional Law"
              date="October 2024"
              readTime="8 min read"
              author="Advocate Nijam Uddin"
              title={locale === 'bn' ? 'সংবিধানের ১০২ অনুচ্ছেদের প্রায়োগিক বিশ্লেষণ' : 'Judicial Review under Article 102: Evolutions in Jurisprudence'}
              excerpt="A critical examination of emergent doctrines concerning locus standi in public interest writ litigation before the Supreme Court."
              onReadArticle={() => showToast({ type: 'info', title: 'Opening Legal Treatise' })}
            />

            {/* Credential Card */}
            <CredentialCard
              category="academic"
              title="Master of Laws (LL.M.)"
              institution="Faculty of Law, University of Chittagong"
              year="Class of 2014"
              credentialId="CU-LAW-8941"
              isVerified
            />

            {/* Publication Card */}
            <PublicationCard
              title="Procedural Law in the Appellate Division"
              publicationType="Law Journal"
              publicationName="Chittagong University Law Gazette"
              date="2022"
              author="Nijam Uddin (Haq)"
              onReadMore={() => showToast({ type: 'info', title: 'Opening Publication Details' })}
            />

            {/* Video Card */}
            <VideoCard
              thumbnailUrl="https://images.unsplash.com/photo-1453733190028-57a68841e40f?auto=format&fit=crop&w=800&q=80"
              title="Panel Discussion on Fundamental Human Rights & Rule of Law"
              category="TV Broadcast"
              duration="24:18"
              date="Nov 2023"
              onPlay={() => setVideoModalOpen(true)}
            />

            {/* Media Card */}
            <MediaCard
              mediaName="The Daily Star"
              date="March 14, 2024"
              title="Legal Perspective on Financial Securities & Artha Rin Adalat Proceedings"
              description="Advocate Nijam Uddin offers critical insights into statutory stay petitions in high-value banking loan recoveries."
              onReadMore={() => showToast({ type: 'info', title: 'Opening Media Summary' })}
            />

            {/* Gallery Card */}
            <GalleryCard
              coverUrl="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
              title="Supreme Court Bar Association Annual General Meeting"
              photoCount={14}
              date="2024"
              onClick={() => setLightboxOpen(true)}
            />

            {/* Base Card Composition */}
            <Card withTopGoldBorder className="p-6 flex flex-col justify-between">
              <CardHeader className="p-0 mb-3">
                <Badge variant="gold" size="sm" className="mb-2">
                  Chambers Credo
                </Badge>
                <CardTitle>Professional Philosophy</CardTitle>
                <CardDescription>
                  "Upholding the sacred trust between advocate and client through forensic preparation, scholarly precision, and absolute integrity."
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-0 pt-4 mt-4">
                <span className="font-serif-editorial text-xs text-gold-secondary italic">
                  Advocate Nijam Uddin (Haq)
                </span>
                <span className="text-xs text-text-subtle font-mono">Supreme Court</span>
              </CardFooter>
            </Card>
          </div>

          {/* Featured Editorial Card Showcase */}
          <div className="mt-8">
            <EditorialCard
              eyebrow="Special Judicial Feature"
              title="Balancing Administrative Discretion & Judicial Review in Public Law"
              excerpt="An exhaustive review of contemporary High Court Division pronouncements analyzing the bounds of bureaucratic action and the doctrine of proportionality under Bangladeshi jurisprudence."
              quote="The court does not substitute its administrative wisdom, but stands as an uncompromising sentinel against arbitrary overreach."
              authorOrDate="Published by Advocate Nijam Uddin (Haq) • July 2024"
              onCtaClick={() => showToast({ type: 'info', title: 'Opening Editorial Spread' })}
            />
          </div>

          <div className="mt-8">
            <GoldDivider withEmblem />
          </div>

          {/* LazyImage Aspect Ratio Matrix Demo */}
          <div className="mt-8">
            <span className="text-xs font-mono text-gold-primary uppercase tracking-wider block mb-4">
              Standardized Image Aspect Ratios (with Dark Shimmer Placeholders)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] font-mono text-text-subtle block mb-1">16:9 Landscape</span>
                <LazyImage
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80"
                  alt="Supreme Court Architecture"
                  aspectRatio="16/9"
                  className="rounded border border-border-subtle"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono text-text-subtle block mb-1">4:3 Journal</span>
                <LazyImage
                  src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=400&q=80"
                  alt="Law Library"
                  aspectRatio="4/3"
                  className="rounded border border-border-subtle"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono text-text-subtle block mb-1">3:4 Portrait</span>
                <LazyImage
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=400&q=80"
                  alt="Advocate Portrait"
                  aspectRatio="3/4"
                  objectPosition="top center"
                  className="rounded border border-border-subtle"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono text-text-subtle block mb-1">1:1 Square</span>
                <LazyImage
                  src="https://images.unsplash.com/photo-1453733190028-57a68841e40f?auto=format&fit=crop&w=400&q=80"
                  alt="Chambers Office"
                  aspectRatio="1/1"
                  className="rounded border border-border-subtle"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 7. Section: Form Intake System */}
      <Section background="primary" spacing="md" hasBorderBottom>
        <Container>
          <SectionHeader
            eyebrow="Form Intake Architecture"
            title="05. Accessible Form Controls & Validation States"
            description="Dark theme inputs, select dropdowns, multi-line auto-resizing textareas, accessible checkboxes, radio groups, and file uploaders."
            align="left"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Column 1 */}
            <div className="space-y-4 bg-surface p-6 rounded-lg border border-border-subtle">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-primary mb-4">
                Standard Input States
              </h3>

              <Input
                label="Full Client Name"
                placeholder="e.g. Barrister / Mr. / Ms."
                defaultValue="Mohammad Rafiqul Islam"
                isSuccess
                helperText="Verified legal name"
              />

              <Input
                label="Case Brief Title (Error State Demo)"
                defaultValue="Invalid"
                error="Case title must contain at least 10 characters."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DatePicker
                  label="Conference Date"
                  defaultValue="2026-10-15"
                />
                <Select
                  label="Legal Domain"
                  options={[
                    { value: 'const', label: 'Constitutional Law' },
                    { value: 'civil', label: 'Civil Litigation' },
                    { value: 'appellate', label: 'Appellate Review' },
                  ]}
                  defaultValue="const"
                />
              </div>

              <Textarea
                label="Factual Summary of Dispute"
                placeholder="Outline case facts..."
                rows={3}
                maxLength={200}
                showCharCount
                defaultValue="Brief summary concerning civil title dispute and High Court status quo injunction application."
              />
            </div>

            {/* Form Column 2 */}
            <div className="space-y-4 bg-surface p-6 rounded-lg border border-border-subtle">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-primary mb-4">
                Specialized Intake Controls
              </h3>

              <SearchInput
                value={searchVal}
                onChange={setSearchVal}
                placeholder="Search case citations or precedents..."
              />

              <FileInput
                label="Litigation Documents Attachment"
                helperText="Upload writ petition drafts or judgment copies"
              />

              <RadioGroup
                name="jurisdiction"
                label="Selected Forum / Bench"
                value={radioVal}
                onChange={setRadioVal}
                options={[
                  {
                    value: 'supreme',
                    label: 'Supreme Court of Bangladesh (High Court / Appellate)',
                    description: 'Direct constitutional writ petitions, appeals, and revision briefs',
                  },
                  {
                    value: 'tribunal',
                    label: 'Administrative Tribunal / Specialized Court',
                    description: 'Service tribunals, tax appellate tribunals, and labor courts',
                  },
                ]}
              />

              <Checkbox
                label="I confirm that all provided details are accurate and acknowledge advocate-client privilege protections."
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* 8. Section: Navigation, Feedback & Overlays */}
      <Section background="secondary" spacing="md">
        <Container>
          <SectionHeader
            eyebrow="Utilities & Feedback"
            title="06. Navigation Primitives, Loaders & Modals"
            description="Breadcrumbs, pagination, pill filters, dark shimmering skeletons, and accessible modal overlays."
            align="left"
          />

          <div className="space-y-10">
            {/* Breadcrumb & Filter */}
            <div className="space-y-4">
              <span className="text-xs font-mono text-gold-primary uppercase tracking-wider block">
                Breadcrumbs & Category Filters
              </span>
              <Breadcrumb
                items={[
                  { label: 'Supreme Court Practice', href: '#' },
                  { label: 'Courtroom Briefs', href: '#' },
                  { label: 'Writ Petition No. 4102 of 2021' },
                ]}
              />
              <Filter
                options={[
                  { id: 'all', label: 'All Jurisdictions', count: 42 },
                  { id: 'writ', label: 'Constitutional Writs', count: 18 },
                  { id: 'civil', label: 'Civil Appeals', count: 12 },
                  { id: 'corporate', label: 'Corporate Disputes', count: 7 },
                  { id: 'research', label: 'Research Treatises', count: 5 },
                ]}
                activeId={activeFilter}
                onSelect={setActiveFilter}
              />
            </div>

            {/* Pagination */}
            <div>
              <span className="text-xs font-mono text-gold-primary uppercase tracking-wider block mb-2">
                Accessible Pagination Controls
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Skeletons & Loaders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="p-6 rounded-lg bg-surface border border-border-subtle flex flex-col items-center justify-center space-y-3">
                <LoadingSpinner size="lg" label="Retrieving Supreme Court Records..." />
              </div>

              <div className="p-6 rounded-lg bg-surface border border-border-subtle space-y-3">
                <Skeleton variant="rectangular" height={16} width="60%" />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <div className="flex gap-2 pt-2">
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="rectangular" width={80} height={32} />
                </div>
              </div>

              <div className="p-6 rounded-lg bg-surface border border-border-subtle flex flex-col items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setModalOpen(true)}
                >
                  Open Accessible Modal
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setLightboxOpen(true)}
                >
                  Open Image Lightbox
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setVideoModalOpen(true)}
                >
                  Open Video Overlay
                </Button>
              </div>
            </div>

            {/* Empty & Error States */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                title="No Judicial Precedents Found"
                description="No judgment review records match your selected constitutional filter."
                actionText="Reset Filter Options"
                onAction={() => setActiveFilter('all')}
              />

              <ErrorState
                title="Supreme Court API Connectivity"
                message="Temporary disruption communicating with the bar records database."
                onRetry={() => showToast({ type: 'success', title: 'Connection Re-established' })}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Interactive Lightbox Instance */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={sampleGalleryImages}
      />

      {/* Interactive Video Modal Instance */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        title="Broadcast: Constitutional Advocacy in the Supreme Court"
      />

      {/* Interactive Test Modal Instance */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Verified Chamber Conference Modal"
        description="This modal demonstrates accessible focus management, ESC key handling, backdrop blurring, and responsive clamping."
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            All interactive dialogs within the Advocate Nijam Uddin (Haq) platform comply with WCAG 2.1 AA requirements, preventing background scroll and enabling seamless keyboard operation.
          </p>

          <Input
            label="Inquirer Full Name"
            placeholder="Mohammad Rahman"
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                showToast({ type: 'success', title: 'Conference Scheduled' });
              }}
            >
              Confirm Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

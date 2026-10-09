# Publications Public User Interface Design (Phase 11)

## 1. Aesthetic Direction: Premium Legal Editorial
The Publications UI adheres to the high-authority visual language of the platform:
- **Palette**: Deep slate/charcoal background (`#07090e`), warm neutral cards, rich legal gold accents (`text-legal-gold`, borders, badges), and crisp white serif titles.
- **Typography**: Editorial serifs for page titles and dossier headings; crisp, highly legible sans-serif for long-form reading; monospace for citations, slugs, and dates.
- **Reading Comfort**: Constrained reading container (`max-w-5xl`), proportional line heights, distinct callout styling for abstracts, and responsive image scaling.

## 2. Public Publications Listing (`/publications`)
- **Hero / Header**:
  - Eyebrow: *Legal Treatises & Scholarship* / *গ্রন্থপঞ্জি ও প্রাতিষ্ঠানিক গবেষণা*
  - Title: *Publications & Legal Monograph Archive* / *আইনি প্রকাশনা ও গবেষণা মনোগ্রাফ*
  - Description: Contextual framing emphasizing rigorous scholarship and legal authority.
- **Toolbar**:
  - Live keyword search input with debouncing.
  - Publication type dropdown filter (Book, Journal Article, Research Paper, etc.).
  - Category dropdown filter.
  - Tag dropdown filter.
  - Reset filters action.
- **Card Grid**:
  - Publication type badge with subtle gold border.
  - Featured badge indicator.
  - Bilingual title resolution with hover transition.
  - Author and publisher metadata with icons.
  - Abstract / excerpt preview (3 lines max clamp).
  - PDF and External link availability indicators.
  - "Read Dossier" / "বিস্তারিত দেখুন" call-to-action button.
- **Pagination**:
  - Accessible Previous / Next buttons and numbered page chips.

## 3. Public Publication Dossier (`/publications/:slug`)
- **Breadcrumb Navigation**: Home > Publications > [Publication Title].
- **Header**:
  - Type, Category, and Featured badges.
  - Prominent title in responsive serif type.
  - Metadata bar: Author, Published Source, Publication Date, and One-Click "Copy Link" sharing button.
- **Cover Artwork**: Displays high-resolution front cover image if assigned, with proper alt text.
- **Abstract Callout Box**: Stylized gold left-bordered quote section highlighting the treatise summary.
- **Full Text / Table of Contents**: Complete editorial article, chapters, or syllabus rendered from sanitized HTML.
- **Verified Documents & Citation Access Box**:
  - Full PDF Download button with direct streamed download.
  - External publisher portal button (opens securely with `rel="noopener noreferrer"`).
- **Subject Tags**: Hash-tagged pills reflecting academic taxonomy.
- **Related Treatises**: Up to 3 related works for continuous scholarly discovery.
- **Back to Publications Archive**: Prominent navigation back to listing.

## 4. Responsive Verification
Fully responsive across:
- 320px (iPhone SE)
- 375px (Standard mobile)
- 768px (Tablet portrait)
- 1024px (Tablet landscape / Laptop)
- 1440px / 1920px (Desktop / 4K displays)

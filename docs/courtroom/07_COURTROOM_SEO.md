# Courtroom Experiences — SEO & Search Architecture

## 1. Overview
The courtroom module leverages the platform's polymorphic `SeoMeta` engine (`HasSeo` trait) to ensure high search ranking on judicial precedents without misleading or promotional keyword stuffing.

## 2. Dynamic Metadata
Every published courtroom experience provides:
- **Meta Title:** Formatted dynamically: `{Case Title} | Case Precedents | Advocate Nijam Uddin`.
- **Meta Description:** Concise executive summary highlighting legal field and court jurisdiction.
- **Canonical URL:** Canonical URL pointing to `https://nijamuddin.com/courtroom/{slug}` with override capability.
- **OpenGraph & Twitter Card:** Title, description, and courtroom featured asset for social sharing.
- **Hreflang Tags:**
  - `en-bd`: `https://nijamuddin.com/courtroom/{slug}`
  - `bn-bd`: `https://nijamuddin.com/courtroom/{slug}?lang=bn`
  - `x-default`: `https://nijamuddin.com/courtroom/{slug}`

## 3. Automated 301 Redirect Architecture
When an administrator modifies the slug of a published courtroom experience:
1. The system detects the change (`$oldSlug !== $newSlug`).
2. An automatic 301 Permanent Redirect is generated in the `redirects` table (`/courtroom/{oldSlug}` → `/courtroom/{newSlug}`).
3. An audit log (`redirect_created`) is recorded.
4. Old cache entries for both `$oldSlug` and `$newSlug` are purged immediately.
5. Inbound backlinks and search engine index authority are preserved without broken 404 links.

## 4. Structured Data
Follows semantic legal editorial representations without promotional claims or unverified outcome assertions.

# 10. Contact Search Engine Optimization & Indexing Safeguards

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** SEO Specialist & Solution Architect  
**Page Route:** `/contact`

---

## 1. Public Metadata & Canonical URL

The public `/contact` page features localized metadata:
- **Title (EN):** Contact & Legal Consultation | Advocate Nijam Uddin
- **Title (BN):** যোগাযোগ ও আইনি পরামর্শ | অ্যাডভোকেট নিজাম উদ্দিন
- **Description:** Official chambers and legal consultation intake for Advocate Nijam Uddin, Supreme Court of Bangladesh and District Court, Chittagong.
- **Canonical:** `https://nijamuddin.com/contact`

---

## 2. Indexing Safety & Private Submissions

1. **Zero Public Submissions URLs:**
   - Neither `ContactMessage` nor `ConsultationRequest` entities have public detail URLs or sitemap entries.
   - All client inquiries are private, non-indexable, write-only submissions.
2. **Admin Console Indexing Blocking:**
   - All admin routes under `/admin/cms` and `/admin/contacts` / `/admin/consultations` are strictly behind authentication and protected with standard `X-Robots-Tag: noindex, nofollow, noarchive`.

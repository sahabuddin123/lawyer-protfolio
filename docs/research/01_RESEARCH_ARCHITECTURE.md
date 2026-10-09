# 01. Legal Research Module — Architecture & Technical Specifications

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 9 — Legal Research & Monographs  
**Scope:** Architectural blueprint, domain entities, taxonomy integration, security posture, and lifecycle workflows.

---

## 1. Architectural Overview

The **Legal Research Module** provides a high-integrity, authoritative repository for peer-reviewed treatises, comparative constitutional analyses, statutory interpretations, case commentary, and academic monographs authored by Advocate Nijam Uddin (Haq) and affiliated legal scholars.

In accordance with strict legal content safety directives, this module is engineered to prevent the fabrication or automated generation of legal opinions, case citations, statutory sections, or judicial quotes. All research entries are explicitly entered, verified, and audited by authenticated administrative personnel.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LEGAL RESEARCH MODULE TOPOLOGY                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
    ┌───────────────────────────┐             ┌───────────────────────────┐
    │     Public API & Web      │             │    Admin Back-Office      │
    │  (/api/v1/research/*)     │             │  (/api/v1/admin/research) │
    └─────────────┬─────────────┘             └─────────────┬─────────────┘
                  │                                         │
                  │ (Published & Public Only)               │ (Sanctum + RBAC)
                  ▼                                         ▼
    ┌───────────────────────────┐             ┌───────────────────────────┐
    │   Cache Layer (Redis)     │             │    HTML Sanitization      │
    │   24h TTL Key Invalidation│             │  (Purify Script/Event/XSS)│
    └─────────────┬─────────────┘             └─────────────┬─────────────┘
                  │                                         │
                  └────────────────────┬────────────────────┘
                                       ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                 Eloquent Model: LegalResearch                           │
    │  - Categories (Taxonomy FK)              - SEO Meta (Polymorphic)       │
    │  - Taggables (Polymorphic Pivot)         - ActivityLog (Audit Trail)    │
    │  - Featured Image (Media FK)             - Redirects (Auto 301 on Slug) │
    │  - PDF Document (Media FK)               - SoftDeletes                  │
    └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles

1. **Authoritative Legal Accuracy & Safety:**  
   Zero AI hallucination or fabricated legal doctrine. The system maintains an empty state whenever verified research data is absent. Fixtures strictly utilize standardized `TEST — Legal Research` signatures.
2. **Strict Multi-Tier Visibility:**  
   Records follow a two-factor exposure model:
   - `status`: `draft` | `published` | `archived`
   - `visibility`: `public` | `private`
   Only items that are simultaneously `status = 'published'` and `visibility = 'public'` are exposed to public endpoints or search engines.
3. **Bilingual JSON Localization:**  
   All content entities (`title`, `author`, `excerpt`, `content`) are modeled as bilingual JSON structures (`en`, `bn`), resolved on-the-fly via the `HasTranslations` trait and localized resources based on request headers (`Accept-Language`).
4. **Decoupled Media & Document Security:**  
   Cover imagery and PDF research treatises leverage the centralized `media` repository. Downloads are mediated via dedicated controller actions (`downloadPdf`) enforcing file signature validation, anti-sniffing headers (`X-Content-Type-Options: nosniff`), and parent visibility checks.
5. **Slug Stability & SEO Redirection:**  
   Slug changes on published monographs automatically create permanent 301 redirects in the `redirects` table and log audit actions to prevent broken academic citations.

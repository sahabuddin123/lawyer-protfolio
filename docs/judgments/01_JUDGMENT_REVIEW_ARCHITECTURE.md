# 01. Judgment Reviews Module — Architecture & Technical Specifications

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 10 — Judgment Reviews & Judicial Analysis  
**Scope:** Architectural blueprint, domain entities, taxonomy integration, security posture, and lifecycle workflows.

---

## 1. Architectural Overview

The **Judgment Reviews Module** provides an authoritative, analytically rigorous platform for case commentary, appellate review analysis, ratio decidendi dissection, and constitutional/statutory evaluation of landmark and notable judgments delivered by the Supreme Court of Bangladesh (Appellate Division & High Court Division) and other competent judicial forums.

In accordance with strict legal accuracy standards, this module enforces an unambiguous architectural boundary between:
1. **The Court's Official Decision & Ratio Decidendi:** The authoritative, unedited judicial holding pronounced by the Bench.
2. **The Author's Analysis & Scholarly Commentary:** Independent editorial evaluation, comparative precedent dissection, and doctrinal analysis by Advocate Nijam Uddin (Haq).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      JUDGMENT REVIEWS MODULE TOPOLOGY                       │
│                                                                             │
│                     ┌─────────────────────────────────┐                     │
│                     │       Database Entity           │                     │
│                     │       judgment_reviews          │                     │
│                     └────────────────┬────────────────┘                     │
│                                      │                                      │
│        ┌─────────────────────────────┼─────────────────────────────┐        │
│        ▼                             ▼                             ▼        │
│ ┌──────────────┐             ┌──────────────┐             ┌──────────────┐  │
│ │PracticeArea  │             │Category / Tag│             │LegalResearch │  │
│ │(BelongsTo)   │             │(Taxonomies)  │             │(BelongsTo)   │  │
│ └──────────────┘             └──────────────┘             └──────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                  ┌────────────────────┴────────────────────┐
                  ▼                                         ▼
     ┌───────────────────────────┐             ┌───────────────────────────┐
     │     Public API & Web      │             │    Admin Back-Office      │
     │  (/api/v1/judgments/*)    │             │ (/api/v1/admin/judgments) │
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
     ┌─────────────────────────────────────────────────────────────────────┐
     │                Eloquent Model: JudgmentReview                       │
     │  - Case Metadata & Citation              - Ratio Decidendi (Holding)│
     │  - Court & Judgment Date                 - Author's Editorial Review│
     │  - Practice Area & Legal Area            - Practical Significance   │
     │  - Featured Image & PDF Document Media   - SEO Meta & Redirects     │
     └─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles

1. **Strict Legal Accuracy & Non-Fabrication:**  
   No AI hallucinations, automated case summaries, or invented case citations. Case names, citations (DLR, BLD, BLC, MLR), court forums, judgment dates, and judicial outcomes are administrator-entered and verified. Test fixtures strictly utilize explicit `TEST — Judgment Review` indicators.
2. **Rigid Separation of Official Decision vs. Editorial Commentary:**  
   The data model and user interface strictly segregate `court_decision` (official Bench holding) from `author_analysis` (editorial scholarly commentary). They are stored in separate attributes and rendered under distinct visual containers to prevent misleading readers.
3. **Multi-Tier Visibility & Indexing Protection:**  
   Dual-state gatekeeping governs data exposure:
   - `status`: `draft` | `published` | `archived`
   - `visibility`: `public` | `private`  
   Only records where `status = 'published'` AND `visibility = 'public'` are exposed to public endpoints or indexed by search engines. Admin preview endpoints emit `X-Robots-Tag: noindex, nofollow`.
4. **Bilingual Localization:**  
   Localized JSON storage for `case_name`, `summary`, `key_issues`, `court_decision`, `author_analysis`, `practical_significance`, `legal_area`, and `author`, resolved seamlessly per request headers (`Accept-Language: bn|en`).
5. **Decoupled Media & Document Security:**  
   Cover imagery and certified judgment judgment transcripts (PDF) utilize the centralized media repository. File streaming validates MIME type, content disposition, and parent publication state.
6. **24-Hour Cache with Event-Driven Purging:**  
   Public listing and detail payloads are cached for 86,400 seconds and automatically flushed on any administrative mutation or reordering.

---

## 3. Technology Stack & Key Classes

| Component | Class / File | Responsibility |
|---|---|---|
| **Eloquent Model** | `App\Models\JudgmentReview` | Domain entity, relationships, JSON casts, query scopes, route model binding. |
| **Admin Controller** | `App\Http\Controllers\Api\V1\Admin\AdminJudgmentReviewController` | Administrative CRUD, validation, 301 redirect management, draft previews, PDF downloads. |
| **Public Controller** | `App\Http\Controllers\Api\V1\Public\JudgmentReviewController` | Read-only public directory, single dossier retrieval, secure PDF streaming. |
| **Form Request** | `App\Http\Requests\Admin\JudgmentReviewRequest` | RBAC authorization (`create_judgments`, `edit_judgments`) and input validation rules. |
| **Cache Service** | `App\Services\CmsCacheService` | Redis/file cache tags, keys, TTL management, targeted invalidation. |
| **Public Resource** | `App\Http\Resources\V1\JudgmentReviewResource` | Lightweight directory payload avoiding full text overhead. |
| **Detail Resource** | `App\Http\Resources\V1\JudgmentReviewDetailResource` | Full dossier payload including related judgments and associated legal research. |

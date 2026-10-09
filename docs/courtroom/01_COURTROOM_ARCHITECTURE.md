# Courtroom Experiences Module — Architecture Specification

## 1. Executive Summary & Purpose
The **Courtroom Experiences / Case Experience Module** provides a structured, high-credibility editorial platform showcasing Advocate Nijam Uddin's judicial litigation portfolio, Supreme Court representations, and legal precedents. Built with legal safety, client confidentiality, and judicial integrity at the forefront, the module presents verified litigation records without promotional embellishment or unverified claims.

## 2. High-Level Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                 React / TypeScript Frontend                 │
│  - /courtroom (Public Catalog with Search & Court Filter)   │
│  - /courtroom/:slug (Public Detail Dossier & Briefs)        │
│  - /admin/courtroom (Admin Manager with Doc Attachment)     │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP GET (Public)            │ HTTP Admin
               │ JSON API                     │ (Sanctum + RBAC)
┌──────────────▼──────────────────────────────┴───────────────┐
│                    Laravel 11 REST API                      │
│  Public:  Api\V1\Public\CourtroomController                 │
│  Admin:   Api\V1\Admin\AdminCourtroomController             │
└──────────────┬──────────────────────────────▲───────────────┘
               │ Eloquent ORM                 │
┌──────────────▼──────────────────────────────┴───────────────┐
│                      MySQL 8.0 Database                     │
│  - courtroom_experiences (Litigation Portfolio)             │
│  - case_documents (Public & Confidential Briefs)            │
│  - practice_areas (Foreign Key Relation)                    │
│  - seo_meta (Polymorphic SEO)                               │
│  - redirects (Auto 301 on Slug Change)                      │
│  - activity_logs (Audit Trail)                              │
└─────────────────────────────────────────────────────────────┘
```

## 3. Core Architectural Principles
1. **Strict Content Integrity:** Zero synthetic, fabricated, or assumed cases in production. Only verified cases explicitly entered by authorized administrators are stored.
2. **Confidentiality by Design:** Clear distinction between public case metadata and confidential case files. Confidential documents are completely excluded from public API responses and enforced with server-side authorization.
3. **Relational Discipline:** Direct foreign key association to `practice_areas` with `nullOnDelete()`, preventing redundant text duplication while preserving isolation.
4. **Resilient Bilingual Architecture:** Unified JSON translations (`en`, `bn`) for titles, legal areas, advocate roles, summaries, full narratives, legal issues, arguments, and outcomes.
5. **Slug Stability & SEO Preservation:** Automatic generation of 301 redirects upon slug modification for published cases.
6. **High-Performance Caching:** 24-hour cache for public listings and detail dossiers with instant cache purging upon any administrative change.

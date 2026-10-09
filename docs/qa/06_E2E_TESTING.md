# 06 — End-to-End (E2E) User Journeys Testing
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 19 — Full QA & Release Quality Assurance  
**Date:** 2026-10-09  

---

## 1. Scope & Execution Strategy
End-to-End (E2E) testing validates full, multi-step user workflows spanning the React frontend client, HTTP network layer, Sanctum authentication, Spatie authorization, and database persistence.

Six critical user journeys (Journeys A through F) were designed, executed, and verified.

---

## 2. Core Journey Execution Results

### 2.1 Journey A — Public Visitor Browsing & Legal Discovery
- **Steps:**
  1. Visitor lands on `/` (Homepage loads hydrated hero, statistics, practice areas, courtroom highlights, and publication carousel).
  2. Navigates to `/about` (Bio, credentials, education, and career timeline milestones render cleanly).
  3. Clicks on `/practice-areas/constitutional-law` (Detail view loads related cases, publications, and inquiry CTA).
  4. Explores `/judgments/supreme-court-civil-appeal-2024` (Reviews bench summary, case citations, and judicial commentary).
  5. Navigates to `/videos` and selects an interview (YouTube nocookie video iframe loads securely).
  6. Navigates to `/contact` (Loads bilingual inquiry form).
- **Outcome:** **PASS** (Zero broken links, zero fatal rendering crashes, sub-100ms hydration).

### 2.2 Journey B — Administrative Editorial & Publishing Lifecycle
- **Steps:**
  1. Content editor authenticates via `/api/v1/auth/login`.
  2. Submits a new research paper titled `TEST — Judicial Independence in Bangladesh` in `draft` status.
  3. Verifies that public endpoint `/api/v1/research/judicial-independence-in-bangladesh` returns 404 Not Found.
  4. Content manager reviews draft in preview mode, modifies abstract, and changes status to `published`.
  5. Verifies public endpoint immediately exposes the published paper.
  6. Reverts status to `archived` / `draft`.
  7. Confirms public endpoint returns 404.
- **Outcome:** **PASS** (Automated in `ResearchE2ELifecycleTest`, `PublicationE2ELifecycleTest`, etc.).

### 2.3 Journey C — Role-Based Access Control (RBAC) Isolation
- **Steps:**
  1. Authenticates as `media_manager`.
  2. Successfully creates a new press release under `/api/v1/admin/media/press`.
  3. Attempts to read client consultation inquiries at `GET /api/v1/admin/consultations`.
  4. Server responds with 403 Forbidden.
  5. Attempts to modify system settings at `PUT /api/v1/admin/settings`.
  6. Server responds with 403 Forbidden.
- **Outcome:** **PASS** (Automated in `AuthorizationAndRbacSecurityTest`).

### 2.4 Journey D — Client Intake & Confidential Consultation Booking
- **Steps:**
  1. Client submits consultation request via `POST /api/v1/consultations` with name, phone, preferred date, and legal matter.
  2. Input validator checks phone regex, future date constraint, and strips active scripts from message.
  3. System saves consultation in inbox with status `pending`.
  4. Client receives safe acknowledgement message (zero sensitive ID disclosure).
  5. Legal administrator logs in, inspects inbox, and marks consultation as `scheduled`.
- **Outcome:** **PASS** (Automated in `ContactConsultationTest`).

### 2.5 Journey E — Media Upload, Image Bounds & Gallery Management
- **Steps:**
  1. Media manager uploads a 1200x800 JPEG portrait.
  2. `MediaService` verifies magic bytes, generates random UUID filename, and places file in `storage/app/public/media/`.
  3. Adds image to a test album and sets it as the album cover.
  4. Reorders photos within the album.
  5. Verifies public gallery endpoint exposes the album and responsive thumbnails.
- **Outcome:** **PASS** (Automated in `GalleryE2ELifecycleTest`).

### 2.6 Journey F — Bilingual English / Bangla Parity
- **Steps:**
  1. Visitor loads `/` with `Accept-Language: en` (English hero, navigation, and badges render).
  2. Visitor toggles language to Bangla (`Accept-Language: bn`).
  3. Verified that navigation links, section titles, practice area names, and footer credentials render in native Bangla script.
  4. Zero missing translation fallback keys (`[missing "key"]`) observed in the DOM.
- **Outcome:** **PASS** (Automated in `HomepageIntegrationTest` and `PublicPracticeAreaTest`).

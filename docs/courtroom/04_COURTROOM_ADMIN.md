# Courtroom Experiences — Administrative Operations & UI Manual

## 1. Overview
The Administrative Back-Office allows authorized chambers personnel to curate case records, verify advocate roles, attach legal orders, and control publication visibility.

## 2. Access & Navigation
- **Location:** CMS Dashboard (`/admin/cms`) → Tab: `🏛 Courtroom Cases` OR Dedicated Route (`/admin/courtroom`).
- **Authorization:** Enforced via Laravel Sanctum authentication and Spatie RBAC permissions (`create_cases`, `edit_cases`, `delete_cases`, `publish_cases`, `manage_case_documents`, `view_confidential_cases`).

## 3. Screen Structure

### 3.1 Case Management List
- **Table Data:**
  - Case Title & Court
  - Official Identifier (Case Number)
  - Year
  - Associated Practice Domain
  - Verified Advocate Role
  - Workflow Status (`draft`, `published`, `archived`)
  - Visibility Tier (`public`, `private`)
  - Attached Document Count
  - Action Controls: Preview, Edit, Delete
- **Filters:** Text search (title/number/summary), Status filter, Visibility filter, Forum/Court filter.

### 3.2 Experience Editor Modal
The editor features four specialized tabs and a bilingual language switcher (`EN` / `বাংলা`):
1. **Basic Information:**
   - Case Title (EN & BN)
   - URL Slug with "Generate from Title" utility
   - Case Identifier (Case Number)
   - Court / Forum
   - Case Type (Writ, Revision, Appeal, Tribunal)
   - Year & Judgment Date
   - Associated Practice Area (Relational selector)
   - Advocate Role (EN & BN)
   - Legal Field (EN & BN)
   - Status, Visibility & Featured Landmark toggle
2. **Narrative & Submissions:**
   - Executive Case Summary (EN & BN)
   - Detailed Narrative & Factual Matrix (HTML sanitized)
   - Substantive Legal Issues (EN & BN)
   - Submissions & Advocacy Arguments (EN & BN)
   - Final Disposition & Order (EN & BN)
3. **Documents Management:**
   - View all attached briefs and orders
   - Public vs. Confidential toggle
   - Attach new order by selecting media asset ID and title
   - Secure admin download test
   - Delete document
4. **SEO & Indexing:**
   - Meta Title (EN & BN)
   - Meta Description (EN & BN)
   - Canonical URL override

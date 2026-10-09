# 11. Gallery Testing Suite & Quality Assurance

**Module:** Gallery & Photographic Documentation (Phase 14)  
**Lead Coordinator:** QA Engineer & Automation/E2E Engineer  
**Test Suites:**
- `backend/tests/Feature/Gallery/AdminGalleryTest.php`
- `backend/tests/Feature/Gallery/PublicGalleryTest.php`
- `backend/tests/Feature/Gallery/GalleryE2ELifecycleTest.php`

---

## 1. Test Coverage Overview

The Gallery module features 18 dedicated feature tests asserting 96 distinct conditions across admin workflows, public endpoints, security barriers, and lifecycle operations.

### 1.1 Admin Gallery Feature Tests (`AdminGalleryTest.php`)
1. `unauthenticated admin request is rejected`: Verifies `401 Unauthorized` for unauthenticated requests.
2. `user without permission receives 403`: Confirms RBAC permission enforcement.
3. `admin can list gallery albums with filters`: Tests searching by title/description and status/visibility filtering.
4. `admin can create gallery album with bilingual content`: Verifies bilingual title/description storage and auto-slug generation.
5. `slug uniqueness is enforced`: Asserts automatic collision suffixing (`-1`).
6. `admin can update album and slug change creates redirect`: Tests automatic creation of HTTP 301 redirects when publishing slugs change.
7. `admin can upload and attach image directly`: Tests MIME/file size validation and creation of `Media` and `GalleryImage` records.
8. `admin can attach existing media to album`: Verifies zero-duplicate media referencing.
9. `admin can reorder images in album`: Verifies ordinal `sort_order` synchronization.
10. `admin cannot access image from another album idor`: Confirms relational 404 blocking for cross-album image manipulation.
11. `deleting album soft deletes album and detaches images without deleting media`: Confirms the physical media preservation invariant.

### 1.2 Public Gallery Feature Tests (`PublicGalleryTest.php`)
1. `public can list only published and public albums`: Confirms draft/archived/private albums are excluded from public listings.
2. `public search and category filtering`: Asserts parameterized title/description search and taxonomy filters.
3. `public can view album detail with public images`: Confirms detailed album view with public images loaded in `sort_order`.
4. `public cannot view draft or private album`: Validates HTTP `404 Not Found` for unpublished or private collections.
5. `public detail handles 301 redirect`: Confirms `301 Moved Permanently` headers for obsolete slugs.
6. `public detail includes related albums`: Validates deterministic category-based recommendations.

### 1.3 Full E2E Lifecycle Test (`GalleryE2ELifecycleTest.php`)
1. `complete gallery album and image lifecycle e2e`: Executes complete end-to-end editorial sequence:
   - Create draft album with bilingual metadata.
   - Attach test images and set cover.
   - Assert album is blocked from public endpoint (`404`).
   - Admin preview returns HTTP 200 with `X-Robots-Tag: noindex`.
   - Publish album and verify public availability.
   - Change slug and verify HTTP 301 redirect.
   - Verify cache invalidation upon updates.
   - Mark individual image as private and verify exclusion from public output.
   - Unpublish album and verify return to HTTP 404.
   - Delete album and verify that underlying `Media` record remains untouched.

---

## 2. Regression Verification Results

- **Full Suite Run:** 239 passed (1224 assertions).
- **Execution Time:** 169.55 seconds.
- **Failures / Errors:** 0.
- **Frontend Verification:** `npm run build` compiled cleanly with 0 TypeScript/ESLint errors.

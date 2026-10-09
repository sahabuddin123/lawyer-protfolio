# Publications Testing Strategy & QA Suite (Phase 11)

## 1. Overview
The Publications test suite guarantees end-to-end data integrity, RBAC compliance, bilingual behavior, document security, and automated redirect functionality.

All test suites strictly use non-production fixtures (`"TEST — Publication"`, `"TEST — Author"`, etc.) in compliance with the Zero-Hallucination policy.

## 2. Test Execution Commands

```bash
# Run only Publications feature tests
php artisan test --filter=Publication

# Run full application test suite
php artisan test

# Run frontend TypeScript & production build verification
npm run build
```

## 3. Test Suites Implemented

### 3.1 `AdminPublicationTest` (11 Tests)
1. `test_unauthenticated_admin_request_is_rejected`: Asserts 401 response without token.
2. `test_user_without_permission_receives_403`: Asserts 403 when lacking `create_publications`/`edit_publications`.
3. `test_admin_can_list_publications_with_filters`: Tests search, type filter, status filter, and pagination.
4. `test_admin_can_create_publication`: Tests creation with translations, tags, category, SEO meta, and audit log.
5. `test_slug_uniqueness_is_enforced`: Validates collision rejection (422).
6. `test_published_slug_change_creates_301_redirect`: Asserts automatic creation of 301 redirect entry in `redirects`.
7. `test_admin_can_soft_delete_publication`: Validates non-destructive soft delete and audit log.
8. `test_admin_can_reorder_publications`: Tests batch ranking updates.
9. `test_admin_can_preview_draft_publication_with_indexing_safety`: Verifies `X-Robots-Tag: noindex, nofollow` header on draft preview.
10. `test_admin_can_download_attached_pdf`: Tests administrative PDF streaming via media ID.
11. `test_invalid_external_url_is_rejected`: Tests rejection of `javascript:alert(1)` and invalid protocols.

### 3.2 `PublicPublicationTest` (6 Tests)
1. `test_public_publications_empty_state`: Verifies valid empty envelope when no published items exist.
2. `test_public_publications_returns_published_and_public_visibility_only`: Validates that drafts and private items are completely absent from public lists.
3. `test_public_publications_respects_locale_switching`: Tests bilingual header resolution (`Accept-Language: bn`).
4. `test_public_detail_endpoint_returns_published_publication`: Tests full dossier response, relations, and SEO.
5. `test_public_detail_returns_404_for_draft_or_private`: Asserts 404 on attempting to view draft or private publications.
6. `test_public_pdf_download_security`: Tests public PDF streaming and validates 404 rejection on draft publications.

### 3.3 `PublicationE2ELifecycleTest` (1 Comprehensive E2E Test)
1. `test_complete_publication_editorial_lifecycle_e2e`:
   - Admin logs in with editor role.
   - Creates a draft publication with bilingual metadata and SEO.
   - Verifies publication is invisible on public API (`/api/v1/publications`).
   - Admin accesses draft preview with `X-Robots-Tag: noindex, nofollow`.
   - Admin publishes publication.
   - Verifies publication appears immediately on public listing and detail endpoints.
   - Attaches public PDF and verifies streaming download works.
   - Changes visibility to private and verifies public access immediately returns 404.
   - Restores visibility to public and updates slug; verifies automated 301 redirect is generated.
   - Soft deletes publication and verifies public endpoints return 404.

## 4. Test Results
- **Publication Test Suite**: 18 passed, 99 assertions.
- **Full Application Backend Suite**: 170 passed, 869 assertions (0 failures).
- **Frontend TypeScript / Vite Build**: Clean build in 3.27s (0 errors).

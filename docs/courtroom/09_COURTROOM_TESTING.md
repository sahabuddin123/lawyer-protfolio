# Courtroom Experiences — Testing & Quality Assurance Manual

## 1. Test Suite Architecture
The test suite consists of automated feature and end-to-end integration tests using isolated test databases and fake storage disks.

## 2. Test Suites Overview

### 2.1 `Tests\Feature\Courtroom\AdminCourtroomTest`
- `test_unauthenticated_admin_request_is_rejected`: HTTP 401 when no bearer token is present.
- `test_user_without_permission_receives_403`: HTTP 403 when user lacks required role/permission.
- `test_admin_can_list_courtroom_experiences_with_filters`: Tests status, court, and pagination parameters.
- `test_admin_can_create_courtroom_experience`: Verifies creation, database persistence, and audit logging.
- `test_admin_creation_sanitizes_xss`: Confirms malicious scripts and event handlers are purged.
- `test_slug_uniqueness_is_enforced`: Validation fails on duplicate slug attempts.
- `test_published_slug_change_creates_301_redirect`: Confirms redirect record created on slug update.
- `test_admin_can_reorder_courtroom_experiences`: Tests batch sort order reordering.
- `test_admin_can_add_update_delete_case_documents`: Tests document attachment lifecycle.
- `test_confidential_document_download_requires_permission`: Verifies 401 for unauthenticated, 403 for plain user, and 200 for authorized admin.

### 2.2 `Tests\Feature\Courtroom\PublicCourtroomTest`
- `test_public_courtroom_empty_state`: Tests empty JSON structure.
- `test_public_courtroom_returns_published_and_public_visibility_only`: Confirms draft and private cases are hidden.
- `test_public_courtroom_respects_locale_switching`: Verifies English and Bengali translations.
- `test_public_detail_endpoint_returns_published_case_with_public_docs_only`: Confirms confidential documents are not leaked.
- `test_public_detail_returns_404_for_draft_or_private_case`: Confirms draft or private cases return 404.
- `test_public_document_download_security`: Tests successful download for public orders and 404 for confidential orders.

### 2.3 `Tests\Feature\Courtroom\CourtroomE2ELifecycleTest`
- Complete end-to-end editorial lifecycle:
  1. Admin authentication
  2. Draft creation
  3. Verification that draft is hidden from public list & detail
  4. Publication
  5. Verification that case appears in public list & detail
  6. Attachment of public order
  7. Public download verification
  8. Changing order to confidential
  9. Public access denial verification (404)
  10. Unpublishing case
  11. Verification that public listing and detail access disappears (404)

## 3. Running Test Suites
```powershell
# Run only Courtroom tests
php artisan test --filter=Courtroom

# Run full platform test suite
php artisan test

# Build frontend assets
npm run build
```

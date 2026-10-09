# Publications Security Verification & Hardening (Phase 11)

## 1. Security Threat Model & Matrix

| Vulnerability Vector | Threat Scenario | Mitigation Implemented | Verification Test |
|---|---|---|---|
| **IDOR** | Direct object access to unpublished publications or documents | Controller scopes enforce `published()` and `publicVisibility()` on public routes. | `PublicPublicationTest::test_public_detail_returns_404_for_draft_or_private` |
| **XSS / HTML Injection** | Malicious `<script>` tags in content or excerpt | HTML Purifier via `HtmlSanitizer::cleanTranslations()` strips executable code, event handlers, and unsafe tags. | `AdminPublicationTest::test_admin_creation_sanitizes_xss` |
| **Protocol Hijacking** | `javascript:` or `data:` URLs in `external_url` | Regex validation in `PublicationRequest` enforces strict `http://` or `https://` schemas. | `AdminPublicationTest::test_invalid_external_url_is_rejected` |
| **Privilege Escalation** | Unauthorized staff creating or modifying publications | Spatie RBAC middleware requires `create_publications` and `edit_publications` permissions. | `AdminPublicationTest::test_user_without_permission_receives_403` |
| **Draft Leakage** | Draft publication exposed to public crawler | Preview route issues `X-Robots-Tag: noindex, nofollow` and requires auth. | `AdminPublicationTest::test_admin_can_preview_draft_publication_with_indexing_safety` |
| **Document Exposure** | Downloading private document from public URL | Public download endpoint requires publication to be published and public. | `PublicPublicationTest::test_public_pdf_download_security` |
| **Mass Assignment** | Setting unauthorized database columns on publication | `$fillable` array explicitly whitelist fields on `Publication` model. | Form request validation + fillable tests |

## 2. Authentication & Authorization
All administrative endpoints are protected by Laravel Sanctum stateful tokens and Spatie Laravel-Permission:
```php
Route::prefix('publications')->group(function () {
    Route::get('/', [AdminPublicationController::class, 'index'])->middleware('permission:edit_publications|create_publications');
    Route::post('/', [AdminPublicationController::class, 'store'])->middleware('permission:create_publications');
    Route::post('/reorder', [AdminPublicationController::class, 'reorder'])->middleware('permission:edit_publications');
    Route::get('/{publication}/preview', [AdminPublicationController::class, 'preview'])->middleware('permission:edit_publications|create_publications');
    Route::get('/{publication}/download', [AdminPublicationController::class, 'downloadDocument'])->middleware('permission:edit_publications|create_publications');
    Route::get('/{publication}', [AdminPublicationController::class, 'show'])->middleware('permission:edit_publications|create_publications');
    Route::put('/{publication}', [AdminPublicationController::class, 'update'])->middleware('permission:edit_publications');
    Route::delete('/{publication}', [AdminPublicationController::class, 'destroy'])->middleware('permission:delete_publications');
});
```

## 3. Audit Logging
Meaningful administrative events are logged in `activity_logs`:
- `publication_created`: Recorded on initial draft/record creation.
- `publication_updated`: Recorded on changes, including diffs.
- `publication_deleted`: Recorded on soft deletion.
- `publications_reordered`: Recorded when sort orders are adjusted.
- `redirect_created`: Recorded when a slug change triggers an automated 301 redirect.

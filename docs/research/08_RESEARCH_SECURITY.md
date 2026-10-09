# 08. Legal Research — Security Architecture, RBAC & Audit Trails

**Lead Coordinator:** Security Auditor & Senior Laravel Engineer  
**Coverage:** RBAC Permissions, XSS Sanitization, IDOR Mitigation, Cache Invalidation, and Audit Logging

---

## 1. Role-Based Access Control (RBAC) Matrix

Permissions adhere strictly to `docs/architecture/09_RBAC_MATRIX.md`:

| Permission Key | Description | Super Admin | Admin | Editor | Content Manager |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `create_research` | Draft new monographs | Yes | Yes | Yes | Yes |
| `edit_research` | Modify monographs & taxonomy | Yes | Yes | Yes | Yes |
| `delete_research` | Soft-delete research records | Yes | Yes | No | No |
| `publish_research` | Toggle published status | Yes | Yes | Yes | No |

*Note: Content managers can prepare and update draft monographs, but cannot unilaterally transition status to `published`.*

---

## 2. Input Validation & XSS Sanitization

1. **Rich Text Purification:**  
   All content and excerpt HTML submitted to `store` and `update` is processed via `HtmlSanitizer::cleanTranslations()`.
2. **Purged Injections:**  
   - `<script>` blocks, inline event handlers (`onload`, `onerror`, `onclick`).
   - `javascript:` pseudo-protocols in links and attributes.
   - Malformed HTML or arbitrary iframes.
3. **Regex Slug Hardening:**  
   Slugs are constrained to `regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/` and enforce strict database uniqueness.

---

## 3. Comprehensive Audit Trail

All lifecycle transitions generate immutable records in the `activity_logs` table:

- `research_created`: Monograph record created with title and author.
- `research_updated`: Metadata or content modifications saved.
- `research_deleted`: Soft deletion executed.
- `research_published`: Monograph published to public discovery.
- `research_unpublished`: Monograph moved from published back to draft.
- `research_featured`: Highlighted on homepage/hub.
- `research_unfeatured`: Highlight flag cleared.
- `research_visibility_changed`: Public/private status transitioned.
- `research_document_attached`: PDF media linked.
- `research_document_removed`: PDF media unlinked.
- `redirect_created`: Automated 301 redirect generated upon published slug change.

# Courtroom Experiences — Security & RBAC Enforcement

## 1. Threat Mitigation Matrix

| Threat Category | Potential Attack Vector | Applied Mitigation |
| :--- | :--- | :--- |
| **XSS (Cross-Site Scripting)** | Malicious scripts in rich-text case descriptions or arguments | Stripped server-side using HTMLPurifier in `HtmlSanitizer::cleanTranslations()` before DB insertion. |
| **Confidential Data Exposure** | Public scraper accessing private case documents | Filtered at database query level and resource serialization; confidential downloads guarded by RBAC. |
| **IDOR (Insecure Direct Object Reference)** | Guessing document or experience IDs | Public APIs bind to validated slugs and published status only; admin operations check ownership and RBAC. |
| **Path Traversal** | Manipulating filename parameters to access system files | Downloads served only via primary-keyed database records referencing internal storage disks. |
| **Mass Assignment** | Setting unpermitted attributes (e.g. `is_confidential`) | Explicit `$fillable` array definitions on `CourtroomExperience` and `CaseDocument`. |
| **Unauthorized Publishing** | Unprivileged editor publishing sensitive litigation | Form request `CourtroomExperienceRequest` enforces `publish_cases` check if `status === 'published'`. |

## 2. Granular Permissions (from 09_RBAC_MATRIX.md)
- `create_cases`: Allows drafting courtroom experiences.
- `edit_cases`: Allows modifying draft or existing cases.
- `delete_cases`: Allows soft-deleting case records.
- `publish_cases`: Allows transitioning cases to `published` state.
- `view_confidential_cases`: Grants access to download internal/confidential documents.
- `manage_case_documents`: Grants authority to attach, update, or remove case orders.

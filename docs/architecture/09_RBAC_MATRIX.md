# 09. Role-Based Access Control (RBAC) Matrix

**Framework:** Spatie Laravel-Permission & Policy Authorization Guards  
**Lead Coordinator:** Security Engineer & Solution Architect  

---

## 1. System Roles Definition

1. **`super_admin` (Advocate Nijam Uddin & Lead Developer):** Unrestricted access across all domains, system configurations, user management, audit trails, and confidential legal archives.
2. **`admin` (Chamber Executive / Chief of Staff):** Full administrative authority over daily legal operations, client consultations, inquiries, publications, and public CMS modules. Cannot delete staff accounts or tamper with system audit trails.
3. **`editor` (Senior Associate Advocate / Legal Researcher):** Authoritative access to write, edit, and publish legal research papers, Supreme Court judgment reviews, case summaries, and authored publications.
4. **`content_manager` (Chamber Communications Associate):** Can draft and organize website content, upload media clips, update event dates, and queue articles for publication. Cannot unilaterally publish without editorial review.
5. **`media_manager` (Chamber Digital Archivist / Media Specialist):** Specialized operational access restricted strictly to the media asset library, photo gallery albums, broadcast video entries, and press coverage.

---

## 2. Granular Permissions vs. Roles Matrix

| Permission Key | Module | Super Admin | Admin | Editor | Content Manager | Media Manager |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `view_dashboard` | Analytics |  |  |  |  |  |
| `manage_settings` | System |  |  |  |  |  |
| `manage_users` | System |  |  |  |  |  |
| `manage_roles` | System |  |  |  |  |  |
| `view_activity_logs` | System |  |  |  |  |  |
| `manage_redirects` | System |  |  |  |  |  |
| `edit_profile` | Profile |  |  |  |  |  |
| `manage_credentials` | Profile |  |  |  |  |  |
| `manage_educations` | Profile |  |  |  |  |  |
| `manage_timeline` | Profile |  |  |  |  |  |
| `manage_memberships`| Profile |  |  |  |  |  |
| `create_practice_area`| Practice |  |  |  |  |  |
| `edit_practice_area` | Practice |  |  |  |  |  |
| `delete_practice_area`| Practice |  |  |  |  |  |
| `publish_practice_area`| Practice|  |  |  |  |  |
| `create_cases` | Courtroom |  |  |  |  |  |
| `edit_cases` | Courtroom |  |  |  |  |  |
| `delete_cases` | Courtroom |  |  |  |  |  |
| `publish_cases` | Courtroom |  |  |  |  |  |
| `view_confidential_cases`| Courtroom|  |  |  |  |  |
| `manage_case_documents`| Courtroom|  |  |  |  |  |
| `create_research` | Research |  |  |  |  |  |
| `edit_research` | Research |  |  |  |  |  |
| `delete_research` | Research |  |  |  |  |  |
| `publish_research` | Research |  |  |  |  |  |
| `create_judgments` | Judgments |  |  |  |  |  |
| `edit_judgments` | Judgments |  |  |  |  |  |
| `delete_judgments` | Judgments |  |  |  |  |  |
| `publish_judgments` | Judgments |  |  |  |  |  |
| `create_publications` | Publications|  |  |  |  |  |
| `edit_publications` | Publications|  |  |  |  |  |
| `delete_publications`| Publications|  |  |  |  |  |
| `publish_publications`| Publications|  |  |  |  |  |
| `manage_press` | Media |  |  |  |  |  |
| `manage_appearances` | Media |  |  |  |  |  |
| `manage_videos` | Media |  |  |  |  |  |
| `manage_gallery` | Gallery |  |  |  |  |  |
| `upload_media` | Media Lib |  |  |  |  |  |
| `delete_media` | Media Lib |  |  |  |  |  |
| `browse_media` | Media Lib |  |  |  |  |  |
| `view_contacts` | Inquiries |  |  |  |  |  |
| `manage_contacts` | Inquiries |  |  |  |  |  |
| `view_consultations` | Inquiries |  |  |  |  |  |
| `manage_consultations`| Inquiries |  |  |  |  |  |
| `manage_pages` | CMS |  |  |  |  |  |
| `manage_menus` | CMS |  |  |  |  |  |
| `manage_homepage` | CMS |  |  |  |  |  |
| `manage_seo` | SEO |  |  |  |  |  |

---

## 3. Enforcement Layers

1. **Route Middleware Guard (`routes/api.php`):**
   ```php
   Route::middleware(['auth:sanctum', 'permission:manage_consultations'])
       ->patch('/consultations/{id}', [ConsultationController::class, 'update']);
   ```
2. **Model Policy Layer (`app/Policies`):**
   - Fine-grained object ownership (e.g. Content Manager can only edit their own draft research articles, whereas an Editor can edit any article).
3. **Frontend UI Capability Guard (`<HasPermission>` component):**
   - Administrative navigation bars and action buttons (Delete, Publish, Edit) render conditionally based on the user's decrypted permission set retrieved via `/api/v1/auth/me`.

# 08. Judgment Reviews — Security Architecture & Threat Modeling

**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Module:** Phase 10 — Judgment Reviews & Judicial Analysis

---

## 1. Threat Modeling & Mitigation Matrix

| Threat Category | Potential Attack Vector | Applied Mitigation |
|---|---|---|
| **Insecure Direct Object Reference (IDOR)** | Attacker guesses numeric ID to read or edit private drafts. | Public endpoints bind exclusively to `slug` and enforce `status = 'published'` and `visibility = 'public'`. Admin endpoints require Sanctum tokens and Spatie RBAC permissions. |
| **Cross-Site Scripting (XSS)** | Malicious HTML/JS injected into legal analysis or case summary. | All input strings undergo HTML stripping and sanitization via `cleanHtml()` in `JudgmentReviewRequest` and `cleanTextInput()`. |
| **SQL Injection** | Malicious payloads in search or court filters. | Strict Eloquent query building using parameterized `where()` and `whereJsonContains()` queries. |
| **Path Traversal / Arbitrary File Read** | Manipulation of file download endpoints with `../` paths. | Downloads are resolved by Media model IDs through Laravel's abstract `Storage::disk()` adapter. |
| **Information Leakage** | Leakage of draft reviews or internal notes via public API. | Dedicated `JudgmentReviewResource` and `JudgmentReviewDetailResource` serialize only public-safe fields. |
| **Denial of Service (DoS)** | Excessive unindexed querying and cache thrashing. | Public responses are cached for 86,400s; database queries are indexed on `status`, `visibility`, `is_featured`, `sort_order`, and `practice_area_id`. |

---

## 2. Server-Side RBAC Enforcement

The `JudgmentReviewRequest` and `AdminJudgmentReviewController` evaluate Spatie permissions at the controller kernel:
- `create_judgments`: Verified on `store()` actions.
- `edit_judgments`: Verified on `update()`, `reorder()`, and `preview()` actions.
- `delete_judgments`: Verified on `destroy()` actions.
- `publish_judgments`: Verified when transitioning status to `published`.

Unauthenticated requests receive `401 Unauthorized`. Users lacking permissions receive `403 Forbidden`.

# Phase 16 — Homepage API Specification

## 1. Primary Public Endpoint

`GET /api/v1/home`

### Headers
| Header | Description | Default |
| --- | --- | --- |
| `Accept` | `application/json` | Required |
| `Accept-Language` | Preferred language code (`en` or `bn`) | `en` |

### Query Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| `lang` | `string` | Optional language override (`en` or `bn`) |

---

## 2. Response Contract

```json
{
  "success": true,
  "message": "Homepage data loaded successfully.",
  "data": {
    "sections": [
      {
        "id": 1,
        "section_key": "hero",
        "title": "Rigorous Legal Scholarship & Relentless Judicial Advocacy",
        "subtitle": "Advocate, Supreme Court of Bangladesh",
        "content": "...",
        "settings": { "show_badges": true },
        "sort_order": 1,
        "is_enabled": true
      }
    ],
    "site_settings": {
      "general": { "site_title": "Advocate Nijam Uddin (Haq)" },
      "contact": { "phone": "+880 1819-000000", "email": "chambers@nijamuddin.com" }
    },
    "hero": { ... },
    "credentials": [ ... ],
    "about": { ... },
    "featured_practice_areas": [ ... ],
    "practice_areas": [ ... ],
    "featured_courtroom": [ ... ],
    "courtroom": [ ... ],
    "featured_judgments": [ ... ],
    "judgment_reviews": [ ... ],
    "featured_research": [ ... ],
    "research": [ ... ],
    "featured_publications": [ ... ],
    "publications": [ ... ],
    "featured_videos": [ ... ],
    "videos": [ ... ],
    "featured_media": [ ... ],
    "media": [ ... ],
    "featured_gallery": [ ... ],
    "gallery": [ ... ],
    "consultation_cta": {
      "title": "Chamber Consultation & Enquiries",
      "phone": "+880 1819-000000",
      "email": "chambers@nijamuddin.com"
    },
    "seo": {
      "meta_title": "...",
      "meta_description": "...",
      "canonical_url": "...",
      "schema": { ... }
    },
    "structured_data": {
      "@context": "https://schema.org",
      "@graph": [ ... ]
    }
  }
}
```

---

## 3. Administrative Management Endpoints

All admin endpoints require authentication via Sanctum and authorization via Spatie permission `manage_homepage`.

### 3.1 List Homepage Sections
`GET /api/v1/admin/homepage/sections`

### 3.2 Update Section Configuration
`PUT /api/v1/admin/homepage/sections/{homepageSection}`
- `title`: Translatable array (`{"en": "...", "bn": "..."}`)
- `subtitle`: Translatable array
- `content`: Translatable array
- `settings`: JSON object (`{"limit": 6}`)
- `is_enabled`: Boolean

### 3.3 Reorder Sections
`POST /api/v1/admin/homepage/sections/reorder`
```json
{
  "sections": [
    { "id": 1, "sort_order": 1 },
    { "id": 4, "sort_order": 2 }
  ]
}
```
Reordering triggers instant cache invalidation via `CmsCacheService::forgetHome()`.

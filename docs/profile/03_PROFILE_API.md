# 03 — Public Profile & Pedigree API Reference

## Advocate Nijam Uddin (Haq) — Premium Legal Authority Platform
### Phase 6: Profile & About Module

---

## 1. Overview

The Public Profile APIs provide endpoints for the frontend About page, homepage authority badges, and search engine crawlers. Responses are optimized, sanitized, and delivered through standard JSON envelopes.

---

## 2. Public Endpoints

### 2.1 Complete Profile & Pedigree
- **Route**: `GET /api/v1/profile`
- **Controller**: `App\Http\Controllers\Api\v1\Public\ProfileController@index`
- **Rate Limit**: 60 requests / minute
- **Cache**: 24 hours (`cms:profile:public:{locale}`)
- **Headers**: `Accept-Language: en|bn`
- **Response Format**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "id": 1,
    "name": "Nijam Uddin (Haq)",
    "title": "Advocate, Supreme Court of Bangladesh",
    "subtitle": "Legal Practitioner & Judicial Consultant",
    "short_bio": "Advocate Nijam Uddin (Haq) is an enrolled Advocate of the Supreme Court of Bangladesh...",
    "long_bio": "<p>Advocate Nijam Uddin (Haq) is an enrolled legal practitioner...</p>",
    "status": "published",
    "bar_council_enrollment": "Enrolled / Certified with Bangladesh Bar Council",
    "high_court_enrollment": null,
    "appellate_division_enrollment": null,
    "chambers_address": "Supreme Court Bar Association Building, Dhaka, Bangladesh",
    "office_address": "Chamber of Advocate Nijam Uddin, Dhaka, Bangladesh",
    "phone": "+880 1700 000000",
    "email": "advocate@nijamuddin.com",
    "whatsapp": "+880 1700 000000",
    "philosophy": "Upholding the rule of law with ethical commitment, judicial integrity, and meticulous legal analysis.",
    "legal_approach": "Rigorous jurisprudence, constitutional fidelity, and principled advocacy.",
    "profile_photo": null,
    "court_robes_photo": null,
    "signature_photo": null,
    "seo": {
      "seo_title": "Profile & Legal Credentials | Advocate Nijam Uddin (Haq)",
      "meta_description": "Authoritative profile, academic pedigree, and verified credentials...",
      "canonical_url": "http://localhost:8000/about",
      "robots": "index, follow",
      "schema_type": "Person"
    },
    "credentials": [
      {
        "id": 1,
        "category": "court",
        "title": "Advocate, Supreme Court of Bangladesh",
        "institution": "Supreme Court of Bangladesh",
        "description": "Enrolled and authorized to practice before the Supreme Court of Bangladesh.",
        "year": null,
        "is_featured": true,
        "is_active": true,
        "sort_order": 1
      }
    ],
    "educations": [
      {
        "id": 1,
        "degree": "Master of Laws (LL.M.)",
        "institution": "University of Chittagong",
        "department": "Department of Law",
        "year_completed": null,
        "is_active": true,
        "sort_order": 1
      }
    ],
    "timeline": [],
    "memberships": []
  }
}
```

### 2.2 Credentials & Degrees
- **Route**: `GET /api/v1/credentials`
- **Controller**: `App\Http\Controllers\Api\v1\Public\ProfileController@credentials`
- **Cache**: 24 hours (`cms:credentials:public:{locale}`)
- **Payload**: Contains active credentials list and active educations list.

### 2.3 Career Timeline & Memberships
- **Route**: `GET /api/v1/timeline`
- **Controller**: `App\Http\Controllers\Api\v1\Public\ProfileController@timeline`
- **Cache**: 24 hours (`cms:timeline:public:{locale}`)
- **Payload**: Contains active career timeline milestones and active verified memberships.

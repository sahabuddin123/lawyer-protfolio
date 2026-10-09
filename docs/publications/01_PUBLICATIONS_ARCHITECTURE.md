# Publications Module Architecture (Phase 11)

## 1. Module Overview
The Publications Module represents the definitive jurisprudential and scholarly publishing platform for **Advocate Nijam Uddin (Haq)**. It is architected for academic rigor, editorial integrity, document security, and bilingual indexing across English and Bengali.

The module provides full lifecycle management for:
- Legal Treatises & Authored Books
- Peer-Reviewed Journal Articles
- Academic Research Papers
- Conference Proceedings & Symposia
- Substantive Legal Articles & Law Reviews
- Official Reports & Case Notes

## 2. High-Level Architectural Diagram
```
                     +---------------------------------------+
                     |         Public Visitors               |
                     +-------------------+-------------------+
                                         |
                       GET /publications | GET /publications/{slug}
                                         v
                     +---------------------------------------+
                     |  PublicPublicationController (Cache)  |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |    CmsCacheService (24h TTL)          |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |        Publication Model              |
                     |  (Published + Public Scopes Only)     |
                     +-------------------+-------------------+
                                         |
                                         v
+-----------------------+   +------------+------------+   +----------------------+
| Categories & Tags     |   | Central Media Library   |   | Polymorphic SEO Meta |
| (Taxonomy Hierarchy)  |   | (Cover & Secure PDFs)   |   | (Canonical & OG)     |
+-----------------------+   +-------------------------+   +----------------------+
                                         ^
                                         | Sanctum + Spatie RBAC
                     +-------------------+-------------------+
                     |    AdminPublicationController         |
                     | (CRUD, Reorder, Preview, Audit Log)   |
                     +-------------------+-------------------+
                                         ^
                                         |
                     +-------------------+-------------------+
                     |       Judicial Back-Office            |
                     |    (React / TypeScript Admin)         |
                     +---------------------------------------+
```

## 3. Strict Boundary Compliance
- **Scope Limit**: Publications, books, articles, reports, attached PDFs, taxonomies, and related metadata only.
- **Future Module Segregation**: No electronic media, video press, gallery, contact intake, or global homepage integrations were created or modified during this phase.

## 4. Key Architectural Pillars
1. **Zero Hallucination Safeguard**: Strictly prohibits seeding of fabricated publications, fictitious ISBNs/DOIs, or unverified author credentials.
2. **Deterministic Security**: Public endpoints strictly enforce `status = 'published'` AND `visibility = 'public'`. Drafts, private monographs, and unpublished items are 100% inaccessible to public consumers.
3. **Automated 301 Redirect Engine**: When an existing published publication slug is changed, the system automatically records a 301 Permanent Redirect in `redirects` table to preserve citation equity and prevent broken backlinks.
4. **Cache Invalidation Lifecycle**: Tagged caching with 86,400s (24h) TTL invalidates immediately on create, update, delete, status transition, or reordering.

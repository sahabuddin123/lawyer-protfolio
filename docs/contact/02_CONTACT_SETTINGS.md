# 02. Dynamic Chamber Settings & Configuration

**Module:** Contact & Legal Consultation (Phase 15)  
**Lead Coordinator:** Database Architect & Senior Solution Architect  
**Model Reference:** `backend/app/Models/SiteSetting.php`

---

## 1. Dynamic Settings Architecture

To maintain zero hardcoded contact credentials in frontend bundles, all chamber communications are driven by the unified `site_settings` table under group `contact` and `social`.

### Key Definitions

| Key | Group | Type | Description |
| :--- | :--- | :--- | :--- |
| `contact_office_name` | `contact` | String | Formal office brand name |
| `contact_chamber_name` | `contact` | String | Specific judicial chamber designation |
| `contact_address` | `contact` | JSON/String | Physical location address (Bilingual supported) |
| `contact_city` | `contact` | String | Primary metropolitan jurisdictions (e.g. Dhaka & Chattogram) |
| `contact_country` | `contact` | String | Country designation (Bangladesh) |
| `contact_phone` | `contact` | String | Verified chamber hotline |
| `contact_email` | `contact` | String | Official correspondence email |
| `contact_whatsapp` | `contact` | String | Verified WhatsApp coordinator phone |
| `contact_office_hours` | `contact` | JSON | Timetable schedule for appointments |
| `contact_map_url` | `contact` | String | Allowlist verified external navigation link |
| `social_links` | `social` | JSON | Official Bar & social profiles |

---

## 2. Cache Invalidation Flow

- Public contact configuration is cached via `CmsCacheService::contactConfigKey($locale)` for 24 hours (`TTL_CONTACT = 86400`).
- Updating any system settings in `AdminSettingController::update()` instantly invokes `CmsCacheService::forgetContactConfig()`, ensuring zero stale contact credentials across the public platform.

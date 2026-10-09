# Caching & Invalidation Architecture — Advocate Nijam Uddin (Haq)

### 1. Overview
The caching architecture delivers sub-second response times for public visitors while ensuring immediate content consistency when editors update records in the administrative CMS.

---

### 2. Cache Key Topology

| Cache Domain | Key Pattern | TTL | Contents | Invalidation Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **XML Sitemap** | `cms:sitemap:xml` | 24 Hours | Complete `<urlset>` XML payload | Record created, updated, deleted, published, or unpublished across any module |
| **Public Homepage** | `cms:home:public` | 1 Hour | Aggregated hero, practice areas, publications, research, video previews | Homepage section reordered or featured item updated |
| **Site Settings** | `cms:settings` | 24 Hours | Brand identity, phone, chamber addresses, consultation options | Settings updated in Admin Settings manager |
| **Navigation Menus** | `cms:navigation` | 24 Hours | Header/footer link trees | Menu structure updated |
| **Taxonomies** | `cms:categories:*` | 6 Hours | Legal categories and tag lists | Categories or tags modified |

---

### 3. Cache Driver Compatibility & Safety
In `App\Services\CmsCacheService`, cache tag operations (`Cache::tags(['cms'])`) are safeguarded with `method_exists($store, 'tags')` detection. When running on cache drivers that lack tagging support (such as `file` or `database`), the service automatically falls back to exact key deletion:

```php
public static function forgetSitemap(): void
{
    try {
        if (self::supportsTags()) {
            Cache::tags(['cms', 'sitemap'])->flush();
        }
    } catch (\Throwable $e) {
        // Fallback
    }
    Cache::forget(self::sitemapKey());
}
```

### 4. Non-Cacheable Surfaces
Strictly excluded from caching:
- Authentication endpoints (`/api/v1/auth/*`)
- Administrative CRUD operations (`/api/v1/admin/*`)
- Form submissions (Contact inquiries, Consultation bookings)
- CSRF cookies and session state

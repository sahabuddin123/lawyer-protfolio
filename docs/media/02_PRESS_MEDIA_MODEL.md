# Press Media Domain Model (`MediaPress`)

## 1. Domain Concept
`MediaPress` models journalistic print and digital press coverage regarding Senior Advocate Nijam Uddin, including national daily articles, legal reviews, op-ed mentions, magazine features, and investigative reports.

---

## 2. Model Specification

```php
namespace App\Models;

use App\Traits\HasSeo;
use App\Traits\HasSortOrder;
use App\Traits\HasStatus;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaPress extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;
    
    protected $table = 'media_press';
    ...
}
```

### Traits Applied:
- `HasTranslations`: Provides transparent locale resolution (`en`/`bn`) for `media_name`, `title`, and `description`.
- `HasStatus`: Standardized `status` querying (`published()`, `draft()`, `archived()`).
- `HasSortOrder`: Default ordering by `sort_order ASC`.
- `HasSeo`: Morph-one relationship to `SeoMeta` for full OpenGraph and JSON-LD metadata.
- `SoftDeletes`: Non-destructive deletion with recovery capability.

---

## 3. Supported Attributes and Accessor Mappings
| Database Column | Model Alias / Fillable | Type | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `id` | int | Auto-increment identifier |
| `category_id` | `category_id` | int | Foreign key to `categories` |
| `media_type` | `media_type` | string | Taxonomy: `newspaper`, `magazine`, `online`, etc. |
| `media_name` | `source_name` | JSON | Name of publishing outlet |
| `title` | `title` | JSON | Headline/Article title |
| `slug` | `slug` | string | Collision-safe URL slug |
| `published_date` | `date` | date | Original media publication date |
| `article_url` | `external_url` | string | Direct link to news outlet |
| `featured_image_id` | `featured_image_id` | int | Thumbnail / News clipping picture |
| `document_media_id` | `document_media_id` | int | Scan / Press kit PDF |
| `description` | `description` | JSON | Summary / Contextual notes |
| `status` | `status` | enum | `draft`, `published`, `archived` |
| `visibility` | `visibility` | enum | `public`, `private` |
| `is_featured` | `is_featured` | bool | Promoted highlight flag |
| `sort_order` | `sort_order` | int | Sequential position |
| `published_at` | `published_at` | datetime | Publication timestamp |

---

## 4. Query Scopes
- `scopePublicVisibility($query)`: Filters where `visibility = 'public'`.
- `scopeFeatured($query)`: Filters where `is_featured = true`.
- `scopeSearch($query, $term)`: Case-insensitive search across title, source name, description, slug, and tag names.
- `scopeFilterType($query, $type)`: Filter by `media_type`.
- `scopeFilterYear($query, $year)`: Filter by `YEAR(published_date)`.
- `scopeFilterSource($query, $source)`: Filter by source outlet.
- `scopeFilterCategory($query, $categoryId)`: Filter by assigned category.
- `scopeFilterTag($query, $tag)`: Filter by associated tag id or slug.

# Electronic Media Appearances Domain Model (`MediaAppearance`)

## 1. Domain Concept
`MediaAppearance` models broadcast television and radio appearances, prime-time talk shows, judicial roundtables, and digital video interviews where Senior Advocate Nijam Uddin participated as a legal commentator, constitutional expert, or senior panelist.

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

class MediaAppearance extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;
    
    protected $table = 'media_appearances';
    ...
}
```

### Traits Applied:
- `HasTranslations`: Provides translation management for `channel`, `program`, `title`, and `description`.
- `HasStatus`: Status filtering (`published()`, `draft()`, `archived()`).
- `HasSortOrder`: Sequential sorting by `sort_order ASC`.
- `HasSeo`: Morph-one SEO relations for OpenGraph and structured data.
- `SoftDeletes`: Trash retention and soft delete safety.

---

## 3. Supported Attributes and Accessor Mappings
| Database Column | Model Alias / Fillable | Type | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `id` | int | Primary identifier |
| `category_id` | `category_id` | int | Category taxonomy |
| `media_type` | `broadcast_type` | string | Taxonomy: `tv`, `radio`, `interview`, `talk_show`, `discussion`, `podcast`, `digital`, `other` |
| `channel` | `channel` | JSON | Network name (`Channel 24`, `Somoy TV`, `BBC Bangla`, etc.) |
| `program` | `program_name` | JSON | Program/Show title |
| `title` | `title` | JSON | Discussion topic / appearance title |
| `slug` | `slug` | string | Collision-safe URL slug |
| `video_url` | `external_url` | string | External video link (YouTube, Vimeo, broadcaster stream) |
| `thumbnail_id` | `thumbnail_id` | int | Broadcast thumbnail / video still |
| `document_media_id` | `document_media_id` | int | Broadcast transcript / brief PDF |
| `broadcast_date` | `appearance_date` | date | Original telecast / recording date |
| `description` | `description` | JSON | Summary of discussion / key arguments |
| `status` | `status` | enum | `draft`, `published`, `archived` |
| `visibility` | `visibility` | enum | `public`, `private` |
| `is_featured` | `is_featured` | bool | Highlight on media landing page |
| `sort_order` | `sort_order` | int | Sequence order |
| `published_at` | `published_at` | datetime | Publishing timestamp |

---

## 4. Query Scopes
- `scopePublicVisibility($query)`: Filters where `visibility = 'public'`.
- `scopeFeatured($query)`: Filters where `is_featured = true`.
- `scopeSearch($query, $term)`: Case-insensitive search across title, channel, program name, description, slug, and tag names.
- `scopeFilterType($query, $type)`: Filter by broadcast medium (`tv`, `radio`, etc.).
- `scopeFilterChannel($query, $channel)`: Filter by broadcast network.
- `scopeFilterYear($query, $year)`: Filter by `YEAR(broadcast_date)`.
- `scopeFilterCategory($query, $categoryId)`: Filter by assigned category.
- `scopeFilterTag($query, $tag)`: Filter by associated tag id or slug.

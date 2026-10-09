<?php

namespace App\Models;

use App\Services\VideoPlatformService;
use App\Traits\HasSeo;
use App\Traits\HasSortOrder;
use App\Traits\HasStatus;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Video extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;

    protected $table = 'videos';

    protected $fillable = [
        'title',
        'slug',
        'platform',
        'video_url',
        'video_id',
        'thumbnail_id',
        'category_id',
        'duration',
        'description',
        'published_date',
        'status',
        'visibility',
        'is_featured',
        'sort_order',
        'published_at',
    ];

    protected $casts = [
        'title' => 'array',
        'description' => 'array',
        'published_date' => 'date',
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    public array $translatable = [
        'title',
        'description',
    ];

    protected static function booted(): void
    {
        static::saving(function (Video $model) {
            if (empty($model->slug) && !empty($model->title)) {
                $source = is_array($model->title) ? ($model->title['en'] ?? reset($model->title)) : $model->title;
                $model->slug = Str::slug($source);
            }
            if (!empty($model->slug)) {
                $model->slug = Str::slug($model->slug);
            }
        });
    }

    /* ---------------------------------------------------------
     | Relationships
     | --------------------------------------------------------- */

    public function thumbnail(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'thumbnail_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /* ---------------------------------------------------------
     | Accessors & Mutators
     | --------------------------------------------------------- */

    public function getFeaturedAttribute(): bool
    {
        return (bool) $this->is_featured;
    }

    public function setFeaturedAttribute($value): void
    {
        $this->attributes['is_featured'] = (bool) $value;
    }

    public function getEmbedUrlAttribute(): ?string
    {
        return app(VideoPlatformService::class)->getEmbedUrl($this->platform ?? 'youtube', $this->video_id);
    }

    public function getExternalWatchUrlAttribute(): string
    {
        return $this->video_url ?? '';
    }

    /* ---------------------------------------------------------
     | Scopes
     | --------------------------------------------------------- */

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('visibility', 'public');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopePlatform(Builder $query, ?string $platform): Builder
    {
        if (!$platform || $platform === 'all') {
            return $query;
        }
        return $query->where('platform', strtolower($platform));
    }

    public function scopeCategorySlug(Builder $query, ?string $slug): Builder
    {
        if (!$slug || $slug === 'all') {
            return $query;
        }
        return $query->whereHas('category', fn ($q) => $q->where('slug', $slug));
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $term = trim($term);
        return $query->where(function (Builder $q) use ($term) {
            $q->where('title->en', 'like', "%{$term}%")
              ->orWhere('title->bn', 'like', "%{$term}%")
              ->orWhere('description->en', 'like', "%{$term}%")
              ->orWhere('description->bn', 'like', "%{$term}%")
              ->orWhere('video_id', 'like', "%{$term}%")
              ->orWhere('slug', 'like', "%{$term}%");
        });
    }
}

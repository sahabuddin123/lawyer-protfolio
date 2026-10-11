<?php

namespace App\Models;

use App\Traits\HasSeo;
use App\Traits\HasSortOrder;
use App\Traits\HasStatus;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class GalleryAlbum extends Model
{
    use HasFactory, HasSortOrder, HasStatus, HasTranslations, HasSeo, SoftDeletes;

    protected $table = 'gallery_albums';

    public array $translatable = [
        'title',
        'description',
    ];

    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover_image_id',
        'category_id',
        'event_date',
        'published_at',
        'status',
        'visibility',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'title' => 'array',
        'description' => 'array',
        'event_date' => 'date',
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (GalleryAlbum $album) {
            if (empty($album->slug)) {
                $rawTitle = is_array($album->title) ? ($album->title['en'] ?? reset($album->title)) : $album->title;
                $baseSlug = Str::slug($rawTitle ?: 'album-' . Str::random(6));
                $slug = $baseSlug;
                $counter = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$baseSlug}-{$counter}";
                    $counter++;
                }
                $album->slug = strtolower($slug);
            }
        });
    }

    public function coverImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_image_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(GalleryImage::class, 'album_id')->ordered();
    }

    public function publicImages(): HasMany
    {
        return $this->hasMany(GalleryImage::class, 'album_id')
            ->where('visibility', 'public')
            ->ordered();
    }

    public function getFeaturedAttribute(): bool
    {
        return (bool) $this->is_featured;
    }

    public function setFeaturedAttribute(mixed $value): void
    {
        $this->attributes['is_featured'] = (bool) $value;
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if ($this->relationLoaded('coverImage') && $this->coverImage) {
            return $this->coverImage->url;
        }

        if ($this->cover_image_id && $this->coverImage) {
            return $this->coverImage->url;
        }

        if ($this->relationLoaded('publicImages')) {
            $first = $this->publicImages->first();
            if ($first) {
                return $first->relationLoaded('media') ? $first->media?->url : null;
            }
        }

        if ($this->relationLoaded('images')) {
            $first = $this->images->first();
            if ($first) {
                return $first->relationLoaded('media') ? $first->media?->url : null;
            }
        }

        return null;
    }

    public function getImageCountAttribute(): int
    {
        if ($this->relationLoaded('images')) {
            return $this->images->count();
        }

        return $this->images()->count();
    }

    public function getPublicImageCountAttribute(): int
    {
        if ($this->relationLoaded('publicImages')) {
            return $this->publicImages->count();
        }

        return $this->publicImages()->count();
    }

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

    public function scopeCategorySlug(Builder $query, string $categorySlug): Builder
    {
        return $query->whereHas('category', function (Builder $q) use ($categorySlug) {
            $q->where('slug', $categorySlug);
        });
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $term = trim($term);

        return $query->where(function (Builder $q) use ($term) {
            $q->whereRaw('LOWER(title->"$.en") LIKE ?', ['%' . strtolower($term) . '%'])
                ->orWhereRaw('LOWER(title->"$.bn") LIKE ?', ['%' . strtolower($term) . '%'])
                ->orWhereRaw('LOWER(slug) LIKE ?', ['%' . strtolower($term) . '%'])
                ->orWhereRaw('LOWER(description->"$.en") LIKE ?', ['%' . strtolower($term) . '%'])
                ->orWhereRaw('LOWER(description->"$.bn") LIKE ?', ['%' . strtolower($term) . '%']);
        });
    }
}

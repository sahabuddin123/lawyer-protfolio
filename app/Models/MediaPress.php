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
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaPress extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;

    protected $table = 'media_press';

    protected $fillable = [
        'category_id',
        'media_type',
        'media_name',
        'source_name',
        'title',
        'slug',
        'published_date',
        'article_url',
        'external_url',
        'featured_image_id',
        'document_media_id',
        'description',
        'status',
        'visibility',
        'is_featured',
        'sort_order',
        'published_at',
    ];

    protected $translatable = [
        'media_name',
        'title',
        'description',
    ];

    protected $casts = [
        'media_name' => 'array',
        'title' => 'array',
        'published_date' => 'date',
        'description' => 'array',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_image_id');
    }

    public function documentMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'document_media_id');
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * Scope query to public visibility.
     */
    public function scopePublicVisibility(Builder $query): Builder
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope query to featured media items.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope query to search term across title, source, description, tags.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $term = trim($term);

        return $query->where(function (Builder $q) use ($term) {
            $q->where('slug', 'like', "%{$term}%")
                ->orWhere('title->en', 'like', "%{$term}%")
                ->orWhere('title->bn', 'like', "%{$term}%")
                ->orWhere('media_name->en', 'like', "%{$term}%")
                ->orWhere('media_name->bn', 'like', "%{$term}%")
                ->orWhere('description->en', 'like', "%{$term}%")
                ->orWhere('description->bn', 'like', "%{$term}%")
                ->orWhereHas('tags', function (Builder $tq) use ($term) {
                    $tq->where('name->en', 'like', "%{$term}%")
                        ->orWhere('name->bn', 'like', "%{$term}%")
                        ->orWhere('slug', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Filter by media type.
     */
    public function scopeFilterType(Builder $query, ?string $type): Builder
    {
        if (empty($type) || $type === 'all') {
            return $query;
        }

        return $query->where('media_type', $type);
    }

    /**
     * Filter by category ID.
     */
    public function scopeFilterCategory(Builder $query, $categoryId): Builder
    {
        if (empty($categoryId) || $categoryId === 'all') {
            return $query;
        }

        return $query->where('category_id', $categoryId);
    }

    /**
     * Filter by tag ID or tag slug.
     */
    public function scopeFilterTag(Builder $query, $tag): Builder
    {
        if (empty($tag) || $tag === 'all') {
            return $query;
        }

        return $query->whereHas('tags', function (Builder $q) use ($tag) {
            if (is_numeric($tag)) {
                $q->where('tags.id', (int) $tag);
            } else {
                $q->where('tags.slug', $tag);
            }
        });
    }

    /**
     * Filter by publication year.
     */
    public function scopeFilterYear(Builder $query, $year): Builder
    {
        if (empty($year) || $year === 'all') {
            return $query;
        }

        return $query->whereYear('published_date', (int) $year);
    }

    /**
     * Filter by media source name.
     */
    public function scopeFilterSource(Builder $query, ?string $source): Builder
    {
        if (empty($source) || $source === 'all') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($source) {
            $q->where('media_name->en', 'like', "%{$source}%")
                ->orWhere('media_name->bn', 'like', "%{$source}%");
        });
    }

    public function setSourceNameAttribute($value): void
    {
        if (is_string($value)) {
            $this->attributes['media_name'] = json_encode(['en' => $value, 'bn' => $value]);
        } elseif (is_array($value)) {
            $this->attributes['media_name'] = json_encode($value);
        }
    }

    public function getSourceNameAttribute()
    {
        $name = $this->media_name;
        if (is_array($name)) {
            return $name[app()->getLocale()] ?? $name['en'] ?? $name['bn'] ?? null;
        }
        return $name;
    }

    public function setExternalUrlAttribute($value): void
    {
        $this->attributes['article_url'] = $value;
    }

    public function getExternalUrlAttribute()
    {
        return $this->article_url;
    }
}

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
use Illuminate\Database\Eloquent\SoftDeletes;

class PracticeArea extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;

    /**
     * Whitelist of safe, supported icon keys mapped on the frontend to Lucide icons.
     */
    public const APPROVED_ICONS = [
        'scale',
        'landmark',
        'shield',
        'briefcase',
        'file-text',
        'scroll',
        'award',
        'users',
        'building',
        'balance',
        'gavel',
        'book-open',
        'globe',
    ];

    protected $fillable = [
        'title',
        'slug',
        'short_description',
        'full_description',
        'icon_name',
        'featured_image_id',
        'status',
        'is_featured',
        'sort_order',
        'published_at',
    ];

    protected $casts = [
        'title' => 'array',
        'short_description' => 'array',
        'full_description' => 'array',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
    ];

    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_image_id');
    }

    public function courtroomExperiences(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CourtroomExperience::class, 'practice_area_id');
    }

    public function judgmentReviews(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(JudgmentReview::class, 'practice_area_id');
    }

    /**
     * Scope query to featured practice areas.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope query to search term across titles, short descriptions, and slugs.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $term = trim($term);

        return $query->where(function (Builder $q) use ($term) {
            $q->where('title->en', 'like', "%{$term}%")
              ->orWhere('title->bn', 'like', "%{$term}%")
              ->orWhere('short_description->en', 'like', "%{$term}%")
              ->orWhere('short_description->bn', 'like', "%{$term}%")
              ->orWhere('slug', 'like', "%{$term}%");
        });
    }

    /**
     * Check if an icon identifier is in the approved registry.
     */
    public static function isValidIcon(?string $icon): bool
    {
        return empty($icon) || in_array($icon, self::APPROVED_ICONS, true);
    }
}

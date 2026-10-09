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

class MediaAppearance extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;

    protected $table = 'media_appearances';

    protected $fillable = [
        'category_id',
        'media_type',
        'broadcast_type',
        'channel',
        'program',
        'program_name',
        'title',
        'slug',
        'video_url',
        'external_url',
        'thumbnail_id',
        'document_media_id',
        'broadcast_date',
        'appearance_date',
        'description',
        'status',
        'visibility',
        'is_featured',
        'sort_order',
        'published_at',
    ];

    protected $translatable = [
        'channel',
        'program',
        'title',
        'description',
    ];

    protected $casts = [
        'channel' => 'array',
        'program' => 'array',
        'title' => 'array',
        'broadcast_date' => 'date',
        'description' => 'array',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->attributes['program'])) {
                $model->attributes['program'] = json_encode(['en' => '', 'bn' => '']);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function thumbnail(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'thumbnail_id');
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
     * Scope query to featured appearance items.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope query to search term across title, channel, program, description, tags.
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
                ->orWhere('channel->en', 'like', "%{$term}%")
                ->orWhere('channel->bn', 'like', "%{$term}%")
                ->orWhere('program->en', 'like', "%{$term}%")
                ->orWhere('program->bn', 'like', "%{$term}%")
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
     * Filter by broadcast year.
     */
    public function scopeFilterYear(Builder $query, $year): Builder
    {
        if (empty($year) || $year === 'all') {
            return $query;
        }

        return $query->whereYear('broadcast_date', (int) $year);
    }

    /**
     * Filter by channel name.
     */
    public function scopeFilterChannel(Builder $query, ?string $channel): Builder
    {
        if (empty($channel) || $channel === 'all') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($channel) {
            $q->where('channel->en', 'like', "%{$channel}%")
                ->orWhere('channel->bn', 'like', "%{$channel}%");
        });
    }

    public function setBroadcastTypeAttribute($value): void
    {
        $this->attributes['media_type'] = $value;
    }

    public function getBroadcastTypeAttribute()
    {
        return $this->attributes['media_type'] ?? null;
    }

    public function setChannelAttribute($value): void
    {
        if (is_string($value)) {
            $this->attributes['channel'] = json_encode(['en' => $value, 'bn' => $value]);
        } elseif (is_array($value)) {
            $this->attributes['channel'] = json_encode($value);
        }
    }

    public function setProgramNameAttribute($value): void
    {
        if (is_string($value)) {
            $this->attributes['program'] = json_encode(['en' => $value, 'bn' => $value]);
        } elseif (is_array($value)) {
            $this->attributes['program'] = json_encode($value);
        }
    }

    public function getProgramNameAttribute()
    {
        $prog = $this->program;
        if (is_array($prog)) {
            return $prog[app()->getLocale()] ?? $prog['en'] ?? $prog['bn'] ?? null;
        }
        return $prog;
    }

    public function setAppearanceDateAttribute($value): void
    {
        $this->attributes['broadcast_date'] = $value;
    }

    public function getAppearanceDateAttribute()
    {
        return $this->broadcast_date?->format('Y-m-d') ?: ($this->attributes['broadcast_date'] ?? null);
    }

    public function setExternalUrlAttribute($value): void
    {
        $this->attributes['video_url'] = $value;
    }

    public function getExternalUrlAttribute()
    {
        return $this->video_url;
    }
}

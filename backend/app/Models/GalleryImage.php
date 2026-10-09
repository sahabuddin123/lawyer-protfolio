<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryImage extends Model
{
    use HasFactory, HasSortOrder, HasTranslations;

    protected $table = 'gallery_images';

    public array $translatable = [
        'caption',
        'alt_text',
    ];

    protected $fillable = [
        'album_id',
        'media_id',
        'caption',
        'alt_text',
        'sort_order',
        'is_featured',
        'visibility',
        'metadata',
    ];

    protected $casts = [
        'caption' => 'array',
        'alt_text' => 'array',
        'metadata' => 'array',
        'sort_order' => 'integer',
        'is_featured' => 'boolean',
    ];

    public function album(): BelongsTo
    {
        return $this->belongsTo(GalleryAlbum::class, 'album_id');
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'media_id');
    }

    public function getFeaturedAttribute(): bool
    {
        return (bool) $this->is_featured;
    }

    public function setFeaturedAttribute(mixed $value): void
    {
        $this->attributes['is_featured'] = (bool) $value;
    }

    public function getUrlAttribute(): ?string
    {
        return $this->media?->url;
    }

    public function getVariantsAttribute(): array
    {
        return $this->media?->variants ?? [];
    }

    public function getWidthAttribute(): ?int
    {
        return $this->media?->width;
    }

    public function getHeightAttribute(): ?int
    {
        return $this->media?->height;
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('visibility', 'public');
    }
}

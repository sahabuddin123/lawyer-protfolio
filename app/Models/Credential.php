<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Credential extends Model
{
    use HasFactory, HasSortOrder, HasTranslations;

    protected $fillable = [
        'category',
        'title',
        'institution',
        'description',
        'year',
        'credential_id',
        'certificate_media_id',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'title' => 'array',
        'institution' => 'array',
        'description' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function certificate(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'certificate_media_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }
}

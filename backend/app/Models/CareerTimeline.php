<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CareerTimeline extends Model
{
    use HasFactory, HasSortOrder, HasTranslations;

    protected $fillable = [
        'period',
        'title',
        'organization',
        'description',
        'is_current',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'title' => 'array',
        'organization' => 'array',
        'description' => 'array',
        'is_current' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}

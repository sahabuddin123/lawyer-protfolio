<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    use HasFactory, HasSortOrder, HasTranslations;

    protected $fillable = [
        'section_key',
        'title',
        'subtitle',
        'content',
        'settings',
        'sort_order',
        'is_enabled',
    ];

    protected $casts = [
        'title' => 'array',
        'subtitle' => 'array',
        'content' => 'array',
        'settings' => 'array',
        'sort_order' => 'integer',
        'is_enabled' => 'boolean',
    ];

    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }
}

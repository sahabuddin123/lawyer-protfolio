<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    use HasFactory, HasSortOrder, HasTranslations;

    protected $table = 'educations';

    protected $fillable = [
        'degree',
        'institution',
        'department',
        'description',
        'year_completed',
        'distinction',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'degree' => 'array',
        'institution' => 'array',
        'department' => 'array',
        'description' => 'array',
        'distinction' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}

<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfessionalMembership extends Model
{
    use HasFactory, HasSortOrder, HasTranslations;

    protected $fillable = [
        'organization',
        'role',
        'description',
        'membership_number',
        'year_joined',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'organization' => 'array',
        'role' => 'array',
        'description' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}

<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory, HasSortOrder, HasTranslations;

    protected $fillable = [
        'parent_id',
        'type',
        'name',
        'slug',
        'description',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'name' => 'array',
        'description' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->ordered();
    }

    public function legalResearches(): HasMany
    {
        return $this->hasMany(LegalResearch::class);
    }

    public function judgmentReviews(): HasMany
    {
        return $this->hasMany(JudgmentReview::class);
    }

    public function publications(): HasMany
    {
        return $this->hasMany(Publication::class);
    }

    public function mediaPress(): HasMany
    {
        return $this->hasMany(MediaPress::class);
    }

    public function mediaAppearances(): HasMany
    {
        return $this->hasMany(MediaAppearance::class);
    }
}


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
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourtroomExperience extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'case_number',
        'court',
        'case_type',
        'year',
        'practice_area_id',
        'legal_area',
        'role',
        'summary',
        'description',
        'issues',
        'arguments',
        'outcome',
        'judgment_date',
        'featured_image_id',
        'visibility',
        'status',
        'is_featured',
        'sort_order',
        'published_at',
    ];

    protected $casts = [
        'title' => 'array',
        'year' => 'integer',
        'practice_area_id' => 'integer',
        'legal_area' => 'array',
        'role' => 'array',
        'summary' => 'array',
        'description' => 'array',
        'issues' => 'array',
        'arguments' => 'array',
        'outcome' => 'array',
        'judgment_date' => 'date',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
    ];

    public function practiceArea(): BelongsTo
    {
        return $this->belongsTo(PracticeArea::class, 'practice_area_id');
    }

    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_image_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(CaseDocument::class, 'courtroom_experience_id')->ordered();
    }

    public function publicDocuments(): HasMany
    {
        return $this->hasMany(CaseDocument::class, 'courtroom_experience_id')
            ->where('is_confidential', false)
            ->ordered();
    }

    /**
     * Scope query to public visibility.
     */
    public function scopePublicVisibility(Builder $query): Builder
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope query to featured courtroom experiences.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope query to search term across title, case number, court, case type, and summary.
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
              ->orWhere('case_number', 'like', "%{$term}%")
              ->orWhere('court', 'like', "%{$term}%")
              ->orWhere('case_type', 'like', "%{$term}%")
              ->orWhere('legal_area->en', 'like', "%{$term}%")
              ->orWhere('legal_area->bn', 'like', "%{$term}%")
              ->orWhere('summary->en', 'like', "%{$term}%")
              ->orWhere('summary->bn', 'like', "%{$term}%");
        });
    }

    /**
     * Scope query by filter array.
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (!empty($filters['court'])) {
            $query->where('court', $filters['court']);
        }

        if (!empty($filters['case_type'])) {
            $query->where('case_type', $filters['case_type']);
        }

        if (!empty($filters['year'])) {
            $query->where('year', (int) $filters['year']);
        }

        if (!empty($filters['practice_area_id'])) {
            $query->where('practice_area_id', (int) $filters['practice_area_id']);
        }

        if (!empty($filters['visibility'])) {
            $query->where('visibility', $filters['visibility']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['is_featured']) && $filters['is_featured'] !== '') {
            $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query;
    }
}

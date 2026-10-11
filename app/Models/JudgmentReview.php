<?php

namespace App\Models;

use App\Traits\HasSeo;
use App\Traits\HasSortOrder;
use App\Traits\HasStatus;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JudgmentReview extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;

    protected $table = 'judgment_reviews';

    protected $fillable = [
        'case_name',
        'citation',
        'slug',
        'court',
        'judgment_date',
        'legal_area',
        'summary',
        'key_issues',
        'court_decision',
        'author_analysis',
        'practical_significance',
        'practice_area_id',
        'category_id',
        'legal_research_id',
        'author',
        'featured_image_id',
        'pdf_media_id',
        'status',
        'visibility',
        'is_featured',
        'sort_order',
        'published_at',
    ];

    protected $casts = [
        'case_name' => 'array',
        'judgment_date' => 'date',
        'legal_area' => 'array',
        'summary' => 'array',
        'key_issues' => 'array',
        'court_decision' => 'array',
        'author_analysis' => 'array',
        'practical_significance' => 'array',
        'author' => 'array',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
    ];

    /**
     * Translatable attribute keys for HasTranslations trait.
     */
    protected array $translatable = [
        'case_name',
        'legal_area',
        'summary',
        'key_issues',
        'court_decision',
        'author_analysis',
        'practical_significance',
        'author',
    ];

    public function practiceArea(): BelongsTo
    {
        return $this->belongsTo(PracticeArea::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function legalResearch(): BelongsTo
    {
        return $this->belongsTo(LegalResearch::class);
    }

    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_image_id');
    }

    public function pdfMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'pdf_media_id');
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * Attribute alias: legal_issues <-> key_issues
     */
    protected function legalIssues(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->key_issues,
            set: fn ($value) => ['key_issues' => is_array($value) ? json_encode($value) : $value],
        );
    }

    /**
     * Attribute alias: decision <-> court_decision
     */
    protected function decision(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->court_decision,
            set: fn ($value) => ['court_decision' => is_array($value) ? json_encode($value) : $value],
        );
    }

    /**
     * Attribute alias: significance <-> practical_significance
     */
    protected function significance(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->practical_significance,
            set: fn ($value) => ['practical_significance' => is_array($value) ? json_encode($value) : $value],
        );
    }

    /**
     * Scope query to public visibility.
     */
    public function scopePublicVisibility(Builder $query): Builder
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope query to featured judgment reviews.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope query to search term across case name, citation, court, summary, legal area.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        $term = trim($term);

        return $query->where(function (Builder $q) use ($term) {
            $q->where('citation', 'like', "%{$term}%")
                ->orWhere('court', 'like', "%{$term}%")
                ->orWhere('slug', 'like', "%{$term}%")
                ->orWhere('case_name->en', 'like', "%{$term}%")
                ->orWhere('case_name->bn', 'like', "%{$term}%")
                ->orWhere('legal_area->en', 'like', "%{$term}%")
                ->orWhere('legal_area->bn', 'like', "%{$term}%")
                ->orWhere('summary->en', 'like', "%{$term}%")
                ->orWhere('summary->bn', 'like', "%{$term}%")
                ->orWhere('author->en', 'like', "%{$term}%")
                ->orWhere('author->bn', 'like', "%{$term}%")
                ->orWhereHas('tags', function (Builder $tagQuery) use ($term) {
                    $tagQuery->where('slug', 'like', "%{$term}%")
                        ->orWhere('name->en', 'like', "%{$term}%")
                        ->orWhere('name->bn', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope query to filter by court.
     */
    public function scopeFilterCourt(Builder $query, ?string $court): Builder
    {
        if (empty($court)) {
            return $query;
        }

        return $query->where('court', 'like', "%" . trim($court) . "%");
    }

    /**
     * Scope query to filter by legal area.
     */
    public function scopeFilterLegalArea(Builder $query, ?string $area): Builder
    {
        if (empty($area)) {
            return $query;
        }

        $area = trim($area);

        return $query->where(function (Builder $q) use ($area) {
            $q->where('legal_area->en', 'like', "%{$area}%")
                ->orWhere('legal_area->bn', 'like', "%{$area}%");
        });
    }

    /**
     * Scope query to filter by practice area ID or slug.
     */
    public function scopeFilterPracticeArea(Builder $query, $practiceArea): Builder
    {
        if (empty($practiceArea)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($practiceArea) {
            if (is_numeric($practiceArea)) {
                $q->where('practice_area_id', $practiceArea);
            } else {
                $q->whereHas('practiceArea', function (Builder $pQuery) use ($practiceArea) {
                    $pQuery->where('slug', $practiceArea);
                });
            }
        });
    }

    /**
     * Scope query to filter by category ID or slug.
     */
    public function scopeFilterCategory(Builder $query, $category): Builder
    {
        if (empty($category)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($category) {
            if (is_numeric($category)) {
                $q->where('category_id', $category);
            } else {
                $q->whereHas('category', function (Builder $cQuery) use ($category) {
                    $cQuery->where('slug', $category);
                });
            }
        });
    }

    /**
     * Scope query to filter by tag slug.
     */
    public function scopeFilterTag(Builder $query, ?string $tag): Builder
    {
        if (empty($tag)) {
            return $query;
        }

        return $query->whereHas('tags', function (Builder $q) use ($tag) {
            $q->where('slug', $tag);
        });
    }

    /**
     * Scope query to filter by year of judgment date.
     */
    public function scopeFilterYear(Builder $query, ?int $year): Builder
    {
        if (empty($year)) {
            return $query;
        }

        return $query->whereYear('judgment_date', $year);
    }
}

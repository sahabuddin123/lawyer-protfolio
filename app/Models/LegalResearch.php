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

class LegalResearch extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;

    protected $table = 'legal_researches';

    protected $fillable = [
        'category_id',
        'research_type',
        'title',
        'slug',
        'author',
        'excerpt',
        'content',
        'research_date',
        'featured_image_id',
        'pdf_media_id',
        'external_url',
        'view_count',
        'status',
        'visibility',
        'is_featured',
        'sort_order',
        'published_at',
    ];

    protected $casts = [
        'title' => 'array',
        'author' => 'array',
        'excerpt' => 'array',
        'content' => 'array',
        'research_date' => 'date',
        'view_count' => 'integer',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
    ];

    /**
     * Translatable attribute keys for HasTranslations trait.
     */
    protected array $translatable = [
        'title',
        'author',
        'excerpt',
        'content',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_image_id');
    }

    public function pdfMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'pdf_media_id');
    }

    public function judgmentReviews(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(JudgmentReview::class, 'legal_research_id');
    }

    /**
     * Scope query to public visibility.
     */
    public function scopePublicVisibility(Builder $query): Builder
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope query to featured research monographs.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope query to search term across title, author, excerpt, and slug.
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
                ->orWhere('author->en', 'like', "%{$term}%")
                ->orWhere('author->bn', 'like', "%{$term}%")
                ->orWhere('excerpt->en', 'like', "%{$term}%")
                ->orWhere('excerpt->bn', 'like', "%{$term}%")
                ->orWhereHas('tags', function (Builder $tagQuery) use ($term) {
                    $tagQuery->where('slug', 'like', "%{$term}%")
                        ->orWhere('name->en', 'like', "%{$term}%")
                        ->orWhere('name->bn', 'like', "%{$term}%");
                })
                ->orWhereHas('category', function (Builder $catQuery) use ($term) {
                    $catQuery->where('slug', 'like', "%{$term}%")
                        ->orWhere('name->en', 'like', "%{$term}%")
                        ->orWhere('name->bn', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope query to filter by category slug or ID.
     */
    public function scopeFilterCategory(Builder $query, ?string $category): Builder
    {
        if (empty($category)) {
            return $query;
        }

        return $query->whereHas('category', function (Builder $q) use ($category) {
            $q->where('slug', $category)->orWhere('id', $category);
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
     * Scope query to filter by research type.
     */
    public function scopeFilterType(Builder $query, ?string $type): Builder
    {
        if (empty($type)) {
            return $query;
        }

        return $query->where('research_type', $type);
    }

    /**
     * Check if research is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if research is public.
     */
    public function isPublic(): bool
    {
        return $this->visibility === 'public';
    }

    /**
     * Calculate approximate reading time in minutes based on content words.
     */
    public function readingTime(?string $locale = null): int
    {
        $locale = $locale ?: app()->getLocale();
        $raw = $this->getTranslated('content', $locale);
        $text = strip_tags($raw ?: '');
        $words = str_word_count($text);

        return max(1, (int) ceil($words / 200));
    }
}

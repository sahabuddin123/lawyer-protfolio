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

class Publication extends Model
{
    use HasFactory, HasSeo, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;

    protected $fillable = [
        'category_id',
        'publication_type',
        'title',
        'slug',
        'publication_name',
        'publication_date',
        'author',
        'excerpt',
        'content',
        'external_url',
        'cover_image_id',
        'pdf_media_id',
        'status',
        'visibility',
        'is_featured',
        'sort_order',
        'published_at',
    ];

    protected $translatable = [
        'title',
        'publication_name',
        'author',
        'excerpt',
        'content',
    ];

    protected $casts = [
        'title' => 'array',
        'publication_name' => 'array',
        'publication_date' => 'date',
        'author' => 'array',
        'excerpt' => 'array',
        'content' => 'array',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function coverImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_image_id');
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
     * Scope query to public visibility.
     */
    public function scopePublicVisibility(Builder $query): Builder
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope query to featured publications.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope query to search term across title, author, publication name, excerpt, tags.
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
                ->orWhere('publication_name->en', 'like', "%{$term}%")
                ->orWhere('publication_name->bn', 'like', "%{$term}%")
                ->orWhere('excerpt->en', 'like', "%{$term}%")
                ->orWhere('excerpt->bn', 'like', "%{$term}%")
                ->orWhere('publication_type', 'like', "%{$term}%")
                ->orWhereHas('tags', function (Builder $tagQuery) use ($term) {
                    $tagQuery->where('slug', 'like', "%{$term}%")
                        ->orWhere('name->en', 'like', "%{$term}%")
                        ->orWhere('name->bn', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope query to filter by publication type.
     */
    public function scopeFilterType(Builder $query, ?string $type): Builder
    {
        if (empty($type) || $type === 'all') {
            return $query;
        }

        return $query->where('publication_type', trim($type));
    }

    /**
     * Scope query to filter by category ID or slug.
     */
    public function scopeFilterCategory(Builder $query, $categoryId): Builder
    {
        if (empty($categoryId) || $categoryId === 'all') {
            return $query;
        }

        if (is_numeric($categoryId)) {
            return $query->where('category_id', (int) $categoryId);
        }

        return $query->whereHas('category', function (Builder $q) use ($categoryId) {
            $q->where('slug', trim($categoryId));
        });
    }

    /**
     * Scope query to filter by tag ID or slug.
     */
    public function scopeFilterTag(Builder $query, $tagId): Builder
    {
        if (empty($tagId) || $tagId === 'all') {
            return $query;
        }

        return $query->whereHas('tags', function (Builder $q) use ($tagId) {
            if (is_numeric($tagId)) {
                $q->where('tags.id', (int) $tagId);
            } else {
                $q->where('tags.slug', trim($tagId));
            }
        });
    }

    /**
     * Scope query to filter by author.
     */
    public function scopeFilterAuthor(Builder $query, ?string $author): Builder
    {
        if (empty($author)) {
            return $query;
        }

        $author = trim($author);

        return $query->where(function (Builder $q) use ($author) {
            $q->where('author->en', 'like', "%{$author}%")
                ->orWhere('author->bn', 'like', "%{$author}%");
        });
    }

    /**
     * Scope query to filter by publication year.
     */
    public function scopeFilterYear(Builder $query, $year): Builder
    {
        if (empty($year)) {
            return $query;
        }

        return $query->whereYear('publication_date', (int) $year);
    }
}

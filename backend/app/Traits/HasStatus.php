<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasStatus
{
    /**
     * Scope query to published records.
     */
    public function scopePublished(Builder $query): Builder
    {
        $query->where($this->getTable() . '.status', 'published');

        if (in_array('published_at', $this->getDates(), true) || in_array('published_at', array_keys($this->getCasts()), true)) {
            $query->where(function ($q) {
                $q->whereNull($this->getTable() . '.published_at')
                  ->orWhere($this->getTable() . '.published_at', '<=', now());
            });
        }

        return $query;
    }

    /**
     * Scope query to draft records.
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where($this->getTable() . '.status', 'draft');
    }

    /**
     * Scope query to archived records.
     */
    public function scopeArchived(Builder $query): Builder
    {
        return $query->where($this->getTable() . '.status', 'archived');
    }

    /**
     * Check if model is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if model is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if model is archived.
     */
    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }
}

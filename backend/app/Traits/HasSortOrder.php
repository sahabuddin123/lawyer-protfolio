<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasSortOrder
{
    /**
     * Boot the sort order trait.
     */
    protected static function bootHasSortOrder(): void
    {
        static::creating(function ($model) {
            if ($model->sort_order === null) {
                $max = static::max('sort_order') ?? 0;
                $model->sort_order = $max + 1;
            }
        });
    }

    /**
     * Scope query to order by sort_order.
     */
    public function scopeOrdered(Builder $query, string $direction = 'asc'): Builder
    {
        return $query->orderBy($this->getTable() . '.sort_order', $direction);
    }
}

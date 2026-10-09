<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseDocument extends Model
{
    use HasFactory, HasSortOrder, HasTranslations;

    protected $fillable = [
        'courtroom_experience_id',
        'title',
        'document_type',
        'media_id',
        'is_confidential',
        'sort_order',
        'download_count',
    ];

    protected $casts = [
        'title' => 'array',
        'courtroom_experience_id' => 'integer',
        'media_id' => 'integer',
        'is_confidential' => 'boolean',
        'sort_order' => 'integer',
        'download_count' => 'integer',
    ];

    public function courtroomExperience(): BelongsTo
    {
        return $this->belongsTo(CourtroomExperience::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    /**
     * Scope query to public documents.
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_confidential', false);
    }

    /**
     * Scope query to confidential documents.
     */
    public function scopeConfidential(Builder $query): Builder
    {
        return $query->where('is_confidential', true);
    }
}

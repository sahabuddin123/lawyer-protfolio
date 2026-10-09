<?php

namespace App\Models;

use App\Traits\HasStatus;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Video extends Model
{
    use HasFactory, HasStatus, HasTranslations, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'platform',
        'video_url',
        'video_id',
        'thumbnail_id',
        'duration',
        'description',
        'published_date',
        'status',
        'is_featured',
    ];

    protected $casts = [
        'title' => 'array',
        'description' => 'array',
        'published_date' => 'date',
        'is_featured' => 'boolean',
    ];

    public function thumbnail(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'thumbnail_id');
    }
}

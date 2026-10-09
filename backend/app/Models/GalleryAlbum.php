<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasStatus;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GalleryAlbum extends Model
{
    use HasFactory, HasSortOrder, HasStatus, HasTranslations, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover_image_id',
        'category_id',
        'event_date',
        'status',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'title' => 'array',
        'description' => 'array',
        'event_date' => 'date',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function coverImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_image_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(GalleryImage::class, 'album_id')->ordered();
    }
}

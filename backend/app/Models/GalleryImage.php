<?php

namespace App\Models;

use App\Traits\HasSortOrder;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryImage extends Model
{
    use HasFactory, HasSortOrder, HasTranslations;

    protected $fillable = [
        'album_id',
        'media_id',
        'caption',
        'alt_text',
        'sort_order',
        'is_featured',
    ];

    protected $casts = [
        'caption' => 'array',
        'alt_text' => 'array',
        'sort_order' => 'integer',
        'is_featured' => 'boolean',
    ];

    public function album(): BelongsTo
    {
        return $this->belongsTo(GalleryAlbum::class, 'album_id');
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}

<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SeoMeta extends Model
{
    use HasFactory, HasTranslations;

    protected $table = 'seo_meta';

    protected $fillable = [
        'seotable_type',
        'seotable_id',
        'seo_title',
        'meta_description',
        'canonical_url',
        'og_title',
        'og_description',
        'og_image_id',
        'robots',
        'schema_type',
        'structured_data',
    ];

    protected $casts = [
        'seo_title' => 'array',
        'meta_description' => 'array',
        'og_title' => 'array',
        'og_description' => 'array',
        'structured_data' => 'array',
    ];

    public function seotable(): MorphTo
    {
        return $this->morphTo();
    }

    public function ogImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'og_image_id');
    }
}

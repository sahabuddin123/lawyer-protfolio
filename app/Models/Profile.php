<?php

namespace App\Models;

use App\Traits\HasSeo;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    use HasFactory, HasSeo, HasTranslations;

    protected $fillable = [
        'name',
        'title',
        'subtitle',
        'short_bio',
        'long_bio',
        'status',
        'profile_photo_id',
        'court_robes_photo_id',
        'signature_photo_id',
        'bar_council_enrollment',
        'high_court_enrollment',
        'appellate_division_enrollment',
        'chambers_address',
        'office_address',
        'phone',
        'email',
        'whatsapp',
        'philosophy',
        'legal_approach',
    ];

    protected $casts = [
        'name' => 'array',
        'title' => 'array',
        'subtitle' => 'array',
        'short_bio' => 'array',
        'long_bio' => 'array',
        'chambers_address' => 'array',
        'office_address' => 'array',
        'philosophy' => 'array',
        'legal_approach' => 'array',
    ];

    protected $attributes = [
        'status' => 'published',
    ];

    public function profilePhoto(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'profile_photo_id');
    }

    public function courtRobesPhoto(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'court_robes_photo_id');
    }

    public function signaturePhoto(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'signature_photo_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }
}

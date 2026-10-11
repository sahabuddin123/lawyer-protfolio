<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Media extends Model
{
    use HasFactory, HasTranslations;

    protected $table = 'media';

    protected $fillable = [
        'uuid',
        'disk',
        'directory',
        'filename',
        'original_name',
        'mime_type',
        'extension',
        'size_bytes',
        'width',
        'height',
        'alt_text',
        'caption',
        'variants',
        'uploaded_by',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'alt_text' => 'array',
        'caption' => 'array',
        'variants' => 'array',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Media $media) {
            if (empty($media->uuid)) {
                $media->uuid = (string) Str::uuid();
            }
        });
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFilePathAttribute(): string
    {
        return $this->directory . '/' . $this->filename;
    }

    public function getUrlAttribute(): string
    {
        $path = $this->directory . '/' . $this->filename;
        if ($this->disk === 'public') {
            return Storage::disk('public')->url($path);
        }

        return $path;
    }

    public function getVariantUrl(string $variant): ?string
    {
        $variants = $this->variants ?? [];
        return $variants[$variant] ?? $this->url;
    }
}

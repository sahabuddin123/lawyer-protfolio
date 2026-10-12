<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FooterTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'status',
        'is_active',
        'display_conditions',
        'layout_data',
        'created_by',
        'updated_by',
        'published_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_conditions' => 'array',
        'layout_data' => 'array',
        'published_at' => 'datetime',
    ];

    public function revisions(): HasMany
    {
        return $this->hasMany(FooterRevision::class)->orderBy('version', 'desc');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('status', 'published');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}

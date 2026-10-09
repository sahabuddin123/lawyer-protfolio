<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConsultationRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'subject',
        'practice_area_id',
        'preferred_date',
        'preferred_time',
        'message',
        'consent_given',
        'consented_at',
        'status',
        'admin_notes',
        'ip_address',
        'user_agent',
    ];

    protected $hidden = [
        'admin_notes',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'consent_given' => 'boolean',
        'consented_at' => 'datetime',
    ];

    public function practiceArea(): BelongsTo
    {
        return $this->belongsTo(PracticeArea::class);
    }

    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, ?string $term)
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%")
              ->orWhere('subject', 'like', "%{$term}%");
        });
    }

    public function scopePracticeArea($query, $practiceAreaId)
    {
        return $query->where('practice_area_id', $practiceAreaId);
    }
}

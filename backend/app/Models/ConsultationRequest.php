<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'subject',
        'practice_area_id',
        'preferred_date',
        'message',
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
    ];

    public function practiceArea(): BelongsTo
    {
        return $this->belongsTo(PracticeArea::class);
    }

    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }
}

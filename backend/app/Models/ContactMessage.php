<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'subject',
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

    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }
}

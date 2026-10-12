<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FooterRevision extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'footer_template_id',
        'version',
        'layout_data',
        'change_summary',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'version' => 'integer',
        'layout_data' => 'array',
        'created_at' => 'datetime',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(FooterTemplate::class, 'footer_template_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'slug',
    ];

    protected $casts = [
        'name' => 'array',
    ];

    public function legalResearches(): MorphToMany
    {
        return $this->morphedByMany(LegalResearch::class, 'taggable');
    }

    public function judgmentReviews(): MorphToMany
    {
        return $this->morphedByMany(JudgmentReview::class, 'taggable');
    }

    public function publications(): MorphToMany
    {
        return $this->morphedByMany(Publication::class, 'taggable');
    }

    public function mediaPress(): MorphToMany
    {
        return $this->morphedByMany(MediaPress::class, 'taggable');
    }

    public function mediaAppearances(): MorphToMany
    {
        return $this->morphedByMany(MediaAppearance::class, 'taggable');
    }
}


<?php

namespace App\Traits;

use App\Models\SeoMeta;
use Illuminate\Database\Eloquent\Relations\MorphOne;

trait HasSeo
{
    /**
     * Get the SEO metadata for the model.
     */
    public function seo(): MorphOne
    {
        return $this->morphOne(SeoMeta::class, 'seotable');
    }
}

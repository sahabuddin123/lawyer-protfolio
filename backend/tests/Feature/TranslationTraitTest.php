<?php

namespace Tests\Feature;

use App\Models\Category;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class TranslationTraitTest extends TestCase
{
    /**
     * Test HasTranslations trait resolves English and Bengali locales.
     */
    public function test_translatable_attribute_resolves_locales(): void
    {
        $category = new Category([
            'name' => [
                'en' => 'Constitutional Law',
                'bn' => 'সাংবিধানিক আইন',
            ],
            'slug' => 'test-constitutional-law',
            'type' => 'research',
        ]);

        App::setLocale('en');
        $this->assertEquals('Constitutional Law', $category->getTranslated('name'));

        App::setLocale('bn');
        $this->assertEquals('সাংবিধানিক আইন', $category->getTranslated('name'));

        // Reset locale
        App::setLocale('en');
    }

    /**
     * Test HasTranslations falls back to English when requested locale is missing.
     */
    public function test_translatable_attribute_falls_back_to_english(): void
    {
        $category = new Category([
            'name' => [
                'en' => 'Supreme Court Precedents',
            ],
            'slug' => 'test-precedents',
            'type' => 'courtroom',
        ]);

        App::setLocale('bn');
        // Because Bengali translation is missing, it should fall back to English
        $this->assertEquals('Supreme Court Precedents', $category->getTranslated('name'));

        App::setLocale('en');
    }
}

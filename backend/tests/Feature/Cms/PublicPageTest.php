<?php

namespace Tests\Feature\Cms;

use App\Models\Page;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicPageTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();

        if (Page::where('slug', 'disclaimer')->doesntExist()) {
            $this->seed(\Database\Seeders\CmsAndSettingsSeeder::class);
        }
    }

    public function test_published_page_is_accessible_by_slug(): void
    {
        $response = $this->getJson('/api/v1/pages/disclaimer');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'slug' => 'disclaimer',
                    'status' => 'published',
                ],
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'slug',
                    'title',
                    'content',
                    'status',
                    'published_at',
                    'seo',
                ],
            ]);
    }

    public function test_draft_page_returns_404_on_public_api(): void
    {
        $draft = Page::create([
            'slug' => 'draft-test-page',
            'title' => ['en' => 'Draft Page', 'bn' => 'ড্রাফট পেজ'],
            'content' => ['en' => 'Internal draft content', 'bn' => 'খসড়া বিষয়বস্তু'],
            'status' => 'draft',
        ]);

        $response = $this->getJson("/api/v1/pages/{$draft->slug}");
        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_archived_page_returns_404_on_public_api(): void
    {
        $archived = Page::create([
            'slug' => 'archived-test-page',
            'title' => ['en' => 'Archived Page', 'bn' => 'আর্কাইভ পেজ'],
            'content' => ['en' => 'Old content', 'bn' => 'পুরনো বিষয়বস্তু'],
            'status' => 'archived',
        ]);

        $response = $this->getJson("/api/v1/pages/{$archived->slug}");
        $response->assertStatus(404);
    }

    public function test_page_includes_seo_metadata(): void
    {
        $response = $this->getJson('/api/v1/pages/disclaimer');
        $response->assertStatus(200);

        $seo = $response->json('data.seo');
        $this->assertNotNull($seo);
        $this->assertNotEmpty($seo['canonical_url']);
        $this->assertEquals('index, follow', $seo['robots']);
    }
}

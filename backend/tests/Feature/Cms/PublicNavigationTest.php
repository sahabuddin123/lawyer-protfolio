<?php

namespace Tests\Feature\Cms;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicNavigationTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();
    }

    public function test_public_navigation_returns_menus_by_location(): void
    {
        $response = $this->getJson('/api/v1/navigation');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Navigation menus retrieved successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'header' => ['id', 'location', 'title', 'items'],
                    'footer' => ['id', 'location', 'title', 'items'],
                    'legal' => ['id', 'location', 'title', 'items'],
                ],
            ]);
    }

    public function test_navigation_items_are_hierarchically_nested(): void
    {
        $menu = Menu::where('location', 'header')->first();

        // Create parent and child
        $parent = MenuItem::create([
            'menu_id' => $menu->id,
            'title' => ['en' => 'Parent Menu', 'bn' => 'প্যারেন্ট মেনু'],
            'url' => '/parent',
            'target' => '_self',
            'sort_order' => 99,
        ]);

        $child = MenuItem::create([
            'menu_id' => $menu->id,
            'parent_id' => $parent->id,
            'title' => ['en' => 'Sub Menu Item', 'bn' => 'সাব মেনু'],
            'url' => '/parent/sub',
            'target' => '_self',
            'sort_order' => 1,
        ]);

        CmsCacheService::forgetNavigation();

        $response = $this->getJson('/api/v1/navigation');
        $response->assertStatus(200);

        $headerItems = $response->json('data.header.items');
        $foundParent = null;
        foreach ($headerItems as $item) {
            if ($item['id'] === $parent->id) {
                $foundParent = $item;
                break;
            }
        }

        $this->assertNotNull($foundParent);
        $this->assertNotEmpty($foundParent['children']);
        $this->assertEquals($child->id, $foundParent['children'][0]['id']);
    }

    public function test_navigation_titles_are_localized(): void
    {
        $responseEn = $this->withHeaders(['Accept-Language' => 'en'])->getJson('/api/v1/navigation');
        $responseEn->assertStatus(200);
        $this->assertEquals('About', $responseEn->json('data.header.items.0.title'));

        $responseBn = $this->withHeaders(['Accept-Language' => 'bn'])->getJson('/api/v1/navigation');
        $responseBn->assertStatus(200);
        $this->assertEquals('পরিচয়', $responseBn->json('data.header.items.0.title'));
    }
}

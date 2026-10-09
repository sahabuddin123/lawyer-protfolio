<?php

namespace Tests\Feature\Cms;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\User;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminMenuTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_menu@nijamuddin.com',
            'password' => bcrypt('Password123!#'),
            'is_active' => true,
        ]);
        $this->admin->assignRole('admin');
    }

    public function test_admin_can_create_menu_and_items(): void
    {
        // 1. Create Menu
        $menuResponse = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/menus', [
            'location' => 'custom_header',
            'title' => 'Custom Header Menu',
        ]);

        $menuResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'location' => 'custom_header',
                    'title' => 'Custom Header Menu',
                ],
            ]);

        $menuId = $menuResponse->json('data.id');

        // 2. Add Menu Item
        $itemResponse = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/menu-items', [
            'menu_id' => $menuId,
            'title' => ['en' => 'Publications Hub', 'bn' => 'প্রকাশনা'],
            'url' => '/publications',
            'target' => '_self',
        ]);

        $itemResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'url' => '/publications',
                    'target' => '_self',
                ],
            ]);
    }

    public function test_menu_item_with_unsafe_protocol_is_rejected(): void
    {
        $menu = Menu::where('location', 'header')->first();

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/menu-items', [
            'menu_id' => $menu->id,
            'title' => ['en' => 'Malicious Link', 'bn' => 'ক্ষতিকর লিংক'],
            'url' => 'javascript:alert(document.cookie)',
            'target' => '_blank',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['url']);
    }

    public function test_admin_can_reorder_menu_items(): void
    {
        $menu = Menu::where('location', 'header')->first();
        $items = MenuItem::where('menu_id', $menu->id)->take(2)->get();

        $reorderPayload = [
            'items' => [
                ['id' => $items[0]->id, 'sort_order' => 10],
                ['id' => $items[1]->id, 'sort_order' => 5],
            ],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson("/api/v1/admin/menus/{$menu->id}/reorder", $reorderPayload);
        $response->assertStatus(200);

        $this->assertEquals(10, $items[0]->fresh()->sort_order);
        $this->assertEquals(5, $items[1]->fresh()->sort_order);
    }
}

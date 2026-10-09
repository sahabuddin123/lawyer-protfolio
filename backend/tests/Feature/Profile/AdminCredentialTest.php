<?php

namespace Tests\Feature\Profile;

use App\Models\Credential;
use App\Models\User;
use Database\Seeders\ProfileAndCredentialsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCredentialTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ProfileAndCredentialsSeeder::class);

        $this->superAdmin = User::where('email', 'admin@nijamuddin.com')->first();
    }

    public function test_admin_can_list_credentials(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/v1/admin/credentials');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertCount(4, $data);
    }

    public function test_admin_can_create_credential(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'category' => 'certification',
            'title' => [
                'en' => 'Arbitration Certificate',
                'bn' => 'সালিসি সনদপত্র',
            ],
            'institution' => [
                'en' => 'Bangladesh International Arbitration Centre',
                'bn' => 'বাংলাদেশ ইন্টারন্যাশনাল আরবিট্রেশন সেন্টার',
            ],
            'description' => [
                'en' => 'Certified Commercial Arbitrator.',
                'bn' => 'প্রত্যয়িত বাণিজ্যিক সালিসকারক।',
            ],
            'year' => '2023',
            'is_featured' => true,
            'is_active' => true,
            'sort_order' => 5,
        ];

        $response = $this->postJson('/api/v1/admin/credentials', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title.en', 'Arbitration Certificate');

        $this->assertDatabaseHas('credentials', [
            'category' => 'certification',
            'year' => '2023',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'credential_created',
        ]);
    }

    public function test_admin_can_update_credential(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $credential = Credential::first();

        $payload = [
            'category' => $credential->category,
            'title' => [
                'en' => 'Updated Credential Title',
                'bn' => 'হালনাগাদ সনদ',
            ],
            'institution' => $credential->institution,
            'is_featured' => false,
            'is_active' => true,
            'sort_order' => 10,
        ];

        $response = $this->putJson("/api/v1/admin/credentials/{$credential->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title.en', 'Updated Credential Title')
            ->assertJsonPath('data.is_featured', false);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'credential_updated',
        ]);
    }

    public function test_admin_can_delete_credential(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $credential = Credential::first();
        $id = $credential->id;

        $response = $this->deleteJson("/api/v1/admin/credentials/{$id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('credentials', ['id' => $id]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'credential_deleted',
        ]);
    }

    public function test_admin_can_reorder_credentials(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $ids = Credential::pluck('id')->toArray();
        $reversed = array_reverse($ids);

        $response = $this->postJson('/api/v1/admin/credentials/reorder', [
            'items' => $reversed,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $firstItem = Credential::find($reversed[0]);
        $this->assertEquals(1, $firstItem->sort_order);
    }
}

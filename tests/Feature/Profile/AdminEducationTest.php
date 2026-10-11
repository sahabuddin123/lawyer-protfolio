<?php

namespace Tests\Feature\Profile;

use App\Models\Education;
use App\Models\User;
use Database\Seeders\ProfileAndCredentialsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminEducationTest extends TestCase
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

    public function test_admin_can_list_educations(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/v1/admin/educations');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertCount(2, $response->json('data'));
    }

    public function test_admin_can_create_education(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'degree' => [
                'en' => 'Higher Secondary Certificate',
                'bn' => 'উচ্চ মাধ্যমিক সার্টিফিকেট',
            ],
            'institution' => [
                'en' => 'Govt. College',
                'bn' => 'সরকারি কলেজ',
            ],
            'department' => [
                'en' => 'Humanities',
                'bn' => 'মানবিক',
            ],
            'year_completed' => '2010',
            'is_active' => true,
            'sort_order' => 3,
        ];

        $response = $this->postJson('/api/v1/admin/educations', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.degree.en', 'Higher Secondary Certificate');

        $this->assertDatabaseHas('educations', [
            'year_completed' => '2010',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'education_created',
        ]);
    }

    public function test_admin_can_update_education(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $education = Education::first();

        $payload = [
            'degree' => [
                'en' => 'Updated Master of Laws',
                'bn' => 'হালনাগাদ এলএল.এম.',
            ],
            'institution' => $education->institution,
            'year_completed' => '2018',
            'is_active' => true,
            'sort_order' => 1,
        ];

        $response = $this->putJson("/api/v1/admin/educations/{$education->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.degree.en', 'Updated Master of Laws');

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'education_updated',
        ]);
    }

    public function test_admin_can_delete_education(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $education = Education::first();
        $id = $education->id;

        $response = $this->deleteJson("/api/v1/admin/educations/{$id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('educations', ['id' => $id]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'education_deleted',
        ]);
    }

    public function test_admin_can_reorder_educations(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $ids = Education::pluck('id')->toArray();
        $reversed = array_reverse($ids);

        $response = $this->postJson('/api/v1/admin/educations/reorder', [
            'items' => $reversed,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $firstItem = Education::find($reversed[0]);
        $this->assertEquals(1, $firstItem->sort_order);
    }
}

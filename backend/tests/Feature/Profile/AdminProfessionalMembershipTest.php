<?php

namespace Tests\Feature\Profile;

use App\Models\ProfessionalMembership;
use App\Models\User;
use Database\Seeders\ProfileAndCredentialsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProfessionalMembershipTest extends TestCase
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

    public function test_admin_can_create_membership(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'organization' => [
                'en' => 'Supreme Court Bar Association (SCBA)',
                'bn' => 'সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন',
            ],
            'role' => [
                'en' => 'Member',
                'bn' => 'সদস্য',
            ],
            'membership_number' => 'SCBA-1234',
            'year_joined' => '2020',
            'is_active' => true,
            'sort_order' => 1,
        ];

        $response = $this->postJson('/api/v1/admin/memberships', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.organization.en', 'Supreme Court Bar Association (SCBA)');

        $this->assertDatabaseHas('professional_memberships', [
            'membership_number' => 'SCBA-1234',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'membership_created',
        ]);
    }

    public function test_admin_can_update_membership(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $membership = ProfessionalMembership::create([
            'organization' => ['en' => 'Bar Association', 'bn' => 'বার অ্যাসোসিয়েশন'],
            'role' => ['en' => 'Life Member', 'bn' => 'আজীবন সদস্য'],
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $payload = [
            'organization' => ['en' => 'District Bar Association', 'bn' => 'জেলা বার অ্যাসোসিয়েশন'],
            'role' => ['en' => 'Executive Member', 'bn' => 'কার্যনির্বাহী সদস্য'],
            'is_active' => true,
            'sort_order' => 1,
        ];

        $response = $this->putJson("/api/v1/admin/memberships/{$membership->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.role.en', 'Executive Member');

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'membership_updated',
        ]);
    }

    public function test_admin_can_delete_membership(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $membership = ProfessionalMembership::create([
            'organization' => ['en' => 'Old Society', 'bn' => 'পুরাতন সমিতি'],
            'role' => ['en' => 'Member', 'bn' => 'সদস্য'],
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $response = $this->deleteJson("/api/v1/admin/memberships/{$membership->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('professional_memberships', ['id' => $membership->id]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'membership_deleted',
        ]);
    }
}

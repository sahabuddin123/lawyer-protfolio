<?php

namespace Tests\Feature\Profile;

use App\Models\CareerTimeline;
use App\Models\User;
use Database\Seeders\ProfileAndCredentialsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCareerTimelineTest extends TestCase
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

    public function test_admin_can_create_timeline_milestone(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'period' => '2019 - Present',
            'title' => [
                'en' => 'Advocate',
                'bn' => 'আইনজীবী',
            ],
            'organization' => [
                'en' => 'Supreme Court of Bangladesh',
                'bn' => 'বাংলাদেশ সুপ্রিম কোর্ট',
            ],
            'description' => [
                'en' => 'Litigation in High Court Division.',
                'bn' => 'হাইকোর্ট বিভাগে মামলা পরিচালনা।',
            ],
            'is_current' => true,
            'is_active' => true,
            'sort_order' => 1,
        ];

        $response = $this->postJson('/api/v1/admin/timeline', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.period', '2019 - Present')
            ->assertJsonPath('data.title.en', 'Advocate');

        $this->assertDatabaseHas('career_timelines', [
            'period' => '2019 - Present',
            'is_current' => true,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'timeline_created',
        ]);
    }

    public function test_admin_can_update_timeline_milestone(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $timeline = CareerTimeline::create([
            'period' => '2015 - 2018',
            'title' => ['en' => 'Junior Counsel', 'bn' => 'কনিষ্ঠ আইনজীবী'],
            'organization' => ['en' => 'Legal Chambers', 'bn' => 'আইনি চেম্বার'],
            'is_current' => false,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $payload = [
            'period' => '2015 - 2018',
            'title' => ['en' => 'Associate Advocate', 'bn' => 'সহযোগী আইনজীবী'],
            'organization' => ['en' => 'Legal Chambers', 'bn' => 'আইনি চেম্বার'],
            'is_current' => false,
            'is_active' => true,
            'sort_order' => 2,
        ];

        $response = $this->putJson("/api/v1/admin/timeline/{$timeline->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title.en', 'Associate Advocate');

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'timeline_updated',
        ]);
    }

    public function test_admin_can_delete_timeline_milestone(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $timeline = CareerTimeline::create([
            'period' => '2012 - 2015',
            'title' => ['en' => 'Apprentice', 'bn' => 'শিক্ষানবিস'],
            'organization' => ['en' => 'District Bar', 'bn' => 'জেলা বার'],
            'is_current' => false,
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $response = $this->deleteJson("/api/v1/admin/timeline/{$timeline->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('career_timelines', ['id' => $timeline->id]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'timeline_deleted',
        ]);
    }
}

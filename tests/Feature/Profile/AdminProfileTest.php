<?php

namespace Tests\Feature\Profile;

use App\Models\ActivityLog;
use App\Models\Profile;
use App\Models\User;
use Database\Seeders\ProfileAndCredentialsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProfileTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ProfileAndCredentialsSeeder::class);

        $this->superAdmin = User::where('email', 'admin@nijamuddin.com')->first();

        $this->unauthorizedUser = User::factory()->create(['is_active' => true]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/profile');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        Sanctum::actingAs($this->unauthorizedUser);

        $response = $this->getJson('/api/v1/admin/profile');
        $response->assertStatus(403);
    }

    public function test_authorized_admin_can_retrieve_profile(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/v1/admin/profile');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name.en', 'Nijam Uddin (Haq)')
            ->assertJsonPath('data.name.bn', 'নিজাম উদ্দিন (হক)');
    }

    public function test_authorized_admin_can_update_profile_with_seo_and_sanitization(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'name' => [
                'en' => 'Advocate Nijam Uddin (Haq)',
                'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন (হক)',
            ],
            'title' => [
                'en' => 'Advocate, Supreme Court of Bangladesh',
                'bn' => 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট',
            ],
            'subtitle' => [
                'en' => 'Judicial Authority & Senior Legal Consultant',
                'bn' => 'বিচারিক কর্তৃপক্ষ ও সিনিয়র আইনি পরামর্শক',
            ],
            'short_bio' => [
                'en' => 'Senior appellate and constitutional counsel.',
                'bn' => 'আপিল ও সাংবিধানিক আইনজীবী।',
            ],
            'long_bio' => [
                'en' => '<p>Updated legal bio.</p><script>alert("xss")</script>',
                'bn' => '<p>হালনাগাদ জীবনবৃত্তান্ত।</p>',
            ],
            'status' => 'published',
            'chambers_address' => [
                'en' => 'Room 402, Supreme Court Bar Association',
                'bn' => 'কক্ষ ৪০২, সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন',
            ],
            'office_address' => [
                'en' => 'Chamber Annex, Dhaka',
                'bn' => 'চেম্বার অ্যানেক্স, ঢাকা',
            ],
            'phone' => '+880 1711 000000',
            'email' => 'advocate@nijamuddin.com',
            'whatsapp' => '+880 1711 000000',
            'seo' => [
                'seo_title' => [
                    'en' => 'Advocate Nijam Uddin Profile',
                    'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন পরিচিতি',
                ],
                'meta_description' => [
                    'en' => 'Custom meta description.',
                    'bn' => 'কাস্টম মেটা বিবরণ।',
                ],
                'canonical_url' => 'https://nijamuddin.com/about',
                'robots' => 'index, follow',
            ],
        ];

        $response = $this->putJson('/api/v1/admin/profile', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name.en', 'Advocate Nijam Uddin (Haq)');

        // Verify XSS was neutralized in long_bio
        $this->assertStringNotContainsString('<script>', $response->json('data.long_bio.en'));
        $this->assertStringContainsString('<p>Updated legal bio.</p>', $response->json('data.long_bio.en'));

        // Verify SEO polymorphic record updated
        $profile = Profile::first();
        $this->assertNotNull($profile->seo);
        $this->assertEquals('https://nijamuddin.com/about', $profile->seo->canonical_url);

        // Verify Audit Log was recorded
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'profile_updated',
            'user_id' => $this->superAdmin->id,
        ]);
    }
}

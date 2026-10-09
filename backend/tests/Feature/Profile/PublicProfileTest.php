<?php

namespace Tests\Feature\Profile;

use App\Models\Credential;
use App\Models\Education;
use App\Models\Profile;
use App\Models\User;
use Database\Seeders\ProfileAndCredentialsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicProfileTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ProfileAndCredentialsSeeder::class);
    }

    public function test_public_profile_endpoint_returns_success_envelope(): void
    {
        $response = $this->getJson('/api/v1/profile');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Nijam Uddin (Haq)')
            ->assertJsonPath('data.title', 'Advocate, Supreme Court of Bangladesh')
            ->assertJsonPath('data.bar_council_enrollment', 'Enrolled / Certified with Bangladesh Bar Council')
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'title',
                    'short_bio',
                    'long_bio',
                    'status',
                    'chambers_address',
                    'office_address',
                    'phone',
                    'email',
                    'seo',
                    'credentials',
                    'educations',
                ],
                'message',
            ]);
    }

    public function test_public_profile_respects_locale_switching(): void
    {
        $responseEn = $this->getJson('/api/v1/profile', ['Accept-Language' => 'en']);
        $responseEn->assertStatus(200)
            ->assertJsonPath('data.title', 'Advocate, Supreme Court of Bangladesh');

        $responseBn = $this->getJson('/api/v1/profile', ['Accept-Language' => 'bn']);
        $responseBn->assertStatus(200)
            ->assertJsonPath('data.title', 'অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট');
    }

    public function test_draft_or_hidden_profile_returns_404_publicly(): void
    {
        $profile = Profile::first();
        $profile->update(['status' => 'hidden']);

        \App\Services\CmsCacheService::forgetProfile();

        $response = $this->getJson('/api/v1/profile');
        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_public_credentials_endpoint_returns_credentials_and_education(): void
    {
        $response = $this->getJson('/api/v1/credentials');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'credentials',
                    'educations',
                ],
                'message',
            ]);

        $credentials = $response->json('data.credentials');
        $this->assertNotEmpty($credentials);
        $this->assertEquals('Supreme Court of Bangladesh', $credentials[0]['institution']);
    }

    public function test_public_timeline_endpoint_returns_timeline_and_memberships(): void
    {
        $response = $this->getJson('/api/v1/timeline');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'timeline',
                    'memberships',
                ],
                'message',
            ]);
    }
}

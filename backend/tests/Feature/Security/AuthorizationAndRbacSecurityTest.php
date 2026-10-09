<?php

namespace Tests\Feature\Security;

use App\Models\CourtroomExperience;
use App\Models\Publication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthorizationAndRbacSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    public function test_anonymous_user_blocked_from_admin_endpoints(): void
    {
        $endpoints = [
            ['GET', '/api/v1/admin/dashboard/stats'],
            ['GET', '/api/v1/admin/users'],
            ['GET', '/api/v1/admin/settings'],
            ['GET', '/api/v1/admin/courtroom'],
            ['POST', '/api/v1/admin/courtroom'],
            ['GET', '/api/v1/admin/contacts'],
            ['GET', '/api/v1/admin/consultations'],
        ];

        foreach ($endpoints as [$method, $uri]) {
            $response = $this->json($method, $uri);
            $response->assertStatus(401)
                ->assertJson([
                    'success' => false,
                    'error_code' => 'UNAUTHENTICATED',
                ]);
        }
    }

    public function test_authenticated_user_without_permissions_is_forbidden(): void
    {
        $unprivilegedUser = User::factory()->create(['is_active' => true]);
        Sanctum::actingAs($unprivilegedUser);

        $endpoints = [
            ['GET', '/api/v1/admin/dashboard/stats'],
            ['GET', '/api/v1/admin/users'],
            ['GET', '/api/v1/admin/settings'],
            ['GET', '/api/v1/admin/courtroom'],
            ['GET', '/api/v1/admin/contacts'],
            ['GET', '/api/v1/admin/consultations'],
        ];

        foreach ($endpoints as [$method, $uri]) {
            $response = $this->json($method, $uri);
            $response->assertStatus(403)
                ->assertJson([
                    'success' => false,
                    'error_code' => 'FORBIDDEN',
                ]);
        }
    }

    public function test_content_manager_cannot_manage_system_settings_or_users(): void
    {
        $contentManager = User::factory()->create(['is_active' => true]);
        $contentManager->assignRole('content_manager');
        Sanctum::actingAs($contentManager);

        $responseSettings = $this->getJson('/api/v1/admin/settings');
        $responseSettings->assertStatus(403);

        $responseUsers = $this->getJson('/api/v1/admin/users');
        $responseUsers->assertStatus(403);
    }

    public function test_media_manager_cannot_access_client_inquiries_or_consultations(): void
    {
        $mediaManager = User::factory()->create(['is_active' => true]);
        $mediaManager->assignRole('media_manager');
        Sanctum::actingAs($mediaManager);

        $responseContacts = $this->getJson('/api/v1/admin/contacts');
        $responseContacts->assertStatus(403);

        $responseConsultations = $this->getJson('/api/v1/admin/consultations');
        $responseConsultations->assertStatus(403);
    }

    public function test_super_admin_has_unrestricted_access(): void
    {
        $superAdmin = User::factory()->create(['is_active' => true]);
        $superAdmin->assignRole('super_admin');
        Sanctum::actingAs($superAdmin);

        $this->getJson('/api/v1/admin/dashboard/stats')->assertStatus(200);
        $this->getJson('/api/v1/admin/users')->assertStatus(200);
        $this->getJson('/api/v1/admin/settings')->assertStatus(200);
        $this->getJson('/api/v1/admin/courtroom')->assertStatus(200);
        $this->getJson('/api/v1/admin/contacts')->assertStatus(200);
        $this->getJson('/api/v1/admin/consultations')->assertStatus(200);
    }

    public function test_public_api_enforces_visibility_and_publication_status(): void
    {
        // Create draft courtroom experience
        CourtroomExperience::create([
            'title' => ['en' => 'Draft Case', 'bn' => 'খসড়া মামলা'],
            'slug' => 'draft-case',
            'court' => 'high_court',
            'case_type' => 'writ',
            'year' => 2026,
            'legal_area' => 'Constitutional',
            'role' => 'Lead Counsel',
            'summary' => ['en' => 'Draft summary', 'bn' => 'খসড়া সারসংক্ষেপ'],
            'description' => ['en' => 'Draft description', 'bn' => 'খসড়া বিবরণ'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        // Create private publication
        Publication::create([
            'title' => ['en' => 'Private Publication', 'bn' => 'ব্যক্তিগত প্রকাশনা'],
            'slug' => 'private-publication',
            'publication_type' => 'law_journal',
            'publication_date' => '2026-01-01',
            'excerpt' => ['en' => 'Private abstract', 'bn' => 'সারসংক্ষেপ'],
            'status' => 'published',
            'visibility' => 'private',
        ]);

        // Attempt public access
        $this->getJson('/api/v1/courtroom/draft-case')->assertStatus(404);
        $this->getJson('/api/v1/publications/private-publication')->assertStatus(404);
    }
}

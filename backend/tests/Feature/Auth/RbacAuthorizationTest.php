<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RbacAuthorizationTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * Test unauthenticated access to admin routes returns 401.
     */
    public function test_admin_route_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/admin/dashboard/stats');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error_code' => 'UNAUTHENTICATED',
            ]);
    }

    /**
     * Test authorized role with permission can access endpoint.
     */
    public function test_authorized_user_with_permission_can_access(): void
    {
        $admin = User::create([
            'name' => 'Authorized Admin',
            'email' => 'auth.admin@nijamuddin.com',
            'password' => Hash::make('AdminPass2026!#'),
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/v1/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Dashboard statistics retrieved successfully.',
            ]);

        // Clean up
        $admin->forceDelete();
    }

    /**
     * Test unauthorized user without required permission receives 403.
     */
    public function test_unauthorized_user_receives_403_forbidden(): void
    {
        // Media manager does not have 'manage_users' permission
        $mediaUser = User::create([
            'name' => 'Media Assistant',
            'email' => 'media.assistant@nijamuddin.com',
            'password' => Hash::make('MediaPass2026!#'),
            'is_active' => true,
        ]);
        $mediaUser->assignRole('media_manager');

        Sanctum::actingAs($mediaUser, ['*']);

        $response = $this->getJson('/api/v1/admin/users');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error_code' => 'FORBIDDEN',
            ]);

        // Clean up
        $mediaUser->forceDelete();
    }

    /**
     * Test super_admin role satisfies all permission checks via Gate bypass.
     */
    public function test_super_admin_has_unrestricted_access(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Administrator',
            'email' => 'super.tester@nijamuddin.com',
            'password' => Hash::make('SuperPass2026!#'),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        Sanctum::actingAs($superAdmin, ['*']);

        // Test dashboard access
        $dashResponse = $this->getJson('/api/v1/admin/dashboard/stats');
        $dashResponse->assertStatus(200);

        // Test user management access
        $usersResponse = $this->getJson('/api/v1/admin/users');
        $usersResponse->assertStatus(200);

        // Clean up
        $superAdmin->forceDelete();
    }
}

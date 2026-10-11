<?php

namespace Tests\Feature\Auth;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
    }

    /**
     * Unauthenticated access to user management is blocked.
     */
    public function test_unauthenticated_user_cannot_access_user_management(): void
    {
        $this->getJson('/api/v1/admin/users')->assertStatus(401);
        $this->getJson('/api/v1/admin/roles')->assertStatus(401);
    }

    /**
     * Users without manage_users permission receive 403 Forbidden.
     */
    public function test_unauthorized_user_without_permission_cannot_access_user_management(): void
    {
        $contentManager = User::create([
            'name' => 'Content Manager Test',
            'email' => 'cm.test@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $contentManager->assignRole('content_manager');

        Sanctum::actingAs($contentManager, ['*']);

        $this->getJson('/api/v1/admin/users')->assertStatus(403);

        $contentManager->forceDelete();
    }

    /**
     * Super Admin can list users with pagination, search, and filtering.
     */
    public function test_authorized_user_can_list_users_with_pagination_and_search(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin Lister',
            'email' => 'super.lister@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        $targetUser = User::create([
            'name' => 'Target Chambers Advocate',
            'email' => 'target.advocate@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $targetUser->assignRole('admin');

        Sanctum::actingAs($superAdmin, ['*']);

        $response = $this->getJson('/api/v1/admin/users?q=Target+Chambers&per_page=10');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'email',
                        'roles',
                        'permissions',
                        'is_active',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ]);

        $this->assertGreaterThanOrEqual(1, count($response->json('data')));

        $targetUser->forceDelete();
        $superAdmin->forceDelete();
    }

    /**
     * Super Admin can update roles of another administrator.
     */
    public function test_super_admin_can_update_user_roles(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin Manager',
            'email' => 'super.manager@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        $staffUser = User::create([
            'name' => 'Junior Associate',
            'email' => 'junior.assoc@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $staffUser->assignRole('editor');

        Sanctum::actingAs($superAdmin, ['*']);

        $response = $this->putJson("/api/v1/admin/users/{$staffUser->id}/roles", [
            'roles' => ['admin', 'content_manager'],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $staffUser->id,
                    'roles' => ['admin', 'content_manager'],
                ],
            ]);

        $this->assertTrue($staffUser->fresh()->hasRole('admin'));
        $this->assertTrue($staffUser->fresh()->hasRole('content_manager'));
        $this->assertFalse($staffUser->fresh()->hasRole('editor'));

        // Check activity log
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $superAdmin->id,
            'action' => 'user_roles_updated',
            'subject_id' => $staffUser->id,
        ]);

        $staffUser->forceDelete();
        $superAdmin->forceDelete();
    }

    /**
     * Privilege escalation prevention: Non-super-admin cannot assign super_admin role.
     */
    public function test_non_super_admin_cannot_assign_super_admin_role(): void
    {
        $adminUser = User::create([
            'name' => 'Admin Role Delegator',
            'email' => 'admin.delegator@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $adminUser->givePermissionTo(['manage_users', 'manage_roles']);

        $staffUser = User::create([
            'name' => 'Subordinate Staff',
            'email' => 'subordinate@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $staffUser->assignRole('editor');

        Sanctum::actingAs($adminUser, ['*']);

        $response = $this->putJson("/api/v1/admin/users/{$staffUser->id}/roles", [
            'roles' => ['super_admin'],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['roles']);

        $this->assertFalse($staffUser->fresh()->hasRole('super_admin'));

        $staffUser->forceDelete();
        $adminUser->forceDelete();
    }

    /**
     * Non-super-admin cannot alter roles of an existing Super Administrator.
     */
    public function test_non_super_admin_cannot_modify_super_admin_roles(): void
    {
        $adminUser = User::create([
            'name' => 'Regular Admin Tester',
            'email' => 'regular.admin@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $adminUser->givePermissionTo(['manage_users', 'manage_roles']);

        $existingSuperAdmin = User::create([
            'name' => 'Protected Super Admin',
            'email' => 'protected.super@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $existingSuperAdmin->assignRole('super_admin');

        Sanctum::actingAs($adminUser, ['*']);

        $response = $this->putJson("/api/v1/admin/users/{$existingSuperAdmin->id}/roles", [
            'roles' => ['editor'],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['roles']);

        $this->assertTrue($existingSuperAdmin->fresh()->hasRole('super_admin'));

        $existingSuperAdmin->forceDelete();
        $adminUser->forceDelete();
    }

    /**
     * Self-lockout prevention: Super admin cannot revoke their own super_admin role.
     */
    public function test_super_admin_cannot_revoke_own_super_admin_role(): void
    {
        $superAdmin = User::create([
            'name' => 'Self Super Admin',
            'email' => 'self.super@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        Sanctum::actingAs($superAdmin, ['*']);

        $response = $this->putJson("/api/v1/admin/users/{$superAdmin->id}/roles", [
            'roles' => ['admin'],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['roles']);

        $this->assertTrue($superAdmin->fresh()->hasRole('super_admin'));

        $superAdmin->forceDelete();
    }

    /**
     * Self-deactivation prevention: User cannot deactivate their own account.
     */
    public function test_user_cannot_deactivate_own_account(): void
    {
        $superAdmin = User::create([
            'name' => 'Active Admin User',
            'email' => 'active.admin@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        Sanctum::actingAs($superAdmin, ['*']);

        $response = $this->patchJson("/api/v1/admin/users/{$superAdmin->id}/status", [
            'is_active' => false,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['is_active']);

        $this->assertTrue($superAdmin->fresh()->is_active);

        $superAdmin->forceDelete();
    }

    /**
     * Deactivating an administrator immediately revokes their active tokens.
     */
    public function test_deactivating_user_revokes_all_sanctum_tokens(): void
    {
        $superAdmin = User::create([
            'name' => 'Root Super Admin',
            'email' => 'root.super@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        $staffUser = User::create([
            'name' => 'Compromised Staff',
            'email' => 'compromised@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $staffUser->assignRole('editor');

        // Create token for staff user
        $staffToken = $staffUser->createToken('compromised-device')->plainTextToken;
        $this->assertCount(1, $staffUser->fresh()->tokens);

        Sanctum::actingAs($superAdmin, ['*']);

        $response = $this->patchJson("/api/v1/admin/users/{$staffUser->id}/status", [
            'is_active' => false,
        ]);

        $response->assertStatus(200);
        $this->assertFalse($staffUser->fresh()->is_active);
        $this->assertCount(0, $staffUser->fresh()->tokens);

        $staffUser->forceDelete();
        $superAdmin->forceDelete();
    }

    /**
     * Roles endpoint returns all available system roles and permissions.
     */
    public function test_roles_list_endpoint_returns_system_roles_and_permissions(): void
    {
        $superAdmin = User::create([
            'name' => 'Role Explorer',
            'email' => 'role.explorer@nijamuddin.com',
            'password' => Hash::make('SecretPass123!#'),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        Sanctum::actingAs($superAdmin, ['*']);

        $response = $this->getJson('/api/v1/admin/roles');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'guard_name',
                        'permissions',
                    ],
                ],
            ]);

        $roleNames = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertContains('super_admin', $roleNames);
        $this->assertContains('admin', $roleNames);
        $this->assertContains('content_manager', $roleNames);
        $this->assertContains('editor', $roleNames);

        $superAdmin->forceDelete();
    }
}

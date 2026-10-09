<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds according to Phase 1 RBAC Matrix.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define all permissions grouped by module per 09_RBAC_MATRIX.md
        $permissions = [
            // Analytics
            ['name' => 'view_dashboard', 'module' => 'analytics'],

            // System
            ['name' => 'manage_settings', 'module' => 'system'],
            ['name' => 'manage_users', 'module' => 'system'],
            ['name' => 'manage_roles', 'module' => 'system'],
            ['name' => 'view_activity_logs', 'module' => 'system'],
            ['name' => 'manage_redirects', 'module' => 'system'],

            // Profile
            ['name' => 'edit_profile', 'module' => 'profile'],
            ['name' => 'manage_credentials', 'module' => 'profile'],
            ['name' => 'manage_educations', 'module' => 'profile'],
            ['name' => 'manage_timeline', 'module' => 'profile'],
            ['name' => 'manage_memberships', 'module' => 'profile'],

            // Practice
            ['name' => 'create_practice_area', 'module' => 'practice'],
            ['name' => 'edit_practice_area', 'module' => 'practice'],
            ['name' => 'delete_practice_area', 'module' => 'practice'],
            ['name' => 'publish_practice_area', 'module' => 'practice'],

            // Courtroom
            ['name' => 'create_cases', 'module' => 'courtroom'],
            ['name' => 'edit_cases', 'module' => 'courtroom'],
            ['name' => 'delete_cases', 'module' => 'courtroom'],
            ['name' => 'publish_cases', 'module' => 'courtroom'],
            ['name' => 'view_confidential_cases', 'module' => 'courtroom'],
            ['name' => 'manage_case_documents', 'module' => 'courtroom'],

            // Research
            ['name' => 'create_research', 'module' => 'research'],
            ['name' => 'edit_research', 'module' => 'research'],
            ['name' => 'delete_research', 'module' => 'research'],
            ['name' => 'publish_research', 'module' => 'research'],

            // Judgments
            ['name' => 'create_judgments', 'module' => 'judgments'],
            ['name' => 'edit_judgments', 'module' => 'judgments'],
            ['name' => 'delete_judgments', 'module' => 'judgments'],
            ['name' => 'publish_judgments', 'module' => 'judgments'],

            // Publications
            ['name' => 'create_publications', 'module' => 'publications'],
            ['name' => 'edit_publications', 'module' => 'publications'],
            ['name' => 'delete_publications', 'module' => 'publications'],
            ['name' => 'publish_publications', 'module' => 'publications'],

            // Media & Broadcast
            ['name' => 'manage_press', 'module' => 'media'],
            ['name' => 'manage_appearances', 'module' => 'media'],
            ['name' => 'manage_videos', 'module' => 'media'],

            // Gallery
            ['name' => 'manage_gallery', 'module' => 'gallery'],

            // Media Library
            ['name' => 'upload_media', 'module' => 'media_lib'],
            ['name' => 'delete_media', 'module' => 'media_lib'],
            ['name' => 'browse_media', 'module' => 'media_lib'],

            // Inquiries
            ['name' => 'view_contacts', 'module' => 'inquiries'],
            ['name' => 'manage_contacts', 'module' => 'inquiries'],
            ['name' => 'view_consultations', 'module' => 'inquiries'],
            ['name' => 'manage_consultations', 'module' => 'inquiries'],

            // CMS
            ['name' => 'manage_pages', 'module' => 'cms'],
            ['name' => 'manage_menus', 'module' => 'cms'],
            ['name' => 'manage_homepage', 'module' => 'cms'],

            // SEO
            ['name' => 'manage_seo', 'module' => 'seo'],
        ];

        foreach ($permissions as $p) {
            Permission::findOrCreate($p['name'], 'web');
            Permission::where('name', $p['name'])->update(['module' => $p['module']]);
        }

        // 2. Define Approved Roles
        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $admin = Role::findOrCreate('admin', 'web');
        $editor = Role::findOrCreate('editor', 'web');
        $contentManager = Role::findOrCreate('content_manager', 'web');
        $mediaManager = Role::findOrCreate('media_manager', 'web');

        // 3. Role-Permission Matrix Assignments

        // Super Admin gets all permissions
        $superAdmin->givePermissionTo(Permission::all());

        // Admin gets daily legal & administrative management (except staff deletion and audit log tampering)
        $adminPermissions = [
            'view_dashboard',
            'manage_settings',
            'manage_redirects',
            'edit_profile', 'manage_credentials', 'manage_educations', 'manage_timeline', 'manage_memberships',
            'create_practice_area', 'edit_practice_area', 'delete_practice_area', 'publish_practice_area',
            'create_cases', 'edit_cases', 'delete_cases', 'publish_cases', 'view_confidential_cases', 'manage_case_documents',
            'create_research', 'edit_research', 'delete_research', 'publish_research',
            'create_judgments', 'edit_judgments', 'delete_judgments', 'publish_judgments',
            'create_publications', 'edit_publications', 'delete_publications', 'publish_publications',
            'manage_press', 'manage_appearances', 'manage_videos',
            'manage_gallery',
            'upload_media', 'delete_media', 'browse_media',
            'view_contacts', 'manage_contacts', 'view_consultations', 'manage_consultations',
            'manage_pages', 'manage_menus', 'manage_homepage',
            'manage_seo',
        ];
        $admin->syncPermissions($adminPermissions);

        // Editor gets research, judgments, courtroom, publications drafting & publishing
        $editorPermissions = [
            'view_dashboard',
            'create_cases', 'edit_cases', 'publish_cases', 'manage_case_documents',
            'create_research', 'edit_research', 'publish_research',
            'create_judgments', 'edit_judgments', 'publish_judgments',
            'create_publications', 'edit_publications', 'publish_publications',
            'browse_media', 'upload_media',
        ];
        $editor->syncPermissions($editorPermissions);

        // Content Manager gets content drafting, media, viewing inquiries (cannot unilaterally publish)
        $contentManagerPermissions = [
            'view_dashboard',
            'create_cases', 'edit_cases',
            'create_research', 'edit_research',
            'create_judgments', 'edit_judgments',
            'create_publications', 'edit_publications',
            'manage_press', 'manage_appearances', 'manage_videos',
            'manage_gallery',
            'upload_media', 'browse_media',
            'view_contacts', 'view_consultations',
        ];
        $contentManager->syncPermissions($contentManagerPermissions);

        // Media Manager gets media library, gallery, videos, appearances, press
        $mediaManagerPermissions = [
            'view_dashboard',
            'manage_press',
            'manage_appearances',
            'manage_videos',
            'manage_gallery',
            'upload_media', 'delete_media', 'browse_media',
        ];
        $mediaManager->syncPermissions($mediaManagerPermissions);

        // 4. Delegate initial Super Admin account creation to dedicated SuperAdminSeeder
        $this->call(SuperAdminSeeder::class);
    }
}

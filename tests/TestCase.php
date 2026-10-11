<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Ensure standard RBAC roles and permissions are seeded for test isolation.
     */
    protected function seedRolesAndPermissions(): void
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    /**
     * Ensure CMS, settings, homepage sections, and navigation menu fixtures are seeded for test isolation.
     */
    protected function seedCmsFixtures(): void
    {
        $this->seed(\Database\Seeders\CmsAndSettingsSeeder::class);
    }
}

<?php

namespace Database\Seeders;

use App\Models\FooterRevision;
use App\Models\FooterTemplate;
use App\Models\User;
use App\Services\FooterBuilderService;
use Illuminate\Database\Seeder;

class FooterBuilderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (FooterTemplate::count() > 0) {
            return;
        }

        $footerService = app(FooterBuilderService::class);
        $admin = User::first();
        $defaultLayout = $footerService->getDefaultInstitutionalLayout();
        $sanitized = $footerService->validateAndSanitizeLayout($defaultLayout);

        $template = FooterTemplate::create([
            'name' => 'Supreme Court Institutional Legal Footer (Default)',
            'slug' => 'default-institutional-legal-footer',
            'status' => 'published',
            'is_active' => true,
            'display_conditions' => ['type' => 'all_pages'],
            'layout_data' => $sanitized,
            'created_by' => $admin?->id,
            'updated_by' => $admin?->id,
            'published_at' => now(),
        ]);

        FooterRevision::create([
            'footer_template_id' => $template->id,
            'version' => 1,
            'layout_data' => $sanitized,
            'change_summary' => 'Initial publication of Supreme Court Institutional Legal Footer',
            'created_by' => $admin?->id,
            'created_at' => now(),
        ]);
    }
}

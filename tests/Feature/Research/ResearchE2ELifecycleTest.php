<?php

namespace Tests\Feature\Research;

use App\Models\Category;
use App\Models\LegalResearch;
use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResearchE2ELifecycleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_complete_research_editorial_lifecycle_e2e(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        // 1. Admin Login & Setup
        $admin = User::factory()->create([
            'name' => 'Editorial Admin',
            'email' => 'e2e_research_admin@nijamuddin.com',
        ]);
        $admin->assignRole('admin');

        $category = Category::create([
            'name' => ['en' => 'TEST — Comparative Jurisprudence', 'bn' => 'টেস্ট — তুলনামূলক আইনশাস্ত্র'],
            'slug' => 'test-comparative-jurisprudence',
            'type' => 'research',
            'is_active' => true,
        ]);

        Storage::fake('public');
        $pdfFile = UploadedFile::fake()->create('research-treatise.pdf', 300, 'application/pdf');
        $pdfPath = $pdfFile->store('documents/research', 'public');

        $pdfMedia = Media::create([
            'disk' => 'public',
            'directory' => 'documents/research',
            'filename' => basename($pdfPath),
            'original_name' => 'research-treatise.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 307200,
            'uploaded_by' => $admin->id,
        ]);

        Sanctum::actingAs($admin);

        // 2. Create Draft Research
        $createPayload = [
            'category_id' => $category->id,
            'research_type' => 'research_paper',
            'title' => [
                'en' => 'TEST — E2E Research Paper Title',
                'bn' => 'টেস্ট — ই২ই গবেষণা পত্র',
            ],
            'slug' => 'test-e2e-research-paper',
            'author' => [
                'en' => 'TEST — Lead Academic',
                'bn' => 'টেস্ট — প্রধান শিক্ষাবিদ',
            ],
            'excerpt' => [
                'en' => 'TEST — Comprehensive initial summary',
                'bn' => 'টেস্ট — প্রাথমিক সারসংক্ষেপ',
            ],
            'content' => [
                'en' => '<h2>Executive Summary</h2><p>TEST — Full in-depth comparative legal research body.</p>',
                'bn' => '<h2>সারসংক্ষেপ</h2><p>টেস্ট — পূর্ণাঙ্গ গবেষণামূলক বিবরণ।</p>',
            ],
            'visibility' => 'public',
            'status' => 'draft',
            'is_featured' => false,
            'sort_order' => 1,
        ];

        $createRes = $this->postJson('/api/v1/admin/research', $createPayload);
        $createRes->assertStatus(201);
        $researchId = $createRes->json('data.id');

        // 3. Verify NOT publicly visible in list or detail
        $publicListRes = $this->getJson('/api/v1/research');
        $publicSlugs = collect($publicListRes->json('data'))->pluck('slug')->toArray();
        $this->assertNotContains('test-e2e-research-paper', $publicSlugs);

        $publicDetailRes = $this->getJson('/api/v1/research/test-e2e-research-paper');
        $publicDetailRes->assertStatus(404);

        // 4. Preview as authorized admin (Draft Preview)
        $previewRes = $this->getJson("/api/v1/admin/research/{$researchId}/preview");
        $previewRes->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertJsonPath('data.is_preview', true);

        // 5. Publish
        $publishPayload = array_merge($createPayload, [
            'status' => 'published',
            'is_featured' => true,
        ]);
        $updateRes = $this->putJson("/api/v1/admin/research/{$researchId}", $publishPayload);
        $updateRes->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        // 6. Verify now in public listing
        $publicListAfter = $this->getJson('/api/v1/research');
        $afterSlugs = collect($publicListAfter->json('data'))->pluck('slug')->toArray();
        $this->assertContains('test-e2e-research-paper', $afterSlugs);

        // 7. Verify public detail and bilingual content
        $detailEn = $this->getJson('/api/v1/research/test-e2e-research-paper');
        $detailEn->assertStatus(200)
            ->assertJsonPath('data.title', 'TEST — E2E Research Paper Title')
            ->assertJsonPath('data.author', 'TEST — Lead Academic');

        $detailBn = $this->withHeaders(['Accept-Language' => 'bn'])
            ->getJson('/api/v1/research/test-e2e-research-paper');
        $detailBn->assertStatus(200)
            ->assertJsonPath('data.title', 'টেস্ট — ই২ই গবেষণা পত্র')
            ->assertJsonPath('data.author', 'টেস্ট — প্রধান শিক্ষাবিদ');

        // 8. Attach PDF document
        $attachPdfPayload = array_merge($publishPayload, [
            'pdf_media_id' => $pdfMedia->id,
        ]);
        $attachRes = $this->putJson("/api/v1/admin/research/{$researchId}", $attachPdfPayload);
        $attachRes->assertStatus(200)
            ->assertJsonPath('data.pdf_media.id', $pdfMedia->id);

        // 9. Verify Public PDF Download
        $downloadRes = $this->get('/api/v1/research/test-e2e-research-paper/download');
        $downloadRes->assertStatus(200)
            ->assertHeader('X-Content-Type-Options', 'nosniff');

        // 10. Change visibility to private
        $makePrivatePayload = array_merge($attachPdfPayload, [
            'visibility' => 'private',
        ]);
        $privateRes = $this->putJson("/api/v1/admin/research/{$researchId}", $makePrivatePayload);
        $privateRes->assertStatus(200);

        // 11. Verify public access denied for private item (detail & download return 404)
        $this->getJson('/api/v1/research/test-e2e-research-paper')->assertStatus(404);
        $this->get('/api/v1/research/test-e2e-research-paper/download')->assertStatus(404);

        // 12. Restore to public and update content
        $updatedPayload = array_merge($makePrivatePayload, [
            'visibility' => 'public',
            'title' => [
                'en' => 'TEST — Revised Research Paper Title',
                'bn' => 'টেস্ট — সংশোধিত গবেষণা পত্র',
            ],
        ]);
        $this->putJson("/api/v1/admin/research/{$researchId}", $updatedPayload)->assertStatus(200);

        $verifyUpdated = $this->withHeaders(['Accept-Language' => 'en'])
            ->getJson('/api/v1/research/test-e2e-research-paper');
        $verifyUpdated->assertStatus(200)
            ->assertJsonPath('data.title', 'TEST — Revised Research Paper Title');


        // 13. Unpublish (change status back to draft)
        $unpublishPayload = array_merge($updatedPayload, [
            'status' => 'draft',
        ]);
        $this->putJson("/api/v1/admin/research/{$researchId}", $unpublishPayload)->assertStatus(200);

        // 14. Verify public page and API no longer expose it
        $this->getJson('/api/v1/research/test-e2e-research-paper')->assertStatus(404);
        $this->get('/api/v1/research/test-e2e-research-paper/download')->assertStatus(404);
    }
}

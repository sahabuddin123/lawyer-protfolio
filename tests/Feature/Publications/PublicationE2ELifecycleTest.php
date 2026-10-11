<?php

namespace Tests\Feature\Publications;

use App\Models\Media;
use App\Models\Publication;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PublicationE2ELifecycleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_complete_publication_editorial_lifecycle_e2e(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        // 1. Create and authenticate Admin
        $admin = User::factory()->create(['email' => 'e2e_pub_admin@nijamuddin.com']);
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        // 2. Prepare fake storage and PDF document
        Storage::fake('public');
        $file = UploadedFile::fake()->create('e2e-publication.pdf', 350, 'application/pdf');
        $storedPath = $file->store('documents/publications', 'public');

        $pdfMedia = Media::create([
            'disk' => 'public',
            'directory' => 'documents/publications',
            'filename' => basename($storedPath),
            'original_name' => 'e2e-publication.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 358400,
            'uploaded_by' => $admin->id,
        ]);

        // 3. Admin creates a DRAFT Publication
        $draftPayload = [
            'title' => [
                'en' => 'TEST — E2E Treatise on Constitutional Jurisprudence',
                'bn' => 'টেস্ট — সাংবিধানিক আইনশাস্ত্র সংক্রান্ত ইটুই গবেষণাপত্র',
            ],
            'slug' => 'test-e2e-treatise-constitutional-jurisprudence',
            'publication_type' => 'book',
            'publication_name' => [
                'en' => 'Supreme Court Bar Association Press',
                'bn' => 'সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন প্রেস',
            ],
            'publication_date' => '2025-02-18',
            'author' => [
                'en' => 'TEST — Advocate Nijam Uddin',
                'bn' => 'টেস্ট — অ্যাডভোকেট নিজাম উদ্দিন',
            ],
            'excerpt' => [
                'en' => 'Comprehensive doctrine review of judicial power and constitutional balance.',
                'bn' => 'বিচারিক ক্ষমতা ও সাংবিধানিক ভারসাম্যের সামগ্রিক তাত্ত্বিক পর্যালোচনা।',
            ],
            'content' => [
                'en' => '<p>Comprehensive chapters examining separation of powers and judicial review.</p>',
                'bn' => '<p>ক্ষমতার পৃথকীকরণ এবং বিচারিক পর্যালোচনা সংক্রান্ত বিস্তারিত অধ্যায়।</p>',
            ],
            'visibility' => 'public',
            'status' => 'draft',
            'is_featured' => false,
        ];

        $createRes = $this->postJson('/api/v1/admin/publications', $draftPayload);
        $createRes->assertStatus(201);
        $publicationId = $createRes->json('data.id');

        // 4. Verify NOT publicly visible in public listing or detail
        $publicListBefore = $this->getJson('/api/v1/publications');
        $publicListBefore->assertStatus(200);
        $this->assertEmpty(
            collect($publicListBefore->json('data'))->where('slug', 'test-e2e-treatise-constitutional-jurisprudence')
        );

        $publicDetailBefore = $this->getJson('/api/v1/publications/test-e2e-treatise-constitutional-jurisprudence');
        $publicDetailBefore->assertStatus(404);

        // 5. Preview as authorized admin (verifying X-Robots-Tag safety)
        $previewRes = $this->getJson("/api/v1/admin/publications/{$publicationId}/preview");
        $previewRes->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertJsonPath('data.slug', 'test-e2e-treatise-constitutional-jurisprudence');

        // 6. Publish the Publication with PDF attached
        $publishPayload = array_merge($draftPayload, [
            'status' => 'published',
            'pdf_media_id' => $pdfMedia->id,
            'is_featured' => true,
        ]);

        $publishRes = $this->putJson("/api/v1/admin/publications/{$publicationId}", $publishPayload);
        $publishRes->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        // 7. Verify visible in public listing
        $publicListAfter = $this->getJson('/api/v1/publications');
        $publicListAfter->assertStatus(200)
            ->assertJsonPath('success', true);
        $matched = collect($publicListAfter->json('data'))->firstWhere('slug', 'test-e2e-treatise-constitutional-jurisprudence');
        $this->assertNotNull($matched);
        $this->assertEquals('book', $matched['publication_type']);

        // 8. Open Public Detail & verify metadata
        $publicDetailAfter = $this->getJson('/api/v1/publications/test-e2e-treatise-constitutional-jurisprudence');
        $publicDetailAfter->assertStatus(200)
            ->assertJsonPath('data.title', 'TEST — E2E Treatise on Constitutional Jurisprudence')
            ->assertJsonPath('data.has_pdf', true);

        // 9. Download public PDF
        $downloadRes = $this->get('/api/v1/publications/test-e2e-treatise-constitutional-jurisprudence/download');
        $downloadRes->assertStatus(200)
            ->assertHeader('X-Content-Type-Options', 'nosniff');

        // 10. Change publication visibility to private
        $privatePayload = array_merge($publishPayload, [
            'visibility' => 'private',
        ]);
        $updatePrivateRes = $this->putJson("/api/v1/admin/publications/{$publicationId}", $privatePayload);
        $updatePrivateRes->assertStatus(200);

        // 11. Verify public access denied (both detail and download return 404)
        $this->getJson('/api/v1/publications/test-e2e-treatise-constitutional-jurisprudence')->assertStatus(404);
        $this->get('/api/v1/publications/test-e2e-treatise-constitutional-jurisprudence/download')->assertStatus(404);

        // 12. Add external URL & restore public visibility
        $updateWithUrlPayload = array_merge($publishPayload, [
            'visibility' => 'public',
            'external_url' => 'https://example.com/books/constitutional-jurisprudence',
        ]);
        $updateRes = $this->putJson("/api/v1/admin/publications/{$publicationId}", $updateWithUrlPayload);
        $updateRes->assertStatus(200);

        // 13. Verify external URL is exposed on public detail
        $detailWithUrl = $this->getJson('/api/v1/publications/test-e2e-treatise-constitutional-jurisprudence');
        $detailWithUrl->assertStatus(200)
            ->assertJsonPath('data.external_url', 'https://example.com/books/constitutional-jurisprudence');

        // 14. Unpublish publication (retract to draft)
        $unpublishPayload = array_merge($updateWithUrlPayload, [
            'status' => 'draft',
        ]);
        $unpublishRes = $this->putJson("/api/v1/admin/publications/{$publicationId}", $unpublishPayload);
        $unpublishRes->assertStatus(200);

        // 15. Verify public page and download no longer expose it
        $this->getJson('/api/v1/publications/test-e2e-treatise-constitutional-jurisprudence')->assertStatus(404);
        $this->get('/api/v1/publications/test-e2e-treatise-constitutional-jurisprudence/download')->assertStatus(404);
    }
}

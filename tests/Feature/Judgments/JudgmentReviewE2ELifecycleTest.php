<?php

namespace Tests\Feature\Judgments;

use App\Models\JudgmentReview;
use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JudgmentReviewE2ELifecycleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_complete_judgment_review_editorial_lifecycle_e2e(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        // 1. Create and authenticate Admin
        $admin = User::factory()->create(['email' => 'e2e_judgment_admin@nijamuddin.com']);
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        // 2. Prepare fake storage and PDF document
        Storage::fake('public');
        $file = UploadedFile::fake()->create('e2e-judgment.pdf', 350, 'application/pdf');
        $storedPath = $file->store('documents/judgments', 'public');

        $pdfMedia = Media::create([
            'disk' => 'public',
            'directory' => 'documents/judgments',
            'filename' => basename($storedPath),
            'original_name' => 'e2e-judgment.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 358400,
            'uploaded_by' => $admin->id,
        ]);

        // 3. Admin creates a DRAFT Judgment Review
        $draftPayload = [
            'case_name' => [
                'en' => 'TEST — Lifecycle Case Alpha v. State',
                'bn' => 'টেস্ট — লাইফসাইকেল মামলা আলফা বনাম রাষ্ট্র',
            ],
            'slug' => 'test-lifecycle-case-alpha',
            'citation' => 'TEST 88 DLR (AD) 555',
            'court' => 'Supreme Court of Bangladesh (Appellate Division)',
            'judgment_date' => '2024-06-10',
            'legal_area' => [
                'en' => 'Constitutional Law',
                'bn' => 'সাংবিধানিক আইন',
            ],
            'summary' => [
                'en' => 'Draft summary for E2E verification.',
                'bn' => 'ইটুই যাচাইয়ের জন্য খসড়া সারসংক্ষেপ।',
            ],
            'court_decision' => [
                'en' => '<p>The Appellate Division reversed the judgment of the High Court Division.</p>',
                'bn' => '<p>আপিল বিভাগ হাইকোর্ট বিভাগের রায় বাতিল ঘোষণা করেছেন।</p>',
            ],
            'author_analysis' => [
                'en' => '<p>Author commentary: Landmark clarification on judicial deference.</p>',
                'bn' => '<p>লেখকের মন্তব্য: বিচারিক শ্রদ্ধাশীলতার নীতিতে স্পষ্টতা।</p>',
            ],
            'practical_significance' => [
                'en' => '<p>Standard reference for future constitutional appeals.</p>',
                'bn' => '<p>ভবিষ্যৎ সাংবিধানিক আপিলের জন্য মানদণ্ড।</p>',
            ],
            'visibility' => 'public',
            'status' => 'draft',
            'is_featured' => false,
        ];

        $createRes = $this->postJson('/api/v1/admin/judgments', $draftPayload);
        $createRes->assertStatus(201);
        $judgmentId = $createRes->json('data.id');

        // 4. Verify NOT publicly visible in public listing or detail
        $publicListBefore = $this->getJson('/api/v1/judgments');
        $publicListBefore->assertStatus(200);
        $this->assertEmpty(
            collect($publicListBefore->json('data'))->where('slug', 'test-lifecycle-case-alpha')
        );

        $publicDetailBefore = $this->getJson('/api/v1/judgments/test-lifecycle-case-alpha');
        $publicDetailBefore->assertStatus(404);

        // 5. Preview as authorized admin (verifying X-Robots-Tag safety)
        $previewRes = $this->getJson("/api/v1/admin/judgments/{$judgmentId}/preview");
        $previewRes->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertJsonPath('data.is_preview', true);

        // 6. Publish the Judgment Review with PDF attached
        $publishPayload = array_merge($draftPayload, [
            'status' => 'published',
            'pdf_media_id' => $pdfMedia->id,
            'is_featured' => true,
        ]);

        $publishRes = $this->putJson("/api/v1/admin/judgments/{$judgmentId}", $publishPayload);
        $publishRes->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        // 7. Verify visible in public listing
        $publicListAfter = $this->getJson('/api/v1/judgments');
        $publicListAfter->assertStatus(200)
            ->assertJsonPath('success', true);
        $matched = collect($publicListAfter->json('data'))->firstWhere('slug', 'test-lifecycle-case-alpha');
        $this->assertNotNull($matched);
        $this->assertEquals('TEST 88 DLR (AD) 555', $matched['citation']);

        // 8. Open Public Detail & verify Court's Decision vs Author's Analysis separation
        $publicDetailAfter = $this->getJson('/api/v1/judgments/test-lifecycle-case-alpha');
        $publicDetailAfter->assertStatus(200)
            ->assertJsonPath('data.court_decision', '<p>The Appellate Division reversed the judgment of the High Court Division.</p>')
            ->assertJsonPath('data.author_analysis', '<p>Author commentary: Landmark clarification on judicial deference.</p>')
            ->assertJsonPath('data.has_pdf', true);

        // 9. Download public PDF
        $downloadRes = $this->get('/api/v1/judgments/test-lifecycle-case-alpha/download');
        $downloadRes->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf');

        // 10. Change visibility to private
        $privatePayload = array_merge($publishPayload, [
            'visibility' => 'private',
        ]);
        $updatePrivate = $this->putJson("/api/v1/admin/judgments/{$judgmentId}", $privatePayload);
        $updatePrivate->assertStatus(200);

        // 11. Verify public access denied (both detail and download return 404)
        $this->getJson('/api/v1/judgments/test-lifecycle-case-alpha')->assertStatus(404);
        $this->get('/api/v1/judgments/test-lifecycle-case-alpha/download')->assertStatus(404);

        // 12. Restore to public, update analysis
        $updatedPayload = array_merge($publishPayload, [
            'visibility' => 'public',
            'author_analysis' => [
                'en' => '<p>Updated doctrinal review commentary.</p>',
                'bn' => '<p>হালনাগাদ মতবাদ পর্যালোচনা।</p>',
            ],
        ]);
        $updatePublic = $this->putJson("/api/v1/admin/judgments/{$judgmentId}", $updatedPayload);
        $updatePublic->assertStatus(200);

        $detailUpdated = $this->getJson('/api/v1/judgments/test-lifecycle-case-alpha');
        $detailUpdated->assertStatus(200)
            ->assertJsonPath('data.author_analysis', '<p>Updated doctrinal review commentary.</p>');

        // 13. Unpublish (change status to draft)
        $unpublishPayload = array_merge($updatedPayload, [
            'status' => 'draft',
        ]);
        $unpublishRes = $this->putJson("/api/v1/admin/judgments/{$judgmentId}", $unpublishPayload);
        $unpublishRes->assertStatus(200);

        // 14. Verify public page/API no longer exposes it
        $this->getJson('/api/v1/judgments/test-lifecycle-case-alpha')->assertStatus(404);
        $this->get('/api/v1/judgments/test-lifecycle-case-alpha/download')->assertStatus(404);
    }
}

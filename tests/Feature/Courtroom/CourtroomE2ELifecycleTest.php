<?php

namespace Tests\Feature\Courtroom;

use App\Models\Media;
use App\Models\PracticeArea;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CourtroomE2ELifecycleTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected PracticeArea $practiceArea;
    protected Media $documentMedia;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        \App\Services\CmsCacheService::flushAll();

        $this->adminUser = User::factory()->create([
            'name' => 'Courtroom Admin',
            'email' => 'admin_e2e_test@nijamuddin.com',
            'password' => bcrypt('AdminSecurePassword123!'),
        ]);
        $this->adminUser->assignRole('admin');

        $this->practiceArea = PracticeArea::create([
            'title' => ['en' => 'TEST — Practice Area E2E', 'bn' => 'টেস্ট — প্র্যাকটিস এরিয়া'],
            'slug' => 'test-practice-area-e2e',
            'short_description' => ['en' => 'Short desc', 'bn' => 'সংক্ষিপ্ত'],
            'full_description' => ['en' => '<p>Full desc</p>', 'bn' => '<p>পূর্ণ বিবরণ</p>'],
            'status' => 'published',
            'sort_order' => 1,
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('test-order.pdf', 80, 'application/pdf');
        $storedPath = $file->store('documents/cases', 'public');

        $this->documentMedia = Media::create([
            'disk' => 'public',
            'directory' => 'documents/cases',
            'filename' => basename($storedPath),
            'original_name' => 'test-order.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 81920,
            'uploaded_by' => $this->adminUser->id,
        ]);
    }

    public function test_complete_courtroom_editorial_lifecycle_e2e(): void
    {
        // 1. Authenticate Admin
        Sanctum::actingAs($this->adminUser);

        // 2. Admin access to Courtroom module
        $listResponse = $this->getJson('/api/v1/admin/courtroom');
        $listResponse->assertStatus(200);

        // 3. Create Draft Experience
        $draftPayload = [
            'title' => ['en' => 'TEST — Lifecycle Case Experience', 'bn' => 'টেস্ট — লাইফসাইকেল মামলা'],
            'slug' => 'test-lifecycle-case-experience',
            'case_number' => 'TEST-WP-999',
            'court' => 'Supreme Court of Bangladesh - High Court Division',
            'case_type' => 'Writ Petition',
            'year' => 2024,
            'practice_area_id' => $this->practiceArea->id,
            'legal_area' => ['en' => 'Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Summary of lifecycle test case.', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Detailed case narrative.</p>', 'bn' => '<p>বিবরণ</p>'],
            'issues' => ['en' => '<p>Legal issues raised.</p>', 'bn' => '<p>আইনি বিষয়</p>'],
            'arguments' => ['en' => '<p>Submissions made.</p>', 'bn' => '<p>যুক্তি</p>'],
            'outcome' => ['en' => '<p>Rule nisi issued.</p>', 'bn' => '<p>ফলাফল</p>'],
            'visibility' => 'public',
            'status' => 'draft',
            'is_featured' => false,
            'sort_order' => 1,
        ];

        $createResponse = $this->postJson('/api/v1/admin/courtroom', $draftPayload);
        $createResponse->assertStatus(201);
        $caseId = $createResponse->json('data.id');
        $caseSlug = $createResponse->json('data.slug');

        // 4. Verify Draft is NOT visible in public listing or detail
        $publicList = $this->getJson('/api/v1/courtroom');
        $publicList->assertStatus(200);
        $publicSlugs = collect($publicList->json('data'))->pluck('slug')->all();
        $this->assertNotContains($caseSlug, $publicSlugs, 'Draft case must not be exposed in public listing.');

        $publicDetail = $this->getJson("/api/v1/courtroom/{$caseSlug}");
        $publicDetail->assertStatus(404);

        // 5. Publish Case
        $publishPayload = array_merge($draftPayload, [
            'status' => 'published',
            'published_at' => now()->toIso8601String(),
        ]);
        $updateResponse = $this->putJson("/api/v1/admin/courtroom/{$caseId}", $publishPayload);
        $updateResponse->assertStatus(200);
        $this->assertEquals('published', $updateResponse->json('data.status'));

        // 6. Verify Public Listing now includes published case
        $publicListAfter = $this->getJson('/api/v1/courtroom');
        $publicListAfter->assertStatus(200);
        $afterSlugs = collect($publicListAfter->json('data'))->pluck('slug')->all();
        $this->assertContains($caseSlug, $afterSlugs, 'Published case must appear in public listing.');

        // 7. Open Public Detail Page and verify content
        $publicDetailAfter = $this->getJson("/api/v1/courtroom/{$caseSlug}");
        $publicDetailAfter->assertStatus(200)
            ->assertJsonPath('data.title', 'TEST — Lifecycle Case Experience')
            ->assertJsonPath('data.court', 'Supreme Court of Bangladesh - High Court Division')
            ->assertJsonPath('data.practice_area.id', $this->practiceArea->id);

        // 8. Add Public Document
        $docPayload = [
            'title' => ['en' => 'TEST — Rule Nisi Order', 'bn' => 'টেস্ট — রুল নিশি আদেশ'],
            'document_type' => 'Order',
            'media_id' => $this->documentMedia->id,
            'is_confidential' => false,
            'sort_order' => 1,
        ];
        $docResponse = $this->postJson("/api/v1/admin/courtroom/{$caseId}/documents", $docPayload);
        $docResponse->assertStatus(201);
        $docId = $docResponse->json('data.id');

        // 9. Verify Public Document Access via public download
        $downloadPublic = $this->get("/api/v1/courtroom/documents/{$docId}/download");
        $downloadPublic->assertStatus(200);

        // 10. Change Document to Confidential/Private
        $updateDocPayload = array_merge($docPayload, [
            'is_confidential' => true,
        ]);
        $updateDocResponse = $this->putJson("/api/v1/admin/case-documents/{$docId}", $updateDocPayload);
        $updateDocResponse->assertStatus(200);
        $this->assertTrue($updateDocResponse->json('data.is_confidential'));

        // 11. Verify Public Download Access is Denied (returns 404)
        $downloadDenied = $this->get("/api/v1/courtroom/documents/{$docId}/download");
        $downloadDenied->assertStatus(404);

        // 12. Unpublish Case (set back to draft)
        $unpublishPayload = array_merge($draftPayload, [
            'status' => 'draft',
        ]);
        $unpublishResponse = $this->putJson("/api/v1/admin/courtroom/{$caseId}", $unpublishPayload);
        $unpublishResponse->assertStatus(200);

        // 13. Verify Public Listing and Detail access disappears
        $publicListFinal = $this->getJson('/api/v1/courtroom');
        $finalSlugs = collect($publicListFinal->json('data'))->pluck('slug')->all();
        $this->assertNotContains($caseSlug, $finalSlugs, 'Unpublished case must disappear from public listing.');

        $publicDetailFinal = $this->getJson("/api/v1/courtroom/{$caseSlug}");
        $publicDetailFinal->assertStatus(404);
    }
}

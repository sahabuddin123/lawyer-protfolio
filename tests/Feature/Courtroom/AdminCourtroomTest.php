<?php

namespace Tests\Feature\Courtroom;

use App\Models\ActivityLog;
use App\Models\CaseDocument;
use App\Models\CourtroomExperience;
use App\Models\Media;
use App\Models\PracticeArea;
use App\Models\Redirect;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCourtroomTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $editor;
    protected User $plainUser;
    protected PracticeArea $practiceArea;
    protected Media $dummyMedia;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin', 'email' => 'admin_courtroom_test@nijamuddin.com']);
        $this->superAdmin->assignRole('super_admin');

        $this->editor = User::factory()->create(['name' => 'Editor User', 'email' => 'editor_courtroom_test@nijamuddin.com']);
        $this->editor->assignRole('editor');

        $this->plainUser = User::factory()->create(['name' => 'Plain User', 'email' => 'plain_courtroom_test@nijamuddin.com']);

        $this->practiceArea = PracticeArea::create([
            'title' => ['en' => 'TEST — Practice Area', 'bn' => 'টেস্ট — প্র্যাকটিস এরিয়া'],
            'slug' => 'test-practice-area-court',
            'short_description' => ['en' => 'Short desc', 'bn' => 'সংক্ষিপ্ত'],
            'full_description' => ['en' => '<p>Full desc</p>', 'bn' => '<p>পূর্ণ বিবরণ</p>'],
            'status' => 'published',
            'sort_order' => 1,
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('test-document.pdf', 100, 'application/pdf');
        $storedPath = $file->store('documents/cases', 'public');

        $this->dummyMedia = Media::create([
            'disk' => 'public',
            'directory' => 'documents/cases',
            'filename' => basename($storedPath),
            'original_name' => 'test-document.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 102400,
            'uploaded_by' => $this->superAdmin->id,
        ]);
    }

    public function test_unauthenticated_admin_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/courtroom');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        Sanctum::actingAs($this->plainUser);

        $response = $this->getJson('/api/v1/admin/courtroom');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_courtroom_experiences_with_filters(): void
    {
        Sanctum::actingAs($this->superAdmin);

        CourtroomExperience::create([
            'title' => ['en' => 'TEST — Experience One', 'bn' => 'টেস্ট — অভিজ্ঞতা এক'],
            'slug' => 'test-experience-one',
            'court' => 'High Court Division',
            'case_type' => 'Writ Petition',
            'year' => 2024,
            'practice_area_id' => $this->practiceArea->id,
            'legal_area' => ['en' => 'Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
            'role' => ['en' => 'Appearing Counsel', 'bn' => 'উপস্থিত কৌঁসুলি'],
            'summary' => ['en' => 'Test summary', 'bn' => 'টেস্ট সারসংক্ষেপ'],
            'description' => ['en' => '<p>Test description</p>', 'bn' => '<p>টেস্ট বিবরণ</p>'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $response = $this->getJson('/api/v1/admin/courtroom?status=draft&court=High Court Division');
        $response->assertStatus(200)
            ->assertJsonPath('data.0.slug', 'test-experience-one')
            ->assertJsonPath('data.0.court', 'High Court Division');
    }

    public function test_admin_can_create_courtroom_experience(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'title' => ['en' => 'TEST — Newly Created Experience', 'bn' => 'টেস্ট — নতুন অভিজ্ঞতা'],
            'slug' => 'test-newly-created-experience',
            'case_number' => 'TEST-CASE-001',
            'court' => 'Supreme Court of Bangladesh',
            'case_type' => 'Civil Revision',
            'year' => 2023,
            'practice_area_id' => $this->practiceArea->id,
            'legal_area' => ['en' => 'Company Law', 'bn' => 'কোম্পানি আইন'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Summary of test case', 'bn' => 'টেস্ট সারসংক্ষেপ'],
            'description' => ['en' => '<p>Detailed description</p>', 'bn' => '<p>বিস্তারিত বিবরণ</p>'],
            'issues' => ['en' => '<p>Legal issues</p>', 'bn' => '<p>আইনি বিষয়</p>'],
            'arguments' => ['en' => '<p>Submissions</p>', 'bn' => '<p>যুক্তি</p>'],
            'outcome' => ['en' => '<p>Order outcome</p>', 'bn' => '<p>ফলাফল</p>'],
            'visibility' => 'public',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'seo' => [
                'seo_title' => ['en' => 'SEO Title EN', 'bn' => 'SEO Title BN'],
                'meta_description' => ['en' => 'Meta description EN', 'bn' => 'Meta description BN'],
            ],
        ];

        $response = $this->postJson('/api/v1/admin/courtroom', $payload);
        $response->assertStatus(201)
            ->assertJsonPath('data.slug', 'test-newly-created-experience')
            ->assertJsonPath('data.is_featured', true)
            ->assertJsonPath('data.practice_area.id', $this->practiceArea->id);

        $this->assertDatabaseHas('courtroom_experiences', [
            'slug' => 'test-newly-created-experience',
            'case_number' => 'TEST-CASE-001',
            'status' => 'published',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'courtroom_created',
        ]);
    }

    public function test_admin_creation_sanitizes_xss(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'title' => ['en' => 'TEST — XSS Test Case', 'bn' => 'টেস্ট — এক্সএসএস কেস'],
            'slug' => 'test-xss-case',
            'court' => 'Appellate Division',
            'case_type' => 'Civil Appeal',
            'year' => 2022,
            'legal_area' => ['en' => 'Arbitration', 'bn' => 'সালিসি'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => [
                'en' => '<p>Safe</p><script>alert("xss")</script><img src="x" onerror="alert(1)">',
                'bn' => '<p>নিরাপদ</p><script>alert("xss")</script>',
            ],
            'visibility' => 'public',
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/v1/admin/courtroom', $payload);
        $response->assertStatus(201);

        $created = CourtroomExperience::where('slug', 'test-xss-case')->firstOrFail();
        $this->assertStringNotContainsString('<script>', $created->description['en']);
        $this->assertStringNotContainsString('onerror=', $created->description['en']);
        $this->assertStringNotContainsString('<script>', $created->description['bn']);
    }

    public function test_slug_uniqueness_is_enforced(): void
    {
        Sanctum::actingAs($this->superAdmin);

        CourtroomExperience::create([
            'title' => ['en' => 'TEST — Existing Slug Case', 'bn' => 'টেস্ট'],
            'slug' => 'test-existing-slug',
            'court' => 'High Court Division',
            'case_type' => 'Writ',
            'year' => 2021,
            'legal_area' => ['en' => 'Tax', 'bn' => 'কর'],
            'role' => ['en' => 'Advocate', 'bn' => 'অ্যাডভোকেট'],
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Desc</p>', 'bn' => '<p>বিবরণ</p>'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $payload = [
            'title' => ['en' => 'TEST — Duplicate Slug Case', 'bn' => 'টেস্ট ডুপ্লিকেট'],
            'slug' => 'test-existing-slug',
            'court' => 'High Court Division',
            'case_type' => 'Writ',
            'year' => 2021,
            'legal_area' => ['en' => 'Tax', 'bn' => 'কর'],
            'role' => ['en' => 'Advocate', 'bn' => 'অ্যাডভোকেট'],
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Desc</p>', 'bn' => '<p>বিবরণ</p>'],
            'status' => 'draft',
            'visibility' => 'public',
        ];

        $response = $this->postJson('/api/v1/admin/courtroom', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_published_slug_change_creates_301_redirect(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $experience = CourtroomExperience::create([
            'title' => ['en' => 'TEST — Slug Change Case', 'bn' => 'টেস্ট স্লাগ পরিবর্তন'],
            'slug' => 'test-original-slug',
            'court' => 'Supreme Court',
            'case_type' => 'Writ',
            'year' => 2020,
            'legal_area' => ['en' => 'Constitutional', 'bn' => 'সাংবিধানিক'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Desc</p>', 'bn' => '<p>বিবরণ</p>'],
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $payload = [
            'title' => ['en' => 'TEST — Slug Change Case', 'bn' => 'টেস্ট স্লাগ পরিবর্তন'],
            'slug' => 'test-renamed-slug',
            'court' => 'Supreme Court',
            'case_type' => 'Writ',
            'year' => 2020,
            'legal_area' => ['en' => 'Constitutional', 'bn' => 'সাংবিধানিক'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Desc</p>', 'bn' => '<p>বিবরণ</p>'],
            'status' => 'published',
            'visibility' => 'public',
        ];

        $response = $this->putJson("/api/v1/admin/courtroom/{$experience->id}", $payload);
        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'test-renamed-slug');

        $this->assertDatabaseHas('redirects', [
            'source_url' => '/courtroom/test-original-slug',
            'target_url' => '/courtroom/test-renamed-slug',
            'status_code' => 301,
        ]);
    }

    public function test_admin_can_reorder_courtroom_experiences(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $case1 = CourtroomExperience::create([
            'title' => ['en' => 'TEST — Case 1', 'bn' => 'টেস্ট ১'],
            'slug' => 'test-case-1',
            'court' => 'Court A',
            'case_type' => 'Type A',
            'year' => 2020,
            'legal_area' => ['en' => 'Area', 'bn' => 'এরিয়া'],
            'role' => ['en' => 'Role', 'bn' => 'রোল'],
            'summary' => ['en' => 'Sum', 'bn' => 'সার'],
            'description' => ['en' => '<p>D</p>', 'bn' => '<p>ডি</p>'],
            'status' => 'draft',
            'visibility' => 'public',
            'sort_order' => 0,
        ]);

        $case2 = CourtroomExperience::create([
            'title' => ['en' => 'TEST — Case 2', 'bn' => 'টেস্ট ২'],
            'slug' => 'test-case-2',
            'court' => 'Court B',
            'case_type' => 'Type B',
            'year' => 2021,
            'legal_area' => ['en' => 'Area', 'bn' => 'এরিয়া'],
            'role' => ['en' => 'Role', 'bn' => 'রোল'],
            'summary' => ['en' => 'Sum', 'bn' => 'সার'],
            'description' => ['en' => '<p>D</p>', 'bn' => '<p>ডি</p>'],
            'status' => 'draft',
            'visibility' => 'public',
            'sort_order' => 1,
        ]);

        $response = $this->postJson('/api/v1/admin/courtroom/reorder', [
            'items' => [$case2->id, $case1->id],
        ]);
        $response->assertStatus(200);

        $this->assertEquals(0, $case2->fresh()->sort_order);
        $this->assertEquals(1, $case1->fresh()->sort_order);
    }

    public function test_admin_can_add_update_delete_case_documents(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $experience = CourtroomExperience::create([
            'title' => ['en' => 'TEST — Experience With Docs', 'bn' => 'টেস্ট ডকুমেন্টস'],
            'slug' => 'test-exp-docs',
            'court' => 'High Court',
            'case_type' => 'Writ',
            'year' => 2022,
            'legal_area' => ['en' => 'Civil', 'bn' => 'দেওয়ানি'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Desc</p>', 'bn' => '<p>বিবরণ</p>'],
            'status' => 'published',
            'visibility' => 'public',
        ]);

        // 1. Add Document
        $addResponse = $this->postJson("/api/v1/admin/courtroom/{$experience->id}/documents", [
            'title' => ['en' => 'TEST — Judgment Brief', 'bn' => 'টেস্ট রায়ের বিবরণ'],
            'document_type' => 'Judgment',
            'media_id' => $this->dummyMedia->id,
            'is_confidential' => true,
            'sort_order' => 1,
        ]);
        $addResponse->assertStatus(201)
            ->assertJsonPath('data.document_type', 'Judgment')
            ->assertJsonPath('data.is_confidential', true);

        $docId = $addResponse->json('data.id');

        // 2. Update Document
        $updateResponse = $this->putJson("/api/v1/admin/case-documents/{$docId}", [
            'title' => ['en' => 'TEST — Judgment Brief Updated', 'bn' => 'টেস্ট আপডেট'],
            'document_type' => 'Order',
            'media_id' => $this->dummyMedia->id,
            'is_confidential' => false,
            'sort_order' => 2,
        ]);
        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.document_type', 'Order')
            ->assertJsonPath('data.is_confidential', false);

        // 3. Delete Document
        $deleteResponse = $this->deleteJson("/api/v1/admin/case-documents/{$docId}");
        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('case_documents', ['id' => $docId]);
    }

    public function test_confidential_document_download_requires_permission(): void
    {
        $experience = CourtroomExperience::create([
            'title' => ['en' => 'TEST — Confidential Case', 'bn' => 'টেস্ট গোপনীয়'],
            'slug' => 'test-conf-case',
            'court' => 'High Court',
            'case_type' => 'Writ',
            'year' => 2022,
            'legal_area' => ['en' => 'Civil', 'bn' => 'দেওয়ানি'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Desc</p>', 'bn' => '<p>বিবরণ</p>'],
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $confidentialDoc = CaseDocument::create([
            'courtroom_experience_id' => $experience->id,
            'title' => ['en' => 'TEST — Confidential Order', 'bn' => 'গোপনীয় আদেশ'],
            'document_type' => 'Order',
            'media_id' => $this->dummyMedia->id,
            'is_confidential' => true,
            'sort_order' => 1,
        ]);

        // Unauthenticated access fails
        $this->getJson("/api/v1/admin/case-documents/{$confidentialDoc->id}/download")->assertStatus(401);

        // Plain user without permission receives 403
        Sanctum::actingAs($this->plainUser);
        $this->getJson("/api/v1/admin/case-documents/{$confidentialDoc->id}/download")->assertStatus(403);

        // Super Admin with permission succeeds
        Sanctum::actingAs($this->superAdmin);
        $downloadResponse = $this->get("/api/v1/admin/case-documents/{$confidentialDoc->id}/download");
        $downloadResponse->assertStatus(200);
        $this->assertEquals(1, $confidentialDoc->fresh()->download_count);
    }
}

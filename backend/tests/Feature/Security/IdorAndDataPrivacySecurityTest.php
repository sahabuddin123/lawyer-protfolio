<?php

namespace Tests\Feature\Security;

use App\Models\CaseDocument;
use App\Models\ContactMessage;
use App\Models\CourtroomExperience;
use App\Models\GalleryAlbum;
use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IdorAndDataPrivacySecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        Storage::fake('public');
        Storage::fake('secure');
    }

    public function test_confidential_document_download_requires_permission(): void
    {
        $courtroom = CourtroomExperience::create([
            'title' => ['en' => 'Confidential Case', 'bn' => 'গোপনীয় মামলা'],
            'slug' => 'confidential-case',
            'court' => 'high_court',
            'case_type' => 'writ',
            'year' => 2026,
            'legal_area' => 'Constitutional',
            'role' => 'Lead Counsel',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => 'Description', 'bn' => 'বিবরণ'],
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $media = Media::create([
            'uuid' => 'secure-doc-uuid-1234',
            'disk' => 'secure',
            'directory' => 'case_documents',
            'filename' => 'secure-doc.pdf',
            'original_name' => 'secret_petition.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 1024,
        ]);
        Storage::disk('secure')->put('case_documents/secure-doc.pdf', '%PDF-1.4 mock content');

        $document = CaseDocument::create([
            'courtroom_experience_id' => $courtroom->id,
            'title' => ['en' => 'Confidential Annexure', 'bn' => 'সংযুক্তি'],
            'media_id' => $media->id,
            'is_confidential' => true,
        ]);

        // 1. Public download attempt must be rejected with 404 (zero information disclosure)
        $publicRes = $this->getJson("/api/v1/courtroom/documents/{$document->id}/download");
        $publicRes->assertStatus(404);

        // 2. Authenticated user without view_confidential_cases permission must receive 403
        $lowPrivUser = User::factory()->create(['is_active' => true]);
        $lowPrivUser->assignRole('content_manager');
        Sanctum::actingAs($lowPrivUser);

        $adminRes = $this->getJson("/api/v1/admin/case-documents/{$document->id}/download");
        $adminRes->assertStatus(403);

        // 3. User with view_confidential_cases permission can download
        $adminUser = User::factory()->create(['is_active' => true]);
        $adminUser->assignRole('admin');
        Sanctum::actingAs($adminUser);

        $successRes = $this->getJson("/api/v1/admin/case-documents/{$document->id}/download");
        $successRes->assertStatus(200);
        $successRes->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_cross_album_idor_is_rejected(): void
    {
        $admin = User::factory()->create(['is_active' => true]);
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $albumA = GalleryAlbum::create([
            'title' => ['en' => 'Album A', 'bn' => 'অ্যালবাম এ'],
            'slug' => 'album-a',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $albumB = GalleryAlbum::create([
            'title' => ['en' => 'Album B', 'bn' => 'অ্যালবাম বি'],
            'slug' => 'album-b',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $media = Media::create([
            'uuid' => 'image-uuid-1',
            'disk' => 'public',
            'directory' => 'media',
            'filename' => 'image-1.jpg',
            'original_name' => 'photo.jpg',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'size_bytes' => 1024,
        ]);

        // Attach image to Album A
        $imageA = $albumA->images()->create([
            'media_id' => $media->id,
            'sort_order' => 1,
        ]);

        // Attacker attempts to modify Album A's image via Album B's endpoint
        $idorRes = $this->putJson("/api/v1/admin/gallery/{$albumB->id}/images/{$imageA->id}", [
            'caption' => ['en' => 'Hacked Caption', 'bn' => 'ক্যাপশন'],
        ]);

        $idorRes->assertStatus(404);
    }

    public function test_admin_notes_and_internal_metadata_never_disclosed_publicly(): void
    {
        $contact = ContactMessage::create([
            'name' => 'Sensitive Client',
            'phone' => '+8801700000000',
            'email' => 'client@confidential.com',
            'subject' => 'Urgent Matter',
            'message' => 'Sensitive legal dispute details',
            'admin_notes' => 'INTERNAL LEGAL STRATEGY: High value litigation, do not disclose.',
            'status' => 'new',
            'ip_address' => '192.168.1.100',
            'user_agent' => 'ConfidentialBrowser/1.0',
        ]);

        // Submit form via public endpoint (intake) only returns acknowledgement envelope
        $response = $this->postJson('/api/v1/contact', [
            'name' => 'John Public',
            'phone' => '+8801711111111',
            'subject' => 'General Inquiry',
            'message' => 'General inquiry text.',
            'consent' => true,
        ]);

        $response->assertStatus(201);
        $data = $response->json('data');
        $this->assertArrayNotHasKey('admin_notes', $data);
        $this->assertArrayNotHasKey('ip_address', $data);
        $this->assertArrayNotHasKey('user_agent', $data);
    }

    public function test_soft_deleted_records_are_isolated_from_public_queries(): void
    {
        $courtroom = CourtroomExperience::create([
            'title' => ['en' => 'Deleted Case', 'bn' => 'মুছে ফেলা মামলা'],
            'slug' => 'deleted-case',
            'court' => 'high_court',
            'case_type' => 'writ',
            'year' => 2026,
            'legal_area' => 'Constitutional',
            'role' => 'Lead Counsel',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => 'Description', 'bn' => 'বিবরণ'],
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $courtroom->delete(); // Soft delete

        // Public show endpoint must return 404
        $this->getJson('/api/v1/courtroom/deleted-case')->assertStatus(404);

        // Public index must not include soft deleted records
        $indexRes = $this->getJson('/api/v1/courtroom');
        $slugs = collect($indexRes->json('data'))->pluck('slug');
        $this->assertFalse($slugs->contains('deleted-case'));
    }
}

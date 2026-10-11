<?php

namespace Tests\Feature\Courtroom;

use App\Models\CaseDocument;
use App\Models\CourtroomExperience;
use App\Models\Media;
use App\Models\PracticeArea;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicCourtroomTest extends TestCase
{
    use DatabaseTransactions;

    protected PracticeArea $practiceArea;
    protected Media $dummyMedia;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->practiceArea = PracticeArea::create([
            'title' => ['en' => 'TEST — Practice Area', 'bn' => 'টেস্ট — প্র্যাকটিস এরিয়া'],
            'slug' => 'test-practice-area-pub',
            'short_description' => ['en' => 'Short desc', 'bn' => 'সংক্ষিপ্ত'],
            'full_description' => ['en' => '<p>Full desc</p>', 'bn' => '<p>পূর্ণ বিবরণ</p>'],
            'status' => 'published',
            'sort_order' => 1,
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('public-case-doc.pdf', 50, 'application/pdf');
        $storedPath = $file->store('documents/cases', 'public');

        $user = User::factory()->create();

        $this->dummyMedia = Media::create([
            'disk' => 'public',
            'directory' => 'documents/cases',
            'filename' => basename($storedPath),
            'original_name' => 'public-case-doc.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 51200,
            'uploaded_by' => $user->id,
        ]);

        \App\Services\CmsCacheService::flushAll();
    }

    public function test_public_courtroom_empty_state(): void
    {
        $response = $this->getJson('/api/v1/courtroom');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', [])
            ->assertJsonPath('meta.total', 0);
    }

    public function test_public_courtroom_returns_published_and_public_visibility_only(): void
    {
        CourtroomExperience::create([
            'title' => ['en' => 'TEST — Published Public Case', 'bn' => 'টেস্ট প্রকাশিত কেস'],
            'slug' => 'test-published-public-case',
            'court' => 'Supreme Court of Bangladesh',
            'case_type' => 'Writ Petition',
            'year' => 2024,
            'practice_area_id' => $this->practiceArea->id,
            'legal_area' => ['en' => 'Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Published summary', 'bn' => 'প্রকাশিত সারসংক্ষেপ'],
            'description' => ['en' => '<p>Published description</p>', 'bn' => '<p>বিবরণ</p>'],
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        CourtroomExperience::create([
            'title' => ['en' => 'TEST — Draft Case', 'bn' => 'টেস্ট ড্রাফট'],
            'slug' => 'test-draft-case',
            'court' => 'High Court',
            'case_type' => 'Civil',
            'year' => 2024,
            'legal_area' => ['en' => 'Civil', 'bn' => 'দেওয়ানি'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Draft summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Draft</p>', 'bn' => '<p>ড্রাফট</p>'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        CourtroomExperience::create([
            'title' => ['en' => 'TEST — Private Case', 'bn' => 'টেস্ট ব্যক্তিগত'],
            'slug' => 'test-private-case',
            'court' => 'High Court',
            'case_type' => 'Civil',
            'year' => 2024,
            'legal_area' => ['en' => 'Civil', 'bn' => 'দেওয়ানি'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Private summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Private</p>', 'bn' => '<p>ব্যক্তিগত</p>'],
            'status' => 'published',
            'visibility' => 'private',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/courtroom');
        $response->assertStatus(200);

        $slugs = collect($response->json('data'))->pluck('slug')->all();
        $this->assertContains('test-published-public-case', $slugs);
        $this->assertNotContains('test-draft-case', $slugs);
        $this->assertNotContains('test-private-case', $slugs);
    }

    public function test_public_courtroom_respects_locale_switching(): void
    {
        CourtroomExperience::create([
            'title' => ['en' => 'TEST — English Case Title', 'bn' => 'টেস্ট — বাংলা মামলার শিরোনাম'],
            'slug' => 'test-bilingual-case',
            'court' => 'High Court Division',
            'case_type' => 'Company Matter',
            'year' => 2023,
            'legal_area' => ['en' => 'Corporate Law', 'bn' => 'করপোরেট আইন'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'English summary text', 'bn' => 'বাংলা সারসংক্ষেপ পাঠ্য'],
            'description' => ['en' => '<p>EN</p>', 'bn' => '<p>বিএন</p>'],
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        // English request
        $responseEn = $this->getJson('/api/v1/courtroom', ['Accept-Language' => 'en']);
        $responseEn->assertStatus(200);
        $itemEn = collect($responseEn->json('data'))->firstWhere('slug', 'test-bilingual-case');
        $this->assertEquals('TEST — English Case Title', $itemEn['title']);
        $this->assertEquals('English summary text', $itemEn['summary']);

        // Bangla request
        $responseBn = $this->getJson('/api/v1/courtroom', ['Accept-Language' => 'bn']);
        $responseBn->assertStatus(200);
        $itemBn = collect($responseBn->json('data'))->firstWhere('slug', 'test-bilingual-case');
        $this->assertEquals('টেস্ট — বাংলা মামলার শিরোনাম', $itemBn['title']);
        $this->assertEquals('বাংলা সারসংক্ষেপ পাঠ্য', $itemBn['summary']);
    }

    public function test_public_detail_endpoint_returns_published_case_with_public_docs_only(): void
    {
        $case = CourtroomExperience::create([
            'title' => ['en' => 'TEST — Detail Case With Documents', 'bn' => 'টেস্ট বিস্তারিত কেস'],
            'slug' => 'test-detail-case-docs',
            'court' => 'High Court Division',
            'case_type' => 'Criminal Revision',
            'year' => 2024,
            'practice_area_id' => $this->practiceArea->id,
            'legal_area' => ['en' => 'Criminal Law', 'bn' => 'ফৌজদারি আইন'],
            'role' => ['en' => 'Counsel', 'bn' => 'আইনজীবী'],
            'summary' => ['en' => 'Case summary', 'bn' => 'সারসংক্ষেপ'],
            'description' => ['en' => '<p>Detailed case narrative</p>', 'bn' => '<p>বিবরণ</p>'],
            'issues' => ['en' => '<p>Key issues</p>', 'bn' => '<p>আইনি বিষয়</p>'],
            'arguments' => ['en' => '<p>Advocacy arguments</p>', 'bn' => '<p>যুক্তি</p>'],
            'outcome' => ['en' => '<p>Court judgment</p>', 'bn' => '<p>রায়</p>'],
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        // Add a public document
        CaseDocument::create([
            'courtroom_experience_id' => $case->id,
            'title' => ['en' => 'Public Judgment Brief', 'bn' => 'পাবলিক রায় সারসংক্ষেপ'],
            'document_type' => 'Judgment',
            'media_id' => $this->dummyMedia->id,
            'is_confidential' => false,
            'sort_order' => 1,
        ]);

        // Add a confidential document
        CaseDocument::create([
            'courtroom_experience_id' => $case->id,
            'title' => ['en' => 'Confidential Internal Note', 'bn' => 'গোপনীয় নোট'],
            'document_type' => 'Internal Note',
            'media_id' => $this->dummyMedia->id,
            'is_confidential' => true,
            'sort_order' => 2,
        ]);

        $response = $this->getJson('/api/v1/courtroom/test-detail-case-docs');
        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'test-detail-case-docs')
            ->assertJsonPath('data.court', 'High Court Division')
            ->assertJsonPath('data.practice_area.id', $this->practiceArea->id);

        $documents = $response->json('data.documents');
        $this->assertCount(1, $documents);
        $this->assertEquals('Public Judgment Brief', $documents[0]['title']);
    }

    public function test_public_detail_returns_404_for_draft_or_private_case(): void
    {
        CourtroomExperience::create([
            'title' => ['en' => 'TEST — Draft Case', 'bn' => 'ড্রাফট'],
            'slug' => 'test-draft-case-hidden',
            'court' => 'Court',
            'case_type' => 'Type',
            'year' => 2024,
            'legal_area' => ['en' => 'Area', 'bn' => 'এরিয়া'],
            'role' => ['en' => 'Role', 'bn' => 'রোল'],
            'summary' => ['en' => 'Sum', 'bn' => 'সার'],
            'description' => ['en' => '<p>D</p>', 'bn' => '<p>ডি</p>'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $this->getJson('/api/v1/courtroom/test-draft-case-hidden')->assertStatus(404);
        $this->getJson('/api/v1/courtroom/non-existent-case-slug')->assertStatus(404);
    }

    public function test_public_document_download_security(): void
    {
        $publishedCase = CourtroomExperience::create([
            'title' => ['en' => 'TEST — Published Case For Download', 'bn' => 'টেস্ট ডাউনলোড কেস'],
            'slug' => 'test-download-case',
            'court' => 'High Court',
            'case_type' => 'Writ',
            'year' => 2023,
            'legal_area' => ['en' => 'Area', 'bn' => 'এরিয়া'],
            'role' => ['en' => 'Role', 'bn' => 'রোল'],
            'summary' => ['en' => 'Sum', 'bn' => 'সার'],
            'description' => ['en' => '<p>D</p>', 'bn' => '<p>ডি</p>'],
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $publicDoc = CaseDocument::create([
            'courtroom_experience_id' => $publishedCase->id,
            'title' => ['en' => 'Public Doc', 'bn' => 'পাবলিক'],
            'document_type' => 'Order',
            'media_id' => $this->dummyMedia->id,
            'is_confidential' => false,
            'sort_order' => 1,
        ]);

        $confidentialDoc = CaseDocument::create([
            'courtroom_experience_id' => $publishedCase->id,
            'title' => ['en' => 'Confidential Doc', 'bn' => 'গোপনীয়'],
            'document_type' => 'Order',
            'media_id' => $this->dummyMedia->id,
            'is_confidential' => true,
            'sort_order' => 2,
        ]);

        // 1. Public document download succeeds
        $response = $this->get("/api/v1/courtroom/documents/{$publicDoc->id}/download");
        $response->assertStatus(200);
        $this->assertEquals(1, $publicDoc->fresh()->download_count);

        // 2. Confidential document via public download returns 404
        $confResponse = $this->get("/api/v1/courtroom/documents/{$confidentialDoc->id}/download");
        $confResponse->assertStatus(404);
    }
}

<?php

namespace Tests\Feature\Judgments;

use App\Models\JudgmentReview;
use App\Models\Media;
use App\Models\PracticeArea;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicJudgmentReviewTest extends TestCase
{
    use DatabaseTransactions;

    protected Media $dummyPdf;
    protected PracticeArea $practiceArea;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $admin = User::factory()->create(['email' => 'public_judgment_seed@nijamuddin.com']);

        $this->practiceArea = PracticeArea::create([
            'title' => ['en' => 'TEST — Corporate Practice', 'bn' => 'টেস্ট — করপোরেট প্র্যাকটিস'],
            'slug' => 'test-corporate-practice',
            'short_description' => ['en' => 'TEST — Description', 'bn' => 'টেস্ট — বিবরণ'],
            'full_description' => ['en' => '<p>TEST — Full description</p>', 'bn' => '<p>টেস্ট — বিস্তারিত বিবরণ</p>'],
            'icon_name' => 'briefcase',
            'status' => 'published',
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('public-judgment.pdf', 300, 'application/pdf');
        $storedPath = $file->store('documents/judgments', 'public');

        $this->dummyPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/judgments',
            'filename' => basename($storedPath),
            'original_name' => 'public-judgment.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 307200,
            'uploaded_by' => $admin->id,
        ]);
    }

    public function test_public_judgments_empty_state(): void
    {
        $response = $this->getJson('/api/v1/judgments');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', []);
    }

    public function test_public_judgments_returns_published_and_public_visibility_only(): void
    {
        // 1. Published + Public
        JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Public Published Case', 'bn' => 'টেস্ট — প্রকাশিত মামলা'],
            'citation' => 'TEST 85 DLR 100',
            'slug' => 'test-public-published-case',
            'court' => 'Supreme Court of Bangladesh',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        // 2. Draft + Public (Should NOT appear)
        JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Draft Case', 'bn' => 'টেস্ট — খসড়া মামলা'],
            'citation' => 'TEST 85 DLR 200',
            'slug' => 'test-draft-case',
            'court' => 'High Court Division',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        // 3. Published + Private (Should NOT appear)
        JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Private Published Case', 'bn' => 'টেস্ট — ব্যক্তিগত মামলা'],
            'citation' => 'TEST 85 DLR 300',
            'slug' => 'test-private-published-case',
            'court' => 'High Court Division',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'published',
            'visibility' => 'private',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/judgments');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'test-public-published-case');
    }

    public function test_public_judgments_respects_locale_switching(): void
    {
        JudgmentReview::create([
            'case_name' => ['en' => 'TEST — English Case Name', 'bn' => 'টেস্ট — বাংলা মামলার নাম'],
            'citation' => 'TEST 71 DLR (AD) 50',
            'slug' => 'test-locale-case-name',
            'court' => 'Appellate Division',
            'legal_area' => ['en' => 'Commercial Law', 'bn' => 'বাণিজ্যিক আইন'],
            'summary' => ['en' => 'English Summary Content', 'bn' => 'বাংলা সারসংক্ষেপ বিষয়বস্তু'],
            'court_decision' => ['en' => 'English Decision', 'bn' => 'বাংলা সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'English Analysis', 'bn' => 'বাংলা বিশ্লেষণ'],
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        // English request
        $resEn = $this->getJson('/api/v1/judgments?search=test-locale-case-name');
        $resEn->assertStatus(200)
            ->assertJsonPath('data.0.case_name', 'TEST — English Case Name')
            ->assertJsonPath('data.0.legal_area', 'Commercial Law')
            ->assertJsonPath('data.0.summary', 'English Summary Content');

        // Bengali request via Accept-Language header
        $resBn = $this->withHeaders(['Accept-Language' => 'bn'])
            ->getJson('/api/v1/judgments?search=test-locale-case-name');
        $resBn->assertStatus(200)
            ->assertJsonPath('data.0.case_name', 'টেস্ট — বাংলা মামলার নাম')
            ->assertJsonPath('data.0.legal_area', 'বাণিজ্যিক আইন')
            ->assertJsonPath('data.0.summary', 'বাংলা সারসংক্ষেপ বিষয়বস্তু');
    }

    public function test_public_detail_endpoint_returns_published_judgment(): void
    {
        $item = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Detail Benchmark Case', 'bn' => 'টেস্ট — বিস্তারিত বেঞ্চমার্ক'],
            'citation' => 'TEST 90 DLR 45',
            'slug' => 'test-detail-benchmark-case',
            'court' => 'High Court Division',
            'judgment_date' => '2023-11-12',
            'legal_area' => ['en' => 'Company Law', 'bn' => 'কোম্পানি আইন'],
            'summary' => ['en' => 'Summary text', 'bn' => 'সারসংক্ষেপ'],
            'key_issues' => ['en' => '<p>Shareholder rights</p>', 'bn' => '<p>শেয়ারহোল্ডার অধিকার</p>'],
            'court_decision' => ['en' => '<p>Injunction upheld</p>', 'bn' => '<p>নিষেধাজ্ঞা বহাল</p>'],
            'author_analysis' => ['en' => '<p>Critical doctrine established</p>', 'bn' => '<p>গুরুত্বপূর্ণ মতবাদ প্রতিষ্ঠিত</p>'],
            'practical_significance' => ['en' => '<p>Prevents minority oppression</p>', 'bn' => '<p>সংখ্যালঘু নিপীড়ন রোধ</p>'],
            'practice_area_id' => $this->practiceArea->id,
            'pdf_media_id' => $this->dummyPdf->id,
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/judgments/test-detail-benchmark-case');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-detail-benchmark-case')
            ->assertJsonPath('data.citation', 'TEST 90 DLR 45')
            ->assertJsonPath('data.court', 'High Court Division')
            ->assertJsonPath('data.has_pdf', true)
            ->assertJsonPath('data.court_decision', '<p>Injunction upheld</p>')
            ->assertJsonPath('data.author_analysis', '<p>Critical doctrine established</p>')
            ->assertJsonPath('data.practical_significance', '<p>Prevents minority oppression</p>');
    }

    public function test_public_detail_returns_404_for_draft_or_private(): void
    {
        JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Unpublished Draft', 'bn' => 'টেস্ট — অপ্রকাশিত খসড়া'],
            'citation' => 'TEST 90 DLR 46',
            'slug' => 'test-unpublished-draft',
            'court' => 'High Court Division',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $response = $this->getJson('/api/v1/judgments/test-unpublished-draft');
        $response->assertStatus(404);
    }

    public function test_public_pdf_download_security(): void
    {
        $published = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Public PDF Case', 'bn' => 'টেস্ট — পাবলিক পিডিএফ'],
            'citation' => 'TEST 92 DLR 10',
            'slug' => 'test-public-pdf-case',
            'court' => 'Supreme Court',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'pdf_media_id' => $this->dummyPdf->id,
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $private = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Private PDF Case', 'bn' => 'টেস্ট — প্রাইভেট পিডিএফ'],
            'citation' => 'TEST 92 DLR 20',
            'slug' => 'test-private-pdf-case',
            'court' => 'Supreme Court',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'pdf_media_id' => $this->dummyPdf->id,
            'status' => 'published',
            'visibility' => 'private',
            'published_at' => now(),
        ]);

        // Public item: download succeeds
        $resPublic = $this->get("/api/v1/judgments/{$published->slug}/download");
        $resPublic->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('X-Content-Type-Options', 'nosniff');

        // Private item: public download returns 404
        $resPrivate = $this->get("/api/v1/judgments/{$private->slug}/download");
        $resPrivate->assertStatus(404);
    }
}

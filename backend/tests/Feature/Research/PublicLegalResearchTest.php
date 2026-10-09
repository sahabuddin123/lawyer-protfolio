<?php

namespace Tests\Feature\Research;

use App\Models\Category;
use App\Models\LegalResearch;
use App\Models\Media;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicLegalResearchTest extends TestCase
{
    use DatabaseTransactions;

    protected Category $category;
    protected Tag $tag;
    protected Media $dummyPdf;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $admin = User::factory()->create(['name' => 'Admin Seed', 'email' => 'admin_seed_test@nijamuddin.com']);

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Corporate Governance', 'bn' => 'টেস্ট — কর্পোরেট সুশাসন'],
            'slug' => 'test-corporate-governance',
            'type' => 'research',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->tag = Tag::create([
            'name' => ['en' => 'TEST — Regulatory Compliance', 'bn' => 'টেস্ট — নিয়ন্ত্রক সম্মতি'],
            'slug' => 'test-regulatory-compliance',
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('test-monograph.pdf', 150, 'application/pdf');
        $storedPath = $file->store('documents/research', 'public');

        $this->dummyPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/research',
            'filename' => basename($storedPath),
            'original_name' => 'test-monograph.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 153600,
            'uploaded_by' => $admin->id,
        ]);
    }

    public function test_public_research_empty_state(): void
    {
        // Ensure no published research exists for a non-matching search
        $response = $this->getJson('/api/v1/research?search=nonexistent-query-string-probe');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', []);
    }

    public function test_public_research_returns_published_and_public_visibility_only(): void
    {
        // 1. Published & Public item
        LegalResearch::create([
            'category_id' => $this->category->id,
            'research_type' => 'article',
            'title' => ['en' => 'TEST — Published Public Research', 'bn' => 'টেস্ট — প্রকাশিত গবেষণা'],
            'slug' => 'test-published-public-research',
            'author' => ['en' => 'TEST — Author', 'bn' => 'টেস্ট — লেখক'],
            'excerpt' => ['en' => 'TEST — Excerpt', 'bn' => 'টেস্ট — সারসংক্ষেপ'],
            'content' => ['en' => '<p>TEST — Public Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'visibility' => 'public',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // 2. Draft item
        LegalResearch::create([
            'category_id' => $this->category->id,
            'research_type' => 'article',
            'title' => ['en' => 'TEST — Draft Research Hidden', 'bn' => 'টেস্ট — খসড়া গোপন'],
            'slug' => 'test-draft-research-hidden',
            'author' => ['en' => 'Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'Excerpt', 'bn' => 'সারসংক্ষেপ'],
            'content' => ['en' => '<p>Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'visibility' => 'public',
            'status' => 'draft',
        ]);

        // 3. Published but Private item
        LegalResearch::create([
            'category_id' => $this->category->id,
            'research_type' => 'article',
            'title' => ['en' => 'TEST — Private Published Research', 'bn' => 'টেস্ট — ব্যক্তিগত গবেষণা'],
            'slug' => 'test-private-published-research',
            'author' => ['en' => 'Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'Excerpt', 'bn' => 'সারসংক্ষেপ'],
            'content' => ['en' => '<p>Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'visibility' => 'private',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/research');
        $response->assertStatus(200);

        $slugs = collect($response->json('data'))->pluck('slug')->toArray();

        $this->assertContains('test-published-public-research', $slugs);
        $this->assertNotContains('test-draft-research-hidden', $slugs);
        $this->assertNotContains('test-private-published-research', $slugs);
    }

    public function test_public_research_respects_locale_switching(): void
    {
        LegalResearch::create([
            'category_id' => $this->category->id,
            'research_type' => 'legal_opinion',
            'title' => [
                'en' => 'TEST — English Title Opinion',
                'bn' => 'টেস্ট — বাংলা মতামত শিরোনাম',
            ],
            'slug' => 'test-bilingual-opinion',
            'author' => [
                'en' => 'TEST — Author English',
                'bn' => 'টেস্ট — লেখক বাংলা',
            ],
            'excerpt' => [
                'en' => 'TEST — English Summary',
                'bn' => 'টেস্ট — বাংলা সারসংক্ষেপ',
            ],
            'content' => [
                'en' => '<p>TEST — English Content</p>',
                'bn' => '<p>টেস্ট — বাংলা বিবরণ</p>',
            ],
            'visibility' => 'public',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Default EN
        $resEn = $this->getJson('/api/v1/research?search=test-bilingual-opinion');
        $resEn->assertStatus(200)
            ->assertJsonPath('data.0.title', 'TEST — English Title Opinion')
            ->assertJsonPath('data.0.author', 'TEST — Author English');

        // Bengali via Accept-Language header
        $resBn = $this->withHeaders(['Accept-Language' => 'bn'])
            ->getJson('/api/v1/research?search=test-bilingual-opinion');
        $resBn->assertStatus(200)
            ->assertJsonPath('data.0.title', 'টেস্ট — বাংলা মতামত শিরোনাম')
            ->assertJsonPath('data.0.author', 'টেস্ট — লেখক বাংলা');
    }

    public function test_public_detail_endpoint_returns_published_monograph(): void
    {
        $research = LegalResearch::create([
            'category_id' => $this->category->id,
            'research_type' => 'constitutional_analysis',
            'title' => ['en' => 'TEST — Detailed Legal Treatise', 'bn' => 'টেস্ট — বিস্তারিত গবেষণা গ্রন্থ'],
            'slug' => 'test-detailed-legal-treatise',
            'author' => ['en' => 'TEST — Senior Researcher', 'bn' => 'টেস্ট — গবেষক'],
            'excerpt' => ['en' => 'TEST — Monograph Overview', 'bn' => 'টেস্ট — সংক্ষিপ্ত'],
            'content' => ['en' => '<h2>Analysis</h2><p>TEST — Comprehensive judicial analysis content.</p>', 'bn' => '<p>বিশ্লেষণ</p>'],
            'pdf_media_id' => $this->dummyPdf->id,
            'visibility' => 'public',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $research->tags()->sync([$this->tag->id]);

        $response = $this->getJson('/api/v1/research/test-detailed-legal-treatise');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-detailed-legal-treatise')
            ->assertJsonPath('data.category.slug', 'test-corporate-governance')
            ->assertJsonPath('data.has_pdf', true)
            ->assertJsonPath('data.pdf_media.original_name', 'test-monograph.pdf');

        $this->assertNotEmpty($response->json('data.tags'));
        $this->assertEquals('test-regulatory-compliance', $response->json('data.tags.0.slug'));
    }

    public function test_public_detail_returns_404_for_draft_or_private(): void
    {
        LegalResearch::create([
            'research_type' => 'article',
            'title' => ['en' => 'TEST — Unpublished Draft', 'bn' => 'টেস্ট — অপ্রকাশিত'],
            'slug' => 'test-unpub-draft',
            'author' => ['en' => 'Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'Excerpt', 'bn' => 'সারসংক্ষেপ'],
            'content' => ['en' => '<p>Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'visibility' => 'public',
            'status' => 'draft',
        ]);

        $resDraft = $this->getJson('/api/v1/research/test-unpub-draft');
        $resDraft->assertStatus(404);

        LegalResearch::create([
            'research_type' => 'article',
            'title' => ['en' => 'TEST — Private Item', 'bn' => 'টেস্ট — ব্যক্তিগত'],
            'slug' => 'test-priv-item',
            'author' => ['en' => 'Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'Excerpt', 'bn' => 'সারসংক্ষেপ'],
            'content' => ['en' => '<p>Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'visibility' => 'private',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $resPrivate = $this->getJson('/api/v1/research/test-priv-item');
        $resPrivate->assertStatus(404);
    }

    public function test_public_pdf_download_security(): void
    {
        LegalResearch::create([
            'research_type' => 'research_paper',
            'title' => ['en' => 'TEST — Paper with PDF Download', 'bn' => 'টেস্ট — পিডিএফ ডাউনলোড'],
            'slug' => 'test-paper-with-pdf-download',
            'author' => ['en' => 'Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'Excerpt', 'bn' => 'সারসংক্ষেপ'],
            'content' => ['en' => '<p>Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'pdf_media_id' => $this->dummyPdf->id,
            'visibility' => 'public',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get('/api/v1/research/test-paper-with-pdf-download/download');
        $response->assertStatus(200)
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }
}

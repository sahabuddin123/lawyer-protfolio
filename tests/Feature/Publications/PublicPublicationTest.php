<?php

namespace Tests\Feature\Publications;

use App\Models\Category;
use App\Models\Media;
use App\Models\Publication;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicPublicationTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected Category $category;
    protected Tag $tag;
    protected Media $publicPdf;
    protected Media $privatePdf;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->adminUser = User::factory()->create(['name' => 'Admin User', 'email' => 'admin_pub_pub_test@nijamuddin.com']);
        $this->adminUser->assignRole('super_admin');

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Academic Treatise', 'bn' => 'টেস্ট — একাডেমিক গবেষণাপত্র'],
            'slug' => 'test-academic-treatise',
            'type' => 'publications',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->tag = Tag::create([
            'name' => ['en' => 'TEST — Civil Rights', 'bn' => 'টেস্ট — নাগরিক অধিকার'],
            'slug' => 'test-civil-rights',
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('public-doc.pdf', 300, 'application/pdf');
        $storedPublic = $file->store('documents/publications', 'public');

        $this->publicPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/publications',
            'filename' => basename($storedPublic),
            'original_name' => 'public-doc.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 307200,
            'uploaded_by' => $this->adminUser->id,
        ]);
    }

    public function test_public_publications_empty_state(): void
    {
        $response = $this->getJson('/api/v1/publications');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', []);
    }

    public function test_public_publications_returns_published_and_public_visibility_only(): void
    {
        Publication::create([
            'title' => ['en' => 'TEST — Public Monograph', 'bn' => 'টেস্ট — প্রকাশ্য মনোগ্রাফ'],
            'slug' => 'test-public-monograph',
            'publication_type' => 'book',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        Publication::create([
            'title' => ['en' => 'TEST — Draft Monograph', 'bn' => 'টেস্ট — খসড়া মনোগ্রাফ'],
            'slug' => 'test-draft-monograph',
            'publication_type' => 'book',
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        Publication::create([
            'title' => ['en' => 'TEST — Private Monograph', 'bn' => 'টেস্ট — ব্যক্তিগত মনোগ্রাফ'],
            'slug' => 'test-private-monograph',
            'publication_type' => 'book',
            'status' => 'published',
            'visibility' => 'private',
        ]);

        $res = $this->getJson('/api/v1/publications');
        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $res->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('test-public-monograph', $data[0]['slug']);
    }

    public function test_public_publications_respects_locale_switching(): void
    {
        Publication::create([
            'title' => ['en' => 'English Publication Title', 'bn' => 'বাংলা প্রকাশনা শিরোনাম'],
            'slug' => 'test-bilingual-pub',
            'publication_type' => 'article',
            'excerpt' => ['en' => 'English Excerpt', 'bn' => 'বাংলা সারসংক্ষেপ'],
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $resEn = $this->getJson('/api/v1/publications', ['Accept-Language' => 'en']);
        $resEn->assertStatus(200)
            ->assertJsonPath('data.0.title', 'English Publication Title')
            ->assertJsonPath('data.0.excerpt', 'English Excerpt');

        $resBn = $this->getJson('/api/v1/publications', ['Accept-Language' => 'bn']);
        $resBn->assertStatus(200)
            ->assertJsonPath('data.0.title', 'বাংলা প্রকাশনা শিরোনাম')
            ->assertJsonPath('data.0.excerpt', 'বাংলা সারসংক্ষেপ');
    }

    public function test_public_detail_endpoint_returns_published_publication(): void
    {
        $pub = Publication::create([
            'title' => ['en' => 'TEST — Deep Constitutional Treatise', 'bn' => 'টেস্ট — গভীর সাংবিধানিক গ্রন্থ'],
            'slug' => 'test-deep-constitutional-treatise',
            'publication_type' => 'book',
            'publication_name' => ['en' => 'Supreme Court Bar Press', 'bn' => 'সুপ্রিম কোর্ট বার প্রেস'],
            'publication_date' => '2025-05-10',
            'author' => ['en' => 'TEST — Author Advocate', 'bn' => 'টেস্ট — লেখক অ্যাডভোকেট'],
            'excerpt' => ['en' => 'Concise thesis on judicial review.', 'bn' => 'বিচারিক পর্যালোচনা সংক্রান্ত থিসিস।'],
            'content' => ['en' => '<p>Detailed treatise chapters and analysis.</p>', 'bn' => '<p>বিস্তারিত অধ্যায় ও বিশ্লেষণ।</p>'],
            'external_url' => 'https://example.com/treatise',
            'category_id' => $this->category->id,
            'pdf_media_id' => $this->publicPdf->id,
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $pub->tags()->sync([$this->tag->id]);

        $res = $this->getJson("/api/v1/publications/{$pub->slug}");
        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-deep-constitutional-treatise')
            ->assertJsonPath('data.has_pdf', true);
        $this->assertNotNull($res->json('data.pdf_media.download_url'));
    }

    public function test_public_detail_returns_404_for_draft_or_private(): void
    {
        Publication::create([
            'title' => ['en' => 'TEST — Hidden Draft', 'bn' => 'টেস্ট — লুকানো খসড়া'],
            'slug' => 'test-hidden-draft',
            'publication_type' => 'article',
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        Publication::create([
            'title' => ['en' => 'TEST — Hidden Private', 'bn' => 'টেস্ট — লুকানো ব্যক্তিগত'],
            'slug' => 'test-hidden-private',
            'publication_type' => 'article',
            'status' => 'published',
            'visibility' => 'private',
        ]);

        $this->getJson('/api/v1/publications/test-hidden-draft')->assertStatus(404);
        $this->getJson('/api/v1/publications/test-hidden-private')->assertStatus(404);
    }

    public function test_public_pdf_download_security(): void
    {
        $pubPublic = Publication::create([
            'title' => ['en' => 'TEST — Public PDF Publication', 'bn' => 'টেস্ট — প্রকাশ্য পিডিএফ'],
            'slug' => 'test-public-pdf-pub',
            'publication_type' => 'article',
            'pdf_media_id' => $this->publicPdf->id,
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $pubPrivate = Publication::create([
            'title' => ['en' => 'TEST — Private PDF Publication', 'bn' => 'টেস্ট — গোপন পিডিএফ'],
            'slug' => 'test-private-pdf-pub',
            'publication_type' => 'article',
            'pdf_media_id' => $this->publicPdf->id,
            'status' => 'published',
            'visibility' => 'private',
        ]);

        $pubDraft = Publication::create([
            'title' => ['en' => 'TEST — Draft PDF Publication', 'bn' => 'টেস্ট — খসড়া পিডিএফ'],
            'slug' => 'test-draft-pdf-pub',
            'publication_type' => 'article',
            'pdf_media_id' => $this->publicPdf->id,
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        // 1. Public PDF download succeeds
        $resSuccess = $this->get("/api/v1/publications/{$pubPublic->slug}/download");
        $resSuccess->assertStatus(200)
            ->assertHeader('X-Content-Type-Options', 'nosniff');

        // 2. Private publication PDF download returns 404 (not exposed publicly)
        $resPrivate = $this->get("/api/v1/publications/{$pubPrivate->slug}/download");
        $resPrivate->assertStatus(404);

        // 3. Draft PDF download returns 404
        $resNotFound = $this->get("/api/v1/publications/{$pubDraft->slug}/download");
        $resNotFound->assertStatus(404);
    }
}

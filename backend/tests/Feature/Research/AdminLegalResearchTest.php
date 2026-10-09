<?php

namespace Tests\Feature\Research;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\LegalResearch;
use App\Models\Media;
use App\Models\Redirect;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminLegalResearchTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $editor;
    protected User $plainUser;
    protected Category $category;
    protected Tag $tag;
    protected Media $dummyPdf;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin', 'email' => 'admin_research_test@nijamuddin.com']);
        $this->superAdmin->assignRole('super_admin');

        $this->editor = User::factory()->create(['name' => 'Editor User', 'email' => 'editor_research_test@nijamuddin.com']);
        $this->editor->assignRole('editor');

        $this->plainUser = User::factory()->create(['name' => 'Plain User', 'email' => 'plain_research_test@nijamuddin.com']);

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Constitutional Analysis', 'bn' => 'টেস্ট — সাংবিধানিক বিশ্লেষণ'],
            'slug' => 'test-constitutional-analysis',
            'type' => 'research',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->tag = Tag::create([
            'name' => ['en' => 'TEST — Fundamental Rights', 'bn' => 'টেস্ট — মৌলিক অধিকার'],
            'slug' => 'test-fundamental-rights',
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('test-research.pdf', 200, 'application/pdf');
        $storedPath = $file->store('documents/research', 'public');

        $this->dummyPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/research',
            'filename' => basename($storedPath),
            'original_name' => 'test-research.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 204800,
            'uploaded_by' => $this->superAdmin->id,
        ]);
    }

    public function test_unauthenticated_admin_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/research');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        Sanctum::actingAs($this->plainUser);

        $response = $this->getJson('/api/v1/admin/research');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_legal_research_with_filters(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $item = LegalResearch::create([
            'category_id' => $this->category->id,
            'research_type' => 'constitutional_analysis',
            'title' => ['en' => 'TEST — Legal Research Article A', 'bn' => 'টেস্ট — গবেষণা এ'],
            'slug' => 'test-legal-research-article-a',
            'author' => ['en' => 'TEST — Author A', 'bn' => 'টেস্ট — লেখক এ'],
            'excerpt' => ['en' => 'TEST — Excerpt A', 'bn' => 'টেস্ট — সারসংক্ষেপ এ'],
            'content' => ['en' => '<p>TEST — Research Content A</p>', 'bn' => '<p>টেস্ট — বিষয়বস্তু এ</p>'],
            'visibility' => 'public',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/admin/research?status=published&visibility=public&research_type=constitutional_analysis');
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertNotEmpty($response->json('data'));
    }

    public function test_admin_can_create_legal_research_monograph(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'category_id' => $this->category->id,
            'tags' => [$this->tag->id],
            'research_type' => 'statutory_analysis',
            'title' => [
                'en' => 'TEST — Legal Research Creation',
                'bn' => 'টেস্ট — নতুন গবেষণা তৈরি',
            ],
            'slug' => 'test-legal-research-creation',
            'author' => [
                'en' => 'TEST — Researcher Name',
                'bn' => 'টেস্ট — গবেষকের নাম',
            ],
            'excerpt' => [
                'en' => 'TEST — Short Excerpt Overview',
                'bn' => 'টেস্ট — সংক্ষিপ্ত বিবরণ',
            ],
            'content' => [
                'en' => '<h2>TEST — Introduction</h2><p>TEST — Research Content Body with <script>alert("xss")</script> safe text.</p>',
                'bn' => '<h2>টেস্ট — ভূমিকা</h2><p>টেস্ট — গবেষণামূলক বিবরণ।</p>',
            ],
            'research_date' => '2026-05-15',
            'pdf_media_id' => $this->dummyPdf->id,
            'visibility' => 'public',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 2,
            'seo' => [
                'seo_title' => ['en' => 'TEST — SEO Title', 'bn' => 'টেস্ট — এসইও শিরোনাম'],
                'meta_description' => ['en' => 'TEST — SEO Description', 'bn' => 'টেস্ট — এসইও বিবরণ'],
            ],
        ];

        $response = $this->postJson('/api/v1/admin/research', $payload);
        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-legal-research-creation')
            ->assertJsonPath('data.research_type', 'statutory_analysis');

        // Verify HTML sanitization purged script tag
        $this->assertStringNotContainsString('<script>', $response->json('data.content.en'));
        $this->assertDatabaseHas('legal_researches', [
            'slug' => 'test-legal-research-creation',
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => 1,
        ]);

        // Verify audit log
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'research_created',
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'research_published',
        ]);
    }

    public function test_slug_uniqueness_is_enforced(): void
    {
        Sanctum::actingAs($this->superAdmin);

        LegalResearch::create([
            'research_type' => 'article',
            'title' => ['en' => 'TEST — Unique Research 1', 'bn' => 'টেস্ট — গবেষণা ১'],
            'slug' => 'test-unique-research',
            'author' => ['en' => 'TEST — Author', 'bn' => 'টেস্ট — লেখক'],
            'excerpt' => ['en' => 'TEST — Excerpt', 'bn' => 'টেস্ট — সারসংক্ষেপ'],
            'content' => ['en' => '<p>TEST — Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $payload = [
            'research_type' => 'article',
            'title' => ['en' => 'TEST — Unique Research 2', 'bn' => 'টেস্ট — গবেষণা ২'],
            'slug' => 'test-unique-research',
            'author' => ['en' => 'TEST — Author', 'bn' => 'টেস্ট — লেখক'],
            'excerpt' => ['en' => 'TEST — Excerpt', 'bn' => 'টেস্ট — সারসংক্ষেপ'],
            'content' => ['en' => '<p>TEST — Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'status' => 'draft',
            'visibility' => 'public',
        ];

        $response = $this->postJson('/api/v1/admin/research', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_published_slug_change_creates_301_redirect(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $research = LegalResearch::create([
            'research_type' => 'case_analysis',
            'title' => ['en' => 'TEST — Original Research Slug', 'bn' => 'টেস্ট — শিরোনাম'],
            'slug' => 'test-original-research-slug',
            'author' => ['en' => 'TEST — Author', 'bn' => 'টেস্ট — লেখক'],
            'excerpt' => ['en' => 'TEST — Excerpt', 'bn' => 'টেস্ট — সারসংক্ষেপ'],
            'content' => ['en' => '<p>TEST — Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $updatePayload = [
            'research_type' => 'case_analysis',
            'title' => ['en' => 'TEST — Updated Research Title', 'bn' => 'টেস্ট — পরিমার্জিত শিরোনাম'],
            'slug' => 'test-updated-research-slug',
            'author' => ['en' => 'TEST — Author', 'bn' => 'টেস্ট — লেখক'],
            'excerpt' => ['en' => 'TEST — Excerpt', 'bn' => 'টেস্ট — সারসংক্ষেপ'],
            'content' => ['en' => '<p>TEST — Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'status' => 'published',
            'visibility' => 'public',
        ];

        $response = $this->putJson("/api/v1/admin/research/{$research->id}", $updatePayload);
        $response->assertStatus(200);

        // Verify redirect record was created
        $this->assertDatabaseHas('redirects', [
            'source_url' => '/research/test-original-research-slug',
            'target_url' => '/research/test-updated-research-slug',
            'status_code' => 301,
        ]);

        // Verify redirect audit log
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'redirect_created',
        ]);
    }

    public function test_admin_can_soft_delete_legal_research(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $research = LegalResearch::create([
            'research_type' => 'commentary',
            'title' => ['en' => 'TEST — To Be Deleted', 'bn' => 'টেস্ট — মুছে ফেলার জন্য'],
            'slug' => 'test-to-be-deleted',
            'author' => ['en' => 'TEST — Author', 'bn' => 'টেস্ট — লেখক'],
            'excerpt' => ['en' => 'TEST — Excerpt', 'bn' => 'টেস্ট — সারসংক্ষেপ'],
            'content' => ['en' => '<p>TEST — Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $response = $this->deleteJson("/api/v1/admin/research/{$research->id}");
        $response->assertStatus(200);

        $this->assertSoftDeleted('legal_researches', ['id' => $research->id]);
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'research_deleted',
        ]);
    }

    public function test_admin_can_reorder_research_monographs(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $r1 = LegalResearch::create([
            'research_type' => 'article',
            'title' => ['en' => 'TEST — Research Order 1', 'bn' => 'টেস্ট — ১'],
            'slug' => 'test-order-1',
            'author' => ['en' => 'Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'Excerpt', 'bn' => 'সারসংক্ষেপ'],
            'content' => ['en' => '<p>Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'status' => 'draft',
            'visibility' => 'public',
            'sort_order' => 10,
        ]);

        $r2 = LegalResearch::create([
            'research_type' => 'article',
            'title' => ['en' => 'TEST — Research Order 2', 'bn' => 'টেস্ট — ২'],
            'slug' => 'test-order-2',
            'author' => ['en' => 'Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'Excerpt', 'bn' => 'সারসংক্ষেপ'],
            'content' => ['en' => '<p>Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'status' => 'draft',
            'visibility' => 'public',
            'sort_order' => 20,
        ]);

        $response = $this->postJson('/api/v1/admin/research/reorder', [
            'items' => [$r2->id, $r1->id],
        ]);

        $response->assertStatus(200);
        $this->assertEquals(0, $r2->fresh()->sort_order);
        $this->assertEquals(1, $r1->fresh()->sort_order);
    }

    public function test_admin_can_preview_draft_research_with_indexing_safety(): void
    {
        Sanctum::actingAs($this->editor);

        $draft = LegalResearch::create([
            'research_type' => 'constitutional_analysis',
            'title' => ['en' => 'TEST — Draft Research For Preview', 'bn' => 'টেস্ট — খসড়া গবেষণা'],
            'slug' => 'test-draft-research-for-preview',
            'author' => ['en' => 'TEST — Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'TEST — Excerpt', 'bn' => 'সারসংক্ষেপ'],
            'content' => ['en' => '<p>TEST — Draft Content Not Yet Published</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $response = $this->getJson("/api/v1/admin/research/{$draft->id}/preview");
        $response->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertJsonPath('data.is_preview', true)
            ->assertJsonPath('meta.preview_mode', true);
    }

    public function test_admin_can_download_attached_pdf(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $research = LegalResearch::create([
            'research_type' => 'research_paper',
            'title' => ['en' => 'TEST — Research Paper with PDF', 'bn' => 'টেস্ট — পিডিএফ সহ'],
            'slug' => 'test-research-paper-with-pdf',
            'author' => ['en' => 'Author', 'bn' => 'লেখক'],
            'excerpt' => ['en' => 'Excerpt', 'bn' => 'সারসংক্ষেপ'],
            'content' => ['en' => '<p>Content</p>', 'bn' => '<p>বিষয়বস্তু</p>'],
            'pdf_media_id' => $this->dummyPdf->id,
            'status' => 'draft',
            'visibility' => 'private',
        ]);

        $response = $this->get("/api/v1/admin/research/{$research->id}/download");
        $response->assertStatus(200)
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }
}

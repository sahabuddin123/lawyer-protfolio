<?php

namespace Tests\Feature\Publications;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Media;
use App\Models\Publication;
use App\Models\Redirect;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminPublicationTest extends TestCase
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

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin', 'email' => 'admin_pub_test@nijamuddin.com']);
        $this->superAdmin->assignRole('super_admin');

        $this->editor = User::factory()->create(['name' => 'Editor User', 'email' => 'editor_pub_test@nijamuddin.com']);
        $this->editor->assignRole('editor');

        $this->plainUser = User::factory()->create(['name' => 'Plain User', 'email' => 'plain_pub_test@nijamuddin.com']);

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Legal Monographs', 'bn' => 'টেস্ট — আইনি মনোগ্রাফ'],
            'slug' => 'test-legal-monographs',
            'type' => 'publications',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->tag = Tag::create([
            'name' => ['en' => 'TEST — Maritime Law', 'bn' => 'টেস্ট — সমুদ্র আইন'],
            'slug' => 'test-maritime-law',
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('test-publication.pdf', 300, 'application/pdf');
        $storedPath = $file->store('documents/publications', 'public');

        $this->dummyPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/publications',
            'filename' => basename($storedPath),
            'original_name' => 'test-publication.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 307200,
            'uploaded_by' => $this->superAdmin->id,
        ]);
    }

    public function test_unauthenticated_admin_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/publications');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        Sanctum::actingAs($this->plainUser);

        $response = $this->getJson('/api/v1/admin/publications');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_publications_with_filters(): void
    {
        Sanctum::actingAs($this->editor);

        Publication::create([
            'title' => ['en' => 'TEST — Admiralty Law In Practice', 'bn' => 'টেস্ট — অ্যাডমিরালটি আইনের প্রয়োগ'],
            'slug' => 'test-admiralty-law-in-practice',
            'publication_type' => 'book',
            'publication_name' => ['en' => 'Law Press Dhaka', 'bn' => 'ল প্রেস ঢাকা'],
            'publication_date' => '2025-01-15',
            'author' => ['en' => 'TEST — Author Nijam', 'bn' => 'টেস্ট — লেখক নিজাম'],
            'category_id' => $this->category->id,
            'status' => 'published',
            'visibility' => 'public',
            'sort_order' => 1,
        ]);

        Publication::create([
            'title' => ['en' => 'TEST — Draft Journal Article', 'bn' => 'টেস্ট — খসড়া জার্নাল প্রবন্ধ'],
            'slug' => 'test-draft-journal-article',
            'publication_type' => 'journal_article',
            'status' => 'draft',
            'visibility' => 'private',
            'sort_order' => 2,
        ]);

        $res = $this->getJson('/api/v1/admin/publications?type=book');
        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $res->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('test-admiralty-law-in-practice', $data[0]['slug']);

        $resDraft = $this->getJson('/api/v1/admin/publications?status=draft');
        $resDraft->assertStatus(200);
        $draftData = $resDraft->json('data');
        $this->assertCount(1, $draftData);
        $this->assertEquals('test-draft-journal-article', $draftData[0]['slug']);
    }

    public function test_admin_can_create_publication(): void
    {
        Sanctum::actingAs($this->editor);

        $payload = [
            'title' => [
                'en' => 'TEST — International Commercial Arbitration Monograph',
                'bn' => 'টেস্ট — আন্তর্জাতিক বাণিজ্যিক সালিশি মনোগ্রাফ',
            ],
            'slug' => 'test-intl-commercial-arbitration-monograph',
            'publication_type' => 'journal_article',
            'category_id' => $this->category->id,
            'publication_name' => [
                'en' => 'Dhaka Law Journal',
                'bn' => 'ঢাকা ল জার্নাল',
            ],
            'publication_date' => '2024-11-20',
            'author' => [
                'en' => 'TEST — Advocate Nijam Uddin',
                'bn' => 'টেস্ট — অ্যাডভোকেট নিজাম উদ্দিন',
            ],
            'excerpt' => [
                'en' => 'A doctrinal analysis of enforcement under the Arbitration Act 2001.',
                'bn' => 'সালিশি আইন ২০০১ এর অধীনে কার্যকারিতার তাত্ত্বিক বিশ্লেষণ।',
            ],
            'content' => [
                'en' => '<p>Detailed treatise on international commercial arbitration awards in Bangladesh.</p>',
                'bn' => '<p>বাংলাদেশে আন্তর্জাতিক বাণিজ্যিক সালিশি রোয়েদাদের ওপর বিস্তারিত আলোচনা।</p>',
            ],
            'external_url' => 'https://example.com/publications/arbitration-monograph',
            'pdf_media_id' => $this->dummyPdf->id,
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 5,
            'tags' => [$this->tag->id],
            'seo' => [
                'seo_title' => ['en' => 'Arbitration Monograph Review', 'bn' => 'সালিশি মনোগ্রাফ পর্যালোচনা'],
                'meta_description' => ['en' => 'Doctrinal study on arbitration enforcement.', 'bn' => 'সালিশি বাস্তবায়ন বিষয়ক আলোচনা।'],
                'canonical_url' => 'https://nijamuddin.com/publications/test-intl-commercial-arbitration-monograph',
            ],
        ];

        $res = $this->postJson('/api/v1/admin/publications', $payload);
        $res->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-intl-commercial-arbitration-monograph')
            ->assertJsonPath('data.publication_type', 'journal_article')
            ->assertJsonPath('data.is_featured', true);

        $this->assertDatabaseHas('publications', [
            'slug' => 'test-intl-commercial-arbitration-monograph',
            'status' => 'published',
            'visibility' => 'public',
            'pdf_media_id' => $this->dummyPdf->id,
        ]);

        $created = Publication::where('slug', 'test-intl-commercial-arbitration-monograph')->first();
        $this->assertNotNull($created);
        $this->assertCount(1, $created->tags);
        $this->assertNotNull($created->seo);

        // Verify audit log
        $this->assertTrue(
            ActivityLog::where('action', 'publication_created')->where('subject_id', $created->id)->exists()
        );
        $this->assertTrue(
            ActivityLog::where('action', 'publication_published')->where('subject_id', $created->id)->exists()
        );
    }

    public function test_slug_uniqueness_is_enforced(): void
    {
        Sanctum::actingAs($this->editor);

        Publication::create([
            'title' => ['en' => 'TEST — First Publication', 'bn' => 'টেস্ট — প্রথম প্রকাশনা'],
            'slug' => 'test-duplicate-pub-slug',
            'publication_type' => 'article',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $payload = [
            'title' => ['en' => 'TEST — Second Publication', 'bn' => 'টেস্ট — দ্বিতীয় প্রকাশনা'],
            'slug' => 'test-duplicate-pub-slug',
            'publication_type' => 'article',
            'status' => 'draft',
            'visibility' => 'public',
        ];

        $res = $this->postJson('/api/v1/admin/publications', $payload);
        $res->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_published_slug_change_creates_301_redirect(): void
    {
        Sanctum::actingAs($this->editor);

        $publication = Publication::create([
            'title' => ['en' => 'TEST — Original Title', 'bn' => 'টেস্ট — মূল শিরোনাম'],
            'slug' => 'test-original-pub-slug',
            'publication_type' => 'article',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $payload = [
            'title' => ['en' => 'TEST — Updated Title', 'bn' => 'টেস্ট — পরিবর্তিত শিরোনাম'],
            'slug' => 'test-updated-pub-slug',
            'publication_type' => 'article',
            'status' => 'published',
            'visibility' => 'public',
        ];

        $res = $this->putJson("/api/v1/admin/publications/{$publication->id}", $payload);
        $res->assertStatus(200)
            ->assertJsonPath('data.slug', 'test-updated-pub-slug');

        $this->assertDatabaseHas('redirects', [
            'source_url' => '/publications/test-original-pub-slug',
            'target_url' => '/publications/test-updated-pub-slug',
            'status_code' => 301,
        ]);
    }

    public function test_admin_can_soft_delete_publication(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $publication = Publication::create([
            'title' => ['en' => 'TEST — To Be Deleted', 'bn' => 'টেস্ট — মুছে ফেলার জন্য'],
            'slug' => 'test-to-be-deleted-pub',
            'publication_type' => 'article',
            'status' => 'draft',
            'visibility' => 'private',
        ]);

        $res = $this->deleteJson("/api/v1/admin/publications/{$publication->id}");
        $res->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('publications', ['id' => $publication->id]);
        $this->assertTrue(
            ActivityLog::where('action', 'publication_deleted')->where('subject_id', $publication->id)->exists()
        );
    }

    public function test_admin_can_reorder_publications(): void
    {
        Sanctum::actingAs($this->editor);

        $p1 = Publication::create([
            'title' => ['en' => 'TEST — Pub A', 'bn' => 'টেস্ট — প্রকাশনা ক'],
            'slug' => 'test-pub-a',
            'publication_type' => 'article',
            'status' => 'published',
            'visibility' => 'public',
            'sort_order' => 1,
        ]);

        $p2 = Publication::create([
            'title' => ['en' => 'TEST — Pub B', 'bn' => 'টেস্ট — প্রকাশনা খ'],
            'slug' => 'test-pub-b',
            'publication_type' => 'article',
            'status' => 'published',
            'visibility' => 'public',
            'sort_order' => 2,
        ]);

        $res = $this->postJson('/api/v1/admin/publications/reorder', [
            'items' => [$p2->id, $p1->id],
        ]);

        $res->assertStatus(200)->assertJsonPath('success', true);

        $this->assertEquals(0, $p2->fresh()->sort_order);
        $this->assertEquals(1, $p1->fresh()->sort_order);
    }

    public function test_admin_can_preview_draft_publication_with_indexing_safety(): void
    {
        Sanctum::actingAs($this->editor);

        $draft = Publication::create([
            'title' => ['en' => 'TEST — Draft Monograph', 'bn' => 'টেস্ট — খসড়া মনোগ্রাফ'],
            'slug' => 'test-draft-monograph',
            'publication_type' => 'research_paper',
            'status' => 'draft',
            'visibility' => 'private',
            'excerpt' => ['en' => 'Private excerpt.', 'bn' => 'ব্যক্তিগত সারসংক্ষেপ।'],
        ]);

        $res = $this->getJson("/api/v1/admin/publications/{$draft->id}/preview");
        $res->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-draft-monograph');
    }

    public function test_admin_can_download_attached_pdf(): void
    {
        Sanctum::actingAs($this->editor);

        $pub = Publication::create([
            'title' => ['en' => 'TEST — With PDF', 'bn' => 'টেস্ট — পিডিএফ সহ'],
            'slug' => 'test-with-pdf-pub',
            'publication_type' => 'article',
            'pdf_media_id' => $this->dummyPdf->id,
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $res = $this->get("/api/v1/admin/publications/{$pub->id}/download");
        $res->assertStatus(200)
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_invalid_external_url_is_rejected(): void
    {
        Sanctum::actingAs($this->editor);

        $payload = [
            'title' => ['en' => 'TEST — XSS Attack URL', 'bn' => 'টেস্ট — ক্ষতিকর ইউআরএল'],
            'slug' => 'test-xss-attack-url',
            'publication_type' => 'article',
            'external_url' => 'javascript:alert(1)',
            'status' => 'draft',
            'visibility' => 'public',
        ];

        $res = $this->postJson('/api/v1/admin/publications', $payload);
        $res->assertStatus(422)
            ->assertJsonValidationErrors(['external_url']);
    }
}

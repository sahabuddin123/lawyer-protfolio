<?php

namespace Tests\Feature\Judgments;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\JudgmentReview;
use App\Models\LegalResearch;
use App\Models\Media;
use App\Models\PracticeArea;
use App\Models\Redirect;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminJudgmentReviewTest extends TestCase
{
    use DatabaseTransactions;

    protected User $superAdmin;
    protected User $editor;
    protected User $plainUser;
    protected Category $category;
    protected PracticeArea $practiceArea;
    protected LegalResearch $legalResearch;
    protected Tag $tag;
    protected Media $dummyPdf;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->superAdmin = User::factory()->create(['name' => 'Super Admin', 'email' => 'admin_judgment_test@nijamuddin.com']);
        $this->superAdmin->assignRole('super_admin');

        $this->editor = User::factory()->create(['name' => 'Editor User', 'email' => 'editor_judgment_test@nijamuddin.com']);
        $this->editor->assignRole('editor');

        $this->plainUser = User::factory()->create(['name' => 'Plain User', 'email' => 'plain_judgment_test@nijamuddin.com']);

        $this->category = Category::create([
            'name' => ['en' => 'TEST — Landmark Constitutional', 'bn' => 'টেস্ট — যুগান্তকারী সাংবিধানিক'],
            'slug' => 'test-landmark-constitutional',
            'type' => 'judgments',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->practiceArea = PracticeArea::create([
            'title' => ['en' => 'TEST — Constitutional Practice', 'bn' => 'টেস্ট — সাংবিধানিক প্র্যাকটিস'],
            'slug' => 'test-constitutional-practice',
            'short_description' => ['en' => 'TEST — Description', 'bn' => 'টেস্ট — বিবরণ'],
            'full_description' => ['en' => '<p>TEST — Full description</p>', 'bn' => '<p>টেস্ট — বিস্তারিত বিবরণ</p>'],
            'icon_name' => 'scale',
            'status' => 'published',
        ]);

        $this->legalResearch = LegalResearch::create([
            'research_type' => 'constitutional_analysis',
            'title' => ['en' => 'TEST — Referenced Research Paper', 'bn' => 'টেস্ট — সম্পর্কিত গবেষণা'],
            'slug' => 'test-referenced-research-paper',
            'author' => ['en' => 'Advocate Test', 'bn' => 'অ্যাডভোকেট টেস্ট'],
            'excerpt' => ['en' => 'TEST — Excerpt', 'bn' => 'টেস্ট — সারসংক্ষেপ'],
            'content' => ['en' => '<p>TEST — Content</p>', 'bn' => '<p>টেস্ট — বিষয়বস্তু</p>'],
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $this->tag = Tag::create([
            'name' => ['en' => 'TEST — Judicial Review', 'bn' => 'টেস্ট — বিচারিক পর্যালোচনা'],
            'slug' => 'test-judicial-review',
        ]);

        Storage::fake('public');
        $file = UploadedFile::fake()->create('test-judgment.pdf', 250, 'application/pdf');
        $storedPath = $file->store('documents/judgments', 'public');

        $this->dummyPdf = Media::create([
            'disk' => 'public',
            'directory' => 'documents/judgments',
            'filename' => basename($storedPath),
            'original_name' => 'test-judgment.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size_bytes' => 256000,
            'uploaded_by' => $this->superAdmin->id,
        ]);
    }

    public function test_unauthenticated_admin_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/judgments');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        Sanctum::actingAs($this->plainUser);

        $response = $this->getJson('/api/v1/admin/judgments');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_judgment_reviews_with_filters(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $item = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — State v. Test Corp', 'bn' => 'টেস্ট — রাষ্ট্র বনাম টেস্ট কর্প'],
            'citation' => 'TEST 78 DLR (AD) 100',
            'slug' => 'test-state-v-test-corp',
            'court' => 'Supreme Court of Bangladesh (Appellate Division)',
            'judgment_date' => '2024-05-15',
            'legal_area' => ['en' => 'Constitutional Law', 'bn' => 'সাংবিধানিক আইন'],
            'summary' => ['en' => 'TEST — Summary A', 'bn' => 'টেস্ট — সারসংক্ষেপ এ'],
            'key_issues' => ['en' => 'TEST — Issue A', 'bn' => 'টেস্ট — বিচার্য বিষয় এ'],
            'court_decision' => ['en' => 'TEST — Court Decision A', 'bn' => 'টেস্ট — আদালতের সিদ্ধান্ত এ'],
            'author_analysis' => ['en' => 'TEST — Author Analysis A', 'bn' => 'টেস্ট — লেখকের বিশ্লেষণ এ'],
            'practical_significance' => ['en' => 'TEST — Significance A', 'bn' => 'টেস্ট — তাৎপর্য এ'],
            'practice_area_id' => $this->practiceArea->id,
            'category_id' => $this->category->id,
            'visibility' => 'public',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 1,
            'published_at' => now(),
        ]);
        $item->tags()->attach($this->tag->id);

        $response = $this->getJson('/api/v1/admin/judgments?court=Supreme Court&status=published&practice_area_id=' . $this->practiceArea->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.slug', 'test-state-v-test-corp')
            ->assertJsonPath('data.0.citation', 'TEST 78 DLR (AD) 100');
    }

    public function test_admin_can_create_judgment_review(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'case_name' => [
                'en' => 'TEST — Advocate Test v. Ministry of Law',
                'bn' => 'টেস্ট — অ্যাডভোকেট টেস্ট বনাম আইন মন্ত্রণালয়',
            ],
            'slug' => 'test-advocate-test-v-ministry-of-law',
            'citation' => 'TEST 80 DLR (HCD) 220',
            'court' => 'High Court Division',
            'judgment_date' => '2024-08-20',
            'legal_area' => [
                'en' => 'Administrative Law',
                'bn' => 'প্রশাসনিক আইন',
            ],
            'summary' => [
                'en' => '<p>TEST — Executive discretion challenged under Article 102.</p>',
                'bn' => '<p>টেস্ট — ১০২ অনুচ্ছেদে নির্বাহী ক্ষমতা চ্যালেঞ্জ।</p>',
            ],
            'key_issues' => [
                'en' => '<p>Scope of legitimate expectation.</p>',
                'bn' => '<p>ন্যায়সঙ্গত প্রত্যাশার পরিধি।</p>',
            ],
            'court_decision' => [
                'en' => '<p>Rule made absolute; arbitrary administrative action declared void.</p>',
                'bn' => '<p>রুল চূড়ান্ত করা হলো; স্বেচ্ছাচারী সিদ্ধান্ত বাতিল ঘোষণা করা হলো।</p>',
            ],
            'author_analysis' => [
                'en' => '<p>The High Court reinforced procedural fairness doctrines.</p>',
                'bn' => '<p>হাইকোর্ট কার্যপ্রণালীগত ন্যায্যতার নীতিসমূহ পুনর্ব্যক্ত করেছেন।</p>',
            ],
            'practical_significance' => [
                'en' => '<p>Standard reference for statutory tribunals.</p>',
                'bn' => '<p>সংবিধিবদ্ধ ট্রাইব্যুনালের জন্য মানদণ্ড।</p>',
            ],
            'practice_area_id' => $this->practiceArea->id,
            'category_id' => $this->category->id,
            'legal_research_id' => $this->legalResearch->id,
            'author' => [
                'en' => 'Advocate Nijam Uddin',
                'bn' => 'অ্যাডভোকেট নিজাম উদ্দিন',
            ],
            'pdf_media_id' => $this->dummyPdf->id,
            'tags' => [$this->tag->id],
            'visibility' => 'public',
            'status' => 'published',
            'is_featured' => true,
            'sort_order' => 2,
            'seo' => [
                'seo_title' => ['en' => 'TEST Review Title SEO', 'bn' => 'টেস্ট রিভিউ এসইও'],
                'meta_description' => ['en' => 'TEST Meta description', 'bn' => 'টেস্ট মেটা বিবরণ'],
            ],
        ];

        $response = $this->postJson('/api/v1/admin/judgments', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'test-advocate-test-v-ministry-of-law')
            ->assertJsonPath('data.citation', 'TEST 80 DLR (HCD) 220')
            ->assertJsonPath('data.court', 'High Court Division')
            ->assertJsonPath('data.practice_area_id', $this->practiceArea->id)
            ->assertJsonPath('data.legal_research_id', $this->legalResearch->id);

        $this->assertDatabaseHas('judgment_reviews', [
            'slug' => 'test-advocate-test-v-ministry-of-law',
            'citation' => 'TEST 80 DLR (HCD) 220',
            'status' => 'published',
            'visibility' => 'public',
            'practice_area_id' => $this->practiceArea->id,
            'legal_research_id' => $this->legalResearch->id,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'judgment_review_created',
        ]);
    }

    public function test_slug_uniqueness_is_enforced(): void
    {
        Sanctum::actingAs($this->superAdmin);

        JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Original Case', 'bn' => 'টেস্ট — আসল মামলা'],
            'citation' => 'TEST 50 DLR 10',
            'slug' => 'test-original-case-slug',
            'court' => 'Supreme Court of Bangladesh',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $payload = [
            'case_name' => ['en' => 'TEST — Duplicate Case', 'bn' => 'টেস্ট — ডুপ্লিকেট মামলা'],
            'slug' => 'test-original-case-slug', // duplicate slug
            'citation' => 'TEST 50 DLR 20',
            'court' => 'Appellate Division',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'draft',
            'visibility' => 'public',
        ];

        $response = $this->postJson('/api/v1/admin/judgments', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_published_slug_change_creates_301_redirect(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $item = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Case Before Rename', 'bn' => 'টেস্ট — পূর্বে নাম'],
            'citation' => 'TEST 60 DLR 15',
            'slug' => 'test-case-before-rename',
            'court' => 'High Court Division',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now(),
        ]);

        $updatePayload = [
            'case_name' => ['en' => 'TEST — Case After Rename', 'bn' => 'টেস্ট — পরবর্তীতে নাম'],
            'citation' => 'TEST 60 DLR 15',
            'slug' => 'test-case-after-rename',
            'court' => 'High Court Division',
            'summary' => ['en' => 'Updated Summary', 'bn' => 'আপডেট সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'published',
            'visibility' => 'public',
        ];

        $response = $this->putJson("/api/v1/admin/judgments/{$item->id}", $updatePayload);

        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'test-case-after-rename');

        $this->assertDatabaseHas('redirects', [
            'source_url' => '/judgments/test-case-before-rename',
            'target_url' => '/judgments/test-case-after-rename',
            'status_code' => 301,
        ]);
    }

    public function test_admin_can_soft_delete_judgment_review(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $item = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Case to Delete', 'bn' => 'টেস্ট — মুছতে হবে'],
            'citation' => 'TEST 45 DLR 8',
            'slug' => 'test-case-to-delete',
            'court' => 'District Court',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $response = $this->deleteJson("/api/v1/admin/judgments/{$item->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('judgment_reviews', ['id' => $item->id]);
    }

    public function test_admin_can_reorder_judgment_reviews(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $itemA = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Case Order A', 'bn' => 'টেস্ট — এ'],
            'citation' => 'TEST 70 DLR 1',
            'slug' => 'test-case-order-a',
            'court' => 'Supreme Court',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'draft',
            'visibility' => 'public',
            'sort_order' => 10,
        ]);

        $itemB = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Case Order B', 'bn' => 'টেস্ট — বি'],
            'citation' => 'TEST 70 DLR 2',
            'slug' => 'test-case-order-b',
            'court' => 'Supreme Court',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'status' => 'draft',
            'visibility' => 'public',
            'sort_order' => 20,
        ]);

        $response = $this->postJson('/api/v1/admin/judgments/reorder', [
            'items' => [$itemB->id, $itemA->id],
        ]);

        $response->assertStatus(200);

        $this->assertEquals(0, $itemB->fresh()->sort_order);
        $this->assertEquals(1, $itemA->fresh()->sort_order);
    }

    public function test_admin_can_preview_draft_judgment_review_with_indexing_safety(): void
    {
        Sanctum::actingAs($this->editor);

        $draft = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — Secret Draft Review', 'bn' => 'টেস্ট — খসড়া রিভিউ'],
            'citation' => 'TEST 99 DLR (AD) 1',
            'slug' => 'test-secret-draft-review',
            'court' => 'Appellate Division',
            'summary' => ['en' => 'Draft Summary', 'bn' => 'খসড়া সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Draft Decision', 'bn' => 'খসড়া সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Draft Analysis', 'bn' => 'খসড়া বিশ্লেষণ'],
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $response = $this->getJson("/api/v1/admin/judgments/{$draft->id}/preview");

        $response->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
            ->assertJsonPath('data.is_preview', true)
            ->assertJsonPath('data.slug', 'test-secret-draft-review');
    }

    public function test_admin_can_download_attached_pdf(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $item = JudgmentReview::create([
            'case_name' => ['en' => 'TEST — PDF Judgment Case', 'bn' => 'টেস্ট — পিডিএফ মামলা'],
            'citation' => 'TEST 82 DLR 50',
            'slug' => 'test-pdf-judgment-case',
            'court' => 'High Court Division',
            'summary' => ['en' => 'Summary', 'bn' => 'সারসংক্ষেপ'],
            'court_decision' => ['en' => 'Decision', 'bn' => 'সিদ্ধান্ত'],
            'author_analysis' => ['en' => 'Analysis', 'bn' => 'বিশ্লেষণ'],
            'pdf_media_id' => $this->dummyPdf->id,
            'status' => 'draft',
            'visibility' => 'private',
        ]);

        $response = $this->get("/api/v1/admin/judgments/{$item->id}/download");

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }
}

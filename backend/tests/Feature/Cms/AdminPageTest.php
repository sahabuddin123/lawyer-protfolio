<?php

namespace Tests\Feature\Cms;

use App\Models\ActivityLog;
use App\Models\Page;
use App\Models\Redirect;
use App\Models\User;
use App\Services\CmsCacheService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminPageTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        CmsCacheService::flushAll();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_page@nijamuddin.com',
            'password' => bcrypt('Password123!#'),
            'is_active' => true,
        ]);
        $this->admin->assignRole('admin');
    }

    public function test_admin_can_create_page_with_seo(): void
    {
        $payload = [
            'title' => ['en' => 'Arbitration Services', 'bn' => 'সালিশি সেবা'],
            'slug' => 'arbitration-services',
            'content' => ['en' => '<p>Arbitration and mediation procedures.</p>', 'bn' => '<p>সালিশি প্রক্রিয়া।</p>'],
            'status' => 'published',
            'seo' => [
                'seo_title' => ['en' => 'Arbitration Services | Advocate Nijam Uddin', 'bn' => 'সালিশি সেবা'],
                'meta_description' => ['en' => 'Commercial arbitration briefing.', 'bn' => 'বাণিজ্যিক সালিশি।'],
                'canonical_url' => 'https://nijamuddin.com/arbitration-services',
                'robots' => 'index, follow',
            ],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/pages', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'slug' => 'arbitration-services',
                    'status' => 'published',
                ],
            ]);

        $this->assertDatabaseHas('pages', ['slug' => 'arbitration-services']);
        $this->assertDatabaseHas('seo_meta', ['canonical_url' => 'https://nijamuddin.com/arbitration-services']);

        // Verify audit log
        $log = ActivityLog::where('action', 'page_created')->latest()->first();
        $this->assertNotNull($log);
        $this->assertEquals($this->admin->id, $log->user_id);
    }

    public function test_admin_page_content_is_sanitized_against_xss(): void
    {
        $payload = [
            'title' => ['en' => 'XSS Test Page', 'bn' => 'নিরাপত্তা পরীক্ষা'],
            'slug' => 'xss-test-page',
            'content' => [
                'en' => '<p>Valid text</p><script>alert("hacked")</script><img src="x" onerror="alert(1)">',
                'bn' => '<p>বৈধ টেক্সট</p><iframe src="evil.com"></iframe>',
            ],
            'status' => 'draft',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/pages', $payload);
        $response->assertStatus(201);

        $page = Page::where('slug', 'xss-test-page')->first();
        $this->assertStringNotContainsString('<script>', $page->content['en']);
        $this->assertStringNotContainsString('onerror', $page->content['en']);
        $this->assertStringNotContainsString('<iframe', $page->content['bn']);
        $this->assertStringContainsString('<p>Valid text</p>', $page->content['en']);
    }

    public function test_slug_uniqueness_is_enforced(): void
    {
        Page::create([
            'title' => ['en' => 'Existing', 'bn' => 'বিদ্যমান'],
            'slug' => 'existing-unique-slug',
            'content' => ['en' => 'Content', 'bn' => 'বিষয়বস্তু'],
            'status' => 'draft',
        ]);

        $payload = [
            'title' => ['en' => 'Duplicate Slug', 'bn' => 'নকল স্ল্যাগ'],
            'slug' => 'existing-unique-slug',
            'content' => ['en' => 'Content', 'bn' => 'বিষয়বস্তু'],
            'status' => 'draft',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/pages', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_published_slug_change_automatically_creates_301_redirect(): void
    {
        $page = Page::create([
            'title' => ['en' => 'Original Page', 'bn' => 'মূল পেজ'],
            'slug' => 'original-slug',
            'content' => ['en' => 'Original text', 'bn' => 'মূল লেখা'],
            'status' => 'published',
            'published_at' => now(),
        ]);

        $updatePayload = [
            'title' => ['en' => 'Original Page Renamed', 'bn' => 'পুনঃনামকরণকৃত পেজ'],
            'slug' => 'updated-new-slug',
            'content' => ['en' => 'Original text', 'bn' => 'মূল লেখা'],
            'status' => 'published',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/admin/pages/{$page->id}", $updatePayload);
        $response->assertStatus(200);

        // Verify redirect auto-created
        $redirect = Redirect::where('source_url', '/original-slug')->first();
        $this->assertNotNull($redirect);
        $this->assertEquals('/updated-new-slug', $redirect->target_url);
        $this->assertEquals(301, $redirect->status_code);
    }
}

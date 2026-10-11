<?php

namespace Tests\Feature\Videos;

use App\Models\Category;
use App\Models\Redirect;
use App\Models\Tag;
use App\Models\User;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminVideoTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::findOrCreate('manage_videos', 'web');
        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->givePermissionTo('manage_videos');

        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole($adminRole);

        $this->unauthorizedUser = User::factory()->create();
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/videos');
        $response->assertStatus(401);
    }

    public function test_user_without_permission_receives_403(): void
    {
        $response = $this->actingAs($this->unauthorizedUser)->getJson('/api/v1/admin/videos');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_videos_with_filters(): void
    {
        Video::create([
            'title' => ['en' => 'TEST — YouTube Lecture', 'bn' => 'টেস্ট — ইউটিউব বক্তব্য'],
            'slug' => 'test-youtube-lecture',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        Video::create([
            'title' => ['en' => 'TEST — Vimeo Seminar', 'bn' => 'টেস্ট — ভিমিও সেমিনার'],
            'slug' => 'test-vimeo-seminar',
            'platform' => 'vimeo',
            'video_url' => 'https://vimeo.com/123456789',
            'video_id' => '123456789',
            'status' => 'draft',
            'visibility' => 'private',
        ]);

        $response = $this->actingAs($this->adminUser)->getJson('/api/v1/admin/videos');
        $response->assertStatus(200);
        $response->assertJsonPath('meta.total', 2);

        // Filter by platform
        $filterResponse = $this->actingAs($this->adminUser)->getJson('/api/v1/admin/videos?platform=youtube');
        $filterResponse->assertStatus(200);
        $filterResponse->assertJsonPath('meta.total', 1);
        $filterResponse->assertJsonPath('data.0.slug', 'test-youtube-lecture');
    }

    public function test_admin_can_create_youtube_video_with_auto_id_extraction(): void
    {
        $category = Category::create([
            'name' => ['en' => 'TEST — Constitutional Debates', 'bn' => 'সাংবিধানিক বিতর্ক'],
            'slug' => 'test-constitutional-debates',
            'type' => 'video',
        ]);

        $payload = [
            'title' => [
                'en' => 'TEST — Supreme Court Constitutional Bench Proceedings',
                'bn' => 'টেস্ট — সুপ্রিম কোর্ট সাংবিধানিক বেঞ্চ কার্যক্রম',
            ],
            'slug' => 'test-sc-constitutional-bench',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'category_id' => $category->id,
            'duration' => '45:30',
            'description' => [
                'en' => 'Detailed analysis of high court constitutional division arguments.<script>alert(1)</script>',
                'bn' => 'হাইকোর্ট সাংবিধানিক বিভাগের যুক্তির বিশদ বিশ্লেষণ।',
            ],
            'published_date' => '2026-05-10',
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
        ];

        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/admin/videos', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.platform', 'youtube');
        $response->assertJsonPath('data.video_id', 'dQw4w9WgXcQ');
        $response->assertJsonPath('data.embed_url', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');

        $this->assertDatabaseHas('videos', [
            'slug' => 'test-sc-constitutional-bench',
            'platform' => 'youtube',
            'video_id' => 'dQw4w9WgXcQ',
            'is_featured' => 1,
        ]);

        // Verify XSS sanitized
        $video = Video::where('slug', 'test-sc-constitutional-bench')->first();
        $this->assertStringNotContainsString('<script>', $video->description['en']);
    }

    public function test_admin_can_create_vimeo_video(): void
    {
        $payload = [
            'title' => [
                'en' => 'TEST — Judicial Ethics Lecture on Vimeo',
                'bn' => 'টেস্ট — বিচার বিভাগীয় নীতিশাস্ত্র বক্তৃতা',
            ],
            'video_url' => 'https://vimeo.com/987654321',
            'platform' => 'vimeo',
            'status' => 'draft',
            'visibility' => 'private',
        ];

        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/admin/videos', $payload);
        $response->assertStatus(201);
        $response->assertJsonPath('data.platform', 'vimeo');
        $response->assertJsonPath('data.video_id', '987654321');
        $response->assertJsonPath('data.embed_url', 'https://player.vimeo.com/video/987654321');
    }

    public function test_unsafe_and_invalid_urls_are_rejected(): void
    {
        // 1. Javascript protocol
        $badResponse1 = $this->actingAs($this->adminUser)->postJson('/api/v1/admin/videos', [
            'title' => ['en' => 'TEST Bad URL', 'bn' => 'টেস্ট'],
            'video_url' => 'javascript:alert(document.cookie)',
            'status' => 'draft',
            'visibility' => 'public',
        ]);
        $badResponse1->assertStatus(422);

        // 2. Localhost address
        $badResponse2 = $this->actingAs($this->adminUser)->postJson('/api/v1/admin/videos', [
            'title' => ['en' => 'TEST Localhost', 'bn' => 'টেস্ট'],
            'video_url' => 'http://localhost:8000/test.mp4',
            'status' => 'draft',
            'visibility' => 'public',
        ]);
        $badResponse2->assertStatus(422);

        // 3. Platform mismatch (claiming Vimeo but sending Youtube)
        $badResponse3 = $this->actingAs($this->adminUser)->postJson('/api/v1/admin/videos', [
            'title' => ['en' => 'TEST Mismatch', 'bn' => 'টেস্ট'],
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'platform' => 'vimeo',
            'status' => 'draft',
            'visibility' => 'public',
        ]);
        $badResponse3->assertStatus(422);
    }

    public function test_admin_can_update_video_and_slug_change_creates_redirect(): void
    {
        $video = Video::create([
            'title' => ['en' => 'TEST — Original Title', 'bn' => 'মূল শিরোনাম'],
            'slug' => 'test-original-video-slug',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $updatePayload = [
            'title' => ['en' => 'TEST — Updated Title', 'bn' => 'হালনাগাদ শিরোনাম'],
            'slug' => 'test-updated-video-slug',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'public',
        ];

        $response = $this->actingAs($this->adminUser)->putJson("/api/v1/admin/videos/{$video->id}", $updatePayload);
        $response->assertStatus(200);

        $this->assertDatabaseHas('videos', [
            'id' => $video->id,
            'slug' => 'test-updated-video-slug',
        ]);

        $this->assertDatabaseHas('redirects', [
            'source_url' => '/videos/test-original-video-slug',
            'target_url' => '/videos/test-updated-video-slug',
            'status_code' => 301,
        ]);
    }

    public function test_admin_preview_endpoint_returns_noindex_header(): void
    {
        $draft = Video::create([
            'title' => ['en' => 'TEST — Draft Video', 'bn' => 'খসড়া ভিডিও'],
            'slug' => 'test-draft-video-preview',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'draft',
            'visibility' => 'private',
        ]);

        $response = $this->actingAs($this->adminUser)->getJson("/api/v1/admin/videos/{$draft->id}/preview");
        $response->assertStatus(200);
        $response->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }

    public function test_admin_can_reorder_videos(): void
    {
        $v1 = Video::create([
            'title' => ['en' => 'TEST Video 1', 'bn' => 'ভিডিও ১'],
            'slug' => 'test-video-1',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'sort_order' => 1,
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $v2 = Video::create([
            'title' => ['en' => 'TEST Video 2', 'bn' => 'ভিডিও ২'],
            'slug' => 'test-video-2',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'sort_order' => 2,
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/admin/videos/reorder', [
            'order' => [
                ['id' => $v2->id, 'sort_order' => 0],
                ['id' => $v1->id, 'sort_order' => 1],
            ],
        ]);

        $response->assertStatus(200);

        $this->assertEquals(0, $v2->fresh()->sort_order);
        $this->assertEquals(1, $v1->fresh()->sort_order);
    }

    public function test_admin_can_delete_video(): void
    {
        $video = Video::create([
            'title' => ['en' => 'TEST Video to Delete', 'bn' => 'মুছে ফেলার ভিডিও'],
            'slug' => 'test-video-to-delete',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->adminUser)->deleteJson("/api/v1/admin/videos/{$video->id}");
        $response->assertStatus(200);

        $this->assertSoftDeleted('videos', ['id' => $video->id]);
    }
}

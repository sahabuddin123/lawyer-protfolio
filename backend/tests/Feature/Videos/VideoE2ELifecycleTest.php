<?php

namespace Tests\Feature\Videos;

use App\Models\Category;
use App\Models\Redirect;
use App\Models\User;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VideoE2ELifecycleTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::findOrCreate('manage_videos', 'web');
        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->givePermissionTo('manage_videos');

        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole($adminRole);
    }

    public function test_complete_video_lifecycle_draft_preview_publish_redirect_unpublish(): void
    {
        // 1. Admin creates draft YouTube video
        $createPayload = [
            'title' => [
                'en' => 'TEST — Landmark Constitutional Lecture',
                'bn' => 'টেস্ট — যুগান্তকারী সাংবিধানিক বক্তৃতা',
            ],
            'slug' => 'test-landmark-lecture',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'status' => 'draft',
            'visibility' => 'public',
            'duration' => '32:15',
        ];

        $createRes = $this->actingAs($this->adminUser)->postJson('/api/v1/admin/videos', $createPayload);
        $createRes->assertStatus(201);
        $createRes->assertJsonPath('data.platform', 'youtube');
        $createRes->assertJsonPath('data.video_id', 'dQw4w9WgXcQ');
        $createRes->assertJsonPath('data.embed_url', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');

        $videoId = $createRes->json('data.id');

        // 2. Verify NOT publicly visible
        $publicListRes = $this->getJson('/api/v1/videos');
        $publicListRes->assertStatus(200);
        $publicListRes->assertJsonPath('meta.pagination.total', 0);

        $publicDetailRes = $this->getJson('/api/v1/videos/test-landmark-lecture');
        $publicDetailRes->assertStatus(404);

        // 3. Admin previews draft with noindex
        $previewRes = $this->actingAs($this->adminUser)->getJson("/api/v1/admin/videos/{$videoId}/preview");
        $previewRes->assertStatus(200);
        $previewRes->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

        // 4. Admin publishes the video
        $publishPayload = array_merge($createPayload, [
            'status' => 'published',
            'is_featured' => true,
        ]);
        $publishRes = $this->actingAs($this->adminUser)->putJson("/api/v1/admin/videos/{$videoId}", $publishPayload);
        $publishRes->assertStatus(200);

        // 5. Verify now public
        $publicListRes2 = $this->getJson('/api/v1/videos');
        $publicListRes2->assertStatus(200);
        $publicListRes2->assertJsonPath('meta.pagination.total', 1);
        $publicListRes2->assertJsonPath('data.0.slug', 'test-landmark-lecture');

        $publicDetailRes2 = $this->getJson('/api/v1/videos/test-landmark-lecture');
        $publicDetailRes2->assertStatus(200);
        $publicDetailRes2->assertJsonPath('data.title', 'TEST — Landmark Constitutional Lecture');
        $publicDetailRes2->assertJsonPath('data.embed_url', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');

        // 6. Admin updates slug -> 301 redirect logged
        $updateSlugPayload = array_merge($publishPayload, [
            'slug' => 'test-landmark-lecture-renamed',
        ]);
        $updateSlugRes = $this->actingAs($this->adminUser)->putJson("/api/v1/admin/videos/{$videoId}", $updateSlugPayload);
        $updateSlugRes->assertStatus(200);

        $this->assertDatabaseHas('redirects', [
            'source_url' => '/videos/test-landmark-lecture',
            'target_url' => '/videos/test-landmark-lecture-renamed',
            'status_code' => 301,
        ]);

        $redirectRes = $this->getJson('/api/v1/videos/test-landmark-lecture');
        $redirectRes->assertStatus(301);
        $redirectRes->assertHeader('Location', '/videos/test-landmark-lecture-renamed');

        // 7. Admin unpublishes back to draft
        $unpublishPayload = array_merge($updateSlugPayload, [
            'status' => 'draft',
        ]);
        $unpublishRes = $this->actingAs($this->adminUser)->putJson("/api/v1/admin/videos/{$videoId}", $unpublishPayload);
        $unpublishRes->assertStatus(200);

        $publicDetailRes3 = $this->getJson('/api/v1/videos/test-landmark-lecture-renamed');
        $publicDetailRes3->assertStatus(404);
    }

    public function test_vimeo_video_lifecycle(): void
    {
        $vimeoPayload = [
            'title' => [
                'en' => 'TEST — Vimeo Dialogue on Admiralty Court',
                'bn' => 'টেস্ট — এডমিরালটি কোর্ট নিয়ে ভিমিও সংলাপ',
            ],
            'slug' => 'test-vimeo-dialogue',
            'video_url' => 'https://vimeo.com/123456789',
            'platform' => 'vimeo',
            'status' => 'published',
            'visibility' => 'public',
        ];

        $createRes = $this->actingAs($this->adminUser)->postJson('/api/v1/admin/videos', $vimeoPayload);
        $createRes->assertStatus(201);
        $createRes->assertJsonPath('data.platform', 'vimeo');
        $createRes->assertJsonPath('data.video_id', '123456789');
        $createRes->assertJsonPath('data.embed_url', 'https://player.vimeo.com/video/123456789');

        $publicRes = $this->getJson('/api/v1/videos/test-vimeo-dialogue');
        $publicRes->assertStatus(200);
        $publicRes->assertJsonPath('data.embed_url', 'https://player.vimeo.com/video/123456789');
    }
}

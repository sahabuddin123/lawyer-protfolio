<?php

namespace Tests\Feature\Media;

use App\Models\MediaAppearance;
use App\Models\MediaPress;
use App\Models\Redirect;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediaE2ELifecycleTest extends TestCase
{
    use DatabaseTransactions;

    protected User $mediaAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->mediaAdmin = User::factory()->create(['name' => 'Media Admin', 'email' => 'media_lifecycle_admin@nijamuddin.com']);
        $this->mediaAdmin->assignRole('super_admin');
    }

    public function test_unified_media_overview_and_slug_resolution(): void
    {
        $press = MediaPress::create([
            'title' => ['en' => 'TEST — Unified Overview Press Item', 'bn' => 'টেস্ট — সমন্বিত প্রেস আইটেম'],
            'slug' => 'test-unified-overview-press-item',
            'media_type' => 'newspaper',
            'source_name' => 'National Journal',
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        $app = MediaAppearance::create([
            'title' => ['en' => 'TEST — Unified Overview Appearance Item', 'bn' => 'টেস্ট — সমন্বিত উপস্থিতি আইটেম'],
            'slug' => 'test-unified-overview-appearance-item',
            'broadcast_type' => 'tv',
            'channel' => 'National Television',
            'program_name' => ['en' => 'Roundtable Dialogue', 'bn' => 'গোলটেবিল সংলাপ'],
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        // 1. Unified listing
        $resUnified = $this->getJson('/api/v1/media');
        $resUnified->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $resUnified->json('data');
        $this->assertArrayHasKey('featured_press', $data);
        $this->assertArrayHasKey('featured_appearances', $data);
        $this->assertArrayHasKey('latest_press', $data);
        $this->assertArrayHasKey('latest_appearances', $data);

        // 2. Direct slug lookup for press item
        $resPressSlug = $this->getJson('/api/v1/media/test-unified-overview-press-item');
        $resPressSlug->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.item_type', 'press')
            ->assertJsonPath('data.slug', 'test-unified-overview-press-item');

        // 3. Direct slug lookup for appearance item
        $resAppSlug = $this->getJson('/api/v1/media/test-unified-overview-appearance-item');
        $resAppSlug->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.item_type', 'appearance')
            ->assertJsonPath('data.slug', 'test-unified-overview-appearance-item');
    }

    public function test_complete_press_lifecycle_draft_preview_publish_redirect_unpublish(): void
    {
        Sanctum::actingAs($this->mediaAdmin);

        // Step 1: Create Press Draft
        $createPayload = [
            'title' => [
                'en' => 'TEST — Editorial on Judicial Review',
                'bn' => 'টেস্ট — বিচার বিভাগীয় পর্যালোচনা সম্পর্কিত সম্পাদকীয়',
            ],
            'slug' => 'test-editorial-judicial-review-initial',
            'media_type' => 'newspaper',
            'source_name' => 'The Financial Express',
            'status' => 'draft',
            'visibility' => 'public',
        ];

        $createRes = $this->postJson('/api/v1/admin/media/press', $createPayload);
        $createRes->assertStatus(201);
        $pressId = $createRes->json('data.id');

        // Step 2: Verify NOT visible publicly
        $publicCheck1 = $this->getJson('/api/v1/media/press/test-editorial-judicial-review-initial');
        $publicCheck1->assertStatus(404);

        // Step 3: Admin Preview works with noindex
        $previewRes = $this->getJson("/api/v1/admin/media/press/{$pressId}/preview");
        $previewRes->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');

        // Step 4: Publish
        $publishRes = $this->putJson("/api/v1/admin/media/press/{$pressId}", array_merge($createPayload, [
            'status' => 'published',
        ]));
        $publishRes->assertStatus(200);

        // Step 5: Verify publicly visible now
        $publicCheck2 = $this->getJson('/api/v1/media/press/test-editorial-judicial-review-initial');
        $publicCheck2->assertStatus(200)
            ->assertJsonPath('data.slug', 'test-editorial-judicial-review-initial');

        // Step 6: Update slug -> verify automatic 301 redirect entry
        $updateSlugRes = $this->putJson("/api/v1/admin/media/press/{$pressId}", array_merge($createPayload, [
            'slug' => 'test-editorial-judicial-review-final',
            'status' => 'published',
        ]));
        $updateSlugRes->assertStatus(200);

        $this->assertDatabaseHas('redirects', [
            'source_url' => '/media/press/test-editorial-judicial-review-initial',
            'target_url' => '/media/press/test-editorial-judicial-review-final',
            'status_code' => 301,
        ]);

        // Step 7: Verify new slug is publicly available
        $publicCheck3 = $this->getJson('/api/v1/media/press/test-editorial-judicial-review-final');
        $publicCheck3->assertStatus(200);

        // Step 8: Unpublish (back to draft) -> verify immediately hidden publicly
        $unpublishRes = $this->putJson("/api/v1/admin/media/press/{$pressId}", array_merge($createPayload, [
            'slug' => 'test-editorial-judicial-review-final',
            'status' => 'draft',
        ]));
        $unpublishRes->assertStatus(200);

        $publicCheck4 = $this->getJson('/api/v1/media/press/test-editorial-judicial-review-final');
        $publicCheck4->assertStatus(404);
    }

    public function test_complete_appearance_lifecycle_draft_publish_delete(): void
    {
        Sanctum::actingAs($this->mediaAdmin);

        // Step 1: Create Appearance Draft
        $payload = [
            'title' => [
                'en' => 'TEST — Dialogue on Maritime Boundaries',
                'bn' => 'টেস্ট — সমুদ্রসীমা সংলাপ',
            ],
            'slug' => 'test-dialogue-maritime-boundaries',
            'broadcast_type' => 'tv',
            'channel' => 'Independent TV',
            'program_name' => [
                'en' => 'Maritime Hour',
                'bn' => 'সমুদ্র প্রহর',
            ],
            'status' => 'draft',
            'visibility' => 'public',
        ];

        $res = $this->postJson('/api/v1/admin/media/appearances', $payload);
        $res->assertStatus(201);
        $appId = $res->json('data.id');

        // Step 2: Verify hidden publicly
        $check1 = $this->getJson('/api/v1/media/appearances/test-dialogue-maritime-boundaries');
        $check1->assertStatus(404);

        // Step 3: Admin Preview works
        $preview = $this->getJson("/api/v1/admin/media/appearances/{$appId}/preview");
        $preview->assertStatus(200)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');

        // Step 4: Publish
        $this->putJson("/api/v1/admin/media/appearances/{$appId}", array_merge($payload, [
            'status' => 'published',
        ]))->assertStatus(200);

        // Step 5: Verify public
        $check2 = $this->getJson('/api/v1/media/appearances/test-dialogue-maritime-boundaries');
        $check2->assertStatus(200);

        // Step 6: Delete -> verify soft deleted and 404 publicly
        $this->deleteJson("/api/v1/admin/media/appearances/{$appId}")->assertStatus(200);

        $check3 = $this->getJson('/api/v1/media/appearances/test-dialogue-maritime-boundaries');
        $check3->assertStatus(404);
    }
}

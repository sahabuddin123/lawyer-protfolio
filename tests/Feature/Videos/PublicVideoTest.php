<?php

namespace Tests\Feature\Videos;

use App\Models\Category;
use App\Models\Redirect;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PublicVideoTest extends TestCase
{
    use DatabaseTransactions;

    public function test_public_can_list_only_published_and_public_videos(): void
    {
        // Published & Public
        Video::create([
            'title' => ['en' => 'TEST — Public Video', 'bn' => 'পাবলিক ভিডিও'],
            'slug' => 'test-public-video',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        // Draft
        Video::create([
            'title' => ['en' => 'TEST — Draft Video', 'bn' => 'খসড়া ভিডিও'],
            'slug' => 'test-draft-video',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        // Private
        Video::create([
            'title' => ['en' => 'TEST — Private Video', 'bn' => 'ব্যক্তিগত ভিডিও'],
            'slug' => 'test-private-video',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'private',
        ]);

        $response = $this->getJson('/api/v1/videos');
        $response->assertStatus(200);
        $response->assertJsonPath('meta.pagination.total', 1);
        $response->assertJsonPath('data.0.slug', 'test-public-video');
    }

    public function test_public_search_and_filters_work(): void
    {
        $cat = Category::create([
            'name' => ['en' => 'TEST Category', 'bn' => 'টেস্ট বিভাগ'],
            'slug' => 'test-cat',
            'type' => 'video',
        ]);

        Video::create([
            'title' => ['en' => 'TEST — Admiralty Law Discussion', 'bn' => 'এডমিরালটি আইন আলোচনা'],
            'slug' => 'test-admiralty-law',
            'platform' => 'youtube',
            'category_id' => $cat->id,
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => true,
        ]);

        Video::create([
            'title' => ['en' => 'TEST — Company Law Lecture', 'bn' => 'কোম্পানি আইন বক্তৃতা'],
            'slug' => 'test-company-law',
            'platform' => 'vimeo',
            'video_url' => 'https://vimeo.com/123456789',
            'video_id' => '123456789',
            'status' => 'published',
            'visibility' => 'public',
            'is_featured' => false,
        ]);

        // Search by keyword
        $searchRes = $this->getJson('/api/v1/videos?q=Admiralty');
        $searchRes->assertStatus(200);
        $searchRes->assertJsonPath('meta.pagination.total', 1);
        $searchRes->assertJsonPath('data.0.slug', 'test-admiralty-law');

        // Filter by platform
        $vimeoRes = $this->getJson('/api/v1/videos?platform=vimeo');
        $vimeoRes->assertStatus(200);
        $vimeoRes->assertJsonPath('meta.pagination.total', 1);
        $vimeoRes->assertJsonPath('data.0.slug', 'test-company-law');

        // Filter by category
        $catRes = $this->getJson('/api/v1/videos?category=test-cat');
        $catRes->assertStatus(200);
        $catRes->assertJsonPath('meta.pagination.total', 1);
        $catRes->assertJsonPath('data.0.slug', 'test-admiralty-law');
    }

    public function test_public_can_view_video_detail_by_slug_with_structured_data(): void
    {
        $video = Video::create([
            'title' => ['en' => 'TEST — Supreme Court Argument', 'bn' => 'সুপ্রিম কোর্ট যুক্তি'],
            'slug' => 'test-supreme-court-argument',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'duration' => '30:00',
            'description' => ['en' => 'Full legal argument presented.', 'bn' => 'উপস্থাপিত সম্পূর্ণ আইনি যুক্তি।'],
            'published_date' => '2026-06-01',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $response = $this->getJson("/api/v1/videos/{$video->slug}");
        $response->assertStatus(200);
        $response->assertJsonPath('data.title', 'TEST — Supreme Court Argument');
        $response->assertJsonPath('data.embed_url', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        $response->assertJsonPath('data.structured_data.@type', 'VideoObject');
        $response->assertJsonPath('data.structured_data.name', 'TEST — Supreme Court Argument');
    }

    public function test_public_cannot_view_draft_or_private_video(): void
    {
        $draft = Video::create([
            'title' => ['en' => 'TEST Draft', 'bn' => 'খসড়া'],
            'slug' => 'test-draft-hidden',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'draft',
            'visibility' => 'public',
        ]);

        $response = $this->getJson("/api/v1/videos/{$draft->slug}");
        $response->assertStatus(404);

        $private = Video::create([
            'title' => ['en' => 'TEST Private', 'bn' => 'ব্যক্তিগত'],
            'slug' => 'test-private-hidden',
            'platform' => 'youtube',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'private',
        ]);

        $privResponse = $this->getJson("/api/v1/videos/{$private->slug}");
        $privResponse->assertStatus(404);
    }

    public function test_public_detail_handles_301_redirect(): void
    {
        Redirect::create([
            'source_url' => '/videos/test-old-slug',
            'target_url' => '/videos/test-new-slug',
            'status_code' => 301,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/videos/test-old-slug');
        $response->assertStatus(301);
        $response->assertHeader('Location', '/videos/test-new-slug');
    }

    public function test_public_detail_includes_related_videos(): void
    {
        $cat = Category::create([
            'name' => ['en' => 'TEST Legal Tech', 'bn' => 'লিগ্যাল টেক'],
            'slug' => 'test-legal-tech',
            'type' => 'video',
        ]);

        $v1 = Video::create([
            'title' => ['en' => 'TEST Main Video', 'bn' => 'প্রধান ভিডিও'],
            'slug' => 'test-main-video',
            'platform' => 'youtube',
            'category_id' => $cat->id,
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $v2 = Video::create([
            'title' => ['en' => 'TEST Related Video 1', 'bn' => 'সম্পর্কিত ভিডিও ১'],
            'slug' => 'test-related-video-1',
            'platform' => 'youtube',
            'category_id' => $cat->id,
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_id' => 'dQw4w9WgXcQ',
            'status' => 'published',
            'visibility' => 'public',
        ]);

        $response = $this->getJson("/api/v1/videos/{$v1->slug}");
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data.related_videos');
        $response->assertJsonPath('data.related_videos.0.slug', 'test-related-video-1');
    }
}

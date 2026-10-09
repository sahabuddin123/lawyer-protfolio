<?php

namespace App\Http\Resources\V1;

use App\Models\Video;
use Illuminate\Http\Request;

class VideoDetailResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            return (new VideoResource($this->resource))->toArray($request);
        }

        $title = $this->resolveTranslation($this->title);
        $description = $this->resolveTranslation($this->description);
        $thumbnailUrl = $this->thumbnail?->url;
        $publishedDate = $this->published_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d'));

        // Deterministic related videos (same category or shared platform)
        $related = Video::query()
            ->where('id', '!=', $this->id)
            ->published()
            ->public()
            ->when($this->category_id, fn ($q) => $q->where('category_id', $this->category_id))
            ->when(!$this->category_id, fn ($q) => $q->where('platform', $this->platform))
            ->with(['thumbnail', 'category', 'tags'])
            ->orderByDesc('published_date')
            ->orderByDesc('created_at')
            ->take(3)
            ->get();

        // Schema.org VideoObject Structured Data
        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => 'VideoObject',
            'name' => $title,
            'description' => strip_tags($description ?? $title),
            'thumbnailUrl' => $thumbnailUrl ? [url($thumbnailUrl)] : [],
            'uploadDate' => $publishedDate ?: $this->created_at?->format('Y-m-d'),
        ];

        if ($this->embed_url) {
            $structuredData['embedUrl'] = $this->embed_url;
        }

        if ($this->video_url) {
            $structuredData['contentUrl'] = $this->video_url;
        }

        if ($this->duration) {
            $structuredData['duration'] = $this->duration;
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $title,
            'platform' => $this->platform,
            'video_url' => $this->video_url,
            'video_id' => $this->video_id,
            'embed_url' => $this->embed_url,
            'external_watch_url' => $this->video_url,
            'duration' => $this->duration,
            'description' => $description,
            'published_date' => $publishedDate,
            'date' => $publishedDate,
            'category' => $this->relationLoaded('category') && $this->category ? [
                'id' => $this->category->id,
                'name' => $this->resolveTranslation($this->category->name),
                'slug' => $this->category->slug,
            ] : null,
            'tags' => $this->relationLoaded('tags') ? $this->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $this->resolveTranslation($tag->name),
                    'slug' => $tag->slug,
                ];
            }) : [],
            'thumbnail' => $this->relationLoaded('thumbnail') && $this->thumbnail ? [
                'id' => $this->thumbnail->id,
                'url' => $this->thumbnail->url,
                'alt_text' => $this->thumbnail->alt_text,
                'variants' => $this->thumbnail->variants,
            ] : null,
            'is_featured' => (bool) $this->is_featured,
            'featured' => (bool) $this->is_featured,
            'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
            'structured_data' => $structuredData,
            'related_videos' => VideoResource::collection($related),
        ];
    }
}

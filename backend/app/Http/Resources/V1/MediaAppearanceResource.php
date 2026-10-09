<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;

class MediaAppearanceResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*api/v1/admin/*');

        if ($isAdmin) {
            return [
                'id' => $this->id,
                'slug' => $this->slug,
                'media_type' => $this->media_type,
                'broadcast_type' => $this->media_type,
                'channel' => is_array($this->channel) ? ($this->channel[app()->getLocale()] ?? $this->channel['en'] ?? $this->channel['bn'] ?? null) : $this->channel,
                'channel_translations' => $this->channel,
                'program' => is_array($this->program) ? ($this->program[app()->getLocale()] ?? $this->program['en'] ?? $this->program['bn'] ?? null) : $this->program,
                'program_name' => is_array($this->program) ? ($this->program[app()->getLocale()] ?? $this->program['en'] ?? $this->program['bn'] ?? null) : $this->program,
                'program_translations' => $this->program,
                'title' => $this->title,
                'video_url' => $this->video_url,
                'external_url' => $this->video_url,
                'broadcast_date' => $this->broadcast_date?->format('Y-m-d'),
                'appearance_date' => $this->broadcast_date?->format('Y-m-d'),
                'description' => $this->description,
                'category_id' => $this->category_id,
                'category' => $this->relationLoaded('category') && $this->category ? [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                    'type' => $this->category->type,
                ] : null,
                'tags' => $this->relationLoaded('tags') ? $this->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                    ];
                }) : [],
                'thumbnail_id' => $this->thumbnail_id,
                'thumbnail' => $this->relationLoaded('thumbnail') && $this->thumbnail ? new MediaResource($this->thumbnail) : null,
                'document_media_id' => $this->document_media_id,
                'document_media' => $this->relationLoaded('documentMedia') && $this->documentMedia ? new MediaResource($this->documentMedia) : null,
                'status' => $this->status,
                'visibility' => $this->visibility,
                'is_featured' => (bool) $this->is_featured,
                'sort_order' => (int) $this->sort_order,
                'published_at' => $this->published_at?->toIso8601String(),
                'seo' => $this->relationLoaded('seo') && $this->seo ? new SeoMetaResource($this->seo) : null,
                'created_at' => $this->created_at?->toIso8601String(),
                'updated_at' => $this->updated_at?->toIso8601String(),
            ];
        }

        // Public representation (list/card format)
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'kind' => 'appearance',
            'item_type' => 'appearance',
            'media_type' => $this->media_type,
            'broadcast_type' => $this->media_type,
            'source' => $this->resolveTranslation($this->channel),
            'channel' => $this->resolveTranslation($this->channel),
            'program' => $this->resolveTranslation($this->program),
            'program_name' => $this->resolveTranslation($this->program),
            'title' => $this->resolveTranslation($this->title),
            'date' => $this->broadcast_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'broadcast_date' => $this->broadcast_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'appearance_date' => $this->broadcast_date?->format('Y-m-d') ?: ($this->published_at?->format('Y-m-d')),
            'description' => $this->resolveTranslation($this->description),
            'video_url' => $this->video_url,
            'external_url' => $this->video_url,
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
            ] : null,
            'has_document' => !empty($this->document_media_id),
            'document_url' => !empty($this->document_media_id)
                ? url("/api/v1/media/appearances/{$this->slug}/download")
                : null,
            'is_featured' => (bool) $this->is_featured,
            'sort_order' => (int) $this->sort_order,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}

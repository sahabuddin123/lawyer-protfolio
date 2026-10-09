<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media_press', function (Blueprint $table) {
            $table->id();
            $table->json('media_name');
            $table->json('title');
            $table->string('slug', 255)->unique();
            $table->date('published_date')->index();
            $table->string('article_url', 500)->nullable();
            $table->foreignId('featured_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->json('description');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('media_appearances', function (Blueprint $table) {
            $table->id();
            $table->json('channel');
            $table->json('program');
            $table->json('title');
            $table->string('slug', 255)->unique();
            $table->string('video_url', 500);
            $table->foreignId('thumbnail_id')->nullable()->constrained('media')->nullOnDelete();
            $table->date('broadcast_date')->index();
            $table->json('description')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->string('slug', 255)->unique();
            $table->enum('platform', ['youtube', 'vimeo', 'external'])->default('youtube');
            $table->string('video_url', 500);
            $table->string('video_id', 100);
            $table->foreignId('thumbnail_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('duration', 20)->nullable();
            $table->json('description')->nullable();
            $table->date('published_date')->index();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('gallery_albums', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->string('slug', 255)->unique();
            $table->json('description')->nullable();
            $table->foreignId('cover_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->date('event_date')->nullable()->index();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('album_id')->constrained('gallery_albums')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media')->restrictOnDelete();
            $table->json('caption')->nullable();
            $table->json('alt_text')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gallery_images');
        Schema::dropIfExists('gallery_albums');
        Schema::dropIfExists('videos');
        Schema::dropIfExists('media_appearances');
        Schema::dropIfExists('media_press');
    }
};

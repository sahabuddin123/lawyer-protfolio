<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for enhancing gallery albums and images.
     */
    public function up(): void
    {
        Schema::table('gallery_albums', function (Blueprint $table) {
            if (!Schema::hasColumn('gallery_albums', 'visibility')) {
                $table->enum('visibility', ['public', 'private'])->default('public')->after('status')->index();
            }

            if (!Schema::hasColumn('gallery_albums', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('event_date')->index();
            }

            $table->index(['status', 'visibility']);
        });

        Schema::table('gallery_images', function (Blueprint $table) {
            if (!Schema::hasColumn('gallery_images', 'visibility')) {
                $table->enum('visibility', ['public', 'private'])->default('public')->after('is_featured')->index();
            }

            if (!Schema::hasColumn('gallery_images', 'metadata')) {
                $table->json('metadata')->nullable()->after('visibility');
            }

            $table->index(['album_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gallery_images', function (Blueprint $table) {
            $table->dropIndex(['gallery_images_album_id_sort_order_index']);
            if (Schema::hasColumn('gallery_images', 'metadata')) {
                $table->dropColumn('metadata');
            }
            if (Schema::hasColumn('gallery_images', 'visibility')) {
                $table->dropColumn('visibility');
            }
        });

        Schema::table('gallery_albums', function (Blueprint $table) {
            $table->dropIndex(['gallery_albums_status_visibility_index']);
            if (Schema::hasColumn('gallery_albums', 'published_at')) {
                $table->dropColumn('published_at');
            }
            if (Schema::hasColumn('gallery_albums', 'visibility')) {
                $table->dropColumn('visibility');
            }
        });
    }
};

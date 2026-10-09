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
        Schema::table('media_press', function (Blueprint $table) {
            $table->string('media_type', 50)->default('newspaper')->after('title')->index();
            $table->foreignId('category_id')->nullable()->after('media_type')->constrained('categories')->nullOnDelete();
            $table->foreignId('document_media_id')->nullable()->after('featured_image_id')->constrained('media')->nullOnDelete();
            $table->enum('visibility', ['public', 'private'])->default('public')->after('status');
            $table->integer('sort_order')->default(0)->after('is_featured')->index();
            $table->timestamp('published_at')->nullable()->after('sort_order');
            $table->date('published_date')->nullable()->change();
            $table->json('description')->nullable()->change();

            $table->index(['status', 'visibility']);
        });

        Schema::table('media_appearances', function (Blueprint $table) {
            $table->string('media_type', 50)->default('tv')->after('title')->index();
            $table->foreignId('category_id')->nullable()->after('media_type')->constrained('categories')->nullOnDelete();
            $table->foreignId('document_media_id')->nullable()->after('thumbnail_id')->constrained('media')->nullOnDelete();
            $table->enum('visibility', ['public', 'private'])->default('public')->after('status');
            $table->integer('sort_order')->default(0)->after('is_featured')->index();
            $table->timestamp('published_at')->nullable()->after('sort_order');
            $table->string('video_url', 500)->nullable()->change();
            $table->date('broadcast_date')->nullable()->change();

            $table->index(['status', 'visibility']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media_appearances', function (Blueprint $table) {
            $table->dropIndex(['status', 'visibility']);
            $table->dropForeign(['category_id']);
            $table->dropForeign(['document_media_id']);
            $table->dropColumn([
                'media_type',
                'category_id',
                'document_media_id',
                'visibility',
                'sort_order',
                'published_at',
            ]);
        });

        Schema::table('media_press', function (Blueprint $table) {
            $table->dropIndex(['status', 'visibility']);
            $table->dropForeign(['category_id']);
            $table->dropForeign(['document_media_id']);
            $table->dropColumn([
                'media_type',
                'category_id',
                'document_media_id',
                'visibility',
                'sort_order',
                'published_at',
            ]);
        });
    }
};

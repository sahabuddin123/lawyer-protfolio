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
        Schema::table('videos', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('thumbnail_id')->constrained('categories')->nullOnDelete();
            $table->enum('visibility', ['public', 'private'])->default('public')->after('status');
            $table->integer('sort_order')->default(0)->after('is_featured')->index();
            $table->timestamp('published_at')->nullable()->after('sort_order')->index();
            $table->string('video_id', 100)->nullable()->change();
            $table->date('published_date')->nullable()->change();

            $table->index(['status', 'visibility']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('videos', function (Blueprint $table) {
            $table->dropIndex(['status', 'visibility']);
            $table->dropForeign(['category_id']);
            $table->dropColumn([
                'category_id',
                'visibility',
                'sort_order',
                'published_at',
            ]);
        });
    }
};

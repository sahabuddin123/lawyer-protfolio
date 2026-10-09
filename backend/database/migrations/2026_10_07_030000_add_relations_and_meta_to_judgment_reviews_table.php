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
        Schema::table('judgment_reviews', function (Blueprint $table) {
            $table->date('judgment_date')->nullable()->change();
            $table->json('legal_area')->nullable()->change();
            $table->json('key_issues')->nullable()->change();
            $table->foreignId('practice_area_id')->nullable()->after('practical_significance')->constrained('practice_areas')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->after('practice_area_id')->constrained('categories')->nullOnDelete();
            $table->foreignId('legal_research_id')->nullable()->after('category_id')->constrained('legal_researches')->nullOnDelete();
            $table->json('author')->nullable()->after('legal_research_id');
            $table->enum('visibility', ['public', 'private'])->default('public')->after('status')->index();
            $table->unsignedInteger('sort_order')->default(0)->after('visibility')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('judgment_reviews', function (Blueprint $table) {
            $table->dropForeign(['practice_area_id']);
            $table->dropForeign(['category_id']);
            $table->dropForeign(['legal_research_id']);
            $table->dropColumn([
                'practice_area_id',
                'category_id',
                'legal_research_id',
                'author',
                'visibility',
                'sort_order',
            ]);
            $table->date('judgment_date')->nullable(false)->change();
            $table->json('legal_area')->nullable(false)->change();
            $table->json('key_issues')->nullable(false)->change();
        });
    }
};

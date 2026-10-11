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
        Schema::create('legal_researches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->enum('research_type', [
                'article',
                'case_analysis',
                'research_paper',
                'constitutional_analysis',
                'statutory_analysis',
                'legal_opinion',
                'commentary'
            ])->index();
            $table->json('title');
            $table->string('slug', 255)->unique();
            $table->json('author');
            $table->json('excerpt');
            $table->json('content');
            $table->foreignId('featured_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('pdf_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->unsignedInteger('view_count')->default(0);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('judgment_reviews', function (Blueprint $table) {
            $table->id();
            $table->json('case_name');
            $table->string('citation', 255)->index();
            $table->string('slug', 255)->unique();
            $table->string('court', 255);
            $table->date('judgment_date')->index();
            $table->json('legal_area');
            $table->json('summary');
            $table->json('key_issues');
            $table->json('court_decision');
            $table->json('author_analysis');
            $table->json('practical_significance')->nullable();
            $table->foreignId('featured_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('pdf_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->enum('publication_type', [
                'article',
                'research_paper',
                'case_note',
                'law_review',
                'legal_opinion',
                'book',
                'book_chapter'
            ])->index();
            $table->json('title');
            $table->string('slug', 255)->unique();
            $table->json('publication_name');
            $table->date('publication_date')->index();
            $table->json('author');
            $table->json('excerpt');
            $table->json('content')->nullable();
            $table->string('external_url', 500)->nullable();
            $table->foreignId('cover_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('pdf_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publications');
        Schema::dropIfExists('judgment_reviews');
        Schema::dropIfExists('legal_researches');
    }
};

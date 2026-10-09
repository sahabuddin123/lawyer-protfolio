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
        Schema::create('practice_areas', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->string('slug', 255)->unique();
            $table->json('short_description');
            $table->json('full_description');
            $table->string('icon_name', 100)->nullable();
            $table->foreignId('featured_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->integer('sort_order')->default(0);
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('courtroom_experiences', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->string('slug', 255)->unique();
            $table->string('case_number', 255)->nullable();
            $table->string('court', 255)->index();
            $table->string('case_type', 100)->index();
            $table->unsignedInteger('year')->index();
            $table->json('legal_area');
            $table->json('role');
            $table->json('summary');
            $table->json('description');
            $table->json('issues')->nullable();
            $table->json('arguments')->nullable();
            $table->json('outcome')->nullable();
            $table->date('judgment_date')->nullable();
            $table->foreignId('featured_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->enum('visibility', ['public', 'private'])->default('public')->index();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->integer('sort_order')->default(0);
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('case_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courtroom_experience_id')->constrained('courtroom_experiences')->cascadeOnDelete();
            $table->json('title');
            $table->foreignId('media_id')->constrained('media')->restrictOnDelete();
            $table->boolean('is_confidential')->default(false)->index();
            $table->integer('sort_order')->default(0);
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('case_documents');
        Schema::dropIfExists('courtroom_experiences');
        Schema::dropIfExists('practice_areas');
    }
};

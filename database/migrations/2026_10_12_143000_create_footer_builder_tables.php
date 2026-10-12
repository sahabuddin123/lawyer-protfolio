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
        Schema::create('footer_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 150)->unique();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_active')->default(false)->index();
            $table->json('display_conditions')->nullable();
            $table->json('layout_data');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('footer_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('footer_template_id')->constrained('footer_templates')->cascadeOnDelete();
            $table->unsignedInteger('version')->default(1);
            $table->json('layout_data');
            $table->string('change_summary', 255)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['footer_template_id', 'version']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('footer_revisions');
        Schema::dropIfExists('footer_templates');
    }
};

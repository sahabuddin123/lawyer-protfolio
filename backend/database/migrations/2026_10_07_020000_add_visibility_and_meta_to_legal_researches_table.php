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
        Schema::table('legal_researches', function (Blueprint $table) {
            $table->date('research_date')->nullable()->index()->after('content');
            $table->string('external_url', 500)->nullable()->after('pdf_media_id');
            $table->enum('visibility', ['public', 'private'])->default('public')->index()->after('status');
            $table->integer('sort_order')->default(0)->index()->after('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('legal_researches', function (Blueprint $table) {
            $table->dropIndex(['research_date']);
            $table->dropIndex(['visibility']);
            $table->dropIndex(['sort_order']);
            $table->dropColumn(['research_date', 'external_url', 'visibility', 'sort_order']);
        });
    }
};

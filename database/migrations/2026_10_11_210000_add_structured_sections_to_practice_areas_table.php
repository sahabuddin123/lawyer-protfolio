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
        Schema::table('practice_areas', function (Blueprint $table) {
            $table->json('tagline')->nullable()->after('short_description');
            $table->json('at_a_glance')->nullable()->after('full_description');
            $table->json('areas_of_assistance')->nullable()->after('at_a_glance');
            $table->json('common_concerns')->nullable()->after('areas_of_assistance');
            $table->json('legal_process')->nullable()->after('common_concerns');
            $table->json('document_checklist')->nullable()->after('legal_process');
            $table->json('faqs')->nullable()->after('document_checklist');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('practice_areas', function (Blueprint $table) {
            $table->dropColumn([
                'tagline',
                'at_a_glance',
                'areas_of_assistance',
                'common_concerns',
                'legal_process',
                'document_checklist',
                'faqs',
            ]);
        });
    }
};

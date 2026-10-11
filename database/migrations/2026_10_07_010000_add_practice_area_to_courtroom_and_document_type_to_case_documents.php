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
        Schema::table('courtroom_experiences', function (Blueprint $table) {
            $table->foreignId('practice_area_id')
                ->nullable()
                ->after('year')
                ->constrained('practice_areas')
                ->nullOnDelete();
        });

        Schema::table('case_documents', function (Blueprint $table) {
            $table->string('document_type', 100)->nullable()->after('title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('case_documents', function (Blueprint $table) {
            $table->dropColumn('document_type');
        });

        Schema::table('courtroom_experiences', function (Blueprint $table) {
            $table->dropForeign(['practice_area_id']);
            $table->dropColumn('practice_area_id');
        });
    }
};

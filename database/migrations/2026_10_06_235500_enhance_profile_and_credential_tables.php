<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to add Phase 6 profile enhancements.
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->enum('status', ['draft', 'published', 'hidden'])->default('published')->after('long_bio');
            $table->json('subtitle')->nullable()->after('title');
            $table->foreignId('signature_photo_id')->nullable()->after('court_robes_photo_id')->constrained('media')->nullOnDelete();
        });

        Schema::table('credentials', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('is_featured');
            $table->json('description')->nullable()->after('institution');
        });

        Schema::table('educations', function (Blueprint $table) {
            $table->string('year_completed', 20)->nullable()->change();
            $table->boolean('is_active')->default(true)->after('distinction');
            $table->json('description')->nullable()->after('distinction');
        });

        Schema::table('career_timelines', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('description');
            $table->boolean('is_current')->default(false)->after('period');
        });

        Schema::table('professional_memberships', function (Blueprint $table) {
            $table->json('description')->nullable()->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('professional_memberships', function (Blueprint $table) {
            $table->dropColumn(['description']);
        });

        Schema::table('career_timelines', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'is_current']);
        });

        Schema::table('educations', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'description']);
        });

        Schema::table('credentials', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'description']);
        });

        Schema::table('profiles', function (Blueprint $table) {
            $table->dropForeign(['signature_photo_id']);
            $table->dropColumn(['status', 'subtitle', 'signature_photo_id']);
        });
    }
};

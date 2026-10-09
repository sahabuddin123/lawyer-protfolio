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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->json('name');
            $table->json('title');
            $table->json('short_bio');
            $table->json('long_bio');
            $table->foreignId('profile_photo_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('court_robes_photo_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('bar_council_enrollment', 255)->nullable();
            $table->string('high_court_enrollment', 255)->nullable();
            $table->string('appellate_division_enrollment', 255)->nullable();
            $table->json('chambers_address');
            $table->json('office_address');
            $table->string('phone', 50);
            $table->string('email', 100);
            $table->string('whatsapp', 50)->nullable();
            $table->json('philosophy')->nullable();
            $table->json('legal_approach')->nullable();
            $table->timestamps();
        });

        Schema::create('credentials', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['academic', 'professional', 'court', 'certification'])->default('professional');
            $table->json('title');
            $table->json('institution');
            $table->string('year', 50)->nullable();
            $table->string('credential_id', 100)->nullable();
            $table->foreignId('certificate_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->boolean('is_featured')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('educations', function (Blueprint $table) {
            $table->id();
            $table->json('degree');
            $table->json('institution');
            $table->json('department')->nullable();
            $table->string('year_completed', 20);
            $table->json('distinction')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('career_timelines', function (Blueprint $table) {
            $table->id();
            $table->string('period', 100);
            $table->json('title');
            $table->json('organization');
            $table->json('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('professional_memberships', function (Blueprint $table) {
            $table->id();
            $table->json('organization');
            $table->json('role');
            $table->string('membership_number', 100)->nullable();
            $table->string('year_joined', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('professional_memberships');
        Schema::dropIfExists('career_timelines');
        Schema::dropIfExists('educations');
        Schema::dropIfExists('credentials');
        Schema::dropIfExists('profiles');
    }
};

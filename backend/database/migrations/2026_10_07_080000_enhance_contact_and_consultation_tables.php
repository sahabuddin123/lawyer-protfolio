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
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->foreignId('practice_area_id')->nullable()->after('subject')->constrained('practice_areas')->nullOnDelete();
            $table->boolean('consent_given')->default(false)->after('message');
            $table->timestamp('consented_at')->nullable()->after('consent_given');
            $table->softDeletes()->after('user_agent');
        });

        Schema::table('consultation_requests', function (Blueprint $table) {
            $table->string('preferred_time', 50)->nullable()->after('preferred_date');
            $table->boolean('consent_given')->default(false)->after('message');
            $table->timestamp('consented_at')->nullable()->after('consent_given');
            $table->softDeletes()->after('user_agent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consultation_requests', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['preferred_time', 'consent_given', 'consented_at']);
        });

        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropForeign(['practice_area_id']);
            $table->dropSoftDeletes();
            $table->dropColumn(['practice_area_id', 'consent_given', 'consented_at']);
        });
    }
};

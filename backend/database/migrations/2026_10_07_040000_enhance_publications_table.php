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
        Schema::table('publications', function (Blueprint $table) {
            $table->string('publication_type', 50)->change();
            $table->date('publication_date')->nullable()->change();
            $table->json('publication_name')->nullable()->change();
            $table->json('author')->nullable()->change();
            $table->json('excerpt')->nullable()->change();
            $table->string('visibility', 20)->default('public')->after('status');
            $table->integer('sort_order')->default(0)->after('is_featured');
            $table->timestamp('published_at')->nullable()->after('sort_order');

            $table->index(['status', 'visibility']);
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            $table->dropIndex(['status', 'visibility']);
            $table->dropIndex(['sort_order']);
            $table->dropColumn(['visibility', 'sort_order', 'published_at']);
        });
    }
};

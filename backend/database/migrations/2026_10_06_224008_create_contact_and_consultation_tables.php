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
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('phone', 50);
            $table->string('email', 255)->nullable();
            $table->string('subject', 255);
            $table->text('message');
            $table->enum('status', ['new', 'read', 'replied', 'archived', 'spam'])->default('new')->index();
            $table->text('admin_notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        Schema::create('consultation_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('phone', 50);
            $table->string('email', 255)->nullable();
            $table->string('subject', 255);
            $table->foreignId('practice_area_id')->nullable()->constrained('practice_areas')->nullOnDelete();
            $table->date('preferred_date')->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'contacted', 'in_progress', 'scheduled', 'completed', 'closed', 'spam'])->default('new')->index();
            $table->text('admin_notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_requests');
        Schema::dropIfExists('contact_messages');
    }
};

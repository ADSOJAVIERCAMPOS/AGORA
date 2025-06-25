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
    Schema::create('general_cases', function (Blueprint $table) {
        $table->id();
        $table->string('case_number')->unique();
        $table->string('ficha')->nullable();
        $table->date('created_at');
        $table->string('apprentice_name')->nullable();
        $table->string('document_type')->nullable();
        $table->string('document_number')->nullable();
        $table->string('training_program')->nullable();
        $table->text('motive')->nullable();
        $table->string('responsible_name')->nullable();
        $table->text('apprentice_signature')->nullable();
        $table->text('responsible_signature')->nullable();
        $table->foreignId('created_by')->constrained('users');
        $table->foreignId('updated_by')->nullable()->constrained('users');
        $table->timestamp('updated_at')->nullable();
        $table->json('files')->nullable();
    });
}

};

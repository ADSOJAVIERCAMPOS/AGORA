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
    Schema::create('special_cases', function (Blueprint $table) {
        $table->id();
        $table->string('apprentice_name');
        $table->string('document_type');
        $table->string('document_number');
        $table->string('ficha');
        $table->date('date');
        $table->string('category');
        $table->text('description')->nullable();
        $table->string('responsible')->nullable();
        $table->text('actions_taken')->nullable();
        $table->text('follow_up')->nullable();
        $table->text('reported_signature')->nullable();
        $table->text('apprentice_signature')->nullable();
        $table->enum('status', ['En proceso', 'Cerrado']);
        $table->foreignId('created_by')->constrained('users');
        $table->foreignId('updated_by')->nullable()->constrained('users');
        $table->timestamp('updated_at')->nullable();
    });
}

};

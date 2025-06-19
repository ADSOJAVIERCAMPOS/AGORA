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
    Schema::create('external_cases', function (Blueprint $table) {
        $table->id();
        $table->string('apprentice_name');
        $table->string('apprentice_document_type');
        $table->string('apprentice_document_number');
        $table->string('ficha');
        $table->string('guardian_name');
        $table->string('guardian_document_type');
        $table->string('guardian_document_number');
        $table->string('relation');
        $table->string('contact_number');
        $table->text('motive');
        $table->text('commitments')->nullable();
        $table->enum('status', ['solucionado', 'pendiente']);
        $table->timestamps();
    });
}

};

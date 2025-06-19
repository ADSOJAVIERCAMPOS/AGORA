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
        Schema::create('aprendices', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('tipo_documento', 10);
            $table->string('numero_documento')->unique();
            $table->string('numero_ficha');
            $table->string('email')->nullable();
            $table->string('telefono')->nullable();
            $table->enum('estado', ['Activo', 'Inactivo', 'Retirado'])->default('Activo');
            $table->timestamps();

            // Índices para mejorar el rendimiento de las consultas
            $table->index('numero_documento');
            $table->index('numero_ficha');
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aprendices');
    }
};

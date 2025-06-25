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
        Schema::create('casos_generales', function (Blueprint $table) {
            $table->id();
            $table->string('numero_caso', 20)->unique();
            $table->date('fecha');
            $table->string('nombre_aprendiz', 255);
            $table->string('tipo_documento', 50);
            $table->string('numero_documento', 50);
            $table->string('numero_ficha', 50);
            $table->text('motivo');
            $table->string('responsable', 255);
            $table->string('categoria_caso', 100)->nullable();
            $table->string('estado', 50);
            $table->timestamps();

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
        Schema::dropIfExists('casos_generales');
    }
};

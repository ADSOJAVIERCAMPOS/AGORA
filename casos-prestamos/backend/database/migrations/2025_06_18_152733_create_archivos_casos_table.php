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
        Schema::create('archivos_casos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('caso_id');
            $table->string('nombre_archivo');
            $table->string('ruta_archivo');
            $table->string('tipo_mime');
            $table->unsignedBigInteger('tamano_bytes');
            $table->string('tipo_archivo');
            $table->string('descripcion')->nullable();
            $table->timestamps();

            $table->foreign('caso_id')->references('id')->on('casos_generales')->onDelete('cascade');
            $table->index('caso_id');
            $table->index('tipo_archivo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archivos_casos');
    }
};

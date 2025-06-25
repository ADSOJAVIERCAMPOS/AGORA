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
    Schema::create('inventory_items', function (Blueprint $table) {
        $table->id();
        $table->string('plate_number')->unique();
        $table->text('description')->nullable();
        $table->string('item_type')->nullable();
        $table->string('location')->nullable();
        $table->enum('status', ['disponible', 'prestado', 'mantenimiento']);
        $table->timestamps();
    });
}

};

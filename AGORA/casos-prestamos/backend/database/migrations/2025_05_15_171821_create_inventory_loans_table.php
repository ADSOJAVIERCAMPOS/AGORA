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
    Schema::create('inventory_loans', function (Blueprint $table) {
        $table->id();
        $table->date('date');
        $table->string('apprentice_name');
        $table->string('document_type');
        $table->string('document_number');
        $table->text('description');
        $table->string('plate_number');
        $table->string('item_status');
        $table->time('delivery_time')->nullable();
        $table->time('return_time')->nullable();
        $table->text('approval_signature')->nullable();
        $table->text('receiver_signature')->nullable();
        $table->foreignId('created_by')->constrained('users');
        $table->timestamps();
    });
}

};

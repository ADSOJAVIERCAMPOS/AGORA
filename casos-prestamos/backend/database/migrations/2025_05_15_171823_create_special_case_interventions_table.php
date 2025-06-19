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
    Schema::create('special_case_interventions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('case_id')->constrained('special_cases')->onDelete('cascade');
        $table->date('intervention_date');
        $table->text('observations')->nullable();
        $table->foreignId('created_by')->constrained('users');
        $table->timestamps();
    });
}

};

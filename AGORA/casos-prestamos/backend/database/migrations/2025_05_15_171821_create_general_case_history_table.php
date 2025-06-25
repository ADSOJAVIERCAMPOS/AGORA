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
    Schema::create('general_case_history', function (Blueprint $table) {
        $table->id();
        $table->foreignId('case_id')->constrained('general_cases')->onDelete('cascade');
        $table->foreignId('modified_by')->constrained('users');
        $table->timestamp('modification_date')->useCurrent();
        $table->json('changes');
    });
}

};

<?php

namespace Database\Factories;

use App\Models\CasoGeneral;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CasoGeneral>
 */
class CasoGeneralFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tiposDocumento = ['CC', 'CE', 'TI', 'PP'];
        $estados = ['Pendiente', 'En Proceso', 'Resuelto', 'Cerrado'];
        $responsables = [
            'Ana García López',
            'Carlos Rodríguez Martínez',
            'María Fernández González',
            'Juan Pérez Silva',
            'Laura Morales Vargas',
            'Roberto Jiménez Ruiz',
            'Carmen Vega Díaz',
            'Miguel Torres Herrera'
        ];

        return [
            'numero_caso' => 'CG-' . Carbon::now()->year . '-' . str_pad($this->faker->unique()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'fecha' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'nombre_aprendiz' => $this->faker->name(),
            'tipo_documento' => $this->faker->randomElement($tiposDocumento),
            'numero_documento' => $this->faker->unique()->numerify('########'),
            'numero_ficha' => $this->faker->numerify('######'),
            'motivo' => $this->faker->paragraph(2),
            'responsable' => $this->faker->randomElement($responsables),
            'categoria_caso' => 'Caso General',
            'estado' => $this->faker->randomElement($estados),
        ];
    }

    /**
     * Indica que el caso está pendiente.
     */
    public function pendiente(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'Pendiente',
        ]);
    }

    /**
     * Indica que el caso está en proceso.
     */
    public function enProceso(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'En Proceso',
        ]);
    }

    /**
     * Indica que el caso está resuelto.
     */
    public function resuelto(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'Resuelto',
        ]);
    }

    /**
     * Indica que el caso está cerrado.
     */
    public function cerrado(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'Cerrado',
        ]);
    }

    /**
     * Indica que el caso es de un aprendiz específico.
     */
    public function aprendiz(string $nombre): static
    {
        return $this->state(fn (array $attributes) => [
            'nombre_aprendiz' => $nombre,
        ]);
    }

    /**
     * Indica que el caso es de una ficha específica.
     */
    public function ficha(string $numeroFicha): static
    {
        return $this->state(fn (array $attributes) => [
            'numero_ficha' => $numeroFicha,
        ]);
    }

    /**
     * Indica que el caso es de un responsable específico.
     */
    public function responsable(string $nombre): static
    {
        return $this->state(fn (array $attributes) => [
            'responsable' => $nombre,
        ]);
    }

    /**
     * Indica que el caso es de una fecha específica.
     */
    public function fecha(string $fecha): static
    {
        return $this->state(fn (array $attributes) => [
            'fecha' => $fecha,
        ]);
    }
} 
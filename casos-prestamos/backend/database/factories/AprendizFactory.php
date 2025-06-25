<?php

namespace Database\Factories;

use App\Models\Aprendiz;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Aprendiz>
 */
class AprendizFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tiposDocumento = ['CC', 'CE', 'TI', 'PP'];
        
        return [
            'nombre' => $this->faker->name(),
            'tipo_documento' => $this->faker->randomElement($tiposDocumento),
            'numero_documento' => $this->faker->unique()->numerify('########'),
            'numero_ficha' => $this->faker->numerify('######'),
            'email' => $this->faker->optional()->safeEmail(),
            'telefono' => $this->faker->optional()->numerify('##########'),
            'estado' => $this->faker->randomElement(['Activo', 'Activo', 'Activo', 'Inactivo', 'Retirado']), // Más probabilidad de estar activo
        ];
    }

    /**
     * Indica que el aprendiz está activo.
     */
    public function activo(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'Activo',
        ]);
    }

    /**
     * Indica que el aprendiz está inactivo.
     */
    public function inactivo(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'Inactivo',
        ]);
    }

    /**
     * Indica que el aprendiz está retirado.
     */
    public function retirado(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'Retirado',
        ]);
    }

    /**
     * Indica que el aprendiz tiene un número de documento específico.
     */
    public function documento(string $numeroDocumento): static
    {
        return $this->state(fn (array $attributes) => [
            'numero_documento' => $numeroDocumento,
        ]);
    }

    /**
     * Indica que el aprendiz tiene un número de ficha específico.
     */
    public function ficha(string $numeroFicha): static
    {
        return $this->state(fn (array $attributes) => [
            'numero_ficha' => $numeroFicha,
        ]);
    }
} 
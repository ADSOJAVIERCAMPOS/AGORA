<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Aprendiz;
use App\Models\CasoGeneral;

class AprendizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear aprendices con diferentes estados
        $this->crearAprendicesPorEstado();
        
        // Crear aprendices con fichas específicas
        $this->crearAprendicesPorFicha();
        
        // Crear aprendices con nombres específicos para pruebas
        $this->crearAprendicesConNombresEspecificos();
        
        // Sincronizar casos existentes con aprendices
        $this->sincronizarCasosConAprendices();
    }

    private function crearAprendicesPorEstado(): void
    {
        // Aprendices activos
        Aprendiz::factory()->count(50)->activo()->create();
        
        // Aprendices inactivos
        Aprendiz::factory()->count(10)->inactivo()->create();
        
        // Aprendices retirados
        Aprendiz::factory()->count(5)->retirado()->create();
    }

    private function crearAprendicesPorFicha(): void
    {
        $fichas = [
            '123456' => 8,
            '234567' => 12,
            '345678' => 6,
            '456789' => 10,
            '567890' => 7,
        ];

        foreach ($fichas as $ficha => $cantidad) {
            Aprendiz::factory()->count($cantidad)->ficha($ficha)->activo()->create();
        }
    }

    private function crearAprendicesConNombresEspecificos(): void
    {
        $nombresEspecificos = [
            'Juan Carlos Pérez',
            'Juan David López',
            'Juan Esteban Rodríguez',
            'María Alejandra García',
            'María Camila Martínez',
            'María Fernanda Silva',
            'Carlos Alberto Torres',
            'Carlos Andrés Vargas',
            'Ana Sofía Morales',
            'Ana Lucía Jiménez',
        ];

        foreach ($nombresEspecificos as $nombre) {
            Aprendiz::factory()->create([
                'nombre' => $nombre,
                'numero_documento' => fake()->unique()->numerify('########'),
                'estado' => 'Activo',
            ]);
        }
    }

    private function sincronizarCasosConAprendices(): void
    {
        // Obtener todos los casos que no tienen un aprendiz correspondiente
        $casos = CasoGeneral::whereNotExists(function ($query) {
            $query->select(\DB::raw(1))
                  ->from('aprendices')
                  ->whereRaw('aprendices.numero_documento = casos_generales.numero_documento');
        })->get();

        foreach ($casos as $caso) {
            // Crear aprendiz basado en los datos del caso
            Aprendiz::updateOrCreate(
                ['numero_documento' => $caso->numero_documento],
                [
                    'nombre' => $caso->nombre_aprendiz,
                    'tipo_documento' => $caso->tipo_documento,
                    'numero_ficha' => $caso->numero_ficha,
                    'estado' => 'Activo',
                ]
            );
        }
    }
} 
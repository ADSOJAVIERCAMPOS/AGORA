<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CasoGeneral;
use Carbon\Carbon;

class CasoGeneralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear casos con diferentes estados
        $this->crearCasosPorEstado();
        
        // Crear casos con diferentes responsables
        $this->crearCasosPorResponsable();
        
        // Crear casos con diferentes fichas
        $this->crearCasosPorFicha();
        
        // Crear casos con diferentes tipos de documento
        $this->crearCasosPorTipoDocumento();
        
        // Crear casos con diferentes fechas
        $this->crearCasosPorFecha();
        
        // Crear casos con nombres específicos para búsquedas
        $this->crearCasosConNombresEspecificos();
        
        // Crear casos con motivos específicos
        $this->crearCasosConMotivosEspecificos();
    }

    private function crearCasosPorEstado(): void
    {
        // Casos pendientes
        CasoGeneral::factory()->count(15)->pendiente()->create();
        
        // Casos en proceso
        CasoGeneral::factory()->count(10)->enProceso()->create();
        
        // Casos resueltos
        CasoGeneral::factory()->count(20)->resuelto()->create();
        
        // Casos cerrados
        CasoGeneral::factory()->count(8)->cerrado()->create();
    }

    private function crearCasosPorResponsable(): void
    {
        $responsables = [
            'Ana García López' => 12,
            'Carlos Rodríguez Martínez' => 8,
            'María Fernández González' => 15,
            'Juan Pérez Silva' => 6,
            'Laura Morales Vargas' => 10,
        ];

        foreach ($responsables as $responsable => $cantidad) {
            CasoGeneral::factory()->count($cantidad)->responsable($responsable)->create();
        }
    }

    private function crearCasosPorFicha(): void
    {
        $fichas = [
            '123456' => 8,
            '234567' => 12,
            '345678' => 6,
            '456789' => 10,
            '567890' => 7,
        ];

        foreach ($fichas as $ficha => $cantidad) {
            CasoGeneral::factory()->count($cantidad)->ficha($ficha)->create();
        }
    }

    private function crearCasosPorTipoDocumento(): void
    {
        // Casos con CC
        CasoGeneral::factory()->count(25)->create([
            'tipo_documento' => 'CC',
            'numero_documento' => fn() => fake()->unique()->numerify('########'),
        ]);
        
        // Casos con CE
        CasoGeneral::factory()->count(15)->create([
            'tipo_documento' => 'CE',
            'numero_documento' => fn() => fake()->unique()->numerify('########'),
        ]);
        
        // Casos con TI
        CasoGeneral::factory()->count(10)->create([
            'tipo_documento' => 'TI',
            'numero_documento' => fn() => fake()->unique()->numerify('########'),
        ]);
        
        // Casos con PP
        CasoGeneral::factory()->count(5)->create([
            'tipo_documento' => 'PP',
            'numero_documento' => fn() => fake()->unique()->numerify('########'),
        ]);
    }

    private function crearCasosPorFecha(): void
    {
        // Casos de este mes
        CasoGeneral::factory()->count(8)->create([
            'fecha' => Carbon::now()->startOfMonth()->addDays(rand(1, 15)),
        ]);
        
        // Casos del mes pasado
        CasoGeneral::factory()->count(12)->create([
            'fecha' => Carbon::now()->subMonth()->startOfMonth()->addDays(rand(1, 28)),
        ]);
        
        // Casos de hace 2 meses
        CasoGeneral::factory()->count(10)->create([
            'fecha' => Carbon::now()->subMonths(2)->startOfMonth()->addDays(rand(1, 28)),
        ]);
        
        // Casos de hace 3 meses
        CasoGeneral::factory()->count(8)->create([
            'fecha' => Carbon::now()->subMonths(3)->startOfMonth()->addDays(rand(1, 28)),
        ]);
    }

    private function crearCasosConNombresEspecificos(): void
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
            CasoGeneral::factory()->aprendiz($nombre)->create([
                'numero_documento' => fake()->unique()->numerify('########'),
            ]);
        }
    }

    private function crearCasosConMotivosEspecificos(): void
    {
        $motivos = [
            'Problema académico con matemáticas',
            'Situación académica compleja',
            'Dificultad académica en programación',
            'Problema personal que afecta lo académico',
            'Situación familiar que impacta lo académico',
            'Problema de salud que afecta el rendimiento académico',
            'Dificultad económica para continuar estudios',
            'Problema de transporte para asistir a clases',
            'Situación laboral que interfiere con estudios',
            'Problema de vivienda que afecta estudios',
        ];

        foreach ($motivos as $motivo) {
            CasoGeneral::factory()->create([
                'motivo' => $motivo,
                'numero_documento' => fake()->unique()->numerify('########'),
            ]);
        }
    }
} 
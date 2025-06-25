<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CasoGeneral;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CasoGeneralSeeder extends Seeder
{
    private static int $numeroCasoCounter = 1;

    private function generarNumeroCasoUnico(): string
    {
        $year = now()->year;
        $num = str_pad(self::$numeroCasoCounter++, 3, '0', STR_PAD_LEFT);
        return "CG-$year-$num";
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar la tabla antes de sembrar para evitar duplicados
        DB::table('casos_generales')->truncate();
        
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
        for ($i = 0; $i < 15; $i++) {
            \App\Models\CasoGeneral::factory()->pendiente()->create([
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
        for ($i = 0; $i < 10; $i++) {
            \App\Models\CasoGeneral::factory()->enProceso()->create([
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
        for ($i = 0; $i < 20; $i++) {
            \App\Models\CasoGeneral::factory()->resuelto()->create([
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
        for ($i = 0; $i < 8; $i++) {
            \App\Models\CasoGeneral::factory()->cerrado()->create([
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
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
            for ($i = 0; $i < $cantidad; $i++) {
                \App\Models\CasoGeneral::factory()->responsable($responsable)->create([
                    'numero_caso' => $this->generarNumeroCasoUnico(),
                ]);
            }
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
            for ($i = 0; $i < $cantidad; $i++) {
                \App\Models\CasoGeneral::factory()->ficha($ficha)->create([
                    'numero_caso' => $this->generarNumeroCasoUnico(),
                ]);
            }
        }
    }

    private function crearCasosPorTipoDocumento(): void
    {
        // Casos con CC
        for ($i = 0; $i < 25; $i++) {
            \App\Models\CasoGeneral::factory()->create([
                'tipo_documento' => 'CC',
                'numero_documento' => fn() => fake()->unique()->numerify('########'),
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
        
        // Casos con CE
        for ($i = 0; $i < 15; $i++) {
            \App\Models\CasoGeneral::factory()->create([
                'tipo_documento' => 'CE',
                'numero_documento' => fn() => fake()->unique()->numerify('########'),
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
        
        // Casos con TI
        for ($i = 0; $i < 10; $i++) {
            \App\Models\CasoGeneral::factory()->create([
                'tipo_documento' => 'TI',
                'numero_documento' => fn() => fake()->unique()->numerify('########'),
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
        
        // Casos con PP
        for ($i = 0; $i < 5; $i++) {
            \App\Models\CasoGeneral::factory()->create([
                'tipo_documento' => 'PP',
                'numero_documento' => fn() => fake()->unique()->numerify('########'),
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
    }

    private function crearCasosPorFecha(): void
    {
        // Casos de este mes
        for ($i = 0; $i < 8; $i++) {
            \App\Models\CasoGeneral::factory()->create([
                'fecha' => Carbon::now()->startOfMonth()->addDays(rand(1, 15)),
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
        
        // Casos del mes pasado
        for ($i = 0; $i < 12; $i++) {
            \App\Models\CasoGeneral::factory()->create([
                'fecha' => Carbon::now()->subMonth()->startOfMonth()->addDays(rand(1, 28)),
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
        
        // Casos de hace 2 meses
        for ($i = 0; $i < 10; $i++) {
            \App\Models\CasoGeneral::factory()->create([
                'fecha' => Carbon::now()->subMonths(2)->startOfMonth()->addDays(rand(1, 28)),
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
        
        // Casos de hace 3 meses
        for ($i = 0; $i < 8; $i++) {
            \App\Models\CasoGeneral::factory()->create([
                'fecha' => Carbon::now()->subMonths(3)->startOfMonth()->addDays(rand(1, 28)),
                'numero_caso' => $this->generarNumeroCasoUnico(),
            ]);
        }
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
            for ($i = 0; $i < 1; $i++) {
                \App\Models\CasoGeneral::factory()->aprendiz($nombre)->create([
                    'numero_documento' => fake()->unique()->numerify('########'),
                    'numero_caso' => $this->generarNumeroCasoUnico(),
                ]);
            }
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
            for ($i = 0; $i < 1; $i++) {
                \App\Models\CasoGeneral::factory()->create([
                    'motivo' => $motivo,
                    'numero_documento' => fake()->unique()->numerify('########'),
                    'numero_caso' => $this->generarNumeroCasoUnico(),
                ]);
            }
        }
    }
} 
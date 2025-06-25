<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\CasoGeneral;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class CasoGeneralFiltrosTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear usuario de prueba
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Obtener token de autenticación
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->token = $response->json('token');
    }

    /** @test */
    public function puede_consultar_casos_sin_filtros()
    {
        // Crear algunos casos de prueba
        CasoGeneral::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'casos',
                    'paginacion',
                    'filtros_aplicados',
                    'ordenamiento',
                    'estadisticas'
                ]);
    }

    /** @test */
    public function puede_filtrar_por_nombre_aprendiz()
    {
        // Crear casos con nombres específicos
        CasoGeneral::factory()->create(['nombre_aprendiz' => 'Juan Pérez']);
        CasoGeneral::factory()->create(['nombre_aprendiz' => 'María García']);
        CasoGeneral::factory()->create(['nombre_aprendiz' => 'Carlos López']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?nombre_aprendiz=Juan');

        $response->assertStatus(200);
        $casos = $response->json('casos');
        
        $this->assertCount(1, $casos);
        $this->assertEquals('Juan Pérez', $casos[0]['nombre_aprendiz']);
    }

    /** @test */
    public function puede_filtrar_por_numero_documento()
    {
        CasoGeneral::factory()->create(['numero_documento' => '12345678']);
        CasoGeneral::factory()->create(['numero_documento' => '87654321']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?numero_documento=12345678');

        $response->assertStatus(200);
        $casos = $response->json('casos');
        
        $this->assertCount(1, $casos);
        $this->assertEquals('12345678', $casos[0]['numero_documento']);
    }

    /** @test */
    public function puede_filtrar_por_estado()
    {
        CasoGeneral::factory()->create(['estado' => 'Pendiente']);
        CasoGeneral::factory()->create(['estado' => 'En Proceso']);
        CasoGeneral::factory()->create(['estado' => 'Resuelto']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?estado=Pendiente');

        $response->assertStatus(200);
        $casos = $response->json('casos');
        
        $this->assertCount(1, $casos);
        $this->assertEquals('Pendiente', $casos[0]['estado']);
    }

    /** @test */
    public function puede_filtrar_por_numero_ficha()
    {
        CasoGeneral::factory()->create(['numero_ficha' => '123456']);
        CasoGeneral::factory()->create(['numero_ficha' => '654321']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?numero_ficha=123456');

        $response->assertStatus(200);
        $casos = $response->json('casos');
        
        $this->assertCount(1, $casos);
        $this->assertEquals('123456', $casos[0]['numero_ficha']);
    }

    /** @test */
    public function puede_filtrar_por_rango_fechas()
    {
        CasoGeneral::factory()->create(['fecha' => '2025-01-15']);
        CasoGeneral::factory()->create(['fecha' => '2025-02-15']);
        CasoGeneral::factory()->create(['fecha' => '2025-03-15']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?fecha_desde=2025-01-01&fecha_hasta=2025-02-28');

        $response->assertStatus(200);
        $casos = $response->json('casos');
        
        $this->assertCount(2, $casos);
    }

    /** @test */
    public function puede_ordenar_por_campo_y_direccion()
    {
        CasoGeneral::factory()->create(['nombre_aprendiz' => 'Carlos']);
        CasoGeneral::factory()->create(['nombre_aprendiz' => 'Ana']);
        CasoGeneral::factory()->create(['nombre_aprendiz' => 'Beatriz']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?sort_by=nombre_aprendiz&sort_direction=asc');

        $response->assertStatus(200);
        $casos = $response->json('casos');
        
        $this->assertEquals('Ana', $casos[0]['nombre_aprendiz']);
        $this->assertEquals('Beatriz', $casos[1]['nombre_aprendiz']);
        $this->assertEquals('Carlos', $casos[2]['nombre_aprendiz']);
    }

    /** @test */
    public function puede_paginar_resultados()
    {
        CasoGeneral::factory()->count(25)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?per_page=10');

        $response->assertStatus(200);
        $paginacion = $response->json('paginacion');
        
        $this->assertEquals(10, $paginacion['per_page']);
        $this->assertEquals(25, $paginacion['total']);
        $this->assertEquals(3, $paginacion['last_page']);
    }

    /** @test */
    public function puede_combinar_multiples_filtros()
    {
        CasoGeneral::factory()->create([
            'nombre_aprendiz' => 'Juan Pérez',
            'estado' => 'Pendiente',
            'responsable' => 'Ana García'
        ]);
        
        CasoGeneral::factory()->create([
            'nombre_aprendiz' => 'Juan López',
            'estado' => 'Pendiente',
            'responsable' => 'Carlos López'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?nombre_aprendiz=Juan&estado=Pendiente&responsable=Ana');

        $response->assertStatus(200);
        $casos = $response->json('casos');
        
        $this->assertCount(1, $casos);
        $this->assertEquals('Juan Pérez', $casos[0]['nombre_aprendiz']);
        $this->assertEquals('Pendiente', $casos[0]['estado']);
        $this->assertEquals('Ana García', $casos[0]['responsable']);
    }

    /** @test */
    public function puede_obtener_estadisticas()
    {
        CasoGeneral::factory()->create(['estado' => 'Pendiente']);
        CasoGeneral::factory()->create(['estado' => 'En Proceso']);
        CasoGeneral::factory()->create(['estado' => 'Resuelto']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales/estadisticas');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'estadisticas' => [
                        'total_casos',
                        'por_estado',
                        'casos_por_mes',
                        'top_responsables',
                        'top_fichas'
                    ]
                ]);

        $estadisticas = $response->json('estadisticas');
        $this->assertEquals(3, $estadisticas['total_casos']);
        $this->assertEquals(1, $estadisticas['por_estado']['pendientes']);
    }

    /** @test */
    public function puede_obtener_valores_filtros()
    {
        CasoGeneral::factory()->create(['estado' => 'Pendiente', 'tipo_documento' => 'CC']);
        CasoGeneral::factory()->create(['estado' => 'En Proceso', 'tipo_documento' => 'CE']);
        CasoGeneral::factory()->create(['estado' => 'Resuelto', 'tipo_documento' => 'TI']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales/filtros/valores');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'filtros' => [
                        'estados',
                        'tipos_documento',
                        'responsables',
                        'fichas',
                        'anios'
                    ]
                ]);

        $filtros = $response->json('filtros');
        $this->assertContains('Pendiente', $filtros['estados']);
        $this->assertContains('CC', $filtros['tipos_documento']);
    }

    /** @test */
    public function respeta_limites_paginacion()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?per_page=150'); // Más del límite máximo

        $response->assertStatus(200);
        $paginacion = $response->json('paginacion');
        
        $this->assertEquals(100, $paginacion['per_page']); // Debería limitarse a 100
    }

    /** @test */
    public function maneja_filtros_invalidos()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Accept' => 'application/json',
        ])->getJson('/api/casos-generales?sort_by=campo_invalido&sort_direction=direccion_invalida');

        $response->assertStatus(200); // No debería fallar, debería usar valores por defecto
        
        $ordenamiento = $response->json('ordenamiento');
        $this->assertEquals('fecha', $ordenamiento['campo']); // Valor por defecto
        $this->assertEquals('desc', $ordenamiento['direccion']); // Valor por defecto
    }
} 
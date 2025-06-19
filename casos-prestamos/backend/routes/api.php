<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\CasoGeneralController; // Importa tu controlador de Casos Generales
use App\Http\Controllers\ArchivoCasoController; // Importa tu controlador de Archivos de Casos
use App\Http\Controllers\AprendizController; // Importa tu controlador de Aprendices
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// ====================================================================
// RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
// Estas rutas son accesibles sin un token de autenticación.
// ====================================================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);


// ====================================================================
// RUTAS PROTEGIDAS POR AUTENTICACIÓN DE LARAVEL SANCTUM
// Todas las rutas dentro de este grupo requerirán un token de autenticación válido
// y el middleware 'auth:sanctum' las protegerá.
// ====================================================================
Route::middleware('auth:sanctum')->group(function () {
    // Rutas de Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);

    // Ruta para obtener los datos del usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas del Dashboard
    Route::get('/dashboard-data', [DashboardApiController::class, 'getDashboardData']);

    // ================================================================
    // RUTAS PARA LA GESTIÓN DE CASOS GENERALES
    // ================================================================

    // Endpoint para registrar un nuevo caso general
    // Método: POST
    // URL: /api/casos-generales
    Route::post('/casos-generales', [CasoGeneralController::class, 'store']);

    // Endpoint para consultar todos los casos generales con filtros
    // Soporta filtros por query parameters (ej. /api/casos-generales?numero_ficha=123)
    // Método: GET
    // URL: /api/casos-generales
    Route::get('/casos-generales', [CasoGeneralController::class, 'index']);

    // Endpoint para consultar un caso general específico por su número de caso
    // Método: GET
    // URL: /api/casos-generales/{numero_caso} (ej. /api/casos-generales/CG-2025-001)
    Route::get('/casos-generales/{numero_caso}', [CasoGeneralController::class, 'show']);

    // Endpoint para obtener estadísticas de casos generales
    // Método: GET
    // URL: /api/casos-generales/estadisticas
    Route::get('/casos-generales/estadisticas', [CasoGeneralController::class, 'getEstadisticas']);

    // Endpoint para obtener valores únicos para filtros
    // Método: GET
    // URL: /api/casos-generales/filtros/valores
    Route::get('/casos-generales/filtros/valores', [CasoGeneralController::class, 'getValoresFiltros']);

    // ================================================================
    // RUTAS PARA LA GESTIÓN DE APRENDICES
    // ================================================================

    // Endpoint para obtener todos los aprendices con filtros
    // Método: GET
    // URL: /api/aprendices
    Route::get('/aprendices', [AprendizController::class, 'index']);

    // Endpoint para obtener aprendiz específico
    // Método: GET
    // URL: /api/aprendices/{numero_documento}
    Route::get('/aprendices/{numero_documento}', [AprendizController::class, 'show']);

    // Endpoint para crear o actualizar aprendiz
    // Método: POST
    // URL: /api/aprendices
    Route::post('/aprendices', [AprendizController::class, 'store']);

    // Endpoint para actualizar aprendiz
    // Método: PUT
    // URL: /api/aprendices/{numero_documento}
    Route::put('/aprendices/{numero_documento}', [AprendizController::class, 'update']);

    // Endpoint para obtener estadísticas de aprendices
    // Método: GET
    // URL: /api/aprendices/estadisticas
    Route::get('/aprendices/estadisticas', [AprendizController::class, 'getEstadisticas']);

    // Endpoint para obtener valores únicos para filtros de aprendices
    // Método: GET
    // URL: /api/aprendices/filtros/valores
    Route::get('/aprendices/filtros/valores', [AprendizController::class, 'getValoresFiltros']);

    // ================================================================
    // RUTAS PARA LA GESTIÓN DE ARCHIVOS DE CASOS
    // ================================================================

    // Endpoint para buscar archivos con filtros
    Route::get('/archivos', [ArchivoCasoController::class, 'index']);

    // Endpoint para subir archivo a un caso específico
    // Método: POST
    // URL: /api/casos-generales/{numero_caso}/archivos
    Route::post('/casos-generales/{numero_caso}/archivos', [ArchivoCasoController::class, 'subirArchivo']);

    // Endpoint para obtener archivos de un caso específico
    // Método: GET
    // URL: /api/casos-generales/{numero_caso}/archivos
    Route::get('/casos-generales/{numero_caso}/archivos', [ArchivoCasoController::class, 'obtenerArchivosCaso']);

    // Endpoint para obtener archivos por número de documento del aprendiz
    // Método: GET
    // URL: /api/archivos/aprendiz/{numero_documento}
    Route::get('/archivos/aprendiz/{numero_documento}', [ArchivoCasoController::class, 'obtenerArchivosPorDocumento']);

    // Endpoint para eliminar archivo específico
    // Método: DELETE
    // URL: /api/casos-generales/{numero_caso}/archivos/{archivo_id}
    Route::delete('/casos-generales/{numero_caso}/archivos/{archivo_id}', [ArchivoCasoController::class, 'eliminarArchivo']);

    // Endpoint para descargar archivo
    // Método: GET
    // URL: /api/casos-generales/{numero_caso}/archivos/{archivo_id}/descargar
    Route::get('/casos-generales/{numero_caso}/archivos/{archivo_id}/descargar', [ArchivoCasoController::class, 'descargarArchivo']);

    // Endpoint para obtener estadísticas de archivos
    // Método: GET
    // URL: /api/archivos/estadisticas
    Route::get('/archivos/estadisticas', [ArchivoCasoController::class, 'getEstadisticas']);

    // Endpoint para obtener valores únicos para filtros de archivos
    // Método: GET
    // URL: /api/archivos/filtros/valores
    Route::get('/archivos/filtros/valores', [ArchivoCasoController::class, 'getValoresFiltros']);

    // Puedes añadir más rutas aquí para actualizar, eliminar, etc., si es necesario en el futuro.

});

// RUTAS SOLO PARA COORDINADOR O ADMIN
Route::middleware(['auth:sanctum', 'coordinador_admin'])->group(function () {
    // Ejemplo: Ruta de gestión de auxiliares
    Route::get('/auxiliares/gestion', function() {
        return response()->json(['message' => 'Gestión de auxiliares disponible solo para coordinador o admin.']);
    });
    // Aquí van las rutas de gestión de auxiliares
});

DB::connection()->getDatabaseName();
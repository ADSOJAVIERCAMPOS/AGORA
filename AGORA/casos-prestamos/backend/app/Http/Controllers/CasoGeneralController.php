<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CasoGeneral; // Asegúrate de que este modelo exista y esté en la ruta correcta
use App\Models\ArchivoCaso; // Asegúrate de que este modelo exista y esté en la ruta correcta
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon; // Necesario para manejar fechas, asegúrate de tenerlo instalado (viene por defecto con Laravel)
use App\Http\Requests\CasoGeneralRequest;

class CasoGeneralController extends Controller
{
    /**
     * Genera un número de caso único, incremental y con formato (ej. CG-2025-001).
     *
     * @return string
     */
    private function generateUniqueCaseNumber()
    {
        $year = Carbon::now()->year;
        $prefix = 'CG-' . $year . '-';

        // Buscar el último número de caso registrado para el año actual
        $lastCase = CasoGeneral::where('numero_caso', 'like', $prefix . '%')
                                ->orderBy('id', 'desc') // Asumimos que un ID mayor significa un caso más reciente
                                ->first();

        $nextNumber = 1;
        if ($lastCase) {
            // Extraer el número consecutivo (los últimos 3 dígitos)
            $lastNumber = (int) substr($lastCase->numero_caso, -3);
            $nextNumber = $lastNumber + 1;
        }

        // Formatear el número con ceros a la izquierda (ej. 001, 010, 100)
        return $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Registra un nuevo caso general.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CasoGeneralRequest $request)
    {
        // La validación se hace automáticamente en el Request
        DB::beginTransaction();

        try {
            // Generar número de caso único
            $numeroCaso = $this->generateUniqueCaseNumber();

            // Crear el caso usando el modelo optimizado
            $caso = CasoGeneral::create([
                'numero_caso' => $numeroCaso,
                'fecha' => $request->fecha,
                'nombre_aprendiz' => $request->nombre_aprendiz,
                'tipo_documento' => $request->tipo_documento,
                'numero_documento' => $request->numero_documento,
                'numero_ficha' => $request->numero_ficha,
                'motivo' => $request->motivo,
                'responsable' => $request->responsable,
            ]);

            // Procesar archivos si se adjuntaron
            if ($request->hasFile('firma_aprendiz')) {
                $this->procesarArchivo($request->file('firma_aprendiz'), $caso, 'Firma');
            }

            // Procesar archivos adicionales si vienen del frontend
            if ($request->hasFile('archivos')) {
                foreach ($request->file('archivos') as $archivo) {
                    $this->procesarArchivo($archivo, $caso, 'Documento');
                }
            }

            // Confirmar transacción
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Caso general registrado exitosamente.',
                'data' => [
                    'numero_caso' => $caso->numero_caso,
                    'caso_id' => $caso->id,
                    'fecha_formateada' => $caso->fecha_formateada,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error al registrar caso general: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor. Por favor, intente de nuevo.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno',
            ], 500);
        }
    }

    /**
     * Procesa y guarda un archivo asociado a un caso
     */
    private function procesarArchivo($file, $caso, $tipoArchivo = 'Documento')
    {
        try {
            // Validar archivo usando las reglas del modelo ArchivoCaso
            $datosArchivo = [
                'nombre_archivo' => $file->getClientOriginalName(),
                'tipo_mime' => $file->getClientMimeType(),
                'tamano_bytes' => $file->getSize(),
                'tipo_archivo' => $tipoArchivo,
            ];

            // Validar datos del archivo
            $validator = \Validator::make($datosArchivo, ArchivoCaso::rules(), ArchivoCaso::messages());
            
            if ($validator->fails()) {
                throw new \Exception('Datos del archivo inválidos: ' . $validator->errors()->first());
            }

            // Generar nombre único para el archivo
            $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
            $filePath = 'casos/' . $caso->numero_caso . '/' . $filename;

            // Guardar archivo
            Storage::disk('public')->put($filePath, file_get_contents($file));

            // Crear registro en la base de datos
            $caso->agregarArchivo([
                'caso_id' => $caso->id,
                'nombre_archivo' => $file->getClientOriginalName(),
                'ruta_archivo' => $filePath,
                'tipo_mime' => $file->getClientMimeType(),
                'tamano_bytes' => $file->getSize(),
                'tipo_archivo' => $tipoArchivo,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al procesar archivo: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Consulta casos generales, permitiendo filtros avanzados.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Iniciar una consulta sobre el modelo CasoGeneral
        $query = CasoGeneral::query();

        // ================================================================
        // FILTROS POR APRENDIZ
        // ================================================================
        
        // Filtrar por nombre del aprendiz (búsqueda parcial)
        if ($request->filled('nombre_aprendiz')) {
            $query->where('nombre_aprendiz', 'like', '%' . $request->input('nombre_aprendiz') . '%');
        }

        // Filtrar por número de documento del aprendiz (búsqueda exacta)
        if ($request->filled('numero_documento')) {
            $query->where('numero_documento', $request->input('numero_documento'));
        }

        // Filtrar por tipo de documento
        if ($request->filled('tipo_documento')) {
            $query->where('tipo_documento', $request->input('tipo_documento'));
        }

        // ================================================================
        // FILTROS POR FICHA
        // ================================================================
        
        // Filtrar por número de ficha (búsqueda exacta)
        if ($request->filled('numero_ficha')) {
            $query->where('numero_ficha', $request->input('numero_ficha'));
        }

        // ================================================================
        // FILTROS POR ESTADO
        // ================================================================
        
        // Filtrar por estado del caso
        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        // ================================================================
        // FILTROS POR FECHA
        // ================================================================
        
        // Filtrar por fecha desde
        if ($request->filled('fecha_desde')) {
            $query->where('fecha', '>=', $request->input('fecha_desde'));
        }

        // Filtrar por fecha hasta
        if ($request->filled('fecha_hasta')) {
            $query->where('fecha', '<=', $request->input('fecha_hasta'));
        }

        // ================================================================
        // FILTROS POR RESPONSABLE
        // ================================================================
        
        // Filtrar por responsable (búsqueda parcial)
        if ($request->filled('responsable')) {
            $query->where('responsable', 'like', '%' . $request->input('responsable') . '%');
        }

        // ================================================================
        // FILTROS POR NÚMERO DE CASO
        // ================================================================
        
        // Filtrar por número de caso (búsqueda parcial)
        if ($request->filled('numero_caso')) {
            $query->where('numero_caso', 'like', '%' . $request->input('numero_caso') . '%');
        }

        // ================================================================
        // FILTROS POR MOTIVO
        // ================================================================
        
        // Filtrar por motivo (búsqueda parcial)
        if ($request->filled('motivo')) {
            $query->where('motivo', 'like', '%' . $request->input('motivo') . '%');
        }

        // ================================================================
        // ORDENAMIENTO
        // ================================================================
        
        // Ordenar por campo y dirección
        $sortBy = $request->input('sort_by', 'fecha'); // Por defecto ordenar por fecha
        $sortDirection = $request->input('sort_direction', 'desc'); // Por defecto descendente
        
        // Validar que el campo de ordenamiento sea válido
        $allowedSortFields = ['fecha', 'numero_caso', 'nombre_aprendiz', 'estado', 'responsable', 'numero_ficha'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'fecha';
        }
        
        // Validar la dirección de ordenamiento
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }
        
        $query->orderBy($sortBy, $sortDirection);

        try {
            // ================================================================
            // PAGINACIÓN
            // ================================================================
            
            $perPage = $request->input('per_page', 15); // Por defecto 15 registros por página
            $perPage = min(max($perPage, 1), 100); // Limitar entre 1 y 100 registros por página
            
            // Ejecutar la consulta con paginación y cargar la relación con los archivos asociados
            $casos = $query->with('archivos')->paginate($perPage);

            // ================================================================
            // PREPARAR RESPUESTA
            // ================================================================
            
            // Obtener información de los filtros aplicados
            $filtrosAplicados = [];
            $filtrosDisponibles = [
                'nombre_aprendiz', 'numero_documento', 'tipo_documento', 'numero_ficha',
                'estado', 'fecha_desde', 'fecha_hasta', 'responsable', 'numero_caso', 'motivo'
            ];
            
            foreach ($filtrosDisponibles as $filtro) {
                if ($request->filled($filtro)) {
                    $filtrosAplicados[$filtro] = $request->input($filtro);
                }
            }

            // Devolver los casos encontrados con información adicional
            return response()->json([
                'message' => 'Casos generales consultados exitosamente.',
                'casos' => $casos->items(),
                'paginacion' => [
                    'current_page' => $casos->currentPage(),
                    'last_page' => $casos->lastPage(),
                    'per_page' => $casos->perPage(),
                    'total' => $casos->total(),
                    'from' => $casos->firstItem(),
                    'to' => $casos->lastItem(),
                ],
                'filtros_aplicados' => $filtrosAplicados,
                'ordenamiento' => [
                    'campo' => $sortBy,
                    'direccion' => $sortDirection
                ],
                'estadisticas' => [
                    'total_casos' => $casos->total(),
                    'casos_encontrados' => count($casos->items()),
                ]
            ], 200);

        } catch (\Exception $e) {
            // Manejo de errores en la consulta
            \Log::error('Error al consultar casos generales: ' . $e->getMessage() . ' en ' . $e->getFile() . ' línea ' . $e->getLine());
            return response()->json([
                'message' => 'Hubo un error al consultar los casos. Por favor, intente de nuevo.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Muestra los detalles de un caso general específico por su numero_caso.
     *
     * @param  string  $numero_caso El número de caso único a buscar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $numero_caso)
    {
        try {
            // Buscar el caso por su numero_caso y cargar sus archivos asociados
            $caso = CasoGeneral::where('numero_caso', $numero_caso)->with('archivos')->first();

            // Si el caso no se encuentra, devolver un error 404
            if (!$caso) {
                return response()->json([
                    'message' => 'Caso general no encontrado con el número proporcionado.',
                ], 404);
            }

            // Devolver los detalles del caso encontrado
            return response()->json([
                'message' => 'Caso general encontrado.',
                'caso' => $caso,
            ], 200);

        } catch (\Exception $e) {
            // Manejo de errores en la búsqueda
            \Log::error('Error al buscar caso general: ' . $e->getMessage() . ' en ' . $e->getFile() . ' línea ' . $e->getLine());
            return response()->json([
                'message' => 'Hubo un error al buscar el caso. Por favor, intente de nuevo.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Puedes añadir métodos adicionales aquí para 'update' (actualizar) o 'destroy' (eliminar) casos, si es necesario.

    /**
     * Obtiene estadísticas generales de los casos.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEstadisticas()
    {
        try {
            // Estadísticas generales
            $totalCasos = CasoGeneral::count();
            $casosPendientes = CasoGeneral::where('estado', 'Pendiente')->count();
            $casosEnProceso = CasoGeneral::where('estado', 'En Proceso')->count();
            $casosResueltos = CasoGeneral::where('estado', 'Resuelto')->count();
            $casosCerrados = CasoGeneral::where('estado', 'Cerrado')->count();

            // Casos por mes (últimos 6 meses)
            $casosPorMes = CasoGeneral::selectRaw('DATE_FORMAT(fecha, "%Y-%m") as mes, COUNT(*) as total')
                ->where('fecha', '>=', now()->subMonths(6))
                ->groupBy('mes')
                ->orderBy('mes', 'desc')
                ->get();

            // Top 5 responsables con más casos
            $topResponsables = CasoGeneral::selectRaw('responsable, COUNT(*) as total_casos')
                ->groupBy('responsable')
                ->orderBy('total_casos', 'desc')
                ->limit(5)
                ->get();

            // Top 5 fichas con más casos
            $topFichas = CasoGeneral::selectRaw('numero_ficha, COUNT(*) as total_casos')
                ->groupBy('numero_ficha')
                ->orderBy('total_casos', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'message' => 'Estadísticas obtenidas exitosamente.',
                'estadisticas' => [
                    'total_casos' => $totalCasos,
                    'por_estado' => [
                        'pendientes' => $casosPendientes,
                        'en_proceso' => $casosEnProceso,
                        'resueltos' => $casosResueltos,
                        'cerrados' => $casosCerrados,
                    ],
                    'casos_por_mes' => $casosPorMes,
                    'top_responsables' => $topResponsables,
                    'top_fichas' => $topFichas,
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener estadísticas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al obtener las estadísticas.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtiene valores únicos de campos para usar en filtros.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getValoresFiltros()
    {
        try {
            // Obtener estados únicos
            $estados = CasoGeneral::distinct()->pluck('estado')->filter()->values();

            // Obtener tipos de documento únicos
            $tiposDocumento = CasoGeneral::distinct()->pluck('tipo_documento')->filter()->values();

            // Obtener responsables únicos
            $responsables = CasoGeneral::distinct()->pluck('responsable')->filter()->values();

            // Obtener fichas únicas
            $fichas = CasoGeneral::distinct()->pluck('numero_ficha')->filter()->values();

            // Obtener años disponibles para filtros de fecha
            $anios = CasoGeneral::selectRaw('YEAR(fecha) as anio')
                ->distinct()
                ->whereNotNull('fecha')
                ->pluck('anio')
                ->sort()
                ->values();

            return response()->json([
                'message' => 'Valores de filtros obtenidos exitosamente.',
                'filtros' => [
                    'estados' => $estados,
                    'tipos_documento' => $tiposDocumento,
                    'responsables' => $responsables,
                    'fichas' => $fichas,
                    'anios' => $anios,
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener valores de filtros: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al obtener los valores de filtros.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
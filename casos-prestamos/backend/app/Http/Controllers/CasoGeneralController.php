<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CasoGeneral; // Asegúrate de que este modelo exista y esté en la ruta correcta
use App\Models\ArchivoCaso; // Asegúrate de que este modelo exista y esté en la ruta correcta
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon; // Necesario para manejar fechas, asegúrate de tenerlo instalado (viene por defecto con Laravel)

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
    public function store(Request $request)
    {
        // 1. Validación de los campos requeridos en el formulario
        // Laravel's built-in validator is powerful and easy to use.
        try {
            $request->validate([
                'fecha' => 'required|date',
                'nombre_aprendiz' => 'required|string|max:255',
                'tipo_documento' => 'required|string|max:50',
                'numero_documento' => 'required|string|max:50',
                'numero_ficha' => 'required|string|max:50',
                'motivo' => 'required|string',
                'responsable' => 'required|string|max:255',
                // Validación para la firma: opcional, debe ser imagen, tipos específicos, tamaño máximo 2MB
                'firma_aprendiz' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // max:2048 significa 2048 KB = 2 MB
            ], [
                // Mensajes personalizados para los errores de validación
                'required' => 'El campo :attribute es obligatorio.',
                'date' => 'El campo :attribute debe ser una fecha válida.',
                'string' => 'El campo :attribute debe ser texto.',
                'max' => 'El campo :attribute no debe exceder :max caracteres o :max KB.',
                'image' => 'El archivo de :attribute debe ser una imagen.',
                'mimes' => 'La :attribute debe ser de tipo: :values.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Captura los errores de validación y los devuelve como una respuesta JSON 422
            return response()->json([
                'message' => 'Error de validación en los datos proporcionados.',
                'errors' => $e->errors(),
            ], 422);
        }

        // Iniciar una transacción de base de datos para asegurar la atomicidad
        DB::beginTransaction();

        try {
            // 2. Implementar lógica para generar número de caso único
            $numeroCaso = $this->generateUniqueCaseNumber();

            // 3. Crear el registro del caso general en la base de datos
            $caso = CasoGeneral::create([
                'numero_caso' => $numeroCaso,
                'fecha' => $request->fecha,
                'nombre_aprendiz' => $request->nombre_aprendiz,
                'tipo_documento' => $request->tipo_documento,
                'numero_documento' => $request->numero_documento,
                'numero_ficha' => $request->numero_ficha,
                'motivo' => $request->motivo,
                'responsable' => $request->responsable,
                'categoria_caso' => 'Caso General', // Según lo especificado en la tarea
                'estado' => 'Pendiente', // Estado inicial por defecto
            ]);

            // 4. Procesar y guardar la firma si se ha adjuntado un archivo
            if ($request->hasFile('firma_aprendiz')) {
                $file = $request->file('firma_aprendiz');
                // Generar un nombre de archivo único para evitar colisiones
                $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
                // Definir la ruta de almacenamiento dentro del disco 'public'
                $filePath = 'firmas/' . $filename;

                // Guardar el archivo en el sistema de almacenamiento de Laravel
                // El 'disk' 'public' se refiere a storage/app/public, que se enlaza a public/storage
                Storage::disk('public')->put($filePath, file_get_contents($file));

                // 5. Relacionar el archivo subido con el caso general recién creado
                ArchivoCaso::create([
                    'caso_id' => $caso->id, // Usa el ID del caso general recién creado
                    'nombre_archivo' => $file->getClientOriginalName(), // Nombre original del archivo
                    'ruta_archivo' => $filePath, // Ruta relativa para accederlo
                    'tipo_mime' => $file->getClientMimeType(),
                    'tamano_bytes' => $file->getSize(),
                    'tipo_archivo' => 'Firma', // Tipo específico de archivo para este caso
                ]);
            }

            // Si todo ha ido bien, confirmar la transacción
            DB::commit();

            // Devolver una respuesta JSON con el éxito y el número de caso generado
            return response()->json([
                'message' => 'Caso general registrado exitosamente.',
                'numero_caso' => $caso->numero_caso, // Devuelve el número de caso único
                'caso_id' => $caso->id, // Devuelve el ID del caso
            ], 201); // Código de estado HTTP 201 (Created)

        } catch (\Exception $e) {
            // Si ocurre algún error, revertir la transacción
            DB::rollBack();

            // Registrar el error para depuración
            \Log::error('Error al registrar caso general: ' . $e->getMessage() . ' en ' . $e->getFile() . ' línea ' . $e->getLine());

            // Devolver una respuesta de error JSON 500
            return response()->json([
                'message' => 'Hubo un error al procesar la solicitud. Por favor, intente de nuevo.',
                'error' => $e->getMessage(),
            ], 500);
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
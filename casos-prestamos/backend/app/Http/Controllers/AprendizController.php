<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aprendiz;
use App\Models\CasoGeneral;
use Illuminate\Support\Facades\DB;

class AprendizController extends Controller
{
    /**
     * Obtener todos los aprendices con paginación y filtros avanzados
     */
    public function index(Request $request)
    {
        try {
            $query = Aprendiz::query();

            // ================================================================
            // FILTROS POR NOMBRE
            // ================================================================
            if ($request->filled('nombre')) {
                $query->where('nombre', 'like', '%' . $request->input('nombre') . '%');
            }

            // ================================================================
            // FILTROS POR DOCUMENTO
            // ================================================================
            if ($request->filled('numero_documento')) {
                $query->where('numero_documento', $request->input('numero_documento'));
            }

            if ($request->filled('tipo_documento')) {
                $query->where('tipo_documento', $request->input('tipo_documento'));
            }

            // ================================================================
            // FILTROS POR FICHA
            // ================================================================
            if ($request->filled('numero_ficha')) {
                $query->where('numero_ficha', $request->input('numero_ficha'));
            }

            // ================================================================
            // FILTROS POR ESTADO
            // ================================================================
            if ($request->filled('estado')) {
                $query->where('estado', $request->input('estado'));
            }

            // ================================================================
            // FILTROS POR EMAIL
            // ================================================================
            if ($request->filled('email')) {
                $query->where('email', 'like', '%' . $request->input('email') . '%');
            }

            // ================================================================
            // FILTROS POR TELÉFONO
            // ================================================================
            if ($request->filled('telefono')) {
                $query->where('telefono', 'like', '%' . $request->input('telefono') . '%');
            }

            // ================================================================
            // FILTROS POR FECHA
            // ================================================================
            if ($request->filled('fecha_registro_desde')) {
                $query->where('created_at', '>=', $request->input('fecha_registro_desde'));
            }

            if ($request->filled('fecha_registro_hasta')) {
                $query->where('created_at', '<=', $request->input('fecha_registro_hasta'));
            }

            // ================================================================
            // ORDENAMIENTO
            // ================================================================
            $sortBy = $request->input('sort_by', 'nombre');
            $sortDirection = $request->input('sort_direction', 'asc');
            
            $allowedSortFields = ['nombre', 'numero_documento', 'numero_ficha', 'estado', 'email', 'created_at'];
            if (!in_array($sortBy, $allowedSortFields)) {
                $sortBy = 'nombre';
            }
            
            if (!in_array($sortDirection, ['asc', 'desc'])) {
                $sortDirection = 'asc';
            }
            
            $query->orderBy($sortBy, $sortDirection);

            // ================================================================
            // PAGINACIÓN
            // ================================================================
            $perPage = $request->input('per_page', 15);
            $perPage = min(max($perPage, 1), 100);
            
            $aprendices = $query->withCount('casos')->paginate($perPage);

            // ================================================================
            // PREPARAR RESPUESTA
            // ================================================================
            $filtrosAplicados = [];
            $filtrosDisponibles = [
                'nombre', 'numero_documento', 'tipo_documento', 'numero_ficha',
                'estado', 'email', 'telefono', 'fecha_registro_desde', 'fecha_registro_hasta'
            ];
            
            foreach ($filtrosDisponibles as $filtro) {
                if ($request->filled($filtro)) {
                    $filtrosAplicados[$filtro] = $request->input($filtro);
                }
            }

            return response()->json([
                'message' => 'Aprendices consultados exitosamente.',
                'aprendices' => $aprendices->items(),
                'paginacion' => [
                    'current_page' => $aprendices->currentPage(),
                    'last_page' => $aprendices->lastPage(),
                    'per_page' => $aprendices->perPage(),
                    'total' => $aprendices->total(),
                    'from' => $aprendices->firstItem(),
                    'to' => $aprendices->lastItem(),
                ],
                'filtros_aplicados' => $filtrosAplicados,
                'ordenamiento' => [
                    'campo' => $sortBy,
                    'direccion' => $sortDirection
                ],
                'estadisticas' => [
                    'total_aprendices' => $aprendices->total(),
                    'aprendices_encontrados' => count($aprendices->items()),
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al consultar aprendices: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al consultar los aprendices.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener aprendiz específico por número de documento
     */
    public function show(string $numero_documento)
    {
        try {
            $aprendiz = Aprendiz::where('numero_documento', $numero_documento)
                ->with(['casos' => function($query) {
                    $query->orderBy('fecha', 'desc');
                }])
                ->first();

            if (!$aprendiz) {
                return response()->json([
                    'message' => 'Aprendiz no encontrado.',
                ], 404);
            }

            return response()->json([
                'message' => 'Aprendiz encontrado exitosamente.',
                'aprendiz' => $aprendiz,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener aprendiz: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al obtener el aprendiz.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Crear o actualizar aprendiz
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255',
                'numero_documento' => 'required|string|max:20|unique:aprendices,numero_documento',
                'tipo_documento' => 'required|string|max:10',
                'numero_ficha' => 'required|string|max:20',
                'email' => 'nullable|email|max:255',
                'telefono' => 'nullable|string|max:20',
                'estado' => 'required|string|max:50',
            ]);

            $aprendiz = Aprendiz::create($request->all());

            return response()->json([
                'message' => 'Aprendiz creado exitosamente.',
                'aprendiz' => $aprendiz,
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error al crear aprendiz: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al crear el aprendiz.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Actualizar aprendiz
     */
    public function update(Request $request, string $numero_documento)
    {
        try {
            $aprendiz = Aprendiz::where('numero_documento', $numero_documento)->first();

            if (!$aprendiz) {
                return response()->json([
                    'message' => 'Aprendiz no encontrado.',
                ], 404);
            }

            $request->validate([
                'nombre' => 'sometimes|required|string|max:255',
                'tipo_documento' => 'sometimes|required|string|max:10',
                'numero_ficha' => 'sometimes|required|string|max:20',
                'email' => 'nullable|email|max:255',
                'telefono' => 'nullable|string|max:20',
                'estado' => 'sometimes|required|string|max:50',
            ]);

            $aprendiz->update($request->all());

            return response()->json([
                'message' => 'Aprendiz actualizado exitosamente.',
                'aprendiz' => $aprendiz,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al actualizar aprendiz: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al actualizar el aprendiz.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de aprendices
     */
    public function getEstadisticas()
    {
        try {
            // Estadísticas por estado
            $porEstado = Aprendiz::select('estado', DB::raw('count(*) as total'))
                ->groupBy('estado')
                ->pluck('total', 'estado')
                ->toArray();

            // Aprendices por mes (últimos 12 meses)
            $porMes = Aprendiz::selectRaw('YEAR(created_at) as anio, MONTH(created_at) as mes, count(*) as total')
                ->where('created_at', '>=', now()->subMonths(12))
                ->groupBy('anio', 'mes')
                ->orderBy('anio', 'desc')
                ->orderBy('mes', 'desc')
                ->get();

            // Top fichas con más aprendices
            $topFichas = Aprendiz::select('numero_ficha', DB::raw('count(*) as total'))
                ->groupBy('numero_ficha')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get();

            // Total de aprendices
            $totalAprendices = Aprendiz::count();

            // Aprendices activos
            $aprendicesActivos = Aprendiz::where('estado', 'Activo')->count();

            return response()->json([
                'message' => 'Estadísticas obtenidas exitosamente.',
                'estadisticas' => [
                    'total_aprendices' => $totalAprendices,
                    'aprendices_activos' => $aprendicesActivos,
                    'por_estado' => $porEstado,
                    'por_mes' => $porMes,
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
     * Obtener valores únicos para filtros
     */
    public function getValoresFiltros()
    {
        try {
            // Estados únicos
            $estados = Aprendiz::distinct()->pluck('estado')->filter()->values();

            // Tipos de documento únicos
            $tiposDocumento = Aprendiz::distinct()->pluck('tipo_documento')->filter()->values();

            // Fichas únicas
            $fichas = Aprendiz::distinct()->pluck('numero_ficha')->filter()->values();

            // Años disponibles para filtros de fecha
            $anios = Aprendiz::selectRaw('YEAR(created_at) as anio')
                ->distinct()
                ->whereNotNull('created_at')
                ->pluck('anio')
                ->sort()
                ->values();

            return response()->json([
                'message' => 'Valores de filtros obtenidos exitosamente.',
                'filtros' => [
                    'estados' => $estados,
                    'tipos_documento' => $tiposDocumento,
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
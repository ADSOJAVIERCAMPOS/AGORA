<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CasoGeneral;
use App\Models\ArchivoCaso;
use App\Models\Aprendiz;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArchivoCasoController extends Controller
{
    /**
     * Buscar archivos con filtros avanzados
     */
    public function index(Request $request)
    {
        try {
            $query = ArchivoCaso::query()->with(['casoGeneral']);

            // ================================================================
            // FILTROS POR NOMBRE DE ARCHIVO
            // ================================================================
            if ($request->filled('nombre_archivo')) {
                $query->where('nombre_archivo', 'like', '%' . $request->input('nombre_archivo') . '%');
            }

            // ================================================================
            // FILTROS POR TIPO DE ARCHIVO
            // ================================================================
            if ($request->filled('tipo_archivo')) {
                $query->where('tipo_archivo', $request->input('tipo_archivo'));
            }

            // ================================================================
            // FILTROS POR TIPO MIME
            // ================================================================
            if ($request->filled('tipo_mime')) {
                $query->where('tipo_mime', 'like', '%' . $request->input('tipo_mime') . '%');
            }

            // ================================================================
            // FILTROS POR TAMAÑO
            // ================================================================
            if ($request->filled('tamano_min')) {
                $query->where('tamano_bytes', '>=', $request->input('tamano_min'));
            }

            if ($request->filled('tamano_max')) {
                $query->where('tamano_bytes', '<=', $request->input('tamano_max'));
            }

            // ================================================================
            // FILTROS POR CASO
            // ================================================================
            if ($request->filled('numero_caso')) {
                $query->whereHas('casoGeneral', function($q) use ($request) {
                    $q->where('numero_caso', 'like', '%' . $request->input('numero_caso') . '%');
                });
            }

            // ================================================================
            // FILTROS POR APRENDIZ
            // ================================================================
            if ($request->filled('numero_documento')) {
                $query->whereHas('casoGeneral', function($q) use ($request) {
                    $q->where('numero_documento', $request->input('numero_documento'));
                });
            }

            if ($request->filled('nombre_aprendiz')) {
                $query->whereHas('casoGeneral', function($q) use ($request) {
                    $q->where('nombre_aprendiz', 'like', '%' . $request->input('nombre_aprendiz') . '%');
                });
            }

            // ================================================================
            // FILTROS POR FICHA
            // ================================================================
            if ($request->filled('numero_ficha')) {
                $query->whereHas('casoGeneral', function($q) use ($request) {
                    $q->where('numero_ficha', $request->input('numero_ficha'));
                });
            }

            // ================================================================
            // FILTROS POR FECHA
            // ================================================================
            if ($request->filled('fecha_desde')) {
                $query->where('created_at', '>=', $request->input('fecha_desde'));
            }

            if ($request->filled('fecha_hasta')) {
                $query->where('created_at', '<=', $request->input('fecha_hasta'));
            }

            // ================================================================
            // FILTROS POR DESCRIPCIÓN
            // ================================================================
            if ($request->filled('descripcion')) {
                $query->where('descripcion', 'like', '%' . $request->input('descripcion') . '%');
            }

            // ================================================================
            // ORDENAMIENTO
            // ================================================================
            $sortBy = $request->input('sort_by', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            
            $allowedSortFields = ['nombre_archivo', 'tipo_archivo', 'tamano_bytes', 'created_at', 'updated_at'];
            if (!in_array($sortBy, $allowedSortFields)) {
                $sortBy = 'created_at';
            }
            
            if (!in_array($sortDirection, ['asc', 'desc'])) {
                $sortDirection = 'desc';
            }
            
            $query->orderBy($sortBy, $sortDirection);

            // ================================================================
            // PAGINACIÓN
            // ================================================================
            $perPage = $request->input('per_page', 15);
            $perPage = min(max($perPage, 1), 100);
            
            $archivos = $query->paginate($perPage);

            // ================================================================
            // PREPARAR RESPUESTA
            // ================================================================
            $filtrosAplicados = [];
            $filtrosDisponibles = [
                'nombre_archivo', 'tipo_archivo', 'tipo_mime', 'tamano_min', 'tamano_max',
                'numero_caso', 'numero_documento', 'nombre_aprendiz', 'numero_ficha',
                'fecha_desde', 'fecha_hasta', 'descripcion'
            ];
            
            foreach ($filtrosDisponibles as $filtro) {
                if ($request->filled($filtro)) {
                    $filtrosAplicados[$filtro] = $request->input($filtro);
                }
            }

            return response()->json([
                'message' => 'Archivos consultados exitosamente.',
                'archivos' => $archivos->items(),
                'paginacion' => [
                    'current_page' => $archivos->currentPage(),
                    'last_page' => $archivos->lastPage(),
                    'per_page' => $archivos->perPage(),
                    'total' => $archivos->total(),
                    'from' => $archivos->firstItem(),
                    'to' => $archivos->lastItem(),
                ],
                'filtros_aplicados' => $filtrosAplicados,
                'ordenamiento' => [
                    'campo' => $sortBy,
                    'direccion' => $sortDirection
                ],
                'estadisticas' => [
                    'total_archivos' => $archivos->total(),
                    'archivos_encontrados' => count($archivos->items()),
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al consultar archivos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al consultar los archivos.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Subir archivo a un caso específico
     */
    public function subirArchivo(Request $request, string $numero_caso)
    {
        try {
            // Validar que el caso existe
            $caso = CasoGeneral::where('numero_caso', $numero_caso)->first();
            if (!$caso) {
                return response()->json([
                    'message' => 'Caso no encontrado.',
                ], 404);
            }

            // Validar el archivo
            $request->validate([
                'archivo' => 'required|file|max:10240', // Máximo 10MB
                'descripcion' => 'nullable|string|max:500',
            ]);

            $archivo = $request->file('archivo');
            $nombreOriginal = $archivo->getClientOriginalName();
            $extension = $archivo->getClientOriginalExtension();
            $tamano = $archivo->getSize();
            $tipoMime = $archivo->getMimeType();

            // Determinar tipo de archivo
            $tipoArchivo = $this->determinarTipoArchivo($tipoMime, $extension);

            // Generar nombre único para el archivo
            $nombreUnico = time() . '_' . uniqid() . '.' . $extension;
            $ruta = 'archivos_casos/' . $numero_caso . '/' . $nombreUnico;

            // Guardar archivo en storage
            $archivo->storeAs('public/' . dirname($ruta), basename($ruta));

            // Crear registro en base de datos
            $archivoCaso = ArchivoCaso::create([
                'caso_id' => $caso->id,
                'nombre_archivo' => $nombreOriginal,
                'ruta_archivo' => $ruta,
                'tipo_mime' => $tipoMime,
                'tamano_bytes' => $tamano,
                'tipo_archivo' => $tipoArchivo,
                'descripcion' => $request->input('descripcion'),
            ]);

            return response()->json([
                'message' => 'Archivo subido exitosamente.',
                'archivo' => $archivoCaso,
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error al subir archivo: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al subir el archivo.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener archivos de un caso específico
     */
    public function obtenerArchivosCaso(string $numero_caso)
    {
        try {
            $caso = CasoGeneral::where('numero_caso', $numero_caso)->first();
            if (!$caso) {
                return response()->json([
                    'message' => 'Caso no encontrado.',
                ], 404);
            }

            $archivos = ArchivoCaso::where('caso_id', $caso->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'message' => 'Archivos del caso obtenidos exitosamente.',
                'archivos' => $archivos,
                'caso' => [
                    'numero_caso' => $caso->numero_caso,
                    'nombre_aprendiz' => $caso->nombre_aprendiz,
                    'total_archivos' => $archivos->count(),
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener archivos del caso: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al obtener los archivos del caso.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener archivos por número de documento del aprendiz
     */
    public function obtenerArchivosPorDocumento(string $numero_documento)
    {
        try {
            $aprendiz = Aprendiz::where('numero_documento', $numero_documento)->first();
            if (!$aprendiz) {
                return response()->json([
                    'message' => 'Aprendiz no encontrado.',
                ], 404);
            }

            $archivos = ArchivoCaso::whereHas('casoGeneral', function($query) use ($numero_documento) {
                $query->where('numero_documento', $numero_documento);
            })->with('casoGeneral')->orderBy('created_at', 'desc')->get();

            return response()->json([
                'message' => 'Archivos del aprendiz obtenidos exitosamente.',
                'archivos' => $archivos,
                'aprendiz' => [
                    'nombre' => $aprendiz->nombre,
                    'numero_documento' => $aprendiz->numero_documento,
                    'total_archivos' => $archivos->count(),
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al obtener archivos del aprendiz: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al obtener los archivos del aprendiz.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar archivo específico
     */
    public function eliminarArchivo(string $numero_caso, int $archivo_id)
    {
        try {
            $caso = CasoGeneral::where('numero_caso', $numero_caso)->first();
            if (!$caso) {
                return response()->json([
                    'message' => 'Caso no encontrado.',
                ], 404);
            }

            $archivo = ArchivoCaso::where('id', $archivo_id)
                ->where('caso_id', $caso->id)
                ->first();

            if (!$archivo) {
                return response()->json([
                    'message' => 'Archivo no encontrado.',
                ], 404);
            }

            // Eliminar archivo físico
            if ($archivo->archivoExiste()) {
                $archivo->eliminarArchivoFisico();
            }

            // Eliminar registro de la base de datos
            $archivo->delete();

            return response()->json([
                'message' => 'Archivo eliminado exitosamente.',
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al eliminar archivo: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al eliminar el archivo.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Descargar archivo
     */
    public function descargarArchivo(string $numero_caso, int $archivo_id)
    {
        try {
            $caso = CasoGeneral::where('numero_caso', $numero_caso)->first();
            if (!$caso) {
                return response()->json([
                    'message' => 'Caso no encontrado.',
                ], 404);
            }

            $archivo = ArchivoCaso::where('id', $archivo_id)
                ->where('caso_id', $caso->id)
                ->first();

            if (!$archivo) {
                return response()->json([
                    'message' => 'Archivo no encontrado.',
                ], 404);
            }

            if (!$archivo->archivoExiste()) {
                return response()->json([
                    'message' => 'El archivo físico no existe.',
                ], 404);
            }

            $rutaCompleta = Storage::disk('public')->path($archivo->ruta_archivo);
            
            return response()->download($rutaCompleta, $archivo->nombre_archivo);

        } catch (\Exception $e) {
            \Log::error('Error al descargar archivo: ' . $e->getMessage());
            return response()->json([
                'message' => 'Hubo un error al descargar el archivo.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de archivos
     */
    public function getEstadisticas()
    {
        try {
            // Estadísticas por tipo de archivo
            $porTipo = ArchivoCaso::select('tipo_archivo', DB::raw('count(*) as total'))
                ->groupBy('tipo_archivo')
                ->pluck('total', 'tipo_archivo')
                ->toArray();

            // Archivos por mes (últimos 12 meses)
            $porMes = ArchivoCaso::selectRaw('YEAR(created_at) as anio, MONTH(created_at) as mes, count(*) as total')
                ->where('created_at', '>=', now()->subMonths(12))
                ->groupBy('anio', 'mes')
                ->orderBy('anio', 'desc')
                ->orderBy('mes', 'desc')
                ->get();

            // Top casos con más archivos
            $topCasos = ArchivoCaso::select('caso_id', DB::raw('count(*) as total'))
                ->groupBy('caso_id')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->with('casoGeneral')
                ->get();

            // Total de archivos y tamaño
            $totalArchivos = ArchivoCaso::count();
            $tamanoTotal = ArchivoCaso::sum('tamano_bytes');

            return response()->json([
                'message' => 'Estadísticas obtenidas exitosamente.',
                'estadisticas' => [
                    'total_archivos' => $totalArchivos,
                    'tamano_total_bytes' => $tamanoTotal,
                    'tamano_total_formateado' => $this->formatearTamano($tamanoTotal),
                    'por_tipo' => $porTipo,
                    'por_mes' => $porMes,
                    'top_casos' => $topCasos,
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
            // Tipos de archivo únicos
            $tiposArchivo = ArchivoCaso::distinct()->pluck('tipo_archivo')->filter()->values();

            // Tipos MIME únicos
            $tiposMime = ArchivoCaso::distinct()->pluck('tipo_mime')->filter()->values();

            // Años disponibles para filtros de fecha
            $anios = ArchivoCaso::selectRaw('YEAR(created_at) as anio')
                ->distinct()
                ->whereNotNull('created_at')
                ->pluck('anio')
                ->sort()
                ->values();

            return response()->json([
                'message' => 'Valores de filtros obtenidos exitosamente.',
                'filtros' => [
                    'tipos_archivo' => $tiposArchivo,
                    'tipos_mime' => $tiposMime,
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

    /**
     * Determinar tipo de archivo basado en MIME type y extensión
     */
    private function determinarTipoArchivo($tipoMime, $extension)
    {
        $tiposMime = [
            'application/pdf' => 'pdf',
            'image/jpeg' => 'imagen',
            'image/png' => 'imagen',
            'image/gif' => 'imagen',
            'image/webp' => 'imagen',
            'video/mp4' => 'video',
            'video/avi' => 'video',
            'video/mov' => 'video',
            'audio/mpeg' => 'audio',
            'audio/wav' => 'audio',
            'audio/mp3' => 'audio',
            'text/plain' => 'documento',
            'application/msword' => 'documento',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'documento',
            'application/vnd.ms-excel' => 'documento',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'documento',
        ];

        if (isset($tiposMime[$tipoMime])) {
            return $tiposMime[$tipoMime];
        }

        // Fallback por extensión
        $extensiones = [
            'pdf' => 'pdf',
            'jpg' => 'imagen', 'jpeg' => 'imagen', 'png' => 'imagen', 'gif' => 'imagen',
            'mp4' => 'video', 'avi' => 'video', 'mov' => 'video',
            'mp3' => 'audio', 'wav' => 'audio',
            'txt' => 'documento', 'doc' => 'documento', 'docx' => 'documento',
            'xls' => 'documento', 'xlsx' => 'documento',
        ];

        return $extensiones[strtolower($extension)] ?? 'documento';
    }

    /**
     * Formatear tamaño en bytes a formato legible
     */
    private function formatearTamano($bytes)
    {
        if ($bytes === 0) return '0 Bytes';
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes) / log($k));
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }
} 
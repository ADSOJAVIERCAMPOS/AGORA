<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ArchivoCaso extends Model
{
    use HasFactory;

    protected $table = 'archivos_casos'; // Especifica el nombre de la tabla
    protected $fillable = [
        'caso_id',
        'nombre_archivo',
        'ruta_archivo',
        'tipo_mime',
        'tamano_bytes',
        'tipo_archivo',
        'descripcion',
    ];

    /**
     * Relación inversa uno a muchos con CasoGeneral
     * Un archivo pertenece a un caso
     */
    public function casoGeneral()
    {
        return $this->belongsTo(CasoGeneral::class, 'caso_id');
    }

    /**
     * Obtener la URL completa del archivo
     */
    public function getUrlAttribute()
    {
        return Storage::disk('public')->url($this->ruta_archivo);
    }

    /**
     * Obtener el tamaño del archivo en formato legible
     */
    public function getTamanoFormateadoAttribute()
    {
        $bytes = $this->tamano_bytes;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Verificar si el archivo existe en el almacenamiento
     */
    public function archivoExiste()
    {
        return Storage::disk('public')->exists($this->ruta_archivo);
    }

    /**
     * Eliminar archivo físico del almacenamiento
     */
    public function eliminarArchivoFisico()
    {
        if ($this->archivoExiste()) {
            return Storage::disk('public')->delete($this->ruta_archivo);
        }
        return false;
    }

    /**
     * Buscar archivos por tipo
     */
    public static function buscarPorTipo($tipoArchivo)
    {
        return static::where('tipo_archivo', $tipoArchivo)->with('casoGeneral')->get();
    }

    /**
     * Buscar archivos por caso
     */
    public static function buscarPorCaso($casoId)
    {
        return static::where('caso_id', $casoId)->orderBy('created_at', 'desc')->get();
    }
}
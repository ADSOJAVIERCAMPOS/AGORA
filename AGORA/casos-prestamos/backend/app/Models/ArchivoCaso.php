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

    // Casts para asegurar tipos de datos correctos
    protected $casts = [
        'tamano_bytes' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Valores por defecto
    protected $attributes = [
        'tipo_archivo' => 'Documento',
    ];

    // Mutators para limpiar datos antes de guardar
    public function setNombreArchivoAttribute($value)
    {
        $this->attributes['nombre_archivo'] = trim($value);
    }

    public function setRutaArchivoAttribute($value)
    {
        $this->attributes['ruta_archivo'] = trim($value);
    }

    public function setTipoArchivoAttribute($value)
    {
        $this->attributes['tipo_archivo'] = ucfirst(strtolower(trim($value)));
    }

    public function setDescripcionAttribute($value)
    {
        $this->attributes['descripcion'] = $value ? trim($value) : null;
    }

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
        return static::where('tipo_archivo', ucfirst(strtolower(trim($tipoArchivo))))
                    ->with('casoGeneral')
                    ->get();
    }

    /**
     * Buscar archivos por caso
     */
    public static function buscarPorCaso($casoId)
    {
        return static::where('caso_id', $casoId)
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    // Accessors para formatear datos
    public function getExtensionAttribute()
    {
        return pathinfo($this->nombre_archivo, PATHINFO_EXTENSION);
    }

    public function getEsImagenAttribute()
    {
        $extensionesImagen = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        return in_array(strtolower($this->extension), $extensionesImagen);
    }

    public function getEsPdfAttribute()
    {
        return strtolower($this->extension) === 'pdf';
    }

    // Scopes para consultas comunes
    public function scopePorTipo($query, $tipoArchivo)
    {
        return $query->where('tipo_archivo', $tipoArchivo);
    }

    public function scopePorCaso($query, $casoId)
    {
        return $query->where('caso_id', $casoId);
    }

    public function scopeImagenes($query)
    {
        return $query->whereIn('tipo_mime', ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']);
    }

    public function scopePdfs($query)
    {
        return $query->where('tipo_mime', 'application/pdf');
    }

    // Validación personalizada
    public static function rules()
    {
        return [
            'caso_id' => 'required|exists:casos_generales,id',
            'nombre_archivo' => 'required|string|max:255',
            'ruta_archivo' => 'required|string|max:500',
            'tipo_mime' => 'required|string|max:100',
            'tamano_bytes' => 'required|integer|min:1',
            'tipo_archivo' => 'required|string|max:50',
            'descripcion' => 'nullable|string|max:500',
        ];
    }

    public static function messages()
    {
        return [
            'caso_id.required' => 'El ID del caso es obligatorio.',
            'caso_id.exists' => 'El caso especificado no existe.',
            'nombre_archivo.required' => 'El nombre del archivo es obligatorio.',
            'ruta_archivo.required' => 'La ruta del archivo es obligatoria.',
            'tipo_mime.required' => 'El tipo MIME es obligatorio.',
            'tamano_bytes.required' => 'El tamaño del archivo es obligatorio.',
            'tamano_bytes.integer' => 'El tamaño debe ser un número entero.',
            'tamano_bytes.min' => 'El tamaño debe ser mayor a 0.',
            'tipo_archivo.required' => 'El tipo de archivo es obligatorio.',
        ];
    }

    // Hook para eliminar archivo físico cuando se elimina el registro
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($archivo) {
            $archivo->eliminarArchivoFisico();
        });
    }
}
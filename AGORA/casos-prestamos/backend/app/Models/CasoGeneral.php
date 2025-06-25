<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class CasoGeneral extends Model
{
    use HasFactory;

    protected $table = 'casos_generales'; // Especifica el nombre de la tabla
    protected $fillable = [
        'numero_caso',
        'fecha',
        'nombre_aprendiz',
        'tipo_documento',
        'numero_documento',
        'numero_ficha',
        'motivo',
        'responsable',
        'categoria_caso',
        'estado',
    ];

    // Casts para asegurar tipos de datos correctos
    protected $casts = [
        'fecha' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Valores por defecto
    protected $attributes = [
        'categoria_caso' => 'Caso General',
        'estado' => 'Pendiente',
    ];

    // Mutators para limpiar datos antes de guardar
    public function setNombreAprendizAttribute($value)
    {
        $this->attributes['nombre_aprendiz'] = ucwords(strtolower(trim($value)));
    }

    public function setNumeroDocumentoAttribute($value)
    {
        $this->attributes['numero_documento'] = trim($value);
    }

    public function setNumeroFichaAttribute($value)
    {
        $this->attributes['numero_ficha'] = trim($value);
    }

    public function setResponsableAttribute($value)
    {
        $this->attributes['responsable'] = ucwords(strtolower(trim($value)));
    }

    public function setMotivoAttribute($value)
    {
        $this->attributes['motivo'] = trim($value);
    }

    // Accessors para formatear datos
    public function getFechaFormateadaAttribute()
    {
        return $this->fecha ? $this->fecha->format('d/m/Y') : '';
    }

    public function getEstadoColorAttribute()
    {
        $colores = [
            'Pendiente' => 'warning',
            'En Proceso' => 'info',
            'Resuelto' => 'success',
            'Cancelado' => 'danger',
        ];
        
        return $colores[$this->estado] ?? 'secondary';
    }

    // Scopes para consultas comunes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'Pendiente');
    }

    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    public function scopePorFicha($query, $numeroFicha)
    {
        return $query->where('numero_ficha', $numeroFicha);
    }

    public function scopePorDocumento($query, $numeroDocumento)
    {
        return $query->where('numero_documento', $numeroDocumento);
    }

    /**
     * Relación uno a muchos con ArchivoCaso
     * Un caso puede tener múltiples archivos
     */
    public function archivos()
    {
        return $this->hasMany(ArchivoCaso::class, 'caso_id');
    }

    /**
     * Relación muchos a uno con Aprendiz
     * Un caso pertenece a un aprendiz
     */
    public function aprendiz()
    {
        return $this->belongsTo(Aprendiz::class, 'numero_documento', 'numero_documento');
    }

    /**
     * Buscar caso por número de caso
     */
    public static function buscarPorNumeroCaso($numeroCaso)
    {
        return static::where('numero_caso', $numeroCaso)
                    ->with(['archivos', 'aprendiz'])
                    ->first();
    }

    /**
     * Buscar casos por número de documento del aprendiz
     */
    public static function buscarPorDocumentoAprendiz($numeroDocumento)
    {
        return static::where('numero_documento', trim($numeroDocumento))
                    ->with(['archivos', 'aprendiz'])
                    ->orderBy('fecha', 'desc')
                    ->get();
    }

    /**
     * Buscar casos por número de ficha
     */
    public static function buscarPorFicha($numeroFicha)
    {
        return static::where('numero_ficha', trim($numeroFicha))
                    ->with(['archivos', 'aprendiz'])
                    ->orderBy('fecha', 'desc')
                    ->get();
    }

    /**
     * Obtener todos los archivos asociados al caso
     */
    public function obtenerArchivos()
    {
        return $this->archivos()->orderBy('created_at', 'desc')->get();
    }

    /**
     * Agregar archivo al caso
     */
    public function agregarArchivo($datosArchivo)
    {
        return $this->archivos()->create($datosArchivo);
    }

    // Validación personalizada
    public static function rules()
    {
        return [
            'fecha' => 'required|date',
            'nombre_aprendiz' => 'required|string|max:255',
            'tipo_documento' => 'required|string|max:50',
            'numero_documento' => 'required|string|max:50',
            'numero_ficha' => 'required|string|max:50',
            'motivo' => 'required|string',
            'responsable' => 'required|string|max:255',
        ];
    }

    public static function messages()
    {
        return [
            'fecha.required' => 'La fecha es obligatoria.',
            'fecha.date' => 'La fecha debe ser válida.',
            'nombre_aprendiz.required' => 'El nombre del aprendiz es obligatorio.',
            'tipo_documento.required' => 'El tipo de documento es obligatorio.',
            'numero_documento.required' => 'El número de documento es obligatorio.',
            'numero_ficha.required' => 'El número de ficha es obligatorio.',
            'motivo.required' => 'El motivo es obligatorio.',
            'responsable.required' => 'El responsable es obligatorio.',
        ];
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        return static::where('numero_caso', $numeroCaso)->with(['archivos', 'aprendiz'])->first();
    }

    /**
     * Buscar casos por número de documento del aprendiz
     */
    public static function buscarPorDocumentoAprendiz($numeroDocumento)
    {
        return static::where('numero_documento', $numeroDocumento)
                    ->with(['archivos', 'aprendiz'])
                    ->orderBy('fecha', 'desc')
                    ->get();
    }

    /**
     * Buscar casos por número de ficha
     */
    public static function buscarPorFicha($numeroFicha)
    {
        return static::where('numero_ficha', $numeroFicha)
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
}
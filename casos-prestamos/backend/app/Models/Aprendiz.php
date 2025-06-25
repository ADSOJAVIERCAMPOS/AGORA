<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aprendiz extends Model
{
    use HasFactory;

    protected $table = 'aprendices';
    protected $fillable = [
        'nombre',
        'tipo_documento',
        'numero_documento',
        'numero_ficha',
        'email',
        'telefono',
        'estado',
    ];

    /**
     * Relación uno a muchos con CasoGeneral
     * Un aprendiz puede tener múltiples casos
     */
    public function casos()
    {
        return $this->hasMany(CasoGeneral::class, 'numero_documento', 'numero_documento');
    }

    /**
     * Buscar aprendiz por número de documento
     */
    public static function buscarPorDocumento($numeroDocumento)
    {
        return static::where('numero_documento', $numeroDocumento)->first();
    }

    /**
     * Crear o actualizar aprendiz
     */
    public static function crearOActualizar($datos)
    {
        return static::updateOrCreate(
            ['numero_documento' => $datos['numero_documento']],
            $datos
        );
    }
} 
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
    use HasFactory;

    protected $fillable = [
        'usuario_id',
        'tipo_entidad',
        'entidad_id',
        'accion',
        'descripcion',
        'datos_nuevos',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }

    public function store(Request $request)
    {
        // ... lógica para crear el préstamo ...
        $prestamo = Prestamo::create($request->all());

        Movimiento::create([
            'usuario_id' => auth()->id(),
            'tipo_entidad' => 'prestamo',
            'entidad_id' => $prestamo->id,
            'accion' => 'creacion',
            'descripcion' => 'Creación de préstamo',
            'datos_nuevos' => $prestamo->toArray(),
        ]);

        // ...
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
// Si tu modelo User tiene una relación con Roles (ej. Spatie/Permission),
// podrías necesitar importar el modelo Role aquí o accederlo a través del User.
// use Spatie\Permission\Models\Role; // Ejemplo si usas Spatie/Permission

class DashboardApiController extends Controller
{
    public function getDashboardData(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $user = Auth::user();

        // Obtener el rol del usuario.
        // Asumo que tu modelo User tiene una propiedad 'role' directamente que es un string,
        // o si tienes una relación, que puedes acceder a su nombre.
        // Si 'role' es una columna directamente en la tabla 'users' y guarda un string:
        $userRoleName = $user->role ?? 'Rol Desconocido'; // Accede directamente a la columna 'role'

        // Si 'role' es un objeto (ej. relación de Eloquent), necesitas acceder a su propiedad 'name':
        // Por lo que se ve en tu captura, parece que $user->userRole ya es un objeto,
        // por lo que podrías necesitar $user->userRole->name
        if (isset($user->userRole) && is_object($user->userRole) && isset($user->userRole->name)) {
             $userRoleName = $user->userRole->name;
        } else {
            // Manejar casos donde userRole no es un objeto o no tiene 'name'
            // Podrías intentar acceder a una columna directa si existe
            $userRoleName = $user->role ?? 'Rol Desconocido'; // Asume que 'role' es una columna string
        }

        // Si estás usando Spatie/Permission, podrías hacer:
        // $userRoleName = $user->getRoleNames()->first() ?? 'Sin Rol';


        $data = [
            'usuariosRegistrados' => 324,
            'usuariosRegistradosTrend' => '+8%',
            'casosActivos' => 1247,
            'casosActivosTrend' => '+12%',
            'casosPendientes' => 89,
            'casosPendientesTrend' => '-5%',
            'casosResueltos' => 156,
            'casosResueltosTrend' => '+23%',
            'userName' => $user->name,
            'userRole' => $userRoleName, // <--- ¡Esta es la línea corregida!
        ];

        return response()->json($data);
    }
}
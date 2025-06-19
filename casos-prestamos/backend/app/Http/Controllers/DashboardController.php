<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Para obtener el usuario autenticado

class DashboardController extends Controller
{
    public function index()
    {
        // Aquí puedes obtener datos de la base de datos, por ejemplo:
        // $totalUsers = User::count();
        // $activeCases = Case::where('status', 'active')->count();

        $username = 'Giovanni Agudelo Fique'; // Valor por defecto del diseño
        if (Auth::check()) {
            // Si el usuario está autenticado, usa su nombre
            // Asegúrate de que tu modelo User tenga una propiedad 'name'
            $username = Auth::user()->name;
        }

        // Pasa los datos a la vista
        return view('dashboard', [
            'username' => $username,
            // 'totalUsers' => $totalUsers, // Si los obtuvieras dinámicamente
            // 'activeCases' => $activeCases,
        ]);
    }
}
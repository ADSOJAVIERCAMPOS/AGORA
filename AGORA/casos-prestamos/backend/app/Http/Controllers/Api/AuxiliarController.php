<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuxiliarController extends Controller
{
    // Listar auxiliares
    public function index()
    {
        $auxiliares = User::whereHas('role', function($q) {
            $q->where('name', 'user');
        })->get();
        return response()->json($auxiliares);
    }

    // Crear auxiliar
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);
        $role = Role::where('name', 'user')->firstOrFail();
        $auxiliar = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $role->id,
            'is_active' => true,
        ]);
        return response()->json($auxiliar, 201);
    }

    // Mostrar auxiliar
    public function show($id)
    {
        $auxiliar = User::where('id', $id)->whereHas('role', function($q) {
            $q->where('name', 'user');
        })->firstOrFail();
        return response()->json($auxiliar);
    }

    // Actualizar auxiliar
    public function update(Request $request, $id)
    {
        $auxiliar = User::where('id', $id)->whereHas('role', function($q) {
            $q->where('name', 'user');
        })->firstOrFail();
        $auxiliar->update($request->only(['name', 'email', 'is_active']));
        if ($request->filled('password')) {
            $auxiliar->password = Hash::make($request->password);
            $auxiliar->save();
        }
        return response()->json($auxiliar);
    }

    // Desactivar auxiliar
    public function deactivate($id)
    {
        $auxiliar = User::where('id', $id)->whereHas('role', function($q) {
            $q->where('name', 'user');
        })->firstOrFail();
        $auxiliar->is_active = false;
        $auxiliar->save();
        return response()->json(['message' => 'Auxiliar desactivado']);
    }

    // Activar/Reactivar auxiliar
    public function activate($id)
    {
        $auxiliar = User::where('id', $id)->whereHas('role', function($q) {
            $q->where('name', 'user');
        })->firstOrFail();
        $auxiliar->is_active = true;
        $auxiliar->save();
        return response()->json(['message' => 'Auxiliar activado']);
    }

    // Eliminar auxiliar
    public function destroy($id)
    {
        $auxiliar = User::where('id', $id)->whereHas('role', function($q) {
            $q->where('name', 'user');
        })->firstOrFail();
        $auxiliar->delete();
        return response()->json(['message' => 'Auxiliar eliminado']);
    }
} 
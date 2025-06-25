<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    // Listar usuarios
    public function index()
    {
        $usuarios = User::with('role')->get();
        return response()->json($usuarios);
    }

    // Crear usuario
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
        ]);
        $usuario = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'is_active' => true,
        ]);
        return response()->json($usuario, 201);
    }

    // Editar usuario
    public function update(Request $request, $id)
    {
        $usuario = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users')->ignore($usuario->id),
            ],
            'password' => 'nullable|string|min:6',
            'role_id' => 'sometimes|required|exists:roles,id',
        ]);
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }
        $usuario->update($validated);
        return response()->json($usuario);
    }

    // Activar/desactivar usuario
    public function toggleStatus($id)
    {
        $usuario = User::findOrFail($id);
        $usuario->is_active = !$usuario->is_active;
        $usuario->save();
        return response()->json(['is_active' => $usuario->is_active]);
    }
}

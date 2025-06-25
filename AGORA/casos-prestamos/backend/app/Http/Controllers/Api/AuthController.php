<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; // No usado directamente para login, pero útil para register
use App\Models\User; // Asegúrate de que tu modelo de usuario esté importado
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password; // Para la funcionalidad de forgot password

class AuthController extends Controller
{
    /**
     * Handle an incoming authentication request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Intenta autenticar al usuario
        if (!Auth::attempt($request->only('email', 'password'))) {
            // Si las credenciales son incorrectas, lanza una excepción de validación
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Si la autenticación es exitosa
        $user = Auth::user();

        // Crea un token de Sanctum para el usuario
        // El nombre del token 'auth_token' es arbitrario, puedes usar el que quieras.
        $token = $user->createToken('auth_token')->plainTextToken;

        // Devuelve una respuesta JSON con el token y los datos del usuario
        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => $user, // Puedes personalizar qué datos del usuario enviar
            'role' => $user->role ?? 'default', // Asegúrate de que la columna 'role' exista en tu tabla 'users'
                                                // o ajusta esto según cómo manejes los roles.
        ]);
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Revoca el token actual del usuario autenticado
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

    /**
     * Send a password reset link to the given user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function forgotPassword(Request $request)
    {
        // Valida que se haya proporcionado un email válido
        $request->validate(['email' => 'required|email']);

        // Envía el enlace de restablecimiento de contraseña utilizando la funcionalidad de Laravel
        // Esto requiere que tengas configurado tu correo electrónico en .env
        // y que la tabla 'password_reset_tokens' exista en tu base de datos.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // Verifica el estado del envío
        if ($status == Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Se ha enviado un enlace de recuperación a tu correo electrónico.']);
        }

        // Si el envío falla (ej. email no encontrado en la base de datos), devuelve un error 404
        // o un mensaje genérico por seguridad.
        return response()->json(['message' => 'No se pudo enviar el enlace de recuperación. Verifica tu correo electrónico.'], 404);
    }

    // Opcional: Podrías añadir un método 'register' si lo necesitas para crear nuevos usuarios vía API.
    /*
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // 'role' => 'default_role', // Asigna un rol por defecto si es necesario
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registro exitoso',
            'token' => $token,
            'user' => $user,
        ], 201);
    }
    */
}
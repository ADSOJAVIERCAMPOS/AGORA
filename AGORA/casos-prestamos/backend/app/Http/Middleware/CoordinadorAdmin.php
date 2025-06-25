<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CoordinadorAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if ($user && $user->role && in_array($user->role->name, ['coordinador', 'admin'])) {
            return $next($request);
        }
        return response()->json(['message' => 'No autorizado.'], 403);
    }
} 
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
        if ($user && ($user->role && $user->role->name === 'coordinador')) {
            return $next($request);
        }
        return response()->json(['message' => 'No autorizado.'], 403);
    }
} 
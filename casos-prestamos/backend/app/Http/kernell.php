<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     * Estos middlewares se ejecutan en CADA solicitud que llega a tu aplicación.
     */
    protected $middleware = [
        // Manejo de CORS: Esto permite que tu frontend (localhost:3000)
        // se comunique con tu backend (localhost:8000).
        // ¡Ya está correctamente posicionado aquí para aplicarse globalmente!
        \Illuminate\Http\Middleware\HandleCors::class,

        // Confía en los proxies para obtener la IP real del cliente (importante en entornos de producción detrás de un proxy/load balancer)
        \App\Http\Middleware\TrustProxies::class,

        // Valida que el tamaño del contenido de la petición POST no exceda el límite PHP
        \Illuminate\Http\Middleware\ValidatePostSize::class,

        // Recorta los espacios en blanco de las cadenas de entrada
        \App\Http\Middleware\TrimStrings::class,

        // Convierte las cadenas vacías a null (útil para la base de datos)
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * The application's route middleware groups.
     * Estos grupos de middlewares se aplican a conjuntos de rutas específicos.
     */
    protected $middlewareGroups = [
        'web' => [
            // Cifrado de cookies (para sesiones, CSRF, etc.)
            \App\Http\Middleware\EncryptCookies::class,
            // Agrega cookies a la respuesta
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            // Inicia la sesión HTTP (necesaria para Sanctum con SPAs)
            \Illuminate\Session\Middleware\StartSession::class,
            // Comparte errores de sesión con las vistas
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            // Verifica el token CSRF (importante para formularios web, no tanto para API REST pura sin cookies de sesión)
            \App\Http\Middleware\VerifyCsrfToken::class,
            // Inyecta modelos de la base de datos en las rutas (ej. Route::get('/users/{user}', ...))
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            // Asegura que las peticiones frontend estén basadas en estado (para Laravel Sanctum)
            // Es vital para que Sanctum envíe y reciba el CSRF token en tu SPA.
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            // Limita las peticiones a la API (ej. 60 peticiones por minuto)
            'throttle:api', // Esto usa el middleware 'throttle' definido abajo
            // Inyecta modelos de la base de datos en las rutas API
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            // NOTA: HandleCors ya está en el middleware global, así que no es necesario aquí.
        ],
    ];

    /**
     * Route middleware.
     * Estos middlewares se pueden asignar individualmente a rutas específicas.
     */
    protected $routeMiddleware = [
        // Autentica al usuario (usado con 'auth:sanctum' o 'auth:web')
        'auth' => \App\Http\Middleware\Authenticate::class,
        // Redirige si el usuario ya está autenticado (para rutas de login/registro)
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        // Limita la tasa de peticiones (usado por 'throttle:api')
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        // Middleware para autorización de roles o permisos (puedes crear tus propios)
        // 'role' => \App\Http\Middleware\CheckRole::class,
        // 'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        'coordinador_admin' => \App\Http\Middleware\CoordinadorAdmin::class,
    ];
}
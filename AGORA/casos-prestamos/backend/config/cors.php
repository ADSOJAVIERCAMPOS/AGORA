<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'], // Asegúrate de que todas tus rutas API estén cubiertas. 'api/*' es lo más común.

    'allowed_methods' => ['*'], // Permite todos los métodos HTTP (GET, POST, PUT, DELETE, OPTIONS)

    'allowed_origins' => ['http://localhost:3000'], // Puedes agregar más dominios si tienes despliegue en producción
                                                     // Si tienes otros frontends o dominios en producción, agrégalos también.
                                                     // Para desarrollo, 'http://localhost:3000' es lo que necesitas.

    'allowed_origins_patterns' => [], // Puedes usar patrones si necesitas flexibilidad (ej. *.tusubdominio.com)

    'allowed_headers' => ['*'], // Permite todos los encabezados HTTP. Para mayor seguridad, podrías especificar solo los necesarios (ej. ['Content-Type', 'Authorization', 'X-Requested-With'])

    'exposed_headers' => [], // Encabezados que el navegador puede ver (si necesitas exponer alguno, ej. 'X-Total-Count')

    'max_age' => 0, // Tiempo en segundos que los resultados de la petición pre-flight pueden ser cacheada por el navegador

    'supports_credentials' => true, // ¡MUY IMPORTANTE para Laravel Sanctum! Permite enviar cookies de sesión y encabezados de autorización.

];
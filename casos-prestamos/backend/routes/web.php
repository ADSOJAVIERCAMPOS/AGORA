<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Password;
use App\Http\Controllers\DashboardController; // ¡Esta línea es crucial y está correcta!

Route::get('/', function () {
    return response()->make('
        <html>
            <head>
                <title>API Gestión de Casos</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        text-align: center;
                        padding-top: 10%;
                    }
                    h1 {
                        color: #2c3e50;
                    }
                    .tagline {
                        font-size: 18px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <h1>😈 HOLA JAVIER  😈</h1>
                <p class="tagline"> 😈 Bienvenido a "AGORA" app para la coordinación de ADSO. Todo MELO 😈 </p>
            </body>
        </html>
    ', 200, ['Content-Type' => 'text/html']);
});

// ¡Nueva ruta para el Dashboard!
// Esta línea es la que hace que la ruta /dashboard apunte al método index del DashboardController
// Route::get('/dashboard', [DashboardController::class, 'index']);

// NOTA: Si también tienes rutas de autenticación web (como login/register para vistas tradicionales),
// podrías agregarlas aquí. Por ejemplo:
// Auth::routes(); // Para rutas de autenticación de Laravel Breeze/Jetstream/UI
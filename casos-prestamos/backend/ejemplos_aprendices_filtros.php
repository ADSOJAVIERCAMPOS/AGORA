<?php

/**
 * Ejemplos de uso de los filtros de aprendices
 * 
 * Este archivo contiene ejemplos de cómo usar los diferentes filtros
 * disponibles en la API de aprendices.
 */

// Configuración básica
$baseUrl = 'http://localhost:8000/api';
$token = 'TU_TOKEN_AQUI'; // Reemplazar con el token real

// Función helper para hacer peticiones HTTP
function makeRequest($url, $token, $method = 'GET', $data = null) {
    $ch = curl_init();
    
    $headers = [
        'Authorization: Bearer ' . $token,
        'Accept: application/json',
        'Content-Type: application/json'
    ];
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data && $method !== 'GET') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

// Función para mostrar resultados de manera formateada
function mostrarResultados($titulo, $resultado) {
    echo "\n" . str_repeat("=", 60) . "\n";
    echo $titulo . "\n";
    echo str_repeat("=", 60) . "\n";
    
    if ($resultado['status'] === 200) {
        $data = $resultado['data'];
        
        if (isset($data['aprendices'])) {
            echo "Total de aprendices encontrados: " . count($data['aprendices']) . "\n";
            echo "Total en base de datos: " . $data['estadisticas']['total_aprendices'] . "\n";
            
            if (!empty($data['aprendices'])) {
                echo "\nPrimeros 3 aprendices:\n";
                foreach (array_slice($data['aprendices'], 0, 3) as $aprendiz) {
                    echo "- " . $aprendiz['nombre'] . " | " . $aprendiz['numero_documento'] . " | " . $aprendiz['estado'] . "\n";
                }
            }
        } elseif (isset($data['estadisticas'])) {
            echo "Estadísticas generales:\n";
            echo "- Total aprendices: " . $data['estadisticas']['total_aprendices'] . "\n";
            echo "- Aprendices activos: " . $data['estadisticas']['aprendices_activos'] . "\n";
            
            if (isset($data['estadisticas']['por_estado'])) {
                echo "- Por estado:\n";
                foreach ($data['estadisticas']['por_estado'] as $estado => $total) {
                    echo "  * $estado: $total\n";
                }
            }
        } elseif (isset($data['filtros'])) {
            echo "Valores disponibles para filtros:\n";
            echo "- Estados: " . implode(', ', $data['filtros']['estados']) . "\n";
            echo "- Tipos documento: " . implode(', ', $data['filtros']['tipos_documento']) . "\n";
            echo "- Fichas: " . implode(', ', array_slice($data['filtros']['fichas'], 0, 5)) . "...\n";
        }
    } else {
        echo "Error: " . $resultado['status'] . "\n";
        if (isset($resultado['data']['message'])) {
            echo "Mensaje: " . $resultado['data']['message'] . "\n";
        }
    }
}

// ============================================================================
// EJEMPLOS DE USO DE FILTROS DE APRENDICES
// ============================================================================

echo "EJEMPLOS DE USO DE FILTROS PARA APRENDICES\n";
echo "==========================================\n";

// 1. Consultar todos los aprendices (sin filtros)
$url = $baseUrl . '/aprendices';
$resultado = makeRequest($url, $token);
mostrarResultados("1. TODOS LOS APRENDICES (sin filtros)", $resultado);

// 2. Filtrar por nombre (búsqueda parcial)
$url = $baseUrl . '/aprendices?nombre=Juan';
$resultado = makeRequest($url, $token);
mostrarResultados("2. APRENDICES CON 'Juan' EN EL NOMBRE", $resultado);

// 3. Filtrar por número de documento (búsqueda exacta)
$url = $baseUrl . '/aprendices?numero_documento=12345678';
$resultado = makeRequest($url, $token);
mostrarResultados("3. APRENDIZ CON DOCUMENTO 12345678", $resultado);

// 4. Filtrar por tipo de documento
$url = $baseUrl . '/aprendices?tipo_documento=CC';
$resultado = makeRequest($url, $token);
mostrarResultados("4. APRENDICES CON CÉDULA DE CIUDADANÍA", $resultado);

// 5. Filtrar por número de ficha
$url = $baseUrl . '/aprendices?numero_ficha=123456';
$resultado = makeRequest($url, $token);
mostrarResultados("5. APRENDICES DE LA FICHA 123456", $resultado);

// 6. Filtrar por estado
$url = $baseUrl . '/aprendices?estado=Activo';
$resultado = makeRequest($url, $token);
mostrarResultados("6. APRENDICES ACTIVOS", $resultado);

// 7. Filtrar por email (búsqueda parcial)
$url = $baseUrl . '/aprendices?email=gmail.com';
$resultado = makeRequest($url, $token);
mostrarResultados("7. APRENDICES CON EMAIL GMAIL", $resultado);

// 8. Filtrar por teléfono (búsqueda parcial)
$url = $baseUrl . '/aprendices?telefono=300';
$resultado = makeRequest($url, $token);
mostrarResultados("8. APRENDICES CON TELÉFONO QUE CONTENGA '300'", $resultado);

// 9. Filtrar por rango de fechas de registro
$url = $baseUrl . '/aprendices?fecha_registro_desde=2025-01-01&fecha_registro_hasta=2025-01-31';
$resultado = makeRequest($url, $token);
mostrarResultados("9. APRENDICES REGISTRADOS EN ENERO 2025", $resultado);

// 10. Combinar múltiples filtros
$url = $baseUrl . '/aprendices?estado=Activo&tipo_documento=CC&sort_by=nombre&sort_direction=asc&per_page=10';
$resultado = makeRequest($url, $token);
mostrarResultados("10. APRENDICES ACTIVOS CON CC, ORDENADOS POR NOMBRE (10 por página)", $resultado);

// 11. Ordenar por diferentes campos
$url = $baseUrl . '/aprendices?sort_by=created_at&sort_direction=desc&per_page=5';
$resultado = makeRequest($url, $token);
mostrarResultados("11. ÚLTIMOS 5 APRENDICES REGISTRADOS", $resultado);

// 12. Obtener estadísticas
$url = $baseUrl . '/aprendices/estadisticas';
$resultado = makeRequest($url, $token);
mostrarResultados("12. ESTADÍSTICAS DE APRENDICES", $resultado);

// 13. Obtener valores para filtros
$url = $baseUrl . '/aprendices/filtros/valores';
$resultado = makeRequest($url, $token);
mostrarResultados("13. VALORES DISPONIBLES PARA FILTROS", $resultado);

// ============================================================================
// EJEMPLOS AVANZADOS
// ============================================================================

echo "\n" . str_repeat("=", 60) . "\n";
echo "EJEMPLOS AVANZADOS DE APRENDICES\n";
echo str_repeat("=", 60) . "\n";

// Ejemplo: Buscar aprendices de una ficha específica con estado activo
$url = $baseUrl . '/aprendices?numero_ficha=123456&estado=Activo&sort_by=nombre&sort_direction=asc';
$resultado = makeRequest($url, $token);
mostrarResultados("A. APRENDICES ACTIVOS DE LA FICHA 123456 (ordenados alfabéticamente)", $resultado);

// Ejemplo: Buscar aprendices registrados en un período específico
$url = $baseUrl . '/aprendices?fecha_registro_desde=2025-01-01&fecha_registro_hasta=2025-03-31&estado=Activo';
$resultado = makeRequest($url, $token);
mostrarResultados("B. APRENDICES ACTIVOS REGISTRADOS EN EL PRIMER TRIMESTRE 2025", $resultado);

// Ejemplo: Buscar aprendices por tipo de documento y ordenar por fecha de registro
$url = $baseUrl . '/aprendices?tipo_documento=TI&sort_by=created_at&sort_direction=desc&per_page=20';
$resultado = makeRequest($url, $token);
mostrarResultados("C. APRENDICES CON TARJETA DE IDENTIDAD (más recientes primero)", $resultado);

// Ejemplo: Buscar aprendices con email específico y estado activo
$url = $baseUrl . '/aprendices?email=@sena.edu.co&estado=Activo&sort_by=nombre&sort_direction=asc';
$resultado = makeRequest($url, $token);
mostrarResultados("D. APRENDICES ACTIVOS CON EMAIL INSTITUCIONAL", $resultado);

// ============================================================================
// EJEMPLOS DE CREACIÓN Y ACTUALIZACIÓN
// ============================================================================

echo "\n" . str_repeat("=", 60) . "\n";
echo "EJEMPLOS DE CREACIÓN Y ACTUALIZACIÓN\n";
echo str_repeat("=", 60) . "\n";

// Ejemplo: Crear un nuevo aprendiz
$nuevoAprendiz = [
    'nombre' => 'María González López',
    'numero_documento' => '98765432',
    'tipo_documento' => 'CC',
    'numero_ficha' => '654321',
    'email' => 'maria.gonzalez@sena.edu.co',
    'telefono' => '3001234567',
    'estado' => 'Activo'
];

$url = $baseUrl . '/aprendices';
$resultado = makeRequest($url, $token, 'POST', $nuevoAprendiz);
mostrarResultados("E. CREAR NUEVO APRENDIZ", $resultado);

// Ejemplo: Actualizar un aprendiz existente
$actualizacion = [
    'estado' => 'Graduado',
    'email' => 'maria.gonzalez.nueva@gmail.com'
];

$url = $baseUrl . '/aprendices/98765432';
$resultado = makeRequest($url, $token, 'PUT', $actualizacion);
mostrarResultados("F. ACTUALIZAR APRENDIZ", $resultado);

// Ejemplo: Obtener aprendiz específico
$url = $baseUrl . '/aprendices/98765432';
$resultado = makeRequest($url, $token);
mostrarResultados("G. OBTENER APRENDIZ ESPECÍFICO", $resultado);

echo "\n" . str_repeat("=", 60) . "\n";
echo "FIN DE EJEMPLOS DE APRENDICES\n";
echo str_repeat("=", 60) . "\n";

echo "\nNOTAS IMPORTANTES:\n";
echo "- Reemplaza 'TU_TOKEN_AQUI' con un token válido de autenticación\n";
echo "- Asegúrate de que el servidor esté corriendo en http://localhost:8000\n";
echo "- Los filtros se pueden combinar de múltiples maneras\n";
echo "- Las búsquedas parciales usan LIKE %valor%\n";
echo "- Las búsquedas exactas usan comparación directa\n";
echo "- La paginación por defecto es 15 registros, máximo 100\n";
echo "- El ordenamiento por defecto es por nombre ascendente\n";
echo "- Los estados disponibles son: Activo, Inactivo, Graduado, Retirado\n";
echo "- Los tipos de documento disponibles son: CC, CE, TI, PP\n"; 
<?php

/**
 * Ejemplos de uso de los filtros de casos generales
 * 
 * Este archivo contiene ejemplos de cómo usar los diferentes filtros
 * disponibles en la API de casos generales.
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
    echo "\n" . str_repeat("=", 50) . "\n";
    echo $titulo . "\n";
    echo str_repeat("=", 50) . "\n";
    
    if ($resultado['status'] === 200) {
        $data = $resultado['data'];
        
        if (isset($data['casos'])) {
            echo "Total de casos encontrados: " . count($data['casos']) . "\n";
            echo "Total en base de datos: " . $data['estadisticas']['total_casos'] . "\n";
            
            if (!empty($data['casos'])) {
                echo "\nPrimeros 3 casos:\n";
                foreach (array_slice($data['casos'], 0, 3) as $caso) {
                    echo "- " . $caso['numero_caso'] . " | " . $caso['nombre_aprendiz'] . " | " . $caso['estado'] . "\n";
                }
            }
        } elseif (isset($data['estadisticas'])) {
            echo "Estadísticas generales:\n";
            echo "- Total casos: " . $data['estadisticas']['total_casos'] . "\n";
            echo "- Pendientes: " . $data['estadisticas']['por_estado']['pendientes'] . "\n";
            echo "- En proceso: " . $data['estadisticas']['por_estado']['en_proceso'] . "\n";
            echo "- Resueltos: " . $data['estadisticas']['por_estado']['resueltos'] . "\n";
            echo "- Cerrados: " . $data['estadisticas']['por_estado']['cerrados'] . "\n";
        } elseif (isset($data['filtros'])) {
            echo "Valores disponibles para filtros:\n";
            echo "- Estados: " . implode(', ', $data['filtros']['estados']) . "\n";
            echo "- Tipos documento: " . implode(', ', $data['filtros']['tipos_documento']) . "\n";
            echo "- Responsables: " . implode(', ', array_slice($data['filtros']['responsables'], 0, 5)) . "...\n";
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
// EJEMPLOS DE USO DE FILTROS
// ============================================================================

echo "EJEMPLOS DE USO DE FILTROS PARA CASOS GENERALES\n";
echo "================================================\n";

// 1. Consultar todos los casos (sin filtros)
$url = $baseUrl . '/casos-generales';
$resultado = makeRequest($url, $token);
mostrarResultados("1. TODOS LOS CASOS (sin filtros)", $resultado);

// 2. Filtrar por nombre de aprendiz (búsqueda parcial)
$url = $baseUrl . '/casos-generales?nombre_aprendiz=Juan';
$resultado = makeRequest($url, $token);
mostrarResultados("2. CASOS DE APRENDICES CON 'Juan' EN EL NOMBRE", $resultado);

// 3. Filtrar por estado
$url = $baseUrl . '/casos-generales?estado=Pendiente';
$resultado = makeRequest($url, $token);
mostrarResultados("3. CASOS PENDIENTES", $resultado);

// 4. Filtrar por número de ficha
$url = $baseUrl . '/casos-generales?numero_ficha=123456';
$resultado = makeRequest($url, $token);
mostrarResultados("4. CASOS DE LA FICHA 123456", $resultado);

// 5. Filtrar por número de documento
$url = $baseUrl . '/casos-generales?numero_documento=12345678';
$resultado = makeRequest($url, $token);
mostrarResultados("5. CASOS DEL DOCUMENTO 12345678", $resultado);

// 6. Filtrar por responsable
$url = $baseUrl . '/casos-generales?responsable=Ana';
$resultado = makeRequest($url, $token);
mostrarResultados("6. CASOS DEL RESPONSABLE 'Ana'", $resultado);

// 7. Filtrar por rango de fechas
$url = $baseUrl . '/casos-generales?fecha_desde=2025-01-01&fecha_hasta=2025-01-31';
$resultado = makeRequest($url, $token);
mostrarResultados("7. CASOS DE ENERO 2025", $resultado);

// 8. Filtrar por motivo (búsqueda parcial)
$url = $baseUrl . '/casos-generales?motivo=académico';
$resultado = makeRequest($url, $token);
mostrarResultados("8. CASOS CON 'académico' EN EL MOTIVO", $resultado);

// 9. Combinar múltiples filtros
$url = $baseUrl . '/casos-generales?estado=Pendiente&responsable=Ana&sort_by=nombre_aprendiz&sort_direction=asc&per_page=10';
$resultado = makeRequest($url, $token);
mostrarResultados("9. CASOS PENDIENTES DE ANA, ORDENADOS POR NOMBRE (10 por página)", $resultado);

// 10. Ordenar por diferentes campos
$url = $baseUrl . '/casos-generales?sort_by=fecha&sort_direction=desc&per_page=5';
$resultado = makeRequest($url, $token);
mostrarResultados("10. ÚLTIMOS 5 CASOS (ordenados por fecha descendente)", $resultado);

// 11. Obtener estadísticas
$url = $baseUrl . '/casos-generales/estadisticas';
$resultado = makeRequest($url, $token);
mostrarResultados("11. ESTADÍSTICAS GENERALES", $resultado);

// 12. Obtener valores para filtros
$url = $baseUrl . '/casos-generales/filtros/valores';
$resultado = makeRequest($url, $token);
mostrarResultados("12. VALORES DISPONIBLES PARA FILTROS", $resultado);

// ============================================================================
// EJEMPLOS AVANZADOS
// ============================================================================

echo "\n" . str_repeat("=", 50) . "\n";
echo "EJEMPLOS AVANZADOS\n";
echo str_repeat("=", 50) . "\n";

// Ejemplo: Buscar casos de una ficha específica con estado pendiente
$url = $baseUrl . '/casos-generales?numero_ficha=123456&estado=Pendiente&sort_by=fecha&sort_direction=desc';
$resultado = makeRequest($url, $token);
mostrarResultados("A. CASOS PENDIENTES DE LA FICHA 123456 (más recientes primero)", $resultado);

// Ejemplo: Buscar casos de un período específico con un responsable específico
$url = $baseUrl . '/casos-generales?fecha_desde=2025-01-01&fecha_hasta=2025-03-31&responsable=María&estado=En Proceso';
$resultado = makeRequest($url, $token);
mostrarResultados("B. CASOS EN PROCESO DE MARÍA EN EL PRIMER TRIMESTRE 2025", $resultado);

// Ejemplo: Buscar casos por tipo de documento y ordenar por nombre
$url = $baseUrl . '/casos-generales?tipo_documento=CC&sort_by=nombre_aprendiz&sort_direction=asc&per_page=20';
$resultado = makeRequest($url, $token);
mostrarResultados("C. CASOS CON CÉDULA DE CIUDADANÍA (ordenados alfabéticamente)", $resultado);

echo "\n" . str_repeat("=", 50) . "\n";
echo "FIN DE EJEMPLOS\n";
echo str_repeat("=", 50) . "\n";

echo "\nNOTAS IMPORTANTES:\n";
echo "- Reemplaza 'TU_TOKEN_AQUI' con un token válido de autenticación\n";
echo "- Asegúrate de que el servidor esté corriendo en http://localhost:8000\n";
echo "- Los filtros se pueden combinar de múltiples maneras\n";
echo "- Las búsquedas parciales usan LIKE %valor%\n";
echo "- Las búsquedas exactas usan comparación directa\n";
echo "- La paginación por defecto es 15 registros, máximo 100\n";
echo "- El ordenamiento por defecto es por fecha descendente\n"; 
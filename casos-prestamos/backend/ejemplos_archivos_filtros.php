<?php

/**
 * Ejemplos de uso de los filtros de archivos
 * 
 * Este archivo contiene ejemplos de cómo usar los diferentes filtros
 * disponibles en la API de archivos.
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

// Función para formatear tamaño de archivo
function formatearTamano($bytes) {
    if ($bytes === 0) return '0 Bytes';
    $k = 1024;
    $sizes = ['Bytes', 'KB', 'MB', 'GB'];
    $i = floor(log($bytes) / log($k));
    return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
}

// Función para mostrar resultados de manera formateada
function mostrarResultados($titulo, $resultado) {
    echo "\n" . str_repeat("=", 60) . "\n";
    echo $titulo . "\n";
    echo str_repeat("=", 60) . "\n";
    
    if ($resultado['status'] === 200) {
        $data = $resultado['data'];
        
        if (isset($data['archivos'])) {
            echo "Total de archivos encontrados: " . count($data['archivos']) . "\n";
            echo "Total en base de datos: " . $data['estadisticas']['total_archivos'] . "\n";
            
            if (!empty($data['archivos'])) {
                echo "\nPrimeros 3 archivos:\n";
                foreach (array_slice($data['archivos'], 0, 3) as $archivo) {
                    $tamano = formatearTamano($archivo['tamano_bytes']);
                    echo "- " . $archivo['nombre_archivo'] . " | " . $archivo['tipo_archivo'] . " | " . $tamano . "\n";
                }
            }
        } elseif (isset($data['estadisticas'])) {
            echo "Estadísticas generales:\n";
            echo "- Total archivos: " . $data['estadisticas']['total_archivos'] . "\n";
            echo "- Tamaño total: " . $data['estadisticas']['tamano_total_formateado'] . "\n";
            
            if (isset($data['estadisticas']['por_tipo'])) {
                echo "- Por tipo:\n";
                foreach ($data['estadisticas']['por_tipo'] as $tipo => $total) {
                    echo "  * $tipo: $total\n";
                }
            }
        } elseif (isset($data['filtros'])) {
            echo "Valores disponibles para filtros:\n";
            echo "- Tipos archivo: " . implode(', ', $data['filtros']['tipos_archivo']) . "\n";
            echo "- Tipos MIME: " . implode(', ', array_slice($data['filtros']['tipos_mime'], 0, 5)) . "...\n";
            echo "- Años: " . implode(', ', $data['filtros']['anios']) . "\n";
        }
    } else {
        echo "Error: " . $resultado['status'] . "\n";
        if (isset($resultado['data']['message'])) {
            echo "Mensaje: " . $resultado['data']['message'] . "\n";
        }
    }
}

// ============================================================================
// EJEMPLOS DE USO DE FILTROS DE ARCHIVOS
// ============================================================================

echo "EJEMPLOS DE USO DE FILTROS PARA ARCHIVOS\n";
echo "========================================\n";

// 1. Consultar todos los archivos (sin filtros)
$url = $baseUrl . '/archivos';
$resultado = makeRequest($url, $token);
mostrarResultados("1. TODOS LOS ARCHIVOS (sin filtros)", $resultado);

// 2. Filtrar por nombre de archivo (búsqueda parcial)
$url = $baseUrl . '/archivos?nombre_archivo=documento';
$resultado = makeRequest($url, $token);
mostrarResultados("2. ARCHIVOS CON 'documento' EN EL NOMBRE", $resultado);

// 3. Filtrar por tipo de archivo
$url = $baseUrl . '/archivos?tipo_archivo=pdf';
$resultado = makeRequest($url, $token);
mostrarResultados("3. ARCHIVOS PDF", $resultado);

// 4. Filtrar por tipo MIME
$url = $baseUrl . '/archivos?tipo_mime=application/pdf';
$resultado = makeRequest($url, $token);
mostrarResultados("4. ARCHIVOS CON TIPO MIME PDF", $resultado);

// 5. Filtrar por tamaño mínimo (1MB)
$url = $baseUrl . '/archivos?tamano_min=1048576';
$resultado = makeRequest($url, $token);
mostrarResultados("5. ARCHIVOS MAYORES A 1MB", $resultado);

// 6. Filtrar por tamaño máximo (5MB)
$url = $baseUrl . '/archivos?tamano_max=5242880';
$resultado = makeRequest($url, $token);
mostrarResultados("6. ARCHIVOS MENORES A 5MB", $resultado);

// 7. Filtrar por rango de tamaño
$url = $baseUrl . '/archivos?tamano_min=1048576&tamano_max=5242880';
$resultado = makeRequest($url, $token);
mostrarResultados("7. ARCHIVOS ENTRE 1MB Y 5MB", $resultado);

// 8. Filtrar por número de caso
$url = $baseUrl . '/archivos?numero_caso=CG-2025';
$resultado = makeRequest($url, $token);
mostrarResultados("8. ARCHIVOS DEL CASO CG-2025", $resultado);

// 9. Filtrar por número de documento del aprendiz
$url = $baseUrl . '/archivos?numero_documento=12345678';
$resultado = makeRequest($url, $token);
mostrarResultados("9. ARCHIVOS DEL APRENDIZ 12345678", $resultado);

// 10. Filtrar por nombre del aprendiz
$url = $baseUrl . '/archivos?nombre_aprendiz=Juan';
$resultado = makeRequest($url, $token);
mostrarResultados("10. ARCHIVOS DE APRENDICES CON 'Juan' EN EL NOMBRE", $resultado);

// 11. Filtrar por número de ficha
$url = $baseUrl . '/archivos?numero_ficha=123456';
$resultado = makeRequest($url, $token);
mostrarResultados("11. ARCHIVOS DE LA FICHA 123456", $resultado);

// 12. Filtrar por rango de fechas
$url = $baseUrl . '/archivos?fecha_desde=2025-01-01&fecha_hasta=2025-01-31';
$resultado = makeRequest($url, $token);
mostrarResultados("12. ARCHIVOS SUBIDOS EN ENERO 2025", $resultado);

// 13. Filtrar por descripción
$url = $baseUrl . '/archivos?descripcion=académico';
$resultado = makeRequest($url, $token);
mostrarResultados("13. ARCHIVOS CON 'académico' EN LA DESCRIPCIÓN", $resultado);

// 14. Combinar múltiples filtros
$url = $baseUrl . '/archivos?tipo_archivo=pdf&tamano_min=1048576&sort_by=created_at&sort_direction=desc&per_page=10';
$resultado = makeRequest($url, $token);
mostrarResultados("14. ARCHIVOS PDF MAYORES A 1MB, ORDENADOS POR FECHA (10 por página)", $resultado);

// 15. Ordenar por diferentes campos
$url = $baseUrl . '/archivos?sort_by=tamano_bytes&sort_direction=desc&per_page=5';
$resultado = makeRequest($url, $token);
mostrarResultados("15. 5 ARCHIVOS MÁS GRANDES", $resultado);

// 16. Obtener estadísticas
$url = $baseUrl . '/archivos/estadisticas';
$resultado = makeRequest($url, $token);
mostrarResultados("16. ESTADÍSTICAS DE ARCHIVOS", $resultado);

// 17. Obtener valores para filtros
$url = $baseUrl . '/archivos/filtros/valores';
$resultado = makeRequest($url, $token);
mostrarResultados("17. VALORES DISPONIBLES PARA FILTROS", $resultado);

// ============================================================================
// EJEMPLOS AVANZADOS
// ============================================================================

echo "\n" . str_repeat("=", 60) . "\n";
echo "EJEMPLOS AVANZADOS DE ARCHIVOS\n";
echo str_repeat("=", 60) . "\n";

// Ejemplo: Buscar archivos PDF de un aprendiz específico
$url = $baseUrl . '/archivos?tipo_archivo=pdf&numero_documento=12345678&sort_by=created_at&sort_direction=desc';
$resultado = makeRequest($url, $token);
mostrarResultados("A. ARCHIVOS PDF DEL APRENDIZ 12345678 (más recientes primero)", $resultado);

// Ejemplo: Buscar archivos grandes de una ficha específica
$url = $baseUrl . '/archivos?numero_ficha=123456&tamano_min=2097152&sort_by=tamano_bytes&sort_direction=desc';
$resultado = makeRequest($url, $token);
mostrarResultados("B. ARCHIVOS GRANDES (>2MB) DE LA FICHA 123456", $resultado);

// Ejemplo: Buscar archivos de imagen de un período específico
$url = $baseUrl . '/archivos?tipo_archivo=imagen&fecha_desde=2025-01-01&fecha_hasta=2025-03-31&sort_by=created_at&sort_direction=desc';
$resultado = makeRequest($url, $token);
mostrarResultados("C. ARCHIVOS DE IMAGEN DEL PRIMER TRIMESTRE 2025", $resultado);

// Ejemplo: Buscar archivos de documento con descripción específica
$url = $baseUrl . '/archivos?tipo_archivo=documento&descripcion=certificado&sort_by=nombre_archivo&sort_direction=asc';
$resultado = makeRequest($url, $token);
mostrarResultados("D. ARCHIVOS DE DOCUMENTO CON 'certificado' EN LA DESCRIPCIÓN", $resultado);

// Ejemplo: Buscar archivos por tipo MIME específico
$url = $baseUrl . '/archivos?tipo_mime=application/vnd.openxmlformats-officedocument.wordprocessingml.document&sort_by=created_at&sort_direction=desc';
$resultado = makeRequest($url, $token);
mostrarResultados("E. ARCHIVOS DOCX (más recientes primero)", $resultado);

// ============================================================================
// EJEMPLOS DE OPERACIONES CON ARCHIVOS
// ============================================================================

echo "\n" . str_repeat("=", 60) . "\n";
echo "EJEMPLOS DE OPERACIONES CON ARCHIVOS\n";
echo str_repeat("=", 60) . "\n";

// Ejemplo: Obtener archivos de un caso específico
$url = $baseUrl . '/casos-generales/CG-2025-001/archivos';
$resultado = makeRequest($url, $token);
mostrarResultados("F. ARCHIVOS DEL CASO CG-2025-001", $resultado);

// Ejemplo: Obtener archivos de un aprendiz por documento
$url = $baseUrl . '/archivos/aprendiz/12345678';
$resultado = makeRequest($url, $token);
mostrarResultados("G. ARCHIVOS DEL APRENDIZ 12345678", $resultado);

// Ejemplo: Descargar un archivo específico
$url = $baseUrl . '/casos-generales/CG-2025-001/archivos/1/descargar';
$resultado = makeRequest($url, $token);
mostrarResultados("H. DESCARGAR ARCHIVO ID 1 DEL CASO CG-2025-001", $resultado);

// Ejemplo: Eliminar un archivo específico
$url = $baseUrl . '/casos-generales/CG-2025-001/archivos/1';
$resultado = makeRequest($url, $token, 'DELETE');
mostrarResultados("I. ELIMINAR ARCHIVO ID 1 DEL CASO CG-2025-001", $resultado);

// ============================================================================
// EJEMPLOS DE SUBIDA DE ARCHIVOS
// ============================================================================

echo "\n" . str_repeat("=", 60) . "\n";
echo "EJEMPLOS DE SUBIDA DE ARCHIVOS\n";
echo str_repeat("=", 60) . "\n";

// Nota: Para subir archivos reales, necesitarías usar multipart/form-data
// Este es un ejemplo conceptual

echo "J. SUBIR ARCHIVO A UN CASO\n";
echo "Para subir archivos reales, usa multipart/form-data con:\n";
echo "- archivo: El archivo a subir\n";
echo "- descripcion: Descripción opcional del archivo\n";
echo "URL: POST /api/casos-generales/CG-2025-001/archivos\n";

echo "\n" . str_repeat("=", 60) . "\n";
echo "FIN DE EJEMPLOS DE ARCHIVOS\n";
echo str_repeat("=", 60) . "\n";

echo "\nNOTAS IMPORTANTES:\n";
echo "- Reemplaza 'TU_TOKEN_AQUI' con un token válido de autenticación\n";
echo "- Asegúrate de que el servidor esté corriendo en http://localhost:8000\n";
echo "- Los filtros se pueden combinar de múltiples maneras\n";
echo "- Las búsquedas parciales usan LIKE %valor%\n";
echo "- Las búsquedas exactas usan comparación directa\n";
echo "- La paginación por defecto es 15 registros, máximo 100\n";
echo "- El ordenamiento por defecto es por fecha de creación descendente\n";
echo "- Los tipos de archivo disponibles son: documento, imagen, pdf, video, audio\n";
echo "- Los tamaños se manejan en bytes\n";
echo "- Para subir archivos, usa multipart/form-data\n";
echo "- Los archivos se almacenan en storage/app/public/archivos_casos/\n";
echo "- El tamaño máximo de archivo es 10MB\n"; 
# Sistema de Filtros para Casos Generales

## Resumen

Se ha implementado un sistema completo de filtros para consultar casos generales con las siguientes características:

### ✅ Funcionalidades Implementadas

1. **Filtros por Aprendiz**
   - Búsqueda parcial por nombre del aprendiz
   - Búsqueda exacta por número de documento
   - Filtro por tipo de documento

2. **Filtros por Ficha**
   - Búsqueda exacta por número de ficha

3. **Filtros por Estado**
   - Filtro por estado del caso (Pendiente, En Proceso, Resuelto, Cerrado)

4. **Filtros por Fecha**
   - Filtro por fecha desde
   - Filtro por fecha hasta

5. **Filtros por Responsable**
   - Búsqueda parcial por nombre del responsable

6. **Filtros por Número de Caso**
   - Búsqueda parcial por número de caso

7. **Filtros por Motivo**
   - Búsqueda parcial por motivo del caso

8. **Ordenamiento**
   - Por cualquier campo disponible
   - Dirección ascendente o descendente

9. **Paginación**
   - Configurable (1-100 registros por página)
   - Por defecto 15 registros

10. **Estadísticas**
    - Conteo por estado
    - Casos por mes
    - Top responsables
    - Top fichas

11. **Valores para Filtros**
    - Estados únicos disponibles
    - Tipos de documento únicos
    - Responsables únicos
    - Fichas únicas
    - Años disponibles

## 🚀 Cómo Usar

### 1. Instalación y Configuración

```bash
# Clonar el repositorio (si no lo has hecho)
git clone <tu-repositorio>
cd backend

# Instalar dependencias
composer install

# Configurar base de datos
cp .env.example .env
# Editar .env con tus credenciales de BD

# Generar clave de aplicación
php artisan key:generate

# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders para crear datos de prueba
php artisan db:seed
```

### 2. Autenticación

Primero necesitas obtener un token de autenticación:

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 3. Ejemplos de Uso

#### Consultar todos los casos
```bash
curl -X GET "http://localhost:8000/api/casos-generales" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

#### Filtrar por aprendiz
```bash
curl -X GET "http://localhost:8000/api/casos-generales?nombre_aprendiz=Juan" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

#### Filtrar por estado
```bash
curl -X GET "http://localhost:8000/api/casos-generales?estado=Pendiente" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

#### Filtrar por ficha
```bash
curl -X GET "http://localhost:8000/api/casos-generales?numero_ficha=123456" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

#### Filtrar por rango de fechas
```bash
curl -X GET "http://localhost:8000/api/casos-generales?fecha_desde=2025-01-01&fecha_hasta=2025-01-31" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

#### Combinar múltiples filtros
```bash
curl -X GET "http://localhost:8000/api/casos-generales?estado=Pendiente&responsable=Ana&sort_by=nombre_aprendiz&sort_direction=asc&per_page=10" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

#### Obtener estadísticas
```bash
curl -X GET "http://localhost:8000/api/casos-generales/estadisticas" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

#### Obtener valores para filtros
```bash
curl -X GET "http://localhost:8000/api/casos-generales/filtros/valores" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

## 📋 Parámetros Disponibles

### Filtros
- `nombre_aprendiz` - Búsqueda parcial por nombre
- `numero_documento` - Búsqueda exacta por documento
- `tipo_documento` - Filtro por tipo de documento
- `numero_ficha` - Búsqueda exacta por ficha
- `estado` - Filtro por estado
- `fecha_desde` - Filtro desde fecha (YYYY-MM-DD)
- `fecha_hasta` - Filtro hasta fecha (YYYY-MM-DD)
- `responsable` - Búsqueda parcial por responsable
- `numero_caso` - Búsqueda parcial por número de caso
- `motivo` - Búsqueda parcial por motivo

### Ordenamiento
- `sort_by` - Campo para ordenar (fecha, numero_caso, nombre_aprendiz, estado, responsable, numero_ficha)
- `sort_direction` - Dirección (asc, desc)

### Paginación
- `per_page` - Registros por página (1-100, por defecto 15)

## 🧪 Pruebas

### Ejecutar pruebas unitarias
```bash
php artisan test --filter=CasoGeneralFiltrosTest
```

### Ejecutar script de ejemplos
```bash
# Editar ejemplos_filtros.php y cambiar TU_TOKEN_AQUI por tu token real
php ejemplos_filtros.php
```

### Probar con Postman o similar
1. Importar la colección de Postman (si tienes una)
2. Configurar la variable de entorno `token` con tu token de autenticación
3. Ejecutar las diferentes peticiones

## 📊 Respuesta de la API

### Estructura de respuesta para consultas
```json
{
    "message": "Casos generales consultados exitosamente.",
    "casos": [...],
    "paginacion": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 15,
        "total": 75,
        "from": 1,
        "to": 15
    },
    "filtros_aplicados": {
        "estado": "Pendiente",
        "responsable": "Ana"
    },
    "ordenamiento": {
        "campo": "nombre_aprendiz",
        "direccion": "asc"
    },
    "estadisticas": {
        "total_casos": 75,
        "casos_encontrados": 15
    }
}
```

### Estructura de respuesta para estadísticas
```json
{
    "message": "Estadísticas obtenidas exitosamente.",
    "estadisticas": {
        "total_casos": 150,
        "por_estado": {
            "pendientes": 45,
            "en_proceso": 30,
            "resueltos": 50,
            "cerrados": 25
        },
        "casos_por_mes": [...],
        "top_responsables": [...],
        "top_fichas": [...]
    }
}
```

## 🔧 Archivos Modificados/Creados

### Controladores
- `app/Http/Controllers/CasoGeneralController.php` - Mejorado con filtros avanzados

### Rutas
- `routes/api.php` - Agregadas nuevas rutas para estadísticas y valores de filtros

### Modelos
- `app/Models/CasoGeneral.php` - Ya existía, no modificado

### Factories y Seeders
- `database/factories/CasoGeneralFactory.php` - Nuevo factory para datos de prueba
- `database/seeders/CasoGeneralSeeder.php` - Nuevo seeder con datos variados
- `database/seeders/DatabaseSeeder.php` - Actualizado para incluir el nuevo seeder

### Pruebas
- `tests/Feature/CasoGeneralFiltrosTest.php` - Pruebas completas para todos los filtros

### Documentación
- `FILTROS_CASOS_API.md` - Documentación completa de la API
- `ejemplos_filtros.php` - Script de ejemplos de uso
- `README_FILTROS.md` - Este archivo

## 🎯 Casos de Uso Comunes

1. **Buscar casos de un aprendiz específico**
   ```
   GET /api/casos-generales?nombre_aprendiz=Juan Pérez&numero_documento=12345678
   ```

2. **Filtrar casos pendientes de una ficha**
   ```
   GET /api/casos-generales?numero_ficha=123456&estado=Pendiente
   ```

3. **Obtener casos de un período específico**
   ```
   GET /api/casos-generales?fecha_desde=2025-01-01&fecha_hasta=2025-01-31
   ```

4. **Buscar casos por responsable**
   ```
   GET /api/casos-generales?responsable=Ana García&sort_by=fecha&sort_direction=desc
   ```

5. **Obtener casos con búsqueda de motivo**
   ```
   GET /api/casos-generales?motivo=académico&estado=En Proceso
   ```

## ⚠️ Notas Importantes

1. **Autenticación**: Todos los endpoints requieren autenticación con Laravel Sanctum
2. **Búsquedas parciales**: Usan LIKE %valor% para mayor flexibilidad
3. **Búsquedas exactas**: Usan comparación directa para precisión
4. **Fechas**: Formato YYYY-MM-DD
5. **Paginación**: Límite máximo de 100 registros por página
6. **Ordenamiento**: Por defecto fecha descendente (más recientes primero)

## 🚀 Próximos Pasos

1. **Frontend**: Integrar los filtros en la interfaz de usuario
2. **Exportación**: Agregar funcionalidad para exportar resultados filtrados
3. **Reportes**: Crear reportes basados en los filtros
4. **Caché**: Implementar caché para mejorar el rendimiento
5. **Búsqueda avanzada**: Agregar búsqueda full-text en motivos

---

¡El sistema de filtros está completamente funcional y listo para usar! 🎉 
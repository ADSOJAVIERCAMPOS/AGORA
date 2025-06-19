# API de Filtros para Casos Generales

## Endpoints Disponibles

### 1. Consultar Casos con Filtros
**GET** `/api/casos-generales`

Este endpoint permite consultar casos generales con múltiples filtros opcionales.

#### Parámetros de Filtro Disponibles

##### Filtros por Aprendiz
- `nombre_aprendiz` (string): Búsqueda parcial por nombre del aprendiz
- `numero_documento` (string): Búsqueda exacta por número de documento
- `tipo_documento` (string): Filtro por tipo de documento

##### Filtros por Ficha
- `numero_ficha` (string): Búsqueda exacta por número de ficha

##### Filtros por Estado
- `estado` (string): Filtro por estado del caso (Pendiente, En Proceso, Resuelto, Cerrado)

##### Filtros por Fecha
- `fecha_desde` (date): Filtrar casos desde esta fecha (formato: YYYY-MM-DD)
- `fecha_hasta` (date): Filtrar casos hasta esta fecha (formato: YYYY-MM-DD)

##### Filtros por Responsable
- `responsable` (string): Búsqueda parcial por nombre del responsable

##### Filtros por Número de Caso
- `numero_caso` (string): Búsqueda parcial por número de caso

##### Filtros por Motivo
- `motivo` (string): Búsqueda parcial por motivo del caso

#### Parámetros de Ordenamiento
- `sort_by` (string): Campo por el cual ordenar (fecha, numero_caso, nombre_aprendiz, estado, responsable, numero_ficha)
- `sort_direction` (string): Dirección del ordenamiento (asc, desc)

#### Parámetros de Paginación
- `per_page` (integer): Número de registros por página (1-100, por defecto 15)

#### Ejemplo de Uso

```bash
# Consultar todos los casos
GET /api/casos-generales

# Filtrar por aprendiz
GET /api/casos-generales?nombre_aprendiz=Juan

# Filtrar por estado y ordenar por fecha descendente
GET /api/casos-generales?estado=Pendiente&sort_by=fecha&sort_direction=desc

# Filtrar por rango de fechas
GET /api/casos-generales?fecha_desde=2025-01-01&fecha_hasta=2025-01-31

# Filtrar por ficha y paginar
GET /api/casos-generales?numero_ficha=123456&per_page=10

# Múltiples filtros combinados
GET /api/casos-generales?estado=Pendiente&responsable=Ana&sort_by=nombre_aprendiz&sort_direction=asc&per_page=20
```

#### Respuesta

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

### 2. Obtener Estadísticas
**GET** `/api/casos-generales/estadisticas`

Obtiene estadísticas generales de los casos.

#### Respuesta

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
        "casos_por_mes": [
            {
                "mes": "2025-01",
                "total": 25
            }
        ],
        "top_responsables": [
            {
                "responsable": "Ana García",
                "total_casos": 15
            }
        ],
        "top_fichas": [
            {
                "numero_ficha": "123456",
                "total_casos": 8
            }
        ]
    }
}
```

### 3. Obtener Valores para Filtros
**GET** `/api/casos-generales/filtros/valores`

Obtiene valores únicos de campos para poblar filtros en el frontend.

#### Respuesta

```json
{
    "message": "Valores de filtros obtenidos exitosamente.",
    "filtros": {
        "estados": ["Pendiente", "En Proceso", "Resuelto", "Cerrado"],
        "tipos_documento": ["CC", "CE", "TI", "PP"],
        "responsables": ["Ana García", "Carlos López", "María Rodríguez"],
        "fichas": ["123456", "234567", "345678"],
        "anios": [2024, 2025]
    }
}
```

## Casos de Uso Comunes

### 1. Buscar Casos de un Aprendiz Específico
```bash
GET /api/casos-generales?nombre_aprendiz=Juan Pérez&numero_documento=12345678
```

### 2. Filtrar Casos Pendientes de una Ficha
```bash
GET /api/casos-generales?numero_ficha=123456&estado=Pendiente
```

### 3. Obtener Casos de un Período Específico
```bash
GET /api/casos-generales?fecha_desde=2025-01-01&fecha_hasta=2025-01-31
```

### 4. Buscar Casos por Responsable
```bash
GET /api/casos-generales?responsable=Ana García&sort_by=fecha&sort_direction=desc
```

### 5. Obtener Casos con Búsqueda de Motivo
```bash
GET /api/casos-generales?motivo=académico&estado=En Proceso
```

## Notas Importantes

1. **Búsquedas Parciales**: Los campos `nombre_aprendiz`, `responsable`, `numero_caso` y `motivo` realizan búsquedas parciales (LIKE %valor%).

2. **Búsquedas Exactas**: Los campos `numero_documento`, `numero_ficha`, `tipo_documento` y `estado` realizan búsquedas exactas.

3. **Fechas**: Usar formato YYYY-MM-DD para los filtros de fecha.

4. **Paginación**: Por defecto se muestran 15 registros por página, máximo 100.

5. **Ordenamiento**: Por defecto se ordena por fecha descendente (más recientes primero).

6. **Autenticación**: Todos los endpoints requieren autenticación con Laravel Sanctum.

## Ejemplos de Prueba con cURL

```bash
# Obtener token de autenticación (ajustar credenciales)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Usar el token para consultar casos
curl -X GET "http://localhost:8000/api/casos-generales?estado=Pendiente&per_page=10" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Accept: application/json"

# Obtener estadísticas
curl -X GET "http://localhost:8000/api/casos-generales/estadisticas" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Accept: application/json"

# Obtener valores para filtros
curl -X GET "http://localhost:8000/api/casos-generales/filtros/valores" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Accept: application/json"
``` 
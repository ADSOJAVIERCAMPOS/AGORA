# Sistema Completo de Filtros de Búsqueda

## 📋 Resumen

Se ha implementado un sistema completo de filtros de búsqueda para todos los formularios de la aplicación, incluyendo:

- **Casos Generales**: Filtros avanzados por aprendiz, ficha, estado, fecha, responsable, etc.
- **Aprendices**: Filtros por nombre, documento, ficha, estado, email, teléfono, etc.
- **Archivos**: Filtros por nombre, tipo, tamaño, caso asociado, aprendiz, fecha, etc.

## 🎯 Características Principales

### ✅ Funcionalidades Implementadas

1. **Filtros Avanzados**
   - Búsquedas parciales (LIKE %valor%)
   - Búsquedas exactas
   - Filtros por rangos de fecha
   - Filtros por rangos de tamaño (archivos)

2. **Ordenamiento**
   - Por cualquier campo disponible
   - Dirección ascendente o descendente
   - Campos personalizados por módulo

3. **Paginación**
   - Configurable (1-100 registros por página)
   - Por defecto 15 registros
   - Información completa de paginación

4. **Estadísticas**
   - Conteos por diferentes criterios
   - Análisis temporal (por mes)
   - Top elementos más frecuentes

5. **Valores para Filtros**
   - Estados únicos disponibles
   - Tipos únicos
   - Años disponibles para filtros de fecha

6. **Interfaz de Usuario**
   - Formularios de búsqueda intuitivos
   - Resultados en tablas organizadas
   - Navegación por pestañas
   - Diseño responsivo

## 🚀 Módulos Disponibles

### 1. Casos Generales (`/api/casos-generales`)

#### Filtros Disponibles:
- **Nombre del Aprendiz**: Búsqueda parcial
- **Número de Documento**: Búsqueda exacta
- **Tipo de Documento**: Filtro exacto (CC, CE, TI, PP)
- **Número de Ficha**: Búsqueda exacta
- **Estado**: Filtro exacto (Pendiente, En Proceso, Resuelto, Cerrado)
- **Responsable**: Búsqueda parcial
- **Número de Caso**: Búsqueda parcial
- **Motivo**: Búsqueda parcial
- **Fecha Desde/Hasta**: Rango de fechas

#### Ordenamiento:
- `fecha`, `numero_caso`, `nombre_aprendiz`, `estado`, `responsable`, `numero_ficha`

#### Endpoints Adicionales:
- `GET /api/casos-generales/estadisticas` - Estadísticas generales
- `GET /api/casos-generales/filtros/valores` - Valores únicos para filtros

### 2. Aprendices (`/api/aprendices`)

#### Filtros Disponibles:
- **Nombre**: Búsqueda parcial
- **Número de Documento**: Búsqueda exacta
- **Tipo de Documento**: Filtro exacto
- **Número de Ficha**: Búsqueda exacta
- **Estado**: Filtro exacto (Activo, Inactivo, Graduado, Retirado)
- **Email**: Búsqueda parcial
- **Teléfono**: Búsqueda parcial
- **Fecha de Registro Desde/Hasta**: Rango de fechas

#### Ordenamiento:
- `nombre`, `numero_documento`, `numero_ficha`, `estado`, `email`, `created_at`

#### Endpoints Adicionales:
- `GET /api/aprendices/estadisticas` - Estadísticas de aprendices
- `GET /api/aprendices/filtros/valores` - Valores únicos para filtros

### 3. Archivos (`/api/archivos`)

#### Filtros Disponibles:
- **Nombre del Archivo**: Búsqueda parcial
- **Tipo de Archivo**: Filtro exacto (documento, imagen, pdf, video, audio)
- **Tipo MIME**: Búsqueda parcial
- **Tamaño Mínimo/Máximo**: Rango en bytes
- **Número de Caso**: Búsqueda parcial
- **Número de Documento del Aprendiz**: Búsqueda exacta
- **Nombre del Aprendiz**: Búsqueda parcial
- **Número de Ficha**: Búsqueda exacta
- **Fecha Desde/Hasta**: Rango de fechas
- **Descripción**: Búsqueda parcial

#### Ordenamiento:
- `nombre_archivo`, `tipo_archivo`, `tamano_bytes`, `created_at`, `updated_at`

#### Endpoints Adicionales:
- `GET /api/archivos/estadisticas` - Estadísticas de archivos
- `GET /api/archivos/filtros/valores` - Valores únicos para filtros

## 🎨 Interfaz de Usuario

### Dashboard Principal
- **Navegación por Pestañas**: Dashboard, Casos, Aprendices, Archivos
- **Formularios de Búsqueda**: Organizados y intuitivos
- **Resultados en Tablas**: Con información detallada
- **Acciones por Fila**: Ver, editar, descargar, eliminar

### Características del Diseño:
- **Responsivo**: Adaptable a diferentes tamaños de pantalla
- **Moderno**: Diseño limpio y profesional
- **Accesible**: Contraste adecuado y navegación clara
- **Interactivo**: Feedback visual en todas las acciones

## 📊 Ejemplos de Uso

### 1. Buscar Casos Pendientes de una Ficha Específica
```bash
GET /api/casos-generales?numero_ficha=123456&estado=Pendiente&sort_by=fecha&sort_direction=desc
```

### 2. Buscar Aprendices Activos por Nombre
```bash
GET /api/aprendices?nombre=Juan&estado=Activo&sort_by=nombre&sort_direction=asc
```

### 3. Buscar Archivos PDF de un Aprendiz
```bash
GET /api/archivos?tipo_archivo=pdf&numero_documento=12345678&sort_by=created_at&sort_direction=desc
```

### 4. Buscar Casos de un Período Específico
```bash
GET /api/casos-generales?fecha_desde=2025-01-01&fecha_hasta=2025-01-31&responsable=Ana
```

### 5. Buscar Archivos por Tamaño
```bash
GET /api/archivos?tamano_min=1048576&tamano_max=5242880&tipo_archivo=documento
```

## 🔧 Configuración y Uso

### 1. Autenticación
Todos los endpoints requieren autenticación con Laravel Sanctum:

```bash
# Obtener token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Usar token en peticiones
curl -X GET "http://localhost:8000/api/casos-generales" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Accept: application/json"
```

### 2. Parámetros de Paginación
- `per_page`: Número de registros por página (1-100, por defecto 15)
- `page`: Número de página (por defecto 1)

### 3. Parámetros de Ordenamiento
- `sort_by`: Campo para ordenar
- `sort_direction`: Dirección (asc, desc)

## 📈 Respuestas de la API

### Estructura General de Respuesta
```json
{
    "message": "Mensaje descriptivo",
    "datos": [...],
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
        "campo": "fecha",
        "direccion": "desc"
    },
    "estadisticas": {
        "total_registros": 75,
        "registros_encontrados": 15
    }
}
```

### Respuesta de Estadísticas
```json
{
    "message": "Estadísticas obtenidas exitosamente.",
    "estadisticas": {
        "total_registros": 150,
        "por_estado": {
            "pendientes": 45,
            "en_proceso": 30,
            "resueltos": 75
        },
        "por_mes": [...],
        "top_elementos": [...]
    }
}
```

### Respuesta de Valores de Filtros
```json
{
    "message": "Valores de filtros obtenidos exitosamente.",
    "filtros": {
        "estados": ["Pendiente", "En Proceso", "Resuelto"],
        "tipos_documento": ["CC", "CE", "TI"],
        "anios": [2024, 2025]
    }
}
```

## 🧪 Pruebas

### Ejecutar Pruebas Unitarias
```bash
# Pruebas de filtros de casos
php artisan test --filter=CasoGeneralFiltrosTest

# Pruebas de filtros de aprendices
php artisan test --filter=AprendizFiltrosTest

# Pruebas de filtros de archivos
php artisan test --filter=ArchivoFiltrosTest
```

### Scripts de Ejemplo
```bash
# Ejecutar ejemplos de filtros
php ejemplos_filtros.php

# Ejecutar ejemplos de aprendices
php ejemplos_aprendices_filtros.php

# Ejecutar ejemplos de archivos
php ejemplos_archivos_filtros.php
```

## 🔒 Seguridad

### Validaciones Implementadas:
1. **Autenticación**: Todos los endpoints requieren token válido
2. **Autorización**: Verificación de permisos por usuario
3. **Validación de Entrada**: Sanitización de parámetros
4. **Límites de Paginación**: Máximo 100 registros por página
5. **Campos de Ordenamiento**: Solo campos permitidos
6. **Filtros de Fecha**: Validación de formato YYYY-MM-DD

### Logs de Seguridad:
- Todas las consultas se registran en logs
- Errores se capturan y registran
- Información de auditoría disponible

## 🚀 Próximos Pasos

### Mejoras Planificadas:
1. **Búsqueda Full-Text**: Implementar búsqueda en texto completo
2. **Filtros Avanzados**: Operadores AND/OR complejos
3. **Exportación**: Exportar resultados filtrados a Excel/PDF
4. **Caché**: Implementar caché para mejorar rendimiento
5. **Reportes**: Generar reportes basados en filtros
6. **Notificaciones**: Alertas para casos críticos
7. **Dashboard Avanzado**: Gráficos y métricas en tiempo real

### Optimizaciones:
1. **Índices de Base de Datos**: Optimizar consultas frecuentes
2. **Lazy Loading**: Cargar relaciones bajo demanda
3. **Compresión**: Comprimir respuestas grandes
4. **CDN**: Distribuir archivos estáticos

## 📞 Soporte

### Documentación Adicional:
- `README_FILTROS.md` - Documentación específica de filtros de casos
- `FILTROS_CASOS_API.md` - Documentación de API de casos
- `ejemplos_filtros.php` - Ejemplos de uso de filtros

### Contacto:
- **Desarrollador**: Sistema de Coordinación ADSO
- **Versión**: 1.0.0
- **Fecha**: Enero 2025

---

¡El sistema de filtros está completamente funcional y listo para usar! 🎉

**Características Destacadas:**
- ✅ Filtros avanzados en todos los módulos
- ✅ Interfaz de usuario moderna y responsiva
- ✅ API RESTful completa
- ✅ Documentación exhaustiva
- ✅ Pruebas unitarias
- ✅ Seguridad implementada
- ✅ Escalabilidad preparada 
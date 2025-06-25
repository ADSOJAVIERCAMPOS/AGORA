# Sistema de Gestión de Casos y Préstamos

Este sistema permite gestionar casos generales, especiales, de acudientes y préstamos con generación automática de números de caso únicos.

## Características

- **Generación automática de números de caso únicos**: Cada tipo de caso tiene su propio formato:
  - Casos Generales: `CG-YYYY-XXX` (ej: CG-2024-001)
  - Casos Especiales: `CE-YYYY-XXX` (ej: CE-2024-001)
  - Casos de Acudientes: `CA-YYYY-XXX` (ej: CA-2024-001)
  - Préstamos: `PR-YYYY-XXX` (ej: PR-2024-001)

- **Verificación de unicidad**: El sistema verifica en la base de datos que no existan números duplicados antes de asignar uno nuevo.

- **Manejo de archivos**: Soporte para subir documentos relacionados con cada caso.

## Configuración

### 1. Base de Datos

Asegúrate de tener PostgreSQL instalado y configurado. Las variables de entorno deben estar configuradas:

```env
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DB=casos_prestamos
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
```

### 2. Ejecutar Migraciones

Para crear las tablas necesarias, ejecuta las migraciones:

```bash
cd src/db
node run-migrations.js
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

## Estructura del Proyecto

### Componentes de Formularios

- `CasoForm.tsx`: Formulario para casos generales
- `CasoEspecialForm.tsx`: Formulario para casos especiales
- `CasoAcudienteForm.tsx`: Formulario para casos de acudientes
- `PrestamoForm.tsx`: Formulario para préstamos

### Rutas de API

- `/api/casos-generales`: Maneja casos generales
- `/api/casos-especiales`: Maneja casos especiales
- `/api/casos-acudientes`: Maneja casos de acudientes
- `/api/prestamos`: Maneja préstamos

### Generador de Números de Caso

- `utils/caseNumberGenerator.ts`: Clase centralizada para generar números únicos

## Uso

### Crear un Caso General

1. Navega a la pestaña "Crear Caso General"
2. Completa el formulario con los datos del aprendiz
3. El sistema generará automáticamente un número de caso único
4. Se mostrará el número de caso generado en el mensaje de confirmación

### Crear un Caso Especial

1. Navega a la pestaña "Crear Caso Especial"
2. Completa el formulario con los datos del aprendiz y detalles especiales
3. El sistema generará automáticamente un número de caso único
4. Se mostrará el número de caso generado en el mensaje de confirmación

### Crear un Caso de Acudiente

1. Navega a la pestaña "Crear Caso de Acudientes"
2. Completa el formulario con los datos del aprendiz y del acudiente
3. El sistema generará automáticamente un número de caso único
4. Se mostrará el número de caso generado en el mensaje de confirmación

### Registrar un Préstamo

1. Navega a la pestaña "Préstamos"
2. Selecciona "Registrar Préstamo"
3. Completa el formulario con los datos del aprendiz y del elemento
4. El sistema generará automáticamente un número de caso único
5. Se mostrará el número de caso generado en el mensaje de confirmación

## Base de Datos

### Tablas Principales

- `casos_generales`: Almacena casos generales
- `casos_especiales`: Almacena casos especiales
- `casos_acudientes`: Almacena casos de acudientes
- `prestamos`: Almacena préstamos

### Tablas de Archivos

- `archivos_casos_generales`: Archivos relacionados con casos generales
- `archivos_casos_especiales`: Archivos relacionados con casos especiales
- `archivos_casos_acudientes`: Archivos relacionados con casos de acudientes
- `archivos_prestamos`: Archivos relacionados con préstamos

## Seguridad

- Los números de caso se generan en el backend para evitar manipulación
- Se verifica la unicidad en la base de datos antes de asignar un número
- Se implementan transacciones para garantizar la integridad de los datos

## Logs

El sistema registra logs detallados para:
- Generación de números de caso
- Inserción de registros en la base de datos
- Manejo de archivos
- Errores y excepciones

## Troubleshooting

### Error: "No se pudo generar un número de caso único"

Este error puede ocurrir si:
1. La base de datos no está disponible
2. Hay demasiados intentos de generación (máximo 10 por defecto)
3. Problemas de conectividad con la base de datos

### Error: "Faltan campos requeridos"

Verifica que todos los campos obligatorios estén completados antes de enviar el formulario.

### Error de conexión a la base de datos

Verifica que:
1. PostgreSQL esté ejecutándose
2. Las credenciales de conexión sean correctas
3. La base de datos exista
4. Las migraciones se hayan ejecutado correctamente

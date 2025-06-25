-- Create prestamos table
CREATE TABLE IF NOT EXISTS prestamos (
    id SERIAL PRIMARY KEY,
    numero_caso VARCHAR(20) UNIQUE NOT NULL,
    nombre_aprendiz VARCHAR(100) NOT NULL,
    documento_aprendiz VARCHAR(20) NOT NULL,
    descripcion_elemento VARCHAR(255) NOT NULL,
    numero_placa VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion DATE,
    hora_final TIME,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    usuario_registro VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create archivos_prestamos table
CREATE TABLE IF NOT EXISTS archivos_prestamos (
    id SERIAL PRIMARY KEY,
    prestamo_id INTEGER REFERENCES prestamos(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    datos_archivo BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prestamos_numero_caso ON prestamos(numero_caso);
CREATE INDEX IF NOT EXISTS idx_prestamos_documento_aprendiz ON prestamos(documento_aprendiz);
CREATE INDEX IF NOT EXISTS idx_prestamos_estado ON prestamos(estado);
CREATE INDEX IF NOT EXISTS idx_archivos_prestamos_prestamo_id ON archivos_prestamos(prestamo_id); 
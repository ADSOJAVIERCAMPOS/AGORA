-- Create casos_acudientes table
CREATE TABLE IF NOT EXISTS casos_acudientes (
    id SERIAL PRIMARY KEY,
    numero_caso VARCHAR(20) UNIQUE NOT NULL,
    nombre_aprendiz VARCHAR(100) NOT NULL,
    documento_aprendiz VARCHAR(20) NOT NULL,
    fecha_nacimiento_aprendiz DATE NOT NULL,
    programa VARCHAR(100) NOT NULL,
    ficha VARCHAR(20) NOT NULL,
    nombre_acudiente VARCHAR(100) NOT NULL,
    documento_acudiente VARCHAR(20) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    telefono_acudiente VARCHAR(20) NOT NULL,
    email_acudiente VARCHAR(100) NOT NULL,
    direccion_acudiente TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_caso DATE NOT NULL,
    tipo_caso VARCHAR(50) NOT NULL,
    estado_actual TEXT NOT NULL,
    observaciones TEXT,
    usuario_registro VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create archivos_casos_acudientes table
CREATE TABLE IF NOT EXISTS archivos_casos_acudientes (
    id SERIAL PRIMARY KEY,
    caso_id INTEGER REFERENCES casos_acudientes(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    datos_archivo BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_casos_acudientes_numero_caso ON casos_acudientes(numero_caso);
CREATE INDEX IF NOT EXISTS idx_casos_acudientes_documento_aprendiz ON casos_acudientes(documento_aprendiz);
CREATE INDEX IF NOT EXISTS idx_casos_acudientes_documento_acudiente ON casos_acudientes(documento_acudiente);
CREATE INDEX IF NOT EXISTS idx_archivos_casos_acudientes_caso_id ON archivos_casos_acudientes(caso_id); 
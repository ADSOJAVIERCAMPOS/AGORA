-- Create casos_especiales table
CREATE TABLE IF NOT EXISTS casos_especiales (
    id SERIAL PRIMARY KEY,
    numero_caso VARCHAR(20) UNIQUE NOT NULL,
    nombre_aprendiz VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL,
    programa VARCHAR(100) NOT NULL,
    ficha VARCHAR(20) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_caso DATE NOT NULL,
    tipo_caso_especial VARCHAR(50) NOT NULL,
    gravedad VARCHAR(20) NOT NULL,
    estado_actual TEXT NOT NULL,
    medidas_previas TEXT NOT NULL,
    observaciones TEXT,
    usuario_registro VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create archivos_casos_especiales table
CREATE TABLE IF NOT EXISTS archivos_casos_especiales (
    id SERIAL PRIMARY KEY,
    caso_id INTEGER REFERENCES casos_especiales(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    datos_archivo BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_casos_especiales_numero_caso ON casos_especiales(numero_caso);
CREATE INDEX IF NOT EXISTS idx_casos_especiales_documento ON casos_especiales(documento);
CREATE INDEX IF NOT EXISTS idx_archivos_casos_especiales_caso_id ON archivos_casos_especiales(caso_id); 
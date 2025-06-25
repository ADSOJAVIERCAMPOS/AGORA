const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'casos_prestamos',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Iniciando migraciones...');
    
    // Leer archivos de migración en orden
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar alfabéticamente para mantener el orden
    
    for (const file of migrationFiles) {
      console.log(`Ejecutando migración: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      await client.query(sql);
      console.log(`Migración ${file} completada exitosamente`);
    }
    
    console.log('Todas las migraciones han sido ejecutadas exitosamente');
    
  } catch (error) {
    console.error('Error ejecutando migraciones:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migraciones si el script se ejecuta directamente
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migraciones completadas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en migraciones:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations }; 
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'casos_prestamos',
  password: process.env.POSTGRES_PASSWORD || '123',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

export default pool; 
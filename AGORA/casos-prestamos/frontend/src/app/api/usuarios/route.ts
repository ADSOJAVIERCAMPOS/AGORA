import { NextResponse } from 'next/server';
import pool from '@/config/database';
import bcrypt from 'bcryptjs';

// GET: Listar usuarios
export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, name, email, is_active, role_id, created_at, updated_at FROM users ORDER BY id DESC`
      );
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener usuarios', error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

// POST: Crear usuario
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, password, role_id } = data;
    if (!name || !email || !password || !role_id) {
      return NextResponse.json({ success: false, message: 'Faltan campos requeridos' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    try {
      // Verificar si el email ya existe
      const exists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (exists.rowCount > 0) {
        return NextResponse.json({ success: false, message: 'El email ya está registrado' }, { status: 409 });
      }
      const result = await client.query(
        `INSERT INTO users (name, email, password, is_active, role_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, name, email, is_active, role_id` ,
        [name, email, hashedPassword, true, role_id]
      );
      return NextResponse.json({ success: true, user: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al crear usuario', error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

// PUT: Editar usuario
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, email, password, role_id } = data;
    if (!id || !name || !email || !role_id) {
      return NextResponse.json({ success: false, message: 'Faltan campos requeridos' }, { status: 400 });
    }
    const client = await pool.connect();
    try {
      let query, params;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query = `UPDATE users SET name=$1, email=$2, password=$3, role_id=$4, updated_at=NOW() WHERE id=$5 RETURNING id, name, email, is_active, role_id`;
        params = [name, email, hashedPassword, role_id, id];
      } else {
        query = `UPDATE users SET name=$1, email=$2, role_id=$3, updated_at=NOW() WHERE id=$4 RETURNING id, name, email, is_active, role_id`;
        params = [name, email, role_id, id];
      }
      const result = await client.query(query, params);
      if (result.rowCount === 0) {
        return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al editar usuario', error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

// PATCH: Activar/desactivar/reactivar usuario
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, is_active } = data;
    if (typeof id !== 'number' || typeof is_active !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Datos inválidos' }, { status: 400 });
    }
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE users SET is_active=$1, updated_at=NOW() WHERE id=$2 RETURNING id, name, email, is_active, role_id`,
        [is_active, id]
      );
      if (result.rowCount === 0) {
        return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al cambiar estado', error: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 
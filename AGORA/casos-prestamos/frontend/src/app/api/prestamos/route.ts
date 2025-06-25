import { NextResponse } from 'next/server';
import pool from '@/config/database';
import { CaseNumberGenerator } from '@/utils/caseNumberGenerator';

export async function POST(request: Request) {
  console.log('Iniciando procesamiento de préstamo...');
  
  try {
    const formData = await request.formData();
    console.log('FormData recibido:', Object.fromEntries(formData.entries()));
    
    // Extract form data
    const nombreAprendiz = formData.get('nombreAprendiz') as string;
    const documentoAprendiz = formData.get('documentoAprendiz') as string;
    const descripcionElemento = formData.get('descripcionElemento') as string;
    const numeroPlaca = formData.get('numeroPlaca') as string;
    const horaInicio = formData.get('horaInicio') as string;
    const fechaPrestamo = formData.get('fechaPrestamo') as string;
    const usuarioRegistro = formData.get('usuarioRegistro') as string;

    // Validar datos requeridos
    if (!nombreAprendiz || !documentoAprendiz || !descripcionElemento || 
        !numeroPlaca || !horaInicio || !fechaPrestamo || !usuarioRegistro) {
      throw new Error('Faltan campos requeridos en el formulario');
    }

    console.log('Conectando a la base de datos...');
    const client = await pool.connect();
    
    try {
      console.log('Iniciando transacción...');
      await client.query('BEGIN');

      // Generar número de caso único
      console.log('Generando número de caso único...');
      const numeroCaso = await CaseNumberGenerator.generatePrestamoCaseNumber();
      console.log('Número de caso generado:', numeroCaso);

      // Insert the main prestamo record
      console.log('Insertando préstamo...');
      const prestamoResult = await client.query(
        `INSERT INTO prestamos (
          numero_caso, nombre_aprendiz, documento_aprendiz, descripcion_elemento,
          numero_placa, hora_inicio, fecha_prestamo, usuario_registro, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          numeroCaso, nombreAprendiz, documentoAprendiz, descripcionElemento,
          numeroPlaca, horaInicio, fechaPrestamo, usuarioRegistro, 'activo'
        ]
      );

      const prestamoId = prestamoResult.rows[0].id;
      console.log('Préstamo insertado con ID:', prestamoId);

      // Handle file uploads if any
      const files = [];
      for (let i = 0; formData.get(`archivo${i}`); i++) {
        console.log(`Procesando archivo ${i}...`);
        const file = formData.get(`archivo${i}`) as File;
        const buffer = await file.arrayBuffer();
        const fileData = Buffer.from(buffer);

        const fileResult = await client.query(
          `INSERT INTO archivos_prestamos (
            prestamo_id, nombre_archivo, tipo_archivo, datos_archivo
          ) VALUES ($1, $2, $3, $4)
          RETURNING id`,
          [prestamoId, file.name, file.type, fileData]
        );

        files.push(fileResult.rows[0].id);
        console.log(`Archivo ${i} guardado con ID:`, fileResult.rows[0].id);
      }

      console.log('Confirmando transacción...');
      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Préstamo registrado exitosamente',
        data: {
          prestamoId,
          numeroCaso,
          archivos: files
        }
      });

    } catch (error) {
      console.error('Error en la transacción:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error al procesar el préstamo:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al registrar el préstamo',
        error: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  console.log('Obteniendo lista de préstamos...');
  
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          id, numero_caso, nombre_aprendiz, descripcion_elemento as item_prestado,
          fecha_prestamo, fecha_devolucion, estado, usuario_registro
        FROM prestamos 
        ORDER BY created_at DESC`
      );

      const prestamos = result.rows.map(row => ({
        id: row.id,
        numeroCaso: row.numero_caso,
        nombreAprendiz: row.nombre_aprendiz,
        itemPrestado: row.item_prestado,
        fechaPrestamo: row.fecha_prestamo,
        fechaDevolucion: row.fecha_devolucion,
        estado: row.estado,
        documentos: [] // Por ahora vacío, se puede expandir después
      }));

      return NextResponse.json(prestamos);

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al obtener los préstamos'
      },
      { status: 500 }
    );
  }
} 
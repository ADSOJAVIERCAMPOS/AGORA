import { NextResponse } from 'next/server';
import pool from '@/config/database';
import { CaseNumberGenerator } from '@/utils/caseNumberGenerator';

export async function POST(request: Request) {
  console.log('Iniciando procesamiento de caso general...');
  
  try {
    const formData = await request.formData();
    console.log('FormData recibido:', Object.fromEntries(formData.entries()));
    
    // Extract form data
    const nombreAprendiz = formData.get('nombreAprendiz') as string;
    const documento = formData.get('documento') as string;
    const programa = formData.get('programa') as string;
    const ficha = formData.get('ficha') as string;
    const descripcion = formData.get('descripcion') as string;
    const fechaCaso = formData.get('fechaCaso') as string;
    const usuarioRegistro = formData.get('usuarioRegistro') as string;

    // Validar datos requeridos
    if (!nombreAprendiz || !documento || !programa || !ficha || 
        !descripcion || !fechaCaso || !usuarioRegistro) {
      throw new Error('Faltan campos requeridos en el formulario');
    }

    console.log('Conectando a la base de datos...');
    const client = await pool.connect();
    
    try {
      console.log('Iniciando transacción...');
      await client.query('BEGIN');

      // Generar número de caso único
      console.log('Generando número de caso único...');
      const numeroCaso = await CaseNumberGenerator.generateGeneralCaseNumber();
      console.log('Número de caso generado:', numeroCaso);

      // Insert the main case record
      console.log('Insertando caso general...');
      const casoResult = await client.query(
        `INSERT INTO casos_generales (
          numero_caso, nombre_aprendiz, documento, programa, ficha,
          descripcion, fecha_caso, usuario_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          numeroCaso, nombreAprendiz, documento, programa, ficha,
          descripcion, fechaCaso, usuarioRegistro
        ]
      );

      const casoId = casoResult.rows[0].id;
      console.log('Caso general insertado con ID:', casoId);

      // Handle file uploads if any
      const files = [];
      for (let i = 0; formData.get(`archivo${i}`); i++) {
        console.log(`Procesando archivo ${i}...`);
        const file = formData.get(`archivo${i}`) as File;
        const buffer = await file.arrayBuffer();
        const fileData = Buffer.from(buffer);

        const fileResult = await client.query(
          `INSERT INTO archivos_casos_generales (
            caso_id, nombre_archivo, tipo_archivo, datos_archivo
          ) VALUES ($1, $2, $3, $4)
          RETURNING id`,
          [casoId, file.name, file.type, fileData]
        );

        files.push(fileResult.rows[0].id);
        console.log(`Archivo ${i} guardado con ID:`, fileResult.rows[0].id);
      }

      console.log('Confirmando transacción...');
      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Caso general registrado exitosamente',
        data: {
          casoId,
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
    console.error('Error al procesar el caso general:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al registrar el caso general',
        error: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
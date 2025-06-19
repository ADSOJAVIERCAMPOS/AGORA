import { NextResponse } from 'next/server';
import pool from '@/config/database';
import { CaseNumberGenerator } from '@/utils/caseNumberGenerator';

export async function POST(request: Request) {
  console.log('Iniciando procesamiento de caso de acudiente...');
  
  try {
    const formData = await request.formData();
    console.log('FormData recibido:', Object.fromEntries(formData.entries()));
    
    // Extract form data - Datos del Aprendiz
    const nombreAprendiz = formData.get('nombreAprendiz') as string;
    const documentoAprendiz = formData.get('documentoAprendiz') as string;
    const fechaNacimientoAprendiz = formData.get('fechaNacimientoAprendiz') as string;
    const programa = formData.get('programa') as string;
    const ficha = formData.get('ficha') as string;
    
    // Datos del Acudiente
    const nombreAcudiente = formData.get('nombreAcudiente') as string;
    const documentoAcudiente = formData.get('documentoAcudiente') as string;
    const parentesco = formData.get('parentesco') as string;
    const telefonoAcudiente = formData.get('telefonoAcudiente') as string;
    const emailAcudiente = formData.get('emailAcudiente') as string;
    const direccionAcudiente = formData.get('direccionAcudiente') as string;
    
    // Datos del Caso
    const descripcion = formData.get('descripcion') as string;
    const fechaCaso = formData.get('fechaCaso') as string;
    const tipoCaso = formData.get('tipoCaso') as string;
    const estadoActual = formData.get('estadoActual') as string;
    const observaciones = formData.get('observaciones') as string;
    const usuarioRegistro = formData.get('usuarioRegistro') as string;

    // Validar datos requeridos
    if (!nombreAprendiz || !documentoAprendiz || !fechaNacimientoAprendiz || !programa || !ficha ||
        !nombreAcudiente || !documentoAcudiente || !parentesco || !telefonoAcudiente || 
        !emailAcudiente || !direccionAcudiente || !descripcion || !fechaCaso || 
        !tipoCaso || !estadoActual || !usuarioRegistro) {
      throw new Error('Faltan campos requeridos en el formulario');
    }

    console.log('Conectando a la base de datos...');
    const client = await pool.connect();
    
    try {
      console.log('Iniciando transacción...');
      await client.query('BEGIN');

      // Generar número de caso único
      console.log('Generando número de caso único...');
      const numeroCaso = await CaseNumberGenerator.generateAcudienteCaseNumber();
      console.log('Número de caso generado:', numeroCaso);

      // Insert the main case record
      console.log('Insertando caso de acudiente...');
      const casoResult = await client.query(
        `INSERT INTO casos_acudientes (
          numero_caso, nombre_aprendiz, documento_aprendiz, fecha_nacimiento_aprendiz,
          programa, ficha, nombre_acudiente, documento_acudiente, parentesco,
          telefono_acudiente, email_acudiente, direccion_acudiente, descripcion,
          fecha_caso, tipo_caso, estado_actual, observaciones, usuario_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id`,
        [
          numeroCaso, nombreAprendiz, documentoAprendiz, fechaNacimientoAprendiz,
          programa, ficha, nombreAcudiente, documentoAcudiente, parentesco,
          telefonoAcudiente, emailAcudiente, direccionAcudiente, descripcion,
          fechaCaso, tipoCaso, estadoActual, observaciones, usuarioRegistro
        ]
      );

      const casoId = casoResult.rows[0].id;
      console.log('Caso de acudiente insertado con ID:', casoId);

      // Handle file uploads if any
      const files = [];
      for (let i = 0; formData.get(`archivo${i}`); i++) {
        console.log(`Procesando archivo ${i}...`);
        const file = formData.get(`archivo${i}`) as File;
        const buffer = await file.arrayBuffer();
        const fileData = Buffer.from(buffer);

        const fileResult = await client.query(
          `INSERT INTO archivos_casos_acudientes (
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
        message: 'Caso de acudiente registrado exitosamente',
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
    console.error('Error al procesar el caso de acudiente:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error al registrar el caso de acudiente',
        error: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
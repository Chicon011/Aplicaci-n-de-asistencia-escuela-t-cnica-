import { db } from './index.ts';
import { cursos, estudiantes, asistencias, usuarios } from './schema.ts';
import { eq, and, sql } from 'drizzle-orm';

const FIRST_NAMES = [
  'Mateo', 'Valentina', 'Santiago', 'Camila', 'Benjamín', 'Mía', 'Lucas', 'Martina',
  'Joaquín', 'Catalina', 'Thiago', 'Emma', 'Felipe', 'Delfina', 'Bautista', 'Zoe',
  'Santino', 'Julieta', 'Ignacio', 'Lucía', 'Facundo', 'Victoria', 'Lautaro', 'Abril',
  'Tomás', 'Sofía', 'Agustín', 'Renata', 'Gael', 'Alma'
];

const LAST_NAMES = [
  'Álvarez', 'Benítez', 'Castro', 'Díaz', 'Espinoza', 'Fernández', 'Gómez', 'Herrera',
  'Ibáñez', 'Juárez', 'López', 'Martínez', 'Navarro', 'Ortiz', 'Pereyra', 'Quiroga',
  'Romero', 'Silva', 'Torres', 'Urquiza', 'Vargas', 'Williams', 'Yáñez', 'Zárate',
  'Acosta', 'Barrios', 'Cabrera', 'Domínguez', 'Escobar', 'Flores'
];

export async function ensureUsersSeeded(): Promise<void> {
  try {
    const existingUsers = await db.select().from(usuarios);
    if (existingUsers.length === 0) {
      await db.insert(usuarios).values([
        {
          id_usuario: 1,
          nombre_usuario: 'profesor.garcia',
          email: 'profesor.garcia@escuela.edu',
          password_hash: 'docente123',
          rol: 'docente',
        },
        {
          id_usuario: 2,
          nombre_usuario: 'julian.perez',
          email: 'julian0309xx@gmail.com',
          password_hash: 'Password123!',
          rol: 'administrador',
          uid: 'usr_demo_1',
        },
        {
          id_usuario: 3,
          nombre_usuario: 'preceptora.lopez',
          email: 'preceptora.lopez@escuela.edu',
          password_hash: 'preceptor123',
          rol: 'preceptor',
        },
      ]);
      console.log('[PostgreSQL] Usuarios iniciales sembrados con éxito.');
    }
  } catch (err) {
    console.warn('[PostgreSQL] Could not seed users:', err);
  }
}

export async function ensureDatabaseSeeded(): Promise<void> {
  try {
    await ensureUsersSeeded();

    const existingCursos = await db.select().from(cursos);
    if (existingCursos.length > 0) {
      return;
    }

    console.log('[PostgreSQL] Base de datos vacía. Iniciando carga inicial de cursos y estudiantes...');

    // 1. Insert default courses (1°, 2°, 3° año - divisiones A y B)
    const defaultCursos = [
      { anio: 1, division: 'A', turno: 'Mañana' },
      { anio: 1, division: 'B', turno: 'Tarde' },
      { anio: 2, division: 'A', turno: 'Mañana' },
      { anio: 2, division: 'B', turno: 'Tarde' },
      { anio: 3, division: 'A', turno: 'Mañana' },
      { anio: 3, division: 'B', turno: 'Tarde' },
    ];

    const insertedCursos = await db.insert(cursos).values(defaultCursos).returning();

    // 2. Insert 30 students per division (180 total)
    let globalIndex = 0;
    const studentsToInsert = [];

    for (const c of insertedCursos) {
      for (let i = 0; i < 30; i++) {
        globalIndex++;
        const dni = `${50000000 + c.id_curso * 1000 + i + 1}`;
        studentsToInsert.push({
          dni,
          apellido: LAST_NAMES[i % LAST_NAMES.length],
          nombre: FIRST_NAMES[i % FIRST_NAMES.length],
          id_curso: c.id_curso,
          estado: true,
        });
      }
    }

    const insertedEstudiantes = await db.insert(estudiantes).values(studentsToInsert).returning();

    // 3. Insert default attendance for today for the first course
    const todayIso = new Date().toISOString().split('T')[0];
    const firstCourseStudents = insertedEstudiantes.filter((s) => s.id_curso === insertedCursos[0].id_curso);

    const attendancesToInsert = firstCourseStudents.map((st, idx) => {
      let estado = 'P';
      let observacion = '';
      if (idx === 2 || idx === 9) {
        estado = 'A';
        observacion = 'Sin aviso';
      } else if (idx === 4) {
        estado = 'T';
        observacion = 'Demora 15 min';
      } else if (idx === 6) {
        estado = 'AJ';
        observacion = 'Certificado médico presentado';
      }
      return {
        id_estudiante: st.id_estudiante,
        fecha: todayIso,
        estado,
        observacion,
      };
    });

    if (attendancesToInsert.length > 0) {
      await db.insert(asistencias).values(attendancesToInsert);
    }

    console.log('[PostgreSQL] Carga inicial completada exitosamente: 6 cursos y 180 estudiantes.');
  } catch (err) {
    console.error('[PostgreSQL] Error durante la inicialización de datos:', err);
  }
}

export async function getCursos() {
  try {
    await ensureDatabaseSeeded();
    return await db.select().from(cursos).orderBy(cursos.anio, cursos.division);
  } catch (error) {
    console.error('Error fetching cursos from PostgreSQL:', error);
    throw new Error('No se pudieron obtener los cursos de la base de datos.', { cause: error });
  }
}

export async function addCurso(anio: number, division: string, turno: string = 'Mañana') {
  try {
    const formattedDivision = division.toUpperCase().trim();
    const result = await db.insert(cursos)
      .values({
        anio,
        division: formattedDivision,
        turno,
      })
      .returning();

    const newCurso = result[0];

    // Seed 30 students automatically for this newly created division
    const studentsToInsert = [];
    for (let i = 0; i < 30; i++) {
      const dni = `${50000000 + newCurso.id_curso * 1000 + i + 1}`;
      studentsToInsert.push({
        dni,
        apellido: LAST_NAMES[i % LAST_NAMES.length],
        nombre: FIRST_NAMES[i % FIRST_NAMES.length],
        id_curso: newCurso.id_curso,
        estado: true,
      });
    }

    await db.insert(estudiantes).values(studentsToInsert);

    return newCurso;
  } catch (error) {
    console.error('Error adding curso to PostgreSQL:', error);
    throw new Error('No se pudo registrar la nueva división en la base de datos.', { cause: error });
  }
}

export async function getEstudiantesByCurso(cursoId: number) {
  try {
    await ensureDatabaseSeeded();
    return await db.select()
      .from(estudiantes)
      .where(eq(estudiantes.id_curso, cursoId))
      .orderBy(estudiantes.apellido, estudiantes.nombre);
  } catch (error) {
    console.error('Error fetching estudiantes from PostgreSQL:', error);
    throw new Error('No se pudieron obtener los estudiantes de la base de datos.', { cause: error });
  }
}

export async function addEstudiante(data: { dni: string; apellido: string; nombre: string; id_curso: number }) {
  try {
    const result = await db.insert(estudiantes)
      .values({
        dni: data.dni.trim(),
        apellido: data.apellido.trim(),
        nombre: data.nombre.trim(),
        id_curso: data.id_curso,
        estado: true,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error adding estudiante to PostgreSQL:', error);
    throw new Error('No se pudo guardar el nuevo estudiante en la base de datos.', { cause: error });
  }
}

export async function deleteEstudiante(id_estudiante: number) {
  try {
    // Delete any attendance records first to avoid foreign key errors
    await db.delete(asistencias).where(eq(asistencias.id_estudiante, id_estudiante));
    // Delete student
    await db.delete(estudiantes).where(eq(estudiantes.id_estudiante, id_estudiante));
    return { success: true };
  } catch (error) {
    console.error('Error deleting estudiante in PostgreSQL:', error);
    throw new Error('No se pudo eliminar el estudiante de la base de datos.', { cause: error });
  }
}

export async function getAsistencias(params: { cursoId?: number; fecha?: string }) {
  try {
    await ensureDatabaseSeeded();
    let query = db.select({
      id_asistencia: asistencias.id_asistencia,
      id_estudiante: asistencias.id_estudiante,
      fecha: asistencias.fecha,
      estado: asistencias.estado,
      observacion: asistencias.observacion,
      id_usuario: asistencias.id_usuario,
      estudiante_dni: estudiantes.dni,
      estudiante_apellido: estudiantes.apellido,
      estudiante_nombre: estudiantes.nombre,
      id_curso: estudiantes.id_curso,
    })
    .from(asistencias)
    .innerJoin(estudiantes, eq(asistencias.id_estudiante, estudiantes.id_estudiante));

    if (params.cursoId && params.fecha) {
      return await query.where(and(eq(estudiantes.id_curso, params.cursoId), eq(asistencias.fecha, params.fecha)));
    } else if (params.cursoId) {
      return await query.where(eq(estudiantes.id_curso, params.cursoId));
    } else if (params.fecha) {
      return await query.where(eq(asistencias.fecha, params.fecha));
    }

    return await query;
  } catch (error) {
    console.error('Error fetching asistencias from PostgreSQL:', error);
    throw new Error('No se pudieron obtener los registros de asistencia.', { cause: error });
  }
}

export async function saveAsistencias(
  fecha: string,
  registros: Array<{ id_estudiante: number; estado: string; observacion?: string }>,
  id_usuario?: number | null
) {
  try {
    await ensureUsersSeeded();

    let validUserId: number | null = null;
    if (id_usuario) {
      const found = await db
        .select({ id: usuarios.id_usuario })
        .from(usuarios)
        .where(eq(usuarios.id_usuario, id_usuario));
      if (found.length > 0) {
        validUserId = found[0].id;
      }
    }

    if (!validUserId) {
      const firstUser = await db
        .select({ id: usuarios.id_usuario })
        .from(usuarios)
        .limit(1);
      if (firstUser.length > 0) {
        validUserId = firstUser[0].id;
      }
    }

    let savedCount = 0;

    for (const r of registros) {
      await db.insert(asistencias)
        .values({
          id_estudiante: r.id_estudiante,
          fecha,
          estado: r.estado,
          observacion: r.observacion || '',
          id_usuario: validUserId,
        })
        .onConflictDoUpdate({
          target: [asistencias.id_estudiante, asistencias.fecha],
          set: {
            estado: r.estado,
            observacion: r.observacion || '',
            id_usuario: validUserId,
          },
        });
      savedCount++;
    }

    return { success: true, count: savedCount };
  } catch (error) {
    console.error('Error saving asistencias in PostgreSQL:', error);
    throw new Error('No se pudieron guardar las asistencias en la base de datos.', { cause: error });
  }
}

export async function getEstadisticas() {
  try {
    await ensureDatabaseSeeded();
    const allStudents = await db.select().from(estudiantes);
    const allAttendances = await db.select().from(asistencias);

    const totalEstudiantes = allStudents.length;
    const totalRegistros = allAttendances.length;

    let presentes = 0;
    let ausentes = 0;
    let tardanzas = 0;
    let ausentesJustificados = 0;

    allAttendances.forEach((a) => {
      if (a.estado === 'P') presentes++;
      else if (a.estado === 'A') ausentes++;
      else if (a.estado === 'T') tardanzas++;
      else if (a.estado === 'AJ') ausentesJustificados++;
    });

    const porcentajeAsistencia = totalRegistros > 0
      ? Math.round(((presentes + tardanzas) / totalRegistros) * 100)
      : 100;
    const porcentajeInasistencia = totalRegistros > 0
      ? Math.round((ausentes / totalRegistros) * 100)
      : 0;

    return {
      totalEstudiantes,
      totalRegistros,
      presentes,
      ausentes,
      tardanzas,
      ausentesJustificados,
      porcentajeAsistencia,
      porcentajeInasistencia,
    };
  } catch (error) {
    console.error('Error computing estadisticas from PostgreSQL:', error);
    throw new Error('No se pudieron calcular las estadísticas de la base de datos.', { cause: error });
  }
}

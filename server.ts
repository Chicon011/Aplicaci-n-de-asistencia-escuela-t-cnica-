/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory relational store mirroring PostgreSQL / MySQL tables
interface UsuarioRow {
  id_usuario: number;
  nombre_usuario: string;
  password_hash: string;
  rol: string;
}

interface CursoRow {
  id_curso: number;
  anio: number;
  division: string;
  turno: string;
}

interface EstudianteRow {
  id_estudiante: number;
  dni: string;
  apellido: string;
  nombre: string;
  id_curso: number;
  estado: boolean;
}

interface AsistenciaRow {
  id_asistencia: number;
  id_estudiante: number;
  fecha: string;
  estado: 'P' | 'A' | 'T' | 'AJ';
  observacion: string | null;
  id_usuario: number | null;
}

// Initial seed data
const DB = {
  usuarios: [
    { id_usuario: 1, nombre_usuario: 'profesor.garcia', password_hash: '$2a$10$...', rol: 'docente' },
    { id_usuario: 2, nombre_usuario: 'preceptora.lopez', password_hash: '$2a$10$...', rol: 'preceptor' },
    { id_usuario: 3, nombre_usuario: 'admin.escolar', password_hash: '$2a$10$...', rol: 'administrador' },
  ] as UsuarioRow[],

  cursos: [
    { id_curso: 1, anio: 1, division: 'A', turno: 'Mañana' },
    { id_curso: 2, anio: 1, division: 'B', turno: 'Tarde' },
    { id_curso: 3, anio: 2, division: 'A', turno: 'Mañana' },
    { id_curso: 4, anio: 2, division: 'B', turno: 'Tarde' },
    { id_curso: 5, anio: 3, division: 'A', turno: 'Mañana' },
    { id_curso: 6, anio: 3, division: 'B', turno: 'Tarde' },
  ] as CursoRow[],

  estudiantes: [] as EstudianteRow[],
  asistencias: [] as AsistenciaRow[],
};

// Seed 30 students per course (180 total)
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

let studentSeq = 1;
DB.cursos.forEach((c) => {
  for (let i = 0; i < 30; i++) {
    const dni = `${50000000 + c.id_curso * 1000 + i + 1}`;
    DB.estudiantes.push({
      id_estudiante: studentSeq++,
      dni,
      apellido: LAST_NAMES[i % LAST_NAMES.length],
      nombre: FIRST_NAMES[i % FIRST_NAMES.length],
      id_curso: c.id_curso,
      estado: true,
    });
  }
});

// Seed some attendance records
let attSeq = 1;
const todayIso = new Date().toISOString().split('T')[0];
DB.estudiantes.slice(0, 30).forEach((st, idx) => {
  let estado: 'P' | 'A' | 'T' | 'AJ' = 'P';
  let observacion: string | null = null;
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

  DB.asistencias.push({
    id_asistencia: attSeq++,
    id_estudiante: st.id_estudiante,
    fecha: todayIso,
    estado,
    observacion,
    id_usuario: 1,
  });
});

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Technical requirement: REST API with Express.js
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      tecnologias: {
        runtime: 'Node.js',
        framework: 'Express.js',
        baseDeDatos: 'PostgreSQL / MySQL compatible',
        deployTarget: 'Render',
        vcs: 'Git & GitHub',
      },
    });
  });

  // GET /api/cursos
  app.get('/api/cursos', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: DB.cursos,
    });
  });

  // POST /api/cursos (Add division)
  app.post('/api/cursos', (req: Request, res: Response) => {
    const { anio, division, turno } = req.body;
    if (!anio || !division) {
      res.status(400).json({ success: false, error: 'Año y división son obligatorios' });
      return;
    }

    const newCurso: CursoRow = {
      id_curso: DB.cursos.length + 1,
      anio: parseInt(anio, 10),
      division: division.toUpperCase().trim(),
      turno: turno || 'Mañana',
    };

    DB.cursos.push(newCurso);

    // Seed 30 students for this new division
    for (let i = 0; i < 30; i++) {
      const dni = `${50000000 + newCurso.id_curso * 1000 + i + 1}`;
      DB.estudiantes.push({
        id_estudiante: studentSeq++,
        dni,
        apellido: LAST_NAMES[i % LAST_NAMES.length],
        nombre: FIRST_NAMES[i % FIRST_NAMES.length],
        id_curso: newCurso.id_curso,
        estado: true,
      });
    }

    res.status(201).json({ success: true, data: newCurso });
  });

  // GET /api/cursos/:id/estudiantes
  app.get('/api/cursos/:id/estudiantes', (req: Request, res: Response) => {
    const cursoId = parseInt(req.params.id, 10);
    const students = DB.estudiantes.filter((s) => s.id_curso === cursoId);
    res.json({ success: true, count: students.length, data: students });
  });

  // GET /api/asistencias?cursoId=...&fecha=...
  app.get('/api/asistencias', (req: Request, res: Response) => {
    const { cursoId, fecha } = req.query;
    let list = DB.asistencias;

    if (fecha) {
      list = list.filter((a) => a.fecha === fecha);
    }

    if (cursoId) {
      const cId = parseInt(cursoId as string, 10);
      const studentIdsInCourse = new Set(
        DB.estudiantes.filter((s) => s.id_curso === cId).map((s) => s.id_estudiante)
      );
      list = list.filter((a) => studentIdsInCourse.has(a.id_estudiante));
    }

    res.json({ success: true, count: list.length, data: list });
  });

  // POST /api/asistencias (Batch save enforcing UNIQUE (id_estudiante, fecha))
  app.post('/api/asistencias', (req: Request, res: Response) => {
    const { fecha, registros } = req.body;
    if (!fecha || !Array.isArray(registros)) {
      res.status(400).json({ success: false, error: 'Fecha y registros son obligatorios' });
      return;
    }

    // Process records with UNIQUE constraint enforcement
    let updatedCount = 0;
    let insertedCount = 0;

    registros.forEach((r: { id_estudiante: number; estado: 'P' | 'A' | 'T' | 'AJ'; observacion?: string }) => {
      const existingIdx = DB.asistencias.findIndex(
        (a) => a.id_estudiante === r.id_estudiante && a.fecha === fecha
      );

      if (existingIdx >= 0) {
        DB.asistencias[existingIdx].estado = r.estado;
        DB.asistencias[existingIdx].observacion = r.observacion || null;
        updatedCount++;
      } else {
        DB.asistencias.push({
          id_asistencia: attSeq++,
          id_estudiante: r.id_estudiante,
          fecha,
          estado: r.estado,
          observacion: r.observacion || null,
          id_usuario: 1,
        });
        insertedCount++;
      }
    });

    res.json({
      success: true,
      message: 'Asistencia registrada con éxito (Restricción UNIQUE verificada)',
      inserted: insertedCount,
      updated: updatedCount,
    });
  });

  // GET /api/estadisticas
  app.get('/api/estadisticas', (req: Request, res: Response) => {
    const totalStudents = DB.estudiantes.length;
    const totalRecords = DB.asistencias.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let justifiedCount = 0;

    DB.asistencias.forEach((a) => {
      if (a.estado === 'P') presentCount++;
      else if (a.estado === 'A') absentCount++;
      else if (a.estado === 'T') lateCount++;
      else if (a.estado === 'AJ') justifiedCount++;
    });

    const attRate = totalRecords > 0 ? Math.round(((presentCount + lateCount) / totalRecords) * 100) : 100;
    const absRate = totalRecords > 0 ? Math.round((absentCount / totalRecords) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalEstudiantes: totalStudents,
        totalRegistros: totalRecords,
        presentes: presentCount,
        ausentes: absentCount,
        tardanzas: lateCount,
        ausentesJustificados: justifiedCount,
        porcentajeAsistencia: attRate,
        porcentajeInasistencia: absRate,
      },
    });
  });

  // GET /api/database/schema/:engine (Download SQL DDL)
  app.get('/api/database/schema/:engine', (req: Request, res: Response) => {
    const engine = req.params.engine.toLowerCase();
    const fileName = engine === 'mysql' ? 'schema-mysql.sql' : 'schema-postgres.sql';
    const filePath = path.resolve(__dirname, 'database', fileName);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Script no encontrado' });
    }
  });

  // Mount Vite middleware in development mode, or serve dist in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EduAsistencia Server] Node.js + Express.js corriendo en http://0.0.0.0:${PORT}`);
  });
}

startServer();

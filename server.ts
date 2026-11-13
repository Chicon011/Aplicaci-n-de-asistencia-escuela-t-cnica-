/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  ensureDatabaseSeeded,
  getCursos,
  addCurso,
  getEstudiantesByCurso,
  addEstudiante,
  deleteEstudiante,
  getAsistencias,
  saveAsistencias,
  getEstadisticas,
} from './src/db/service.ts';
import { optionalAuth, AuthRequest } from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());
  app.use(optionalAuth);

  // Technical requirement: REST API with Express.js + PostgreSQL status
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const cursosList = await getCursos();
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          engine: 'PostgreSQL',
          status: 'connected',
          persistencia: 'Permanente en Cloud SQL / PostgreSQL (sin pérdida de datos tras reinicio o actualización)',
          totalCursos: cursosList.length,
        },
        tecnologias: {
          runtime: 'Node.js',
          framework: 'Express.js',
          orm: 'Drizzle ORM (PostgreSQL)',
          deployTarget: 'Render & Cloud Run',
          vcs: 'Git & GitHub',
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        error: err.message || 'Error al conectar con PostgreSQL',
      });
    }
  });

  // GET /api/cursos (Read all courses from PostgreSQL)
  app.get('/api/cursos', async (req: Request, res: Response) => {
    try {
      const data = await getCursos();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error al obtener cursos' });
    }
  });

  // POST /api/cursos (Add new division to PostgreSQL + generate 30 students)
  app.post('/api/cursos', async (req: Request, res: Response) => {
    try {
      const { anio, division, turno } = req.body;
      if (!anio || !division) {
        res.status(400).json({ success: false, error: 'Año y división son obligatorios' });
        return;
      }

      const newCurso = await addCurso(parseInt(anio, 10), division, turno || 'Mañana');
      res.status(201).json({
        success: true,
        message: 'División creada y persistida en PostgreSQL con 30 alumnos asignados',
        data: newCurso,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error al crear curso' });
    }
  });

  // GET /api/cursos/:id/estudiantes (Fetch students of course from PostgreSQL)
  app.get('/api/cursos/:id/estudiantes', async (req: Request, res: Response) => {
    try {
      const cursoId = parseInt(req.params.id, 10);
      const data = await getEstudiantesByCurso(cursoId);
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error al obtener estudiantes' });
    }
  });

  // POST /api/estudiantes (Create single student in PostgreSQL)
  app.post('/api/estudiantes', async (req: Request, res: Response) => {
    try {
      const { dni, apellido, nombre, id_curso } = req.body;
      if (!dni || !apellido || !nombre || !id_curso) {
        res.status(400).json({ success: false, error: 'DNI, apellido, nombre y curso son obligatorios' });
        return;
      }

      const newStudent = await addEstudiante({
        dni,
        apellido,
        nombre,
        id_curso: parseInt(id_curso, 10),
      });

      res.status(201).json({
        success: true,
        message: 'Estudiante agregado y guardado de forma permanente en PostgreSQL',
        data: newStudent,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error al agregar estudiante' });
    }
  });

  // DELETE /api/estudiantes/:id (Delete student and cascade attendances in PostgreSQL)
  app.delete('/api/estudiantes/:id', async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.id, 10);
      if (!studentId || isNaN(studentId)) {
        res.status(400).json({ success: false, error: 'ID de estudiante no válido' });
        return;
      }

      await deleteEstudiante(studentId);
      res.json({
        success: true,
        message: `Estudiante ${studentId} eliminado de PostgreSQL correctamente`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error al eliminar estudiante' });
    }
  });

  // GET /api/asistencias?cursoId=...&fecha=... (Fetch attendance records from PostgreSQL)
  app.get('/api/asistencias', async (req: Request, res: Response) => {
    try {
      const { cursoId, fecha } = req.query;
      const cId = cursoId ? parseInt(cursoId as string, 10) : undefined;
      const f = fecha ? (fecha as string) : undefined;

      const data = await getAsistencias({ cursoId: cId, fecha: f });
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error al consultar asistencias' });
    }
  });

  // POST /api/asistencias (Batch save enforcing UNIQUE (id_estudiante, fecha) in PostgreSQL)
  app.post('/api/asistencias', async (req: Request, res: Response) => {
    try {
      const { fecha, registros, id_usuario } = req.body;
      if (!fecha || !Array.isArray(registros)) {
        res.status(400).json({ success: false, error: 'Fecha y registros son obligatorios' });
        return;
      }

      const result = await saveAsistencias(fecha, registros, id_usuario || 1);
      res.json({
        success: true,
        message: 'Asistencia registrada con éxito en PostgreSQL (Restricción UNIQUE verificada)',
        count: result.count,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error al guardar asistencias' });
    }
  });

  // GET /api/estadisticas (Compute statistics directly from PostgreSQL)
  app.get('/api/estadisticas', async (req: Request, res: Response) => {
    try {
      const data = await getEstadisticas();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error al calcular estadísticas' });
    }
  });

  // GET /api/database/schema/:engine (Download SQL DDL for Render / PostgreSQL / MySQL)
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
    console.log(`[EduAsistencia Server] Node.js + Express.js + PostgreSQL corriendo en http://0.0.0.0:${PORT}`);
  });
}

startServer();

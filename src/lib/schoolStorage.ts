/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AcademicYear,
  ShiftType,
  CourseDivision,
  Student,
  AttendanceRecord,
  AttendanceStatus,
  StudentAttendanceStats,
  CourseDailySummary,
  UsuarioDB,
  CursoDB,
  EstudianteDB,
  AsistenciaDB,
} from '../types/school';

const SCHOOL_STORAGE_KEYS = {
  COURSES: 'edu_courses_v2',
  STUDENTS: 'edu_students_v2',
  ATTENDANCE: 'edu_attendance_v2',
};

// ============================================================================
// 1. Relational Database Tables: DDL SQL Schema Definition
// ============================================================================

export const DDL_SCHEMA_SQL = `
-- ============================================================================
-- BASE DE DATOS RELACIONAL: SISTEMA DE CONTROL DE ASISTENCIA ESCOLAR
-- ============================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'docente'
);

CREATE TABLE IF NOT EXISTS cursos (
  id_curso INT AUTO_INCREMENT PRIMARY KEY,
  anio INT NOT NULL CHECK (anio IN (1, 2, 3)),
  division VARCHAR(5) NOT NULL,
  turno VARCHAR(20) NOT NULL,
  aula VARCHAR(50),
  preceptor VARCHAR(100),
  CONSTRAINT uq_curso_anio_division_turno UNIQUE (anio, division, turno)
);

CREATE TABLE IF NOT EXISTS estudiantes (
  id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(15) NOT NULL UNIQUE,
  apellido VARCHAR(80) NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  id_curso INT NOT NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  tutor_nombre VARCHAR(100),
  tutor_telefono VARCHAR(30),
  observaciones VARCHAR(255),
  FOREIGN KEY (id_curso) REFERENCES cursos(id_curso) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS asistencias (
  id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  fecha DATE NOT NULL,
  estado VARCHAR(5) NOT NULL CHECK (estado IN ('P', 'A', 'T', 'AJ')),
  observacion VARCHAR(255),
  id_usuario INT NOT NULL,
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
  -- Restricción UNIQUE para evitar registros duplicados por estudiante y fecha
  CONSTRAINT uq_asistencia_estudiante_fecha UNIQUE (id_estudiante, fecha)
);
`;

// ============================================================================
// 2. Initial Seed: Cursos de 1.º, 2.º y 3.º Año
// ============================================================================

const INITIAL_COURSES: CourseDivision[] = [
  {
    id: 'c_1',
    id_curso: 1,
    year: 1,
    divisionName: '1.ª División',
    shift: 'Mañana',
    classroom: 'Aula 101',
    preceptor: 'Prof. Carlos Gómez',
    academicYearLabel: '1.º Año',
    displayName: '1.º 1.ª - Turno Mañana',
    createdAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'c_2',
    id_curso: 2,
    year: 1,
    divisionName: '2.ª División',
    shift: 'Tarde',
    classroom: 'Aula 102',
    preceptor: 'Prof. Marcela Morales',
    academicYearLabel: '1.º Año',
    displayName: '1.º 2.ª - Turno Tarde',
    createdAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'c_3',
    id_curso: 3,
    year: 2,
    divisionName: '1.ª División',
    shift: 'Mañana',
    classroom: 'Aula 201',
    preceptor: 'Prof. Rodrigo Varela',
    academicYearLabel: '2.º Año',
    displayName: '2.º 1.ª - Turno Mañana',
    createdAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'c_4',
    id_curso: 4,
    year: 2,
    divisionName: '2.ª División',
    shift: 'Tarde',
    classroom: 'Aula 202',
    preceptor: 'Prof. Valeria Díaz',
    academicYearLabel: '2.º Año',
    displayName: '2.º 2.ª - Turno Tarde',
    createdAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'c_5',
    id_curso: 5,
    year: 3,
    divisionName: '1.ª División',
    shift: 'Mañana',
    classroom: 'Aula 301',
    preceptor: 'Prof. Martín Herrera',
    academicYearLabel: '3.º Año',
    displayName: '3.º 1.ª - Turno Mañana',
    createdAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'c_6',
    id_curso: 6,
    year: 3,
    divisionName: '2.ª División',
    shift: 'Tarde',
    classroom: 'Aula 302',
    preceptor: 'Prof. Silvia Rossi',
    academicYearLabel: '3.º Año',
    displayName: '3.º 2.ª - Turno Tarde',
    createdAt: '2026-02-15T08:00:00Z',
  },
];

// ============================================================================
// 3. Generador de 30 Alumnos Reales por Cada División (Total: 180 Estudiantes)
// ============================================================================

const APELLIDOS = [
  'Acosta', 'Álvarez', 'Benítez', 'Castro', 'Díaz', 'Espíndola', 'Fernández', 'Giménez',
  'Herrera', 'Ibarra', 'Juárez', 'López', 'Martínez', 'Navarro', 'Ortiz', 'Pérez',
  'Quintana', 'Rios', 'Sánchez', 'Torres', 'Urrutia', 'Vega', 'Zabala', 'Barrios',
  'Cáceres', 'Duarte', 'Flores', 'Godoy', 'Ledesma', 'Mendez', 'Molina', 'Nuñez',
  'Peralta', 'Quiroga', 'Romero', 'Salinas', 'Toledo', 'Valdez', 'Villalba', 'Zarate',
];

const NOMBRES_M = [
  'Mateo', 'Santiago', 'Lucas', 'Benjamín', 'Joaquín', 'Tomás', 'Thiago', 'Nicolás',
  'Ignacio', 'Facundo', 'Bruno', 'Maximiliano', 'Felipe', 'Agustín', 'Lautaro',
  'Bautista', 'Emiliano', 'Julián', 'Manuel', 'Ramiro', 'Esteban', 'Franco',
];

const NOMBRES_F = [
  'Valentina', 'Camila', 'Mía', 'Sofía', 'Emma', 'Catalina', 'Julieta', 'Martina',
  'Delfina', 'Luciana', 'Renata', 'Zoe', 'Paulina', 'Victoria', 'Abril',
  'Morena', 'Florencia', 'Constanza', 'Paula', 'Bianca', 'Clara', 'Elena',
];

const AVATAR_COLORS = ['#4f46e5', '#059669', '#e11d48', '#d97706', '#0891b2', '#7c3aed'];

function generate30StudentsForCourse(courseIdInt: number, courseIdStr: string, baseDni: number): Student[] {
  const students: Student[] = [];

  for (let i = 1; i <= 30; i++) {
    const isMale = i % 2 !== 0;
    const firstName = isMale
      ? NOMBRES_M[(i * 3 + courseIdInt) % NOMBRES_M.length]
      : NOMBRES_F[(i * 2 + courseIdInt) % NOMBRES_F.length];
    const lastName = APELLIDOS[(i * 5 + courseIdInt * 7) % APELLIDOS.length];
    const dniNum = baseDni + i * 27 + courseIdInt * 1000;
    const dniFormatted = `${Math.floor(dniNum / 1000000)}.${Math.floor((dniNum % 1000000) / 1000)}.${dniNum % 1000}`;
    const studentIdInt = courseIdInt * 100 + i;
    const color = AVATAR_COLORS[(i + courseIdInt) % AVATAR_COLORS.length];

    const tutorType = i % 3 === 0 ? 'Tutor/a Legal' : i % 2 === 0 ? 'Madre' : 'Padre';
    const tutorName = `${APELLIDOS[(i + 3) % APELLIDOS.length]}, ${NOMBRES_F[i % NOMBRES_F.length]} (${tutorType})`;
    const phone = `+54 9 11 ${4000 + i * 13}-${1000 + courseIdInt * 50 + i}`;

    let notes = '';
    if (i === 4) notes = 'Alergia al polen y cambios estacionales.';
    else if (i === 11) notes = 'Uso permanente de lentes recetados.';
    else if (i === 18) notes = 'Autorizado para retiro anticipado con el tutor registrado.';
    else if (i === 25) notes = 'Presentó apto médico deportivo completo.';

    students.push({
      id: `st_${studentIdInt}`,
      id_estudiante: studentIdInt,
      courseId: courseIdStr,
      id_curso: courseIdInt,
      firstName,
      lastName,
      dni: dniFormatted,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@alumno.edu`,
      tutorName,
      phoneTutor: phone,
      avatarColor: color,
      gender: isMale ? 'M' : 'F',
      notes,
      estado: true,
      createdAt: '2026-02-20T08:00:00Z',
    });
  }

  return students;
}

// Generate the 180 initial students (30 students x 6 courses)
function generateAllInitialStudents(): Student[] {
  const all: Student[] = [];
  // 1.º 1.ª (c_1) -> 30 alumnos
  all.push(...generate30StudentsForCourse(1, 'c_1', 48210000));
  // 1.º 2.ª (c_2) -> 30 alumnos
  all.push(...generate30StudentsForCourse(2, 'c_2', 48510000));
  // 2.º 1.ª (c_3) -> 30 alumnos
  all.push(...generate30StudentsForCourse(3, 'c_3', 47210000));
  // 2.º 2.ª (c_4) -> 30 alumnos
  all.push(...generate30StudentsForCourse(4, 'c_4', 47510000));
  // 3.º 1.ª (c_5) -> 30 alumnos
  all.push(...generate30StudentsForCourse(5, 'c_5', 46210000));
  // 3.º 2.ª (c_6) -> 30 alumnos
  all.push(...generate30StudentsForCourse(6, 'c_6', 46510000));
  return all;
}

// ============================================================================
// 4. Initial Attendance Seed
// ============================================================================

export function getTodayIsoString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayIsoString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateInitialAttendance(students: Student[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  
  // Generate dates for the last 5 school days
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Skip weekends (0=Sun, 6=Sat)
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      if (dates.length >= 5) break;
    }
  }

  let idCounter = 1;

  dates.forEach((date, dayIdx) => {
    students.forEach((s) => {
      let status: AttendanceStatus = 'presente';
      let statusDb: 'P' | 'A' | 'T' | 'AJ' = 'P';
      let obs = '';

      // Create realistic attendance distribution based on student id and day
      const seed = (s.id_estudiante * 7 + dayIdx * 13) % 20;

      if (seed === 3) {
        status = 'tarde';
        statusDb = 'T';
        obs = 'Ingreso a las 08:15 hs.';
      } else if (seed === 7) {
        status = 'ausente';
        statusDb = 'A';
      } else if (seed === 11 || seed === 17) {
        // High absence pattern for a few students to populate absence ranking
        if (s.id_estudiante % 10 === 4 || s.id_estudiante % 10 === 8) {
          status = 'ausente';
          statusDb = 'A';
        } else {
          status = 'justificado';
          statusDb = 'AJ';
          obs = 'Certificado médico presentado.';
        }
      } else if (seed === 19) {
        status = 'justificado';
        statusDb = 'AJ';
        obs = 'Trámite personal con constancia.';
      }

      records.push({
        id: `att_${s.courseId}_${s.id}_${date}`,
        id_asistencia: idCounter++,
        studentId: s.id,
        id_estudiante: s.id_estudiante,
        courseId: s.courseId,
        date,
        status,
        statusDb,
        observation: obs,
        id_usuario: 1,
        recordedAt: new Date().toISOString(),
        recordedBy: 'Docente a cargo',
      });
    });
  });

  return records;
}

// ============================================================================
// 5. Storage Initialization & Migration (Enforces 30 Students per Division)
// ============================================================================

export function initSchoolStorage(): void {
  try {
    const rawCourses = localStorage.getItem(SCHOOL_STORAGE_KEYS.COURSES);
    const rawStudents = localStorage.getItem(SCHOOL_STORAGE_KEYS.STUDENTS);

    // If courses don't exist, seed
    if (!rawCourses) {
      localStorage.setItem(SCHOOL_STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    }

    // Check if students exist and if they have at least 30 students per division
    let needsReseedStudents = false;
    if (!rawStudents) {
      needsReseedStudents = true;
    } else {
      try {
        const parsed: Student[] = JSON.parse(rawStudents);
        // Verify count: must have 30 per division for initial courses
        if (!Array.isArray(parsed) || parsed.length < 180) {
          needsReseedStudents = true;
        }
      } catch {
        needsReseedStudents = true;
      }
    }

    if (needsReseedStudents) {
      const generated = generateAllInitialStudents();
      localStorage.setItem(SCHOOL_STORAGE_KEYS.STUDENTS, JSON.stringify(generated));

      // Also reset attendance so it matches all 180 students
      const attendance = generateInitialAttendance(generated);
      localStorage.setItem(SCHOOL_STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    }
  } catch (err) {
    console.error('Error initializing school storage:', err);
  }
}

// ----------------- COURSES -----------------

export function getCourses(): CourseDivision[] {
  initSchoolStorage();
  try {
    const raw = localStorage.getItem(SCHOOL_STORAGE_KEYS.COURSES);
    if (!raw) return INITIAL_COURSES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COURSES;
  } catch {
    return INITIAL_COURSES;
  }
}

export function saveCourses(courses: CourseDivision[]): void {
  localStorage.setItem(SCHOOL_STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

export function getCourseById(courseId: string): CourseDivision | undefined {
  const list = getCourses();
  return list.find((c) => c.id === courseId || String(c.id_curso) === String(courseId));
}

export function addCourseDivision(params: {
  year: AcademicYear;
  divisionName: string;
  shift: ShiftType;
  classroom: string;
  preceptor: string;
}): { success: boolean; course?: CourseDivision; error?: string } {
  const courses = getCourses();
  const cleanName = params.divisionName.trim();

  if (!cleanName) {
    return { success: false, error: 'Por favor, introduce el nombre de la división.' };
  }
  if (!params.classroom.trim()) {
    return { success: false, error: 'Por favor, indica el aula asignada.' };
  }

  // Check unique constraint (anio, division, turno)
  const exists = courses.some(
    (c) => c.year === params.year && c.divisionName.toLowerCase() === cleanName.toLowerCase() && c.shift === params.shift
  );
  if (exists) {
    return {
      success: false,
      error: `Ya existe una división "${cleanName}" en ${params.year}.º año para el turno ${params.shift}.`,
    };
  }

  const maxIdCurso = courses.reduce((acc, c) => Math.max(acc, c.id_curso || 0), 0);
  const nextIdCurso = maxIdCurso + 1;
  const newCourseId = `c_${nextIdCurso}`;

  const newCourse: CourseDivision = {
    id: newCourseId,
    id_curso: nextIdCurso,
    year: params.year,
    divisionName: cleanName,
    shift: params.shift,
    classroom: params.classroom.trim(),
    preceptor: params.preceptor.trim() || 'A designar',
    academicYearLabel: `${params.year}.º Año`,
    displayName: `${params.year}.º ${cleanName} - Turno ${params.shift}`,
    createdAt: new Date().toISOString(),
  };

  courses.push(newCourse);
  saveCourses(courses);

  // Auto-seed 30 students for this new division to maintain full cohorts!
  const newStudents = generate30StudentsForCourse(nextIdCurso, newCourseId, 48000000 + nextIdCurso * 100000);
  const currentStudents = getStudents();
  currentStudents.push(...newStudents);
  saveStudents(currentStudents);

  return { success: true, course: newCourse };
}

// ----------------- STUDENTS -----------------

export function getStudents(courseId?: string): Student[] {
  initSchoolStorage();
  try {
    const raw = localStorage.getItem(SCHOOL_STORAGE_KEYS.STUDENTS);
    let all: Student[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(all) || all.length === 0) {
      all = generateAllInitialStudents();
      saveStudents(all);
    }

    if (courseId) {
      return all.filter((s) => s.courseId === courseId || String(s.id_curso) === String(courseId));
    }
    return all;
  } catch {
    const fallback = generateAllInitialStudents();
    return courseId ? fallback.filter((s) => s.courseId === courseId) : fallback;
  }
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(SCHOOL_STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function addStudentToCourse(params: {
  courseId: string;
  firstName: string;
  lastName: string;
  dni: string;
  email?: string;
  tutorName?: string;
  phoneTutor?: string;
  gender: 'M' | 'F' | 'Otro';
  notes?: string;
}): { success: boolean; student?: Student; error?: string } {
  if (!params.firstName.trim() || !params.lastName.trim()) {
    return { success: false, error: 'Nombre y apellido son obligatorios.' };
  }
  if (!params.dni.trim()) {
    return { success: false, error: 'El DNI o documento es obligatorio.' };
  }

  const all = getStudents();
  const cleanDni = params.dni.trim();

  // Validate UNIQUE DNI constraint
  const dniExists = all.some((s) => s.dni.replace(/\./g, '') === cleanDni.replace(/\./g, ''));
  if (dniExists) {
    return { success: false, error: `Ya existe un estudiante registrado con el DNI ${cleanDni}.` };
  }

  const course = getCourseById(params.courseId);
  const courseIdInt = course ? course.id_curso : 1;
  const maxIdEst = all.reduce((acc, s) => Math.max(acc, s.id_estudiante || 0), 0);
  const nextIdEst = maxIdEst + 1;

  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const newStudent: Student = {
    id: `st_${nextIdEst}`,
    id_estudiante: nextIdEst,
    courseId: params.courseId,
    id_curso: courseIdInt,
    firstName: params.firstName.trim(),
    lastName: params.lastName.trim(),
    dni: cleanDni,
    email: params.email?.trim() || `${params.firstName.toLowerCase()}.${params.lastName.toLowerCase()}@alumno.edu`,
    tutorName: params.tutorName?.trim(),
    phoneTutor: params.phoneTutor?.trim(),
    avatarColor: color,
    gender: params.gender,
    notes: params.notes?.trim() || '',
    estado: true,
    createdAt: new Date().toISOString(),
  };

  all.push(newStudent);
  saveStudents(all);

  return { success: true, student: newStudent };
}

export function removeStudent(studentId: string): void {
  const students = getStudents().filter((s) => s.id !== studentId && String(s.id_estudiante) !== String(studentId));
  saveStudents(students);
}

// ----------------- ATTENDANCE (With UNIQUE Constraint Enforcement) -----------------

export function getAllAttendanceRecords(): AttendanceRecord[] {
  initSchoolStorage();
  try {
    const raw = localStorage.getItem(SCHOOL_STORAGE_KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAllAttendanceRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(SCHOOL_STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
}

export function getAttendanceForCourseAndDate(courseId: string, date: string): AttendanceRecord[] {
  const records = getAllAttendanceRecords();
  return records.filter(
    (r) => (r.courseId === courseId || r.courseId === `c_${courseId}`) && r.date === date
  );
}

const STATUS_TO_DB: Record<AttendanceStatus, 'P' | 'A' | 'T' | 'AJ'> = {
  presente: 'P',
  ausente: 'A',
  tarde: 'T',
  justificado: 'AJ',
};

/**
 * Enforces the relational UNIQUE constraint:
 * CONSTRAINT uq_asistencia_estudiante_fecha UNIQUE (id_estudiante, fecha)
 */
export function saveCourseAttendance(
  courseId: string,
  date: string,
  records: { studentId: string; status: AttendanceStatus; observation?: string }[],
  recordedBy?: string
): void {
  const all = getAllAttendanceRecords();
  const students = getStudents();

  // Create a fast map of studentId -> id_estudiante
  const studentMap = new Map(students.map((s) => [s.id, s.id_estudiante]));

  // Build a set of student IDs being updated
  const updatedStudentIds = new Set(records.map((r) => r.studentId));

  // Remove existing records for these students on this specific date (satisfies UNIQUE constraint)
  const remaining = all.filter(
    (r) => !(r.date === date && updatedStudentIds.has(r.studentId))
  );

  let nextIdAsistencia = all.reduce((acc, r) => Math.max(acc, r.id_asistencia || 0), 0) + 1;

  // Add the newly saved or modified records
  const newRecords: AttendanceRecord[] = records.map((rec) => {
    const idEstudiante = studentMap.get(rec.studentId) || 0;
    return {
      id: `att_${courseId}_${rec.studentId}_${date}`,
      id_asistencia: nextIdAsistencia++,
      courseId,
      studentId: rec.studentId,
      id_estudiante: idEstudiante,
      date,
      status: rec.status,
      statusDb: STATUS_TO_DB[rec.status] || 'P',
      observation: rec.observation || '',
      id_usuario: 1, // Current logged user ID
      recordedAt: new Date().toISOString(),
      recordedBy: recordedBy || 'Docente a cargo',
    };
  });

  remaining.push(...newRecords);
  saveAllAttendanceRecords(remaining);
}

export function getStudentAttendanceStats(studentId: string): StudentAttendanceStats {
  const all = getAllAttendanceRecords().filter(
    (r) => r.studentId === studentId || String(r.id_estudiante) === String(studentId)
  );
  const totalDays = all.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let justifiedCount = 0;

  all.forEach((r) => {
    if (r.status === 'presente' || r.statusDb === 'P') presentCount++;
    else if (r.status === 'ausente' || r.statusDb === 'A') absentCount++;
    else if (r.status === 'tarde' || r.statusDb === 'T') lateCount++;
    else if (r.status === 'justificado' || r.statusDb === 'AJ' || (r.statusDb as string) === 'J') justifiedCount++;
  });

  const effective = presentCount + justifiedCount + lateCount * 0.5;
  const attendancePercentage = totalDays > 0 ? Math.round((effective / totalDays) * 100) : 100;
  const absencePercentage = totalDays > 0 ? Math.round((absentCount / totalDays) * 100) : 0;

  return {
    totalDays,
    presentCount,
    absentCount,
    lateCount,
    justifiedCount,
    attendancePercentage,
    absencePercentage,
  };
}

export function getCourseDailySummary(courseId: string, date: string): CourseDailySummary {
  const students = getStudents(courseId);
  const records = getAttendanceForCourseAndDate(courseId, date);

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let justifiedCount = 0;

  records.forEach((r) => {
    if (r.status === 'presente' || r.statusDb === 'P') presentCount++;
    else if (r.status === 'ausente' || r.statusDb === 'A') absentCount++;
    else if (r.status === 'tarde' || r.statusDb === 'T') lateCount++;
    else if (r.status === 'justificado' || r.statusDb === 'AJ' || (r.statusDb as string) === 'J') justifiedCount++;
  });

  const recordedCount = records.length;
  const effective = presentCount + justifiedCount + lateCount * 0.5;
  const attendanceRate = recordedCount > 0 ? Math.round((effective / recordedCount) * 100) : 0;
  const absenceRate = recordedCount > 0 ? Math.round((absentCount / recordedCount) * 100) : 0;

  return {
    totalStudents: students.length,
    presentCount,
    absentCount,
    lateCount,
    justifiedCount,
    attendanceRate,
    absenceRate,
  };
}

// ----------------- ADVANCED QUERY & STATISTICAL FUNCTIONS -----------------

/**
 * Consulta global de estadísticas de la escuela
 */
export function getGlobalAttendanceStats(date?: string) {
  const allStudents = getStudents();
  const allRecords = getAllAttendanceRecords();
  const filtered = date ? allRecords.filter((r) => r.date === date) : allRecords;

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let justifiedCount = 0;

  filtered.forEach((r) => {
    if (r.status === 'presente' || r.statusDb === 'P') presentCount++;
    else if (r.status === 'ausente' || r.statusDb === 'A') absentCount++;
    else if (r.status === 'tarde' || r.statusDb === 'T') lateCount++;
    else if (r.status === 'justificado' || r.statusDb === 'AJ' || (r.statusDb as string) === 'J') justifiedCount++;
  });

  const totalEvaluated = filtered.length;
  const effective = presentCount + justifiedCount + lateCount * 0.5;
  const attendancePercentage = totalEvaluated > 0 ? Math.round((effective / totalEvaluated) * 100) : 100;
  const absencePercentage = totalEvaluated > 0 ? Math.round((absentCount / totalEvaluated) * 100) : 0;

  return {
    totalStudents: allStudents.length,
    totalRecords: totalEvaluated,
    presentCount,
    absentCount,
    lateCount,
    justifiedCount,
    attendancePercentage,
    absencePercentage,
  };
}

/**
 * Consulta de estudiantes con mayor cantidad de ausencias (Alerta Temprana)
 */
export function getStudentsWithMostAbsences(limit = 10, courseId?: string) {
  const students = getStudents(courseId);
  const courses = getCourses();
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const ranking = students.map((s) => {
    const stats = getStudentAttendanceStats(s.id);
    const course = courseMap.get(s.courseId) || courses[0];
    const totalAbsences = stats.absentCount + stats.justifiedCount;

    let riskLevel: 'alto' | 'medio' | 'bajo' = 'bajo';
    if (stats.absentCount >= 3 || totalAbsences >= 5) {
      riskLevel = 'alto';
    } else if (stats.absentCount >= 2 || totalAbsences >= 3) {
      riskLevel = 'medio';
    }

    return {
      student: s,
      course,
      totalAbsences,
      unexcusedAbsences: stats.absentCount,
      excusedAbsences: stats.justifiedCount,
      lateCount: stats.lateCount,
      attendancePercentage: stats.attendancePercentage,
      absencePercentage: stats.absencePercentage,
      riskLevel,
    };
  });

  ranking.sort((a, b) => {
    if (b.unexcusedAbsences !== a.unexcusedAbsences) {
      return b.unexcusedAbsences - a.unexcusedAbsences;
    }
    return b.totalAbsences - a.totalAbsences;
  });

  return ranking.slice(0, limit);
}

/**
 * Comparación de asistencia entre cursos
 */
export function getCourseComparisonStats(date?: string) {
  const courses = getCourses();
  return courses.map((course) => {
    const students = getStudents(course.id);
    const summary = date ? getCourseDailySummary(course.id, date) : null;

    if (summary) {
      return {
        course,
        totalStudents: students.length,
        attendanceRate: summary.attendanceRate,
        absenceRate: summary.absenceRate,
        presentCount: summary.presentCount,
        absentCount: summary.absentCount,
        lateCount: summary.lateCount,
        justifiedCount: summary.justifiedCount,
      };
    }

    // Accumulate across all recorded days for this course
    const allRecords = getAllAttendanceRecords().filter((r) => r.courseId === course.id);
    let p = 0, a = 0, t = 0, aj = 0;
    allRecords.forEach((r) => {
      if (r.status === 'presente' || r.statusDb === 'P') p++;
      else if (r.status === 'ausente' || r.statusDb === 'A') a++;
      else if (r.status === 'tarde' || r.statusDb === 'T') t++;
      else if (r.status === 'justificado' || r.statusDb === 'AJ' || (r.statusDb as string) === 'J') aj++;
    });

    const tot = allRecords.length;
    const eff = p + aj + t * 0.5;
    const rate = tot > 0 ? Math.round((eff / tot) * 100) : 100;
    const absRate = tot > 0 ? Math.round((a / tot) * 100) : 0;

    return {
      course,
      totalStudents: students.length,
      attendanceRate: rate,
      absenceRate: absRate,
      presentCount: p,
      absentCount: a,
      lateCount: t,
      justifiedCount: aj,
    };
  });
}

/**
 * Consulta de historial mensual para un estudiante
 */
export function getStudentMonthlyHistory(studentId: string, year: number, month: number) {
  const all = getAllAttendanceRecords().filter((r) => r.studentId === studentId || String(r.id_estudiante) === String(studentId));
  const monthStr = String(month).padStart(2, '0');
  const prefix = `${year}-${monthStr}`;

  return all
    .filter((r) => r.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Generate CSV data for download
export function generateCourseAttendanceCSV(course: CourseDivision, date: string): string {
  const students = getStudents(course.id);
  const records = getAttendanceForCourseAndDate(course.id, date);
  const recordsMap = new Map(records.map((r) => [r.studentId, r]));

  const headers = ['id_asistencia', 'Año', 'División', 'Turno', 'Fecha', 'id_estudiante', 'DNI', 'Apellido', 'Nombre', 'Estado (SQL)', 'Significado', 'Observación'];
  const rows = students.map((s) => {
    const rec = recordsMap.get(s.id);
    const statusDb = rec?.statusDb || 'P';
    const statusLabel =
      statusDb === 'P'
        ? 'PRESENTE'
        : statusDb === 'A'
        ? 'AUSENTE'
        : statusDb === 'T'
        ? 'TARDANZA'
        : 'AUSENTE JUSTIFICADO (AJ)';
    const obs = rec?.observation ? `"${rec.observation.replace(/"/g, '""')}"` : '""';
    return [
      rec?.id_asistencia || 'N/A',
      `"${course.academicYearLabel}"`,
      `"${course.divisionName}"`,
      `"${course.shift}"`,
      `"${date}"`,
      s.id_estudiante,
      `"${s.dni}"`,
      `"${s.lastName}"`,
      `"${s.firstName}"`,
      `"${statusDb}"`,
      `"${statusLabel}"`,
      obs,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Export full institutional school attendance report
 */
export function generateFullSchoolAttendanceCSV(): string {
  const courses = getCourses();
  const students = getStudents();
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const headers = [
    'id_estudiante',
    'DNI',
    'Apellido',
    'Nombre',
    'Año',
    'División',
    'Turno',
    'Total Días Evaluados',
    'Presentes (P)',
    'Ausentes (A)',
    'Tardanzas (T)',
    'Ausentes Justificados (AJ)',
    'Porcentaje Asistencia (%)',
    'Porcentaje Inasistencia (%)',
    'Nivel de Riesgo',
  ];

  const rows = students.map((s) => {
    const course = courseMap.get(s.courseId) || courses[0];
    const stats = getStudentAttendanceStats(s.id);
    const risk = stats.absentCount >= 3 ? 'ALTO' : stats.absentCount >= 2 ? 'MEDIO' : 'BAJO';

    return [
      s.id_estudiante,
      `"${s.dni}"`,
      `"${s.lastName}"`,
      `"${s.firstName}"`,
      `"${course.academicYearLabel}"`,
      `"${course.divisionName}"`,
      `"${course.shift}"`,
      stats.totalDays,
      stats.presentCount,
      stats.absentCount,
      stats.lateCount,
      stats.justifiedCount,
      `${stats.attendancePercentage}%`,
      `${stats.absencePercentage}%`,
      `"${risk}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Reset data helper
export function resetToDefault30Students(): void {
  localStorage.removeItem(SCHOOL_STORAGE_KEYS.COURSES);
  localStorage.removeItem(SCHOOL_STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(SCHOOL_STORAGE_KEYS.ATTENDANCE);
  initSchoolStorage();
}

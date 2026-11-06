/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// -------------------------------------------------------------
// Relational Database Schema Model (Conforme a Especificación SQL)
// -------------------------------------------------------------

export interface UsuarioDB {
  id_usuario: number; // INT (PK)
  nombre_usuario: string; // VARCHAR(50)
  password_hash: string; // VARCHAR(255)
  rol: string; // VARCHAR(20) e.g. 'docente', 'preceptor', 'administrador'
}

export interface CursoDB {
  id_curso: number; // INT (PK)
  anio: number; // INT (1, 2, 3)
  division: string; // VARCHAR(5) e.g. '1.ª', '2.ª', 'A', 'B'
  turno: string; // VARCHAR(20) e.g. 'Mañana', 'Tarde', 'Vespertino'
  aula?: string;
  preceptor?: string;
}

export interface EstudianteDB {
  id_estudiante: number; // INT (PK)
  dni: string; // VARCHAR(15)
  apellido: string; // VARCHAR(80)
  nombre: string; // VARCHAR(80)
  id_curso: number; // INT (FK -> cursos.id_curso)
  estado: boolean; // BOOLEAN (true = activo/matriculado)
  tutor_nombre?: string;
  tutor_telefono?: string;
  observaciones?: string;
  color_avatar?: string;
}

export interface AsistenciaDB {
  id_asistencia: number; // INT (PK)
  id_estudiante: number; // INT (FK -> estudiantes.id_estudiante)
  fecha: string; // DATE (YYYY-MM-DD)
  estado: 'P' | 'A' | 'T' | 'AJ'; // P=Presente, A=Ausente, T=Tardanza, AJ=Ausente justificado
  observacion?: string; // VARCHAR(255)
  id_usuario: number; // INT (FK -> usuarios.id_usuario)
}

// -------------------------------------------------------------
// UI Types & Compatibility Layer
// -------------------------------------------------------------

export type AcademicYear = 1 | 2 | 3;
export type ShiftType = 'Mañana' | 'Tarde' | 'Vespertino';

export interface CourseDivision {
  id: string; // e.g. "c_1" or "1"
  id_curso: number;
  year: AcademicYear;
  divisionName: string;
  shift: ShiftType;
  classroom: string;
  preceptor: string;
  academicYearLabel: string; // e.g. "1.º Año"
  displayName: string; // e.g. "1.º 1.ª - Turno Mañana"
  createdAt: string;
}

export interface Student {
  id: string; // e.g. "st_1" or "1"
  id_estudiante: number;
  courseId: string;
  id_curso: number;
  firstName: string;
  lastName: string;
  dni: string;
  email?: string;
  tutorName?: string;
  phoneTutor?: string;
  avatarColor?: string;
  gender: 'M' | 'F' | 'Otro';
  notes?: string;
  estado: boolean;
  createdAt: string;
}

export type AttendanceStatus = 'presente' | 'ausente' | 'tarde' | 'justificado';
export type AttendanceStatusCode = 'P' | 'A' | 'T' | 'AJ';

export interface AttendanceRecord {
  id: string;
  id_asistencia?: number;
  studentId: string;
  id_estudiante: number;
  courseId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  statusDb: AttendanceStatusCode;
  observation?: string;
  id_usuario?: number;
  recordedAt: string;
  recordedBy?: string;
}

export interface StudentAttendanceStats {
  totalDays: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  justifiedCount: number;
  attendancePercentage: number;
  absencePercentage: number;
}

export interface CourseDailySummary {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  justifiedCount: number;
  attendanceRate: number;
  absenceRate: number;
}

export interface AbsenceRankingItem {
  student: Student;
  course: CourseDivision;
  totalAbsences: number; // A + AJ
  unexcusedAbsences: number; // A
  excusedAbsences: number; // AJ
  lateCount: number;
  attendancePercentage: number;
  absencePercentage: number;
  riskLevel: 'alto' | 'medio' | 'bajo'; // >= 5 ausencias = alto riesgo
}

export interface CourseComparisonItem {
  course: CourseDivision;
  totalStudents: number;
  attendanceRate: number;
  absenceRate: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  justifiedCount: number;
}

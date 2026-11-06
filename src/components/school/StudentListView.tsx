/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  FileText,
  AlertTriangle,
  Trash2,
  Percent,
  CheckCircle2,
  UserCheck,
  X,
  Database,
} from 'lucide-react';
import { CourseDivision, Student } from '../../types/school';
import { getStudents, removeStudent, getStudentAttendanceStats, getAllAttendanceRecords } from '../../lib/schoolStorage';

interface StudentListViewProps {
  course: CourseDivision;
  onOpenAddStudent: () => void;
  onStudentListChanged?: () => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  course,
  onOpenAddStudent,
  onStudentListChanged,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const students = course?.id ? getStudents(course.id) : [];

  // Filtered by search
  const filtered = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const lName = s.lastName || '';
    const fName = s.firstName || '';
    const dni = s.dni || '';
    const tutor = s.tutorName || '';
    return (
      fName.toLowerCase().includes(term) ||
      lName.toLowerCase().includes(term) ||
      dni.toLowerCase().includes(term) ||
      tutor.toLowerCase().includes(term)
    );
  });

  // Calculate course-wide metrics
  const totalStudents = students.length;
  const boysCount = students.filter((s) => s.gender === 'M').length;
  const girlsCount = students.filter((s) => s.gender === 'F').length;

  const totalPercentage = students.reduce((acc, curr) => {
    const stats = getStudentAttendanceStats(curr.id);
    return acc + (stats?.attendancePercentage || 0);
  }, 0);
  const averageAttendance = totalStudents > 0 ? Math.round(totalPercentage / totalStudents) : 100;

  const handleDeleteConfirm = () => {
    if (!studentToDelete) return;
    removeStudent(studentToDelete.id);
    setStudentToDelete(null);
    onStudentListChanged?.();
  };

  if (!course) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl">
        Por favor selecciona un curso para consultar los estudiantes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase mb-1">
            <span>Alumnos Matriculados</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStudents}</p>
          <span className="text-[11px] text-slate-400">Total en {course.displayName || 'este curso'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase mb-1">
            <span>Promedio de Asistencia</span>
            <Percent className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {averageAttendance}%
          </p>
          <span className="text-[11px] text-slate-400">Desempeño acumulado</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase mb-1">
            <span>Distribución de Género</span>
            <UserCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {boysCount} V. • {girlsCount} M.
          </p>
          <span className="text-[11px] text-slate-400">Cohorte completa</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
            Nueva Incorporación
          </span>
          <button
            type="button"
            onClick={onOpenAddStudent}
            className="w-full mt-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Inscribir Alumno</span>
          </button>
        </div>
      </div>

      {/* Search and count bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por apellido, nombre o DNI..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Listado de {filtered.length} alumnos registrados en {course.displayName}
        </span>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No se encontraron alumnos
            </p>
            <p className="text-xs mt-1">Puedes incorporar estudiantes usando el botón de inscripción.</p>
          </div>
        ) : (
          <div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Estudiante (Tabla: estudiantes)</th>
                  <th className="py-3.5 px-4">DNI</th>
                  <th className="py-3.5 px-4">Tutor / Contacto</th>
                  <th className="py-3.5 px-4 text-center">Asistencia Acumulada</th>
                  <th className="py-3.5 px-4">Ficha Médica / Observación</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((student, idx) => {
                  const stats = getStudentAttendanceStats(student.id);
                  const initialL = (student.lastName || 'S').slice(0, 1).toUpperCase();
                  const initialF = (student.firstName || 'A').slice(0, 1).toUpperCase();

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                            style={{ backgroundColor: student.avatarColor || '#4f46e5' }}
                          >
                            {initialL}{initialF}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForModal(student)}
                              className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors cursor-pointer"
                            >
                              {student.lastName || 'Sin Apellido'}, {student.firstName || 'Sin Nombre'}
                            </button>
                            <span className="block text-[11px] text-slate-400">
                              id_est: {student.id_estudiante} • {student.gender === 'M' ? 'Masculino' : student.gender === 'F' ? 'Femenino' : 'Otro'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {student.dni}
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {student.tutorName || 'Sin tutor asignado'}
                          </p>
                          {student.phoneTutor && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {student.phoneTutor}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-black text-xs ${
                                stats.attendancePercentage >= 85
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : stats.attendancePercentage >= 75
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {stats.attendancePercentage}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({stats.presentCount}P / {stats.absentCount}A / {stats.lateCount}T)
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                stats.attendancePercentage >= 85
                                  ? 'bg-emerald-500'
                                  : stats.attendancePercentage >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${stats.attendancePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                        {student.notes || <span className="text-slate-300 dark:text-slate-600">Sin observaciones</span>}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForModal(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Ver ficha del estudiante"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Dar de baja estudiante"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Small-Screen Adaptive Cards View */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((student, idx) => {
              const stats = getStudentAttendanceStats(student.id);
              const initialL = (student.lastName || 'S').slice(0, 1).toUpperCase();
              const initialF = (student.firstName || 'A').slice(0, 1).toUpperCase();

              return (
                <div key={student.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold text-slate-400 font-mono w-4 shrink-0">
                        {idx + 1}.
                      </span>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                        style={{ backgroundColor: student.avatarColor || '#4f46e5' }}
                      >
                        {initialL}{initialF}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForModal(student)}
                          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 text-left truncate block cursor-pointer"
                        >
                          {student.lastName || 'Sin Apellido'}, {student.firstName || 'Sin Nombre'}
                        </button>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          DNI: {student.dni}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                        stats.attendancePercentage >= 85
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : stats.attendancePercentage >= 75
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}
                    >
                      {stats.attendancePercentage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stats.attendancePercentage >= 85
                          ? 'bg-emerald-500'
                          : stats.attendancePercentage >= 75
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${stats.attendancePercentage}%` }}
                    />
                  </div>

                  {/* Tutor info & actions */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="truncate mr-2">
                      <span className="text-[10px] block text-slate-400 truncate">Tutor: {student.tutorName || 'Sin asignar'}</span>
                      {student.phoneTutor && (
                        <a href={`tel:${student.phoneTutor}`} className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 text-[10px] mt-0.5">
                          <Phone className="w-3 h-3" />
                          {student.phoneTutor}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForModal(student)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 cursor-pointer"
                      >
                        Ver Ficha
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentToDelete(student)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Dar de baja"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

      {/* Student Detail Modal */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-md"
                  style={{ backgroundColor: selectedStudentForModal.avatarColor || '#4f46e5' }}
                >
                  {(selectedStudentForModal.lastName || 'S').slice(0, 1)}
                  {(selectedStudentForModal.firstName || 'A').slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedStudentForModal.lastName}, {selectedStudentForModal.firstName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    DNI: {selectedStudentForModal.dni} • id_estudiante: {selectedStudentForModal.id_estudiante}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendance stats for this student */}
            {(() => {
              const stats = getStudentAttendanceStats(selectedStudentForModal.id);
              const history = getAllAttendanceRecords().filter((r) => r.studentId === selectedStudentForModal.id || r.id_estudiante === selectedStudentForModal.id_estudiante);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Presentes [P]</span>
                      <p className="text-lg font-black text-emerald-700">{stats.presentCount}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60">
                      <span className="text-[10px] font-bold text-rose-700 uppercase">Ausentes [A]</span>
                      <p className="text-lg font-black text-rose-700">{stats.absentCount}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Tardanzas [T]</span>
                      <p className="text-lg font-black text-amber-700">{stats.lateCount}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60">
                      <span className="text-[10px] font-bold text-sky-700 uppercase">Justificadas [J]</span>
                      <p className="text-lg font-black text-sky-700">{stats.justifiedCount}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Contacto de Tutor: <span className="font-normal">{selectedStudentForModal.tutorName || 'No informado'}</span>
                    </p>
                    {selectedStudentForModal.phoneTutor && (
                      <p className="text-slate-600 dark:text-slate-400">
                        Teléfono: <span className="font-mono font-medium">{selectedStudentForModal.phoneTutor}</span>
                      </p>
                    )}
                    {selectedStudentForModal.notes && (
                      <p className="text-slate-600 dark:text-slate-400">
                        Observación: <span className="italic">{selectedStudentForModal.notes}</span>
                      </p>
                    )}
                  </div>

                  {/* Recent attendance days */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Historial Reciente (Tabla: asistencias):
                    </h4>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800">
                      {history.length === 0 ? (
                        <p className="text-xs text-slate-400">Sin registros de asistencia aún.</p>
                      ) : (
                        history.map((h) => (
                          <div key={h.id} className="pt-1.5 flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-600 dark:text-slate-400">{h.date}</span>
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                h.status === 'presente' || h.statusDb === 'P'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : h.status === 'ausente' || h.statusDb === 'A'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : h.status === 'tarde' || h.statusDb === 'T'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              }`}
                            >
                              {h.status || 'P'} [{h.statusDb || 'P'}]
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <button
              type="button"
              onClick={() => setSelectedStudentForModal(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ¿Dar de baja a este estudiante?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Se desvinculará a <span className="font-semibold">{studentToDelete.lastName}, {studentToDelete.firstName}</span> del curso {course.displayName}.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm cursor-pointer"
              >
                Confirmar Baja
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

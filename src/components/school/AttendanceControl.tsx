/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  Save,
  Download,
  CheckCheck,
  Search,
  Users,
  ShieldCheck,
  Smartphone,
  LayoutGrid,
  ListFilter,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { CourseDivision, Student, AttendanceStatus } from '../../types/school';
import { useDeviceType } from '../../hooks/useDeviceType';
import {
  getStudents,
  getAttendanceForCourseAndDate,
  saveCourseAttendance,
  generateCourseAttendanceCSV,
  getStudentAttendanceStats,
} from '../../lib/schoolStorage';

interface AttendanceControlProps {
  course: CourseDivision;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAttendanceSaved?: () => void;
}

export const AttendanceControl: React.FC<AttendanceControlProps> = ({
  course,
  selectedDate,
  onDateChange,
  onAttendanceSaved,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; observation: string }>
  >({});
  const [searchTerm, setSearchTerm] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load students and attendance records whenever course or date changes
  useEffect(() => {
    if (!course?.id) return;
    const courseStudents = getStudents(course.id);
    setStudents(courseStudents);

    const existingRecords = getAttendanceForCourseAndDate(course.id, selectedDate);
    const initialMap: Record<string, { status: AttendanceStatus; observation: string }> = {};

    courseStudents.forEach((student) => {
      const match = existingRecords.find((r) => r.studentId === student.id || r.id_estudiante === student.id_estudiante);
      if (match) {
        initialMap[student.id] = {
          status: match.status || 'presente',
          observation: match.observation || '',
        };
      } else {
        initialMap[student.id] = {
          status: 'presente',
          observation: '',
        };
      }
    });

    setAttendanceMap(initialMap);
  }, [course?.id, selectedDate]);

  // Handle single status change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        status,
        observation: prev[studentId]?.observation || '',
      },
    }));
  };

  // Handle observation change
  const handleObservationChange = (studentId: string, observation: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'presente',
        observation,
      },
    }));
  };

  // Bulk action: Mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; observation: string }> = {};
    students.forEach((s) => {
      updated[s.id] = {
        status: 'presente',
        observation: attendanceMap[s.id]?.observation || '',
      };
    });
    setAttendanceMap(updated);
  };

  // Save changes (enforces relational UNIQUE constraint on (id_estudiante, fecha))
  const handleSave = () => {
    if (!course?.id) return;
    setIsSaving(true);
    const recordsToSave = students.map((s) => ({
      studentId: s.id,
      status: attendanceMap[s.id]?.status || 'presente',
      observation: attendanceMap[s.id]?.observation || '',
    }));

    saveCourseAttendance(course.id, selectedDate, recordsToSave);

    setTimeout(() => {
      setIsSaving(false);
      setSavedNotice(true);
      onAttendanceSaved?.();
      setTimeout(() => setSavedNotice(false), 3000);
    }, 350);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!course) return;
    const csvContent = generateCourseAttendanceCSV(course, selectedDate);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Asistencia_${course.year}Ano_${(course.divisionName || '').replace(/\s+/g, '_')}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for live summary
  const total = students.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let justifiedCount = 0;

  Object.values(attendanceMap).forEach((val) => {
    if (!val) return;
    if (val.status === 'presente') presentCount++;
    else if (val.status === 'ausente') absentCount++;
    else if (val.status === 'tarde') lateCount++;
    else if (val.status === 'justificado') justifiedCount++;
  });

  // Filter students by search
  const filteredStudents = students.filter((s) => {
    const lName = s.lastName || '';
    const fName = s.firstName || '';
    const dni = s.dni || '';
    const full = `${lName} ${fName} ${dni}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  // Fast date helpers
  const handleSetToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${d}`);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${day}`);
  };

  if (!course) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl">
        Por favor selecciona un curso para controlar la asistencia.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      
      {/* Top Bar: Date picker & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Fecha de Asistencia:
            </span>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSetToday}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={handleSetYesterday}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Ayer
            </button>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Marcar a los 30 alumnos como presentes con un solo clic"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Todos Presentes</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Descargar planilla de asistencia con esquema relacional en formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Guardando...' : 'Guardar Asistencia'}</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            ¡Asistencia de {course.displayName} guardada exitosamente para la fecha {selectedDate} (Restricción UNIQUE verificada)!
          </span>
        </div>
      )}

      {/* Real-time Attendance Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Matrícula</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{total}</p>
          <span className="text-[10px] text-slate-400">30 alumnos asignados</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Presentes [P]</span>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{presentCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{total > 0 ? Math.round((presentCount / total) * 100) : 0}% del curso</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase">Ausentes [A]</span>
          <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-0.5">{absentCount}</p>
          <span className="text-[10px] text-rose-600 font-semibold">{total > 0 ? Math.round((absentCount / total) * 100) : 0}% inasistencias</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase">Tardanzas [T]</span>
          <p className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">{lateCount}</p>
          <span className="text-[10px] text-amber-600 font-semibold">{lateCount} ingresos tarde</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 uppercase">Ausentes Just. [AJ]</span>
          <p className="text-xl font-black text-sky-700 dark:text-sky-300 mt-0.5">{justifiedCount}</p>
          <span className="text-[10px] text-sky-600 font-semibold">Con justificación</span>
        </div>
      </div>

      {/* Filter and search students */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por apellido, nombre o DNI..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Mostrando {filteredStudents.length} de {students.length} estudiantes
        </span>
      </div>

      {/* Students Attendance Table / List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              No hay estudiantes que coincidan con la búsqueda
            </p>
            <p className="text-xs mt-1">Verifica el nombre o limpia el filtro de búsqueda.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredStudents.map((student, idx) => {
              const currentAttendance = attendanceMap[student.id] || { status: 'presente', observation: '' };
              const stats = getStudentAttendanceStats(student.id);

              const initialL = (student.lastName || 'S').slice(0, 1).toUpperCase();
              const initialF = (student.firstName || 'A').slice(0, 1).toUpperCase();

              const quickReasons = ['Certificado médico', 'Retiro anticipado', 'Enfermedad', 'Trámite personal'];

              return (
                <div
                  key={student.id}
                  className="p-3.5 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Student basic info */}
                  <div className="flex items-start gap-3 min-w-[220px]">
                    <span className="text-xs font-bold text-slate-400 mt-1.5 w-5 text-right font-mono">
                      {idx + 1}.
                    </span>

                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-xs"
                      style={{ backgroundColor: student.avatarColor || '#4f46e5' }}
                    >
                      {initialL}{initialF}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {student.lastName || 'Sin Apellido'}, {student.firstName || 'Sin Nombre'}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono text-[11px]">DNI: {student.dni}</span>
                        <span>•</span>
                        <span
                          className={`font-semibold text-[11px] ${
                            stats.attendancePercentage >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {stats.attendancePercentage}% asist.
                        </span>
                        {currentAttendance.observation && (
                          <span className="text-[10px] text-indigo-500 font-medium truncate max-w-[140px]">
                            • {currentAttendance.observation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4 Status Choice Buttons - Fully responsive & touch-friendly */}
                  <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto">
                    {/* Presente [P] */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'presente')}
                      className={`h-11 sm:h-9 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 cursor-pointer touch-manipulation ${
                        currentAttendance.status === 'presente'
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                      title="Presente (P)"
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span className="text-[11px] sm:text-xs">P</span>
                      <span className="hidden md:inline font-normal">Presente</span>
                    </button>

                    {/* Ausente [A] */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'ausente')}
                      className={`h-11 sm:h-9 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 cursor-pointer touch-manipulation ${
                        currentAttendance.status === 'ausente'
                          ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                      title="Ausente (A)"
                    >
                      <XCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span className="text-[11px] sm:text-xs">A</span>
                      <span className="hidden md:inline font-normal">Ausente</span>
                    </button>

                    {/* Tarde [T] */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'tarde')}
                      className={`h-11 sm:h-9 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 cursor-pointer touch-manipulation ${
                        currentAttendance.status === 'tarde'
                          ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                      title="Tardanza (T)"
                    >
                      <Clock className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span className="text-[11px] sm:text-xs">T</span>
                      <span className="hidden md:inline font-normal">Tarde</span>
                    </button>

                    {/* Ausente justificado [AJ] */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.id, 'justificado')}
                      className={`h-11 sm:h-9 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 cursor-pointer touch-manipulation ${
                        currentAttendance.status === 'justificado'
                          ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-500/30'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                      title="Ausente justificado (AJ)"
                    >
                      <FileCheck2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span className="text-[11px] sm:text-xs">AJ</span>
                      <span className="hidden md:inline font-normal">Justif.</span>
                    </button>
                  </div>

                  {/* Observation note field & quick mobile chips */}
                  <div className="w-full lg:w-72 space-y-1.5">
                    <input
                      type="text"
                      value={currentAttendance.observation}
                      onChange={(e) => handleObservationChange(student.id, e.target.value)}
                      placeholder="Observación o motivo..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />

                    {/* Quick chips for mobile convenience */}
                    {currentAttendance.status !== 'presente' && (
                      <div className="flex flex-wrap gap-1">
                        {quickReasons.map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => handleObservationChange(student.id, reason)}
                            className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            +{reason}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer save reminder */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Control de asistencia para el curso <span className="font-bold text-slate-800 dark:text-slate-200">{course.displayName}</span> del día <span className="font-semibold">{selectedDate}</span>. (30 alumnos matriculados).
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Guardando cambios...' : 'Guardar Asistencia'}</span>
          </button>
        </div>
      </div>

      {/* ================= STICKY MOBILE QUICK SAVE BAR ================= */}
      {/* Appears on mobile/tablet screens so teachers taking attendance on smartphones don't have to scroll */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-2xl safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-emerald-600 dark:text-emerald-400">P:{presentCount}</span>
            <span className="text-rose-600 dark:text-rose-400">A:{absentCount}</span>
            <span className="text-amber-600 dark:text-amber-400">T:{lateCount}</span>
            <span className="text-sky-600 dark:text-sky-400">AJ:{justifiedCount}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-2.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all cursor-pointer"
              title="Marcar todos como presentes"
            >
              Todos P
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

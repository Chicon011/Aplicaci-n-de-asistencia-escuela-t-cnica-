/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Users,
  Search,
  Download,
  Printer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  Percent,
  TrendingDown,
  TrendingUp,
  School,
  User,
  Filter,
  FileText,
  Phone,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { CourseDivision, Student } from '../../types/school';
import {
  getCourses,
  getStudents,
  getAllAttendanceRecords,
  getGlobalAttendanceStats,
  getStudentsWithMostAbsences,
  getCourseComparisonStats,
  getStudentAttendanceStats,
  getStudentMonthlyHistory,
  generateFullSchoolAttendanceCSV,
  generateCourseAttendanceCSV,
  getTodayIsoString,
} from '../../lib/schoolStorage';

interface AttendanceAnalyticsViewProps {
  initialCourseId?: string;
}

type QueryMode = 'general' | 'estudiante' | 'curso' | 'fecha' | 'ranking' | 'comparativa';

export const AttendanceAnalyticsView: React.FC<AttendanceAnalyticsViewProps> = ({
  initialCourseId,
}) => {
  const courses = getCourses();
  const students = getStudents();
  const today = getTodayIsoString();

  const [queryMode, setQueryMode] = useState<QueryMode>('general');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || courses[0]?.id || 'c_1');
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'st_101');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Statistics
  const globalStats = getGlobalAttendanceStats();
  const dateStats = getGlobalAttendanceStats(selectedDate);
  const absenceRanking = getStudentsWithMostAbsences(15);
  const courseComparison = getCourseComparisonStats();

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Filter students for student lookup
  const filteredStudents = students.filter((s) => {
    const term = studentSearch.toLowerCase();
    return (
      (s.lastName || '').toLowerCase().includes(term) ||
      (s.firstName || '').toLowerCase().includes(term) ||
      (s.dni || '').toLowerCase().includes(term)
    );
  });

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = generateFullSchoolAttendanceCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Informe_Asistencia_Escolar_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Course CSV
  const handleExportCourseCSV = () => {
    if (!activeCourse) return;
    const csvContent = generateCourseAttendanceCSV(activeCourse, selectedDate);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Asistencia_${activeCourse.academicYearLabel}_${activeCourse.divisionName}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print / PDF format view
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Módulo de Consulta de Asistencia y Estadísticas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informes detallados por curso, estudiante, fecha, ranking de inasistencias y comparativa
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons for Export (CSV & PDF) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Exportar informe institucional completo a formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV General</span>
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Abrir vista de impresión y guardar como PDF institucional"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Totales, Porcentajes, Estados P, A, T, AJ) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Estudiantes</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{globalStats.totalStudents}</p>
          <span className="text-[11px] text-slate-400">1.º, 2.º y 3.º Año</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">% Asistencia</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {globalStats.attendancePercentage}%
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">{globalStats.presentCount} presentes acumulados</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">% Inasistencia</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
            {globalStats.absencePercentage}%
          </p>
          <span className="text-[11px] text-rose-600 font-semibold">{globalStats.absentCount} inasistencias</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Presentes [P]</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{globalStats.presentCount}</p>
          <span className="text-[11px] text-slate-400">Estado regular</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Tardanzas [T]</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{globalStats.lateCount}</p>
          <span className="text-[11px] text-slate-400">Ingresos con demora</span>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Aus. Just. [AJ]</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{globalStats.justifiedCount}</p>
          <span className="text-[11px] text-slate-400">Con certificado médico</span>
        </div>
      </div>

      {/* Query Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 sm:p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setQueryMode('general')}
          className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            queryMode === 'general'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span className="hidden sm:inline">Resumen General</span>
          <span className="sm:hidden">General</span>
        </button>

        <button
          type="button"
          onClick={() => setQueryMode('ranking')}
          className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            queryMode === 'ranking'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="hidden sm:inline">Ranking de Inasistencias (Alerta)</span>
          <span className="sm:hidden">Ranking Alertas</span>
        </button>

        <button
          type="button"
          onClick={() => setQueryMode('comparativa')}
          className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            queryMode === 'comparativa'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span className="hidden sm:inline">Comparativa entre Cursos</span>
          <span className="sm:hidden">Comparativa</span>
        </button>

        <button
          type="button"
          onClick={() => setQueryMode('estudiante')}
          className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            queryMode === 'estudiante'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span className="hidden sm:inline">Consulta por Estudiante & Historial</span>
          <span className="sm:hidden">Por Estudiante</span>
        </button>

        <button
          type="button"
          onClick={() => setQueryMode('fecha')}
          className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            queryMode === 'fecha'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span className="hidden sm:inline">Consulta por Fecha Específica</span>
          <span className="sm:hidden">Por Fecha</span>
        </button>
      </div>

      {/* =========================================================================
          VIEW 1: RANKING DE ESTUDIANTES CON MAYOR CANTIDAD DE AUSENCIAS (ALERTA)
         ========================================================================= */}
      {queryMode === 'ranking' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Estudiantes con Mayor Cantidad de Ausencias (Sistema de Alerta Temprana)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Identifica alumnos con alto índice de inasistencias para intervención pedagógica y notificación a tutores
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Top 15 casos de seguimiento
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4">Curso / División</th>
                  <th className="py-3 px-4 text-center">Ausencias Injustificadas [A]</th>
                  <th className="py-3 px-4 text-center">Ausencias Justificadas [AJ]</th>
                  <th className="py-3 px-4 text-center">Tardanzas [T]</th>
                  <th className="py-3 px-4 text-center">% Inasistencia</th>
                  <th className="py-3 px-4 text-center">Nivel de Riesgo</th>
                  <th className="py-3 px-4 text-right">Contacto Tutor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {absenceRanking.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400 font-mono">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                          style={{ backgroundColor: item.student.avatarColor || '#e11d48' }}
                        >
                          {(item.student.lastName || 'S').slice(0, 1)}
                          {(item.student.firstName || 'A').slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {item.student.lastName}, {item.student.firstName}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono">DNI: {item.student.dni}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.course.academicYearLabel} • {item.course.divisionName}
                      </span>
                      <span className="block text-[11px] text-slate-400">{item.course.shift}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-md font-black text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300">
                        {item.unexcusedAbsences}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-md font-bold text-sky-700 bg-sky-100 dark:bg-sky-950 dark:text-sky-300">
                        {item.excusedAbsences}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-md font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                        {item.lateCount}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-black text-rose-600 dark:text-rose-400">
                        {item.absencePercentage}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          item.riskLevel === 'alto'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : item.riskLevel === 'medio'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.riskLevel === 'alto' ? 'Riesgo Alto' : item.riskLevel === 'medio' ? 'Riesgo Medio' : 'Bajo'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {item.student.phoneTutor ? (
                        <a
                          href={`tel:${item.student.phoneTutor}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{item.student.phoneTutor}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Sin teléfono</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: COMPARACIÓN DE ASISTENCIA ENTRE CURSOS (1.º, 2.º y 3.º Año)
         ========================================================================= */}
      {queryMode === 'comparativa' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Comparación de Asistencia entre Cursos y Divisiones</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tasa comparativa de presentismo e inasistencias en 1.º, 2.º y 3.º año
            </p>
          </div>

          {/* Visual Bars Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseComparison.map((item) => (
              <div
                key={item.course.id}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {item.course.displayName}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {item.course.classroom} • Preceptor: {item.course.preceptor}
                    </p>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600">
                    {item.totalStudents} al.
                  </span>
                </div>

                {/* Progress bar comparison */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Asistencia: {item.attendanceRate}%
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Inasistencia: {item.absenceRate}%
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${item.attendanceRate}%` }} />
                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${item.absenceRate}%` }} />
                  </div>
                </div>

                {/* Breakdown counts */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60">
                    <span className="text-emerald-700 font-bold block">P</span>
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">{item.presentCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60">
                    <span className="text-rose-700 font-bold block">A</span>
                    <span className="text-xs font-black text-rose-800 dark:text-rose-300">{item.absentCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60">
                    <span className="text-amber-700 font-bold block">T</span>
                    <span className="text-xs font-black text-amber-800 dark:text-amber-300">{item.lateCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60">
                    <span className="text-sky-700 font-bold block">AJ</span>
                    <span className="text-xs font-black text-sky-800 dark:text-sky-300">{item.justifiedCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: CONSULTA POR ESTUDIANTE & HISTORIAL MENSUAL
         ========================================================================= */}
      {queryMode === 'estudiante' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Student Picker */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Seleccionar Estudiante</span>
            </h4>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Buscar por apellido, nombre o DNI..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {filteredStudents.map((s) => {
                const isSel = s.id === selectedStudentId;
                const stats = getStudentAttendanceStats(s.id);

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSel
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                        style={{ backgroundColor: s.avatarColor || '#4f46e5' }}
                      >
                        {(s.lastName || 'S').slice(0, 1)}
                        {(s.firstName || 'A').slice(0, 1)}
                      </div>
                      <div>
                        <p className={`font-bold text-xs ${isSel ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                          {s.lastName}, {s.firstName}
                        </p>
                        <span className="text-[11px] text-slate-400 font-mono">DNI: {s.dni}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-black ${stats.attendancePercentage >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {stats.attendancePercentage}%
                      </span>
                      <span className="block text-[10px] text-slate-400">{stats.absentCount} ausencias</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Monthly History & Student Stats */}
          {activeStudent && (
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              {/* Student Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-md"
                    style={{ backgroundColor: activeStudent.avatarColor || '#4f46e5' }}
                  >
                    {(activeStudent.lastName || 'S').slice(0, 1)}
                    {(activeStudent.firstName || 'A').slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {activeStudent.lastName}, {activeStudent.firstName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      DNI: {activeStudent.dni} • id_estudiante: {activeStudent.id_estudiante}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Alumno Activo
                  </span>
                </div>
              </div>

              {/* Student Stats Cards */}
              {(() => {
                const sStats = getStudentAttendanceStats(activeStudent.id);
                const monthlyHistory = getStudentMonthlyHistory(activeStudent.id, selectedYear, selectedMonth);

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Presentes [P]</span>
                        <p className="text-xl font-black text-emerald-700">{sStats.presentCount}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60">
                        <span className="text-[10px] font-bold text-rose-700 uppercase">Ausentes [A]</span>
                        <p className="text-xl font-black text-rose-700">{sStats.absentCount}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60">
                        <span className="text-[10px] font-bold text-amber-700 uppercase">Tardanzas [T]</span>
                        <p className="text-xl font-black text-amber-700">{sStats.lateCount}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60">
                        <span className="text-[10px] font-bold text-sky-700 uppercase">Aus. Just. [AJ]</span>
                        <p className="text-xl font-black text-sky-700">{sStats.justifiedCount}</p>
                      </div>
                    </div>

                    {/* Tutor Info */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Tutor: {activeStudent.tutorName || 'Sin tutor asignado'}
                      </p>
                      {activeStudent.phoneTutor && (
                        <p className="text-slate-600 dark:text-slate-400 font-mono">
                          Teléfono de contacto: {activeStudent.phoneTutor}
                        </p>
                      )}
                    </div>

                    {/* Monthly History Calendar / Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          <span>Historial de Asistencias del Mes</span>
                        </h4>

                        <div className="flex items-center gap-2">
                          <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                          >
                            <option value={1}>Enero</option>
                            <option value={2}>Febrero</option>
                            <option value={3}>Marzo</option>
                            <option value={4}>Abril</option>
                            <option value={5}>Mayo</option>
                            <option value={6}>Junio</option>
                            <option value={7}>Julio</option>
                            <option value={8}>Agosto</option>
                            <option value={9}>Septiembre</option>
                            <option value={10}>Octubre</option>
                            <option value={11}>Noviembre</option>
                            <option value={12}>Diciembre</option>
                          </select>
                        </div>
                      </div>

                      {monthlyHistory.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                          No hay registros de asistencia para este mes.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                          {monthlyHistory.map((rec) => (
                            <div key={rec.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {rec.date}
                                </span>
                                {rec.observation && (
                                  <span className="text-[11px] text-slate-400 italic">
                                    Nota: {rec.observation}
                                  </span>
                                )}
                              </div>

                              <span
                                className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                                  rec.statusDb === 'P'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : rec.statusDb === 'A'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : rec.statusDb === 'T'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                }`}
                              >
                                {rec.statusDb === 'P'
                                  ? 'Presente [P]'
                                  : rec.statusDb === 'A'
                                  ? 'Ausente [A]'
                                  : rec.statusDb === 'T'
                                  ? 'Tardanza [T]'
                                  : 'Ausente Just. [AJ]'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 4: CONSULTA POR FECHA ESPECÍFICA
         ========================================================================= */}
      {queryMode === 'fecha' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Consulta de Asistencia por Fecha Específica</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Revisa el estado de presentismo general de la escuela en la jornada seleccionada
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Daily Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Presentes [P]</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{dateStats.presentCount}</p>
              <span className="text-xs text-emerald-600">{dateStats.attendancePercentage}% asistencia hoy</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Ausentes [A]</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{dateStats.absentCount}</p>
              <span className="text-xs text-rose-600">{dateStats.absencePercentage}% inasistencia</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Tardanzas [T]</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{dateStats.lateCount}</p>
              <span className="text-xs text-amber-600">Llegadas tarde</span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200">
              <span className="text-[10px] font-bold text-sky-700 uppercase">Aus. Justificadas [AJ]</span>
              <p className="text-2xl font-black text-sky-700 mt-1">{dateStats.justifiedCount}</p>
              <span className="text-xs text-sky-600">Certificados recibidos</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: RESUMEN GENERAL INSTITUCIONAL
         ========================================================================= */}
      {queryMode === 'general' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Resumen de Cursos (1.º, 2.º y 3.º Año)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Desempeño general de presentismo por año y división
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Reporte Completo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => {
              const comp = courseComparison.find((cc) => cc.course.id === c.id);
              return (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">{c.displayName}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {comp?.totalStudents || 30} alumnos
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-emerald-600 font-bold">Asistencia: {comp?.attendanceRate || 100}%</span>
                    <span className="text-rose-600 font-bold">Inasistencia: {comp?.absenceRate || 0}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${comp?.attendanceRate || 100}%` }} />
                    <div className="bg-rose-500 h-full" style={{ width: `${comp?.absenceRate || 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

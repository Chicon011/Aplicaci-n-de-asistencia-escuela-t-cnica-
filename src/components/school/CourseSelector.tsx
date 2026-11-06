/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  Plus,
  DoorOpen,
  UserCheck,
  Users,
  Percent,
  Database,
} from 'lucide-react';
import { AcademicYear, CourseDivision } from '../../types/school';
import { getStudents, getCourseDailySummary } from '../../lib/schoolStorage';

interface CourseSelectorProps {
  courses: CourseDivision[];
  selectedYear: AcademicYear;
  selectedCourseId: string;
  onSelectYear: (year: AcademicYear) => void;
  onSelectCourse: (courseId: string) => void;
  onOpenAddDivision: () => void;
  onOpenAddStudent: () => void;
  onOpenDatabaseSchema: () => void;
  currentDate: string;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses = [],
  selectedYear = 1,
  selectedCourseId,
  onSelectYear,
  onSelectCourse,
  onOpenAddDivision,
  onOpenAddStudent,
  onOpenDatabaseSchema,
  currentDate,
}) => {
  const safeCourses = Array.isArray(courses) ? courses : [];
  const yearCourses = safeCourses.filter((c) => c.year === selectedYear);
  const activeCourse = safeCourses.find((c) => c.id === selectedCourseId) || yearCourses[0] || safeCourses[0];

  const students = activeCourse ? getStudents(activeCourse.id) : [];
  const dailySummary = activeCourse ? getCourseDailySummary(activeCourse.id, currentDate) : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* 1. Year Selector (1.º, 2.º y 3.º año) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Nivel Secundario / Ciclo Básico (30 Alumnos por División)
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Gestión y Control de Cursos</span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Database Schema Button */}
          <button
            type="button"
            onClick={onOpenDatabaseSchema}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Ver diseño de base de datos relacional (usuarios, cursos, estudiantes, asistencias)"
          >
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>Diseño BD Relacional</span>
          </button>

          {/* Year Pills (1.º, 2.º y 3.º año) - Full-width on mobile */}
          <div className="grid grid-cols-3 sm:inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1 w-full sm:w-auto">
            {([1, 2, 3] as AcademicYear[]).map((y) => {
              const countInYear = safeCourses.filter((c) => c.year === y).length;
              const isSelected = selectedYear === y;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    onSelectYear(y);
                    const firstOfY = safeCourses.find((c) => c.year === y);
                    if (firstOfY) onSelectCourse(firstOfY.id);
                  }}
                  className={`py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{y}.º Año</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {countInYear}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Division selector for the active year */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Divisiones de {selectedYear}.º Año:
          </label>
          <button
            type="button"
            onClick={onOpenAddDivision}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Agregar nueva división</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {yearCourses.map((course) => {
            const isSelected = activeCourse?.id === course.id;
            const count = getStudents(course.id).length;

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onSelectCourse(course.id)}
                className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span>{course.divisionName || 'División'}</span>
                <span className="text-[11px] font-normal opacity-70">({course.shift || 'Mañana'})</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600">
                  {count} al.
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onOpenAddDivision}
            className="px-3.5 py-2.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 dark:border-slate-700 dark:hover:border-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva División</span>
          </button>
        </div>
      </div>

      {/* 3. Selected Course Overview Card */}
      {activeCourse && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/50 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-700/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {activeCourse.academicYearLabel || `${activeCourse.year}.º Año`} • {activeCourse.divisionName}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Turno {activeCourse.shift}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                (id_curso: {activeCourse.id_curso || 1})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <DoorOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>{activeCourse.classroom || 'Aula asignada'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Preceptor: {activeCourse.preceptor || 'A designar'}</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 shadow-xs">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Matrícula</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {students.length} Estudiantes
                </p>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 shadow-xs">
              <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Presentismo Hoy</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {dailySummary ? `${dailySummary.attendanceRate}%` : 'S/D'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAddStudent}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Inscribir Alumno</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

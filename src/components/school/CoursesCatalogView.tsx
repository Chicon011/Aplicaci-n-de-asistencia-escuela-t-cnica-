/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  School,
  Plus,
  Users,
  DoorOpen,
  UserCheck,
  ArrowRight,
  Database,
} from 'lucide-react';
import { CourseDivision, AcademicYear } from '../../types/school';
import { getStudents, getCourseDailySummary } from '../../lib/schoolStorage';

interface CoursesCatalogViewProps {
  courses: CourseDivision[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  onOpenAddDivision: (year?: AcademicYear) => void;
  onOpenDatabaseSchema?: () => void;
  currentDate: string;
}

export const CoursesCatalogView: React.FC<CoursesCatalogViewProps> = ({
  courses = [],
  selectedCourseId,
  onSelectCourse,
  onOpenAddDivision,
  onOpenDatabaseSchema,
  currentDate,
}) => {
  const years: AcademicYear[] = [1, 2, 3];
  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Catálogo Completo de Cursos y Divisiones</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supervisa la oferta académica de 1.º, 2.º y 3.º año (30 estudiantes por división)
          </p>
        </div>

        {onOpenDatabaseSchema && (
          <button
            type="button"
            onClick={onOpenDatabaseSchema}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Database className="w-4 h-4" />
            <span>Ver Estructura de BD Relacional</span>
          </button>
        )}
      </div>

      {years.map((year) => {
        const yearCourses = safeCourses.filter((c) => c.year === year);
        const totalYearStudents = yearCourses.reduce((acc, c) => acc + getStudents(c.id).length, 0);

        return (
          <div key={year} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {year}º
                </span>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {year}.º Año del Ciclo Secundario
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {yearCourses.length} divisiones activas • {totalYearStudents} estudiantes en total
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenAddDivision(year)}
                className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Agregar División a {year}.º Año</span>
                <span className="sm:hidden">+ División</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yearCourses.map((course) => {
                const students = getStudents(course.id);
                const dailyStats = getCourseDailySummary(course.id, currentDate);
                const isSelected = course.id === selectedCourseId;

                return (
                  <div
                    key={course.id}
                    onClick={() => onSelectCourse(course.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-50/80 to-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20 dark:from-slate-800/80 dark:to-slate-900 dark:border-indigo-500'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/40 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {course.divisionName || 'División'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {course.shift || 'Mañana'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <DoorOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{course.classroom || 'Aula asignada'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="truncate">Preceptor: {course.preceptor || 'A designar'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {students.length} estudiantes matriculados
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {dailyStats ? `${dailyStats.attendanceRate}% Asistencia` : 'Sin datos'}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Gestionar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Add division card in the grid */}
              <button
                type="button"
                onClick={() => onOpenAddDivision(year)}
                className="p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-600 flex flex-col items-center justify-center text-center group transition-all min-h-[190px] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Crear División en {year}.º Año
                </h5>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[160px]">
                  Habilita una nueva sección con 30 vacantes
                </p>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

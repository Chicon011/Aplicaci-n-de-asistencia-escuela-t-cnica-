/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Users,
  School,
  Database,
  RotateCcw,
  BarChart3,
  Cpu,
} from 'lucide-react';
import { AcademicYear, CourseDivision } from '../../types/school';
import { getCourses, initSchoolStorage, resetToDefault30Students } from '../../lib/schoolStorage';
import { CourseSelector } from './CourseSelector';
import { AttendanceControl } from './AttendanceControl';
import { StudentListView } from './StudentListView';
import { CoursesCatalogView } from './CoursesCatalogView';
import { AttendanceAnalyticsView } from './AttendanceAnalyticsView';
import { AddDivisionModal } from './AddDivisionModal';
import { AddStudentModal } from './AddStudentModal';
import { DatabaseSchemaModal } from './DatabaseSchemaModal';
import { TechnicalRequirementsModal } from './TechnicalRequirementsModal';

interface SchoolManagementDashboardProps {
  onRefreshNotice?: () => void;
}

type SchoolTab = 'asistencia' | 'consultas' | 'estudiantes' | 'cursos';

export const SchoolManagementDashboard: React.FC<SchoolManagementDashboardProps> = () => {
  const [courses, setCourses] = useState<CourseDivision[]>([]);
  const [selectedYear, setSelectedYear] = useState<AcademicYear>(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<SchoolTab>('asistencia');

  // Modals state
  const [isAddDivisionOpen, setIsAddDivisionOpen] = useState(false);
  const [modalYearForDivision, setModalYearForDivision] = useState<AcademicYear>(1);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isDatabaseSchemaOpen, setIsDatabaseSchemaOpen] = useState(false);
  const [isTechReqOpen, setIsTechReqOpen] = useState(false);

  // Today ISO date helper
  const getTodayDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [currentDate, setCurrentDate] = useState<string>(getTodayDate());

  // Load courses safely
  const refreshCourses = () => {
    initSchoolStorage();
    const loaded = getCourses();
    setCourses(loaded);

    if (loaded.length > 0) {
      // If current selected course doesn't exist, pick the first
      const exists = loaded.some((c) => c.id === selectedCourseId);
      if (!exists) {
        setSelectedCourseId(loaded[0].id);
        setSelectedYear(loaded[0].year);
      }
    }
  };

  useEffect(() => {
    refreshCourses();
  }, []);

  const safeCourses = Array.isArray(courses) ? courses : [];
  const activeCourse = safeCourses.find((c) => c.id === selectedCourseId) || safeCourses[0];

  const handleOpenAddDivision = (year?: AcademicYear) => {
    if (year) setModalYearForDivision(year);
    else setModalYearForDivision(selectedYear);
    setIsAddDivisionOpen(true);
  };

  const handleDivisionAdded = (newCourse: CourseDivision) => {
    refreshCourses();
    setSelectedYear(newCourse.year);
    setSelectedCourseId(newCourse.id);
    setActiveTab('estudiantes'); // Navigate to see newly created division
  };

  const handleStudentAdded = () => {
    refreshCourses();
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer los cursos y estudiantes a la configuración inicial con 30 alumnos por división?')) {
      resetToDefault30Students();
      refreshCourses();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header with Course & Division Selector */}
      {safeCourses.length > 0 && (
        <CourseSelector
          courses={safeCourses}
          selectedYear={selectedYear}
          selectedCourseId={selectedCourseId}
          onSelectYear={(y) => setSelectedYear(y)}
          onSelectCourse={(cId) => setSelectedCourseId(cId)}
          onOpenAddDivision={() => handleOpenAddDivision()}
          onOpenAddStudent={() => setIsAddStudentOpen(true)}
          onOpenDatabaseSchema={() => setIsDatabaseSchemaOpen(true)}
          currentDate={currentDate}
        />
      )}

      {/* 2. Main School Functionality Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto gap-4">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('asistencia')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'asistencia'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Control de Asistencia Diaria</span>
            <span className="sm:hidden">Asistencia</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consultas')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'consultas'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="hidden sm:inline">Consulta de Asistencia & Reportes</span>
            <span className="sm:hidden">Reportes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('estudiantes')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'estudiantes'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Consultar Estudiantes ({activeCourse ? '30 alumnos' : ''})</span>
            <span className="md:hidden">Alumnos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cursos')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'cursos'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <School className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Visualizar Todos los Cursos (1.º, 2.º y 3.º)</span>
            <span className="md:hidden">Cursos</span>
          </button>
        </div>

        {/* Quick action: Requerimientos Técnicos, BD Schema and Reset */}
        <div className="flex items-center gap-2 shrink-0 py-1">
          <button
            type="button"
            onClick={() => setIsTechReqOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Ver requerimientos técnicos obligatorios (HTML5, CSS3, JS, Node, Express, MySQL/Postgres, Git/GitHub, Render)"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Requerimientos Técnicos</span>
            <span className="md:hidden">Tecnologías</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDatabaseSchemaOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Esquema Relacional SQL</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Restablecer datos predeterminados (30 alumnos por división)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Restaurar 30 alumnos</span>
          </button>
        </div>
      </div>

      {/* 3. Tab Content */}
      <div className="pt-2">
        {activeCourse && activeTab === 'asistencia' && (
          <div className="animate-in fade-in duration-200">
            <AttendanceControl
              course={activeCourse}
              selectedDate={currentDate}
              onDateChange={(d) => setCurrentDate(d)}
              onAttendanceSaved={refreshCourses}
            />
          </div>
        )}

        {activeTab === 'consultas' && (
          <div className="animate-in fade-in duration-200">
            <AttendanceAnalyticsView initialCourseId={selectedCourseId} />
          </div>
        )}

        {activeCourse && activeTab === 'estudiantes' && (
          <div className="animate-in fade-in duration-200">
            <StudentListView
              course={activeCourse}
              onOpenAddStudent={() => setIsAddStudentOpen(true)}
              onStudentListChanged={refreshCourses}
            />
          </div>
        )}

        {activeTab === 'cursos' && (
          <div className="animate-in fade-in duration-200">
            <CoursesCatalogView
              courses={safeCourses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={(id) => {
                const found = safeCourses.find((c) => c.id === id);
                if (found) {
                  setSelectedYear(found.year);
                  setSelectedCourseId(found.id);
                  setActiveTab('asistencia');
                }
              }}
              onOpenAddDivision={(year) => handleOpenAddDivision(year)}
              onOpenDatabaseSchema={() => setIsDatabaseSchemaOpen(true)}
              currentDate={currentDate}
            />
          </div>
        )}
      </div>

      {/* Modal: Add Division */}
      <AddDivisionModal
        isOpen={isAddDivisionOpen}
        onClose={() => setIsAddDivisionOpen(false)}
        onDivisionAdded={handleDivisionAdded}
        defaultYear={modalYearForDivision}
      />

      {/* Modal: Add Student */}
      {activeCourse && (
        <AddStudentModal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
          course={activeCourse}
          onStudentAdded={handleStudentAdded}
        />
      )}

      {/* Modal: Database Relational Schema Inspector */}
      <DatabaseSchemaModal
        isOpen={isDatabaseSchemaOpen}
        onClose={() => setIsDatabaseSchemaOpen(false)}
      />

      {/* Modal: Technical Requirements Obligatorios Matrix */}
      <TechnicalRequirementsModal
        isOpen={isTechReqOpen}
        onClose={() => setIsTechReqOpen(false)}
      />

    </div>
  );
};

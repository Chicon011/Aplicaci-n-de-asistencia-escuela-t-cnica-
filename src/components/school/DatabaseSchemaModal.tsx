/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Database,
  Table,
  Key,
  Link2,
  Copy,
  Check,
  ShieldCheck,
  Code,
  Users,
  GraduationCap,
  ClipboardList,
} from 'lucide-react';
import { DDL_SCHEMA_SQL, getCourses, getStudents, getAllAttendanceRecords } from '../../lib/schoolStorage';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'sql' | 'datos'>('visual');

  if (!isOpen) return null;

  const courses = getCourses();
  const students = getStudents();
  const attendances = getAllAttendanceRecords();

  const handleCopy = () => {
    navigator.clipboard.writeText(DDL_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Diseño de Base de Datos Relacional
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  SQL Estándar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modelo entidad-relación para estudiantes de 1.º, 2.º y 3.º año (30 alumnos por división)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Diagrama & Tablas Relacionales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Script DDL SQL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('datos')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'datos'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Registros Activos ({students.length} alumnos)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* ================= VISUAL DIAGRAM & TABLES ================= */}
          {activeTab === 'visual' && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Tabla: cursos</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{courses.length}</p>
                  <span className="text-[11px] text-slate-500">Divisiones de 1.º a 3.º</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Tabla: estudiantes</span>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{students.length}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Exactamente 30 / división</span>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/60">
                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">Tabla: asistencias</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{attendances.length}</p>
                  <span className="text-[11px] text-slate-500">Registros con UNIQUE</span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Tabla: usuarios</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">2</p>
                  <span className="text-[11px] text-slate-500">Docentes / Preceptores</span>
                </div>
              </div>

              {/* 4 Relational Tables Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Tabla usuarios */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-purple-500" />
                      <h4 className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        usuarios
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400">Entidad de Acceso</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <Key className="w-3 h-3" /> id_usuario
                      </span>
                      <span className="text-slate-400">INT (PK)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>nombre_usuario</span>
                      <span className="text-slate-400">VARCHAR(50)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>password_hash</span>
                      <span className="text-slate-400">VARCHAR(255)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>rol</span>
                      <span className="text-slate-400">VARCHAR(20)</span>
                    </div>
                  </div>
                </div>

                {/* 2. Tabla cursos */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        cursos
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400">1.º, 2.º y 3.º Año</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <Key className="w-3 h-3" /> id_curso
                      </span>
                      <span className="text-slate-400">INT (PK)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>anio</span>
                      <span className="text-slate-400">INT (1, 2, 3)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>division</span>
                      <span className="text-slate-400">VARCHAR(5)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>turno</span>
                      <span className="text-slate-400">VARCHAR(20)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Tabla estudiantes */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-emerald-500" />
                      <h4 className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        estudiantes
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">30 Alumnos por Curso</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <Key className="w-3 h-3" /> id_estudiante
                      </span>
                      <span className="text-slate-400">INT (PK)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>dni</span>
                      <span className="text-slate-400">VARCHAR(15) [UNIQUE]</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>apellido</span>
                      <span className="text-slate-400">VARCHAR(80)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>nombre</span>
                      <span className="text-slate-400">VARCHAR(80)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900">
                      <span className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                        <Link2 className="w-3 h-3" /> id_curso
                      </span>
                      <span className="text-slate-400">INT (FK -&gt; cursos)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>estado</span>
                      <span className="text-slate-400">BOOLEAN (Activo)</span>
                    </div>
                  </div>
                </div>

                {/* 4. Tabla asistencias */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-cyan-500" />
                      <h4 className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        asistencias
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-600">Restricción UNIQUE</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <Key className="w-3 h-3" /> id_asistencia
                      </span>
                      <span className="text-slate-400">INT (PK)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <Link2 className="w-3 h-3" /> id_estudiante
                      </span>
                      <span className="text-slate-400">INT (FK -&gt; estudiantes)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">fecha</span>
                      <span className="text-slate-400">DATE</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>estado</span>
                      <span className="text-slate-400">VARCHAR(5) (P, A, T, J)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span>observacion</span>
                      <span className="text-slate-400">VARCHAR(255)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900">
                      <span className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                        <Link2 className="w-3 h-3" /> id_usuario
                      </span>
                      <span className="text-slate-400">INT (FK -&gt; usuarios)</span>
                    </div>
                  </div>
                  
                  {/* Restricción UNIQUE highlight */}
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-[10px] text-amber-800 dark:text-amber-300">
                    <span className="font-bold">Restricción UNIQUE:</span> uq_asistencia_estudiante_fecha (id_estudiante, fecha). Evita registros duplicados por jornada.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= SCRIPT DDL SQL ================= */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">
                  Script SQL DDL para creación de tablas, claves primarias, foráneas y restricciones:
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar DDL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                {DDL_SCHEMA_SQL}
              </pre>
            </div>
          )}

          {/* ================= DATOS EN VIVO ================= */}
          {activeTab === 'datos' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Población de datos relacionales cargada en memoria y almacenamiento local con 30 estudiantes por división:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {courses.map((c) => {
                  const count = students.filter((s) => s.id_curso === c.id_curso).length;
                  return (
                    <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{c.displayName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {count} alumnos
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">id_curso: {c.id_curso} • {c.classroom}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total matriculados: <span className="font-bold text-slate-800 dark:text-slate-200">{students.length} estudiantes</span> en {courses.length} divisiones.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
          >
            Cerrar Visor
          </button>
        </div>

      </div>
    </div>
  );
};

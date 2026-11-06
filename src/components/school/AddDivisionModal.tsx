/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, PlusCircle, School, Clock, DoorOpen, UserCheck, AlertCircle } from 'lucide-react';
import { AcademicYear, ShiftType, CourseDivision } from '../../types/school';
import { addCourseDivision } from '../../lib/schoolStorage';

interface AddDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDivisionAdded: (newCourse: CourseDivision) => void;
  defaultYear?: AcademicYear;
}

export const AddDivisionModal: React.FC<AddDivisionModalProps> = ({
  isOpen,
  onClose,
  onDivisionAdded,
  defaultYear = 1,
}) => {
  const [year, setYear] = useState<AcademicYear>(defaultYear);
  const [divisionName, setDivisionName] = useState('');
  const [shift, setShift] = useState<ShiftType>('Mañana');
  const [classroom, setClassroom] = useState('');
  const [preceptor, setPreceptor] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = addCourseDivision({
      year,
      divisionName,
      shift,
      classroom,
      preceptor,
    });

    if (res.success && res.course) {
      onDivisionAdded(res.course);
      onClose();
    } else {
      setErrorMessage(res.error || 'No se pudo crear la división.');
    }
  };

  const handleQuickName = (name: string) => {
    setDivisionName(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <PlusCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Agregar Nueva División
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Habilita una nueva división para 1.º, 2.º o 3.º año
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Year selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Año Académico (1.º, 2.º o 3.º año)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y as AcademicYear)}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    year === y
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {y}.º Año
                </button>
              ))}
            </div>
          </div>

          {/* Division Name with quick suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre de la División
            </label>
            <input
              type="text"
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              placeholder="Ej. 3.ª División o División C"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400">Sugerencias rápidas:</span>
              {['1.ª División', '2.ª División', '3.ª División', 'División A', 'División B'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleQuickName(sug)}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 rounded-md transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Shift and Classroom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Turno</span>
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as ShiftType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white cursor-pointer"
              >
                <option value="Mañana">Turno Mañana (07:30 - 12:45)</option>
                <option value="Tarde">Turno Tarde (13:00 - 18:15)</option>
                <option value="Vespertino">Turno Vespertino (18:30 - 22:30)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Aula Asignada</span>
              </label>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="Ej. Aula 103, Laboratorio B"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Preceptor / Docente */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Preceptor(a) o Docente a Cargo</span>
            </label>
            <input
              type="text"
              value={preceptor}
              onChange={(e) => setPreceptor(e.target.value)}
              placeholder="Ej. Prof. Andrea Molina"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Crear y Habilitar División
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  History,
  LogOut,
  Mail,
  School,
  Lock,
  Smartphone,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { User, SystemEmail } from '../../types/auth';
import { ProfileTab } from './ProfileTab';
import { SecurityTab } from './SecurityTab';
import { HistoryTab } from './HistoryTab';
import { SchoolManagementDashboard } from '../school/SchoolManagementDashboard';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onUserUpdated: (user: User) => void;
  systemEmails: SystemEmail[];
  onOpenEmailSimulator: () => void;
}

type TabType = 'escuela' | 'resumen' | 'perfil' | 'seguridad' | 'historial';

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onLogout,
  onUserUpdated,
  systemEmails,
  onOpenEmailSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('escuela');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const unreadEmails = systemEmails.filter((e) => !e.read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-4 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl font-black shadow-lg ring-4 ring-white/10 shrink-0"
              style={{ backgroundColor: currentUser.avatarBgColor || '#4f46e5' }}
            >
              {currentUser.avatar}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight">
                  Bienvenido, {currentUser.name}
                </h1>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-indigo-100 backdrop-blur-xs border border-white/20">
                  {currentUser.role === 'administrador' ? 'Docente / Preceptor' : 'Usuario Escolar'}
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-indigo-200">
                Sistema de Control de Asistencia y Gestión de Cursos (1.º, 2.º y 3.º Año)
              </p>
              <div className="flex items-center gap-2 mt-1 sm:mt-2 text-[10px] sm:text-[11px] text-indigo-300/80">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Sesión activa en el ciclo lectivo 2026</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <button
              onClick={onOpenEmailSimulator}
              className="flex-1 sm:flex-none px-3 py-1.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
              <span>Avisos ({systemEmails.length})</span>
              {unreadEmails > 0 && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex-1 sm:flex-none px-3 py-1.5 sm:py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white text-xs font-semibold border border-rose-500/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('escuela')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'escuela'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <School className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Gestión de Cursos & Asistencia</span>
          <span className="sm:hidden">Cursos & Asist.</span>
        </button>

        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'resumen'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Estado de Cuenta</span>
          <span className="sm:hidden">Cuenta</span>
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'perfil'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Mi Perfil Docente</span>
          <span className="sm:hidden">Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('seguridad')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'seguridad'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Seguridad & Contraseña</span>
          <span className="sm:hidden">Seguridad</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'historial'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Historial de Accesos</span>
          <span className="sm:hidden">Historial</span>
        </button>
      </div>

      {/* Content Area */}
      <div>
        {/* ================= GESTIÓN DE CURSOS Y ASISTENCIA (MAIN FEATURE) ================= */}
        {activeTab === 'escuela' && (
          <SchoolManagementDashboard />
        )}

        {/* ================= RESUMEN DE CUENTA ================= */}
        {activeTab === 'resumen' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Resumen de Cuenta de Usuario
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Información de credenciales, seguridad y permisos escolares
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-semibold text-slate-500">Rol Institucional</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {currentUser.role === 'administrador' ? 'Preceptor / Docente Titular' : 'Usuario Estándar'}
                </p>
                <span className="text-[11px] text-slate-400">Habilitado para tomar asistencia</span>
              </div>

              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-semibold text-slate-500">Doble Factor (2FA)</span>
                <p className="text-base font-bold mt-1 text-slate-900 dark:text-white">
                  {currentUser.twoFactorEnabled ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Protección Activa</span>
                  ) : (
                    <span className="text-amber-500">Inactivo</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('seguridad')}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 block"
                >
                  Gestionar seguridad →
                </button>
              </div>

              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-semibold text-slate-500">Correo Electrónico</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                  {currentUser.email}
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold">Verificado para recuperación</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= PERFIL ================= */}
        {activeTab === 'perfil' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <ProfileTab currentUser={currentUser} onUserUpdated={onUserUpdated} />
          </div>
        )}

        {/* ================= SEGURIDAD ================= */}
        {activeTab === 'seguridad' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <SecurityTab
              currentUser={currentUser}
              onUserUpdated={onUserUpdated}
              onRefreshEmails={onOpenEmailSimulator}
            />
          </div>
        )}

        {/* ================= HISTORIAL ================= */}
        {activeTab === 'historial' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <HistoryTab />
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ¿Cerrar sesión?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tendrás que introducir nuevamente tus credenciales para acceder al control de asistencia.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

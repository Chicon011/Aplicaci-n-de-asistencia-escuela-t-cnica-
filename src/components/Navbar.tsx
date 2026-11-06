/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  Mail,
  Sun,
  Moon,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Cpu,
} from 'lucide-react';
import { User, SystemEmail } from '../types/auth';
import { useDeviceType } from '../hooks/useDeviceType';

interface NavbarProps {
  currentUser: User | null;
  onLogout?: () => void;
  systemEmails: SystemEmail[];
  onOpenEmailSimulator: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenTechRequirements?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  systemEmails,
  onOpenEmailSimulator,
  darkMode,
  onToggleDarkMode,
  onOpenTechRequirements,
}) => {
  const unreadEmailsCount = systemEmails.filter((e) => !e.read).length;
  const { deviceType, isMobile, isTablet } = useDeviceType();

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors bg-white/90 border-slate-200/80 dark:bg-slate-900/90 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                Edu<span className="text-indigo-600 dark:text-indigo-400">Asistencia</span>
              </span>
              {currentUser && (
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                  1.º-3.º Año
                </span>
              )}
            </div>
            {currentUser && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
                Control de Asistencia y Gestión de Divisiones
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Requerimientos Técnicos Obligatorios Button (Visible when logged in) */}
          {currentUser && onOpenTechRequirements && (
            <button
              onClick={onOpenTechRequirements}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 cursor-pointer shadow-xs"
              title="Ver especificación de tecnologías obligatorias: HTML5, CSS3, JavaScript, Node.js, Express.js, MySQL/PostgreSQL, Git/GitHub, Render"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Requerimientos Técnicos</span>
              <span className="sm:hidden">Tecnologías</span>
            </button>
          )}

          {/* Real-time Adaptive Device Indicator (Visible when logged in) */}
          {currentUser && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
              title={`Interfaz adaptada automáticamente a tu pantalla (${deviceType})`}
            >
              {isMobile ? (
                <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
              ) : isTablet ? (
                <Tablet className="w-3.5 h-3.5 text-indigo-500" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span className="hidden xs:inline sm:inline">
                {isMobile ? 'Móvil' : isTablet ? 'Tablet' : 'Escritorio'}
              </span>
            </div>
          )}

          {/* Email Inbox Simulator Button */}
          <button
            onClick={onOpenEmailSimulator}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 dark:text-slate-200 dark:hover:text-indigo-300 dark:hover:bg-slate-800 dark:border-slate-700 cursor-pointer"
            title="Bandeja de correos del sistema (códigos OTP y avisos)"
          >
            <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="hidden md:inline">Bandeja</span>
            {unreadEmailsCount > 0 ? (
              <span className="flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] font-bold text-white bg-indigo-600 rounded-full animate-pulse">
                {unreadEmailsCount}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 hidden lg:inline">
                ({systemEmails.length})
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
          </button>

          {/* User status badge or quick indicator */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: currentUser.avatarBgColor || '#4f46e5' }}
              >
                {currentUser.avatar}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {currentUser.name.split(' ')[0]}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Conectado
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-md dark:bg-slate-800 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Acceso seguro</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

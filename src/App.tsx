/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, SystemEmail } from './types/auth';
import {
  initStorage,
  getCurrentUser,
  setCurrentUser,
  getSystemEmails,
} from './lib/storage';
import { initSchoolStorage } from './lib/schoolStorage';
import { Navbar } from './components/Navbar';
import { AuthContainer } from './components/auth/AuthContainer';
import { Dashboard } from './components/dashboard/Dashboard';
import { EmailSimulatorDrawer } from './components/EmailSimulatorDrawer';
import { TermsModal } from './components/auth/TermsModal';
import { TechnicalRequirementsModal } from './components/school/TechnicalRequirementsModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  const [currentUser, setCurUser] = useState<User | null>(null);
  const [systemEmails, setSystemEmails] = useState<SystemEmail[]>([]);
  const [isEmailSimulatorOpen, setIsEmailSimulatorOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isTechReqOpen, setIsTechReqOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('portal_auth_theme');
    if (saved === 'light') {
      // User requested dark mode, so we activate dark mode
      localStorage.setItem('portal_auth_theme', 'dark');
      return true;
    }
    return true;
  });

  // Initialize storage and check logged in user
  useEffect(() => {
    try {
      initStorage();
      initSchoolStorage();
      const user = getCurrentUser();
      if (user) {
        setCurUser(user);
      }
      setSystemEmails(getSystemEmails());
    } catch (e) {
      console.error('Initialization error:', e);
    }
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('portal_auth_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('portal_auth_theme', 'light');
    }
  }, [darkMode]);

  const refreshEmails = () => {
    setSystemEmails(getSystemEmails());
  };

  const handleAuthSuccess = (user: User) => {
    setCurUser(user);
    refreshEmails();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurUser(null);
  };

  const handleUserUpdated = (updated: User) => {
    setCurUser(updated);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white">
        {/* Navbar */}
        <Navbar
          currentUser={currentUser}
          systemEmails={systemEmails}
          onOpenEmailSimulator={() => {
            refreshEmails();
            setIsEmailSimulatorOpen(true);
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenTechRequirements={() => setIsTechReqOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col justify-center relative">
          {/* Subtle background decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {currentUser ? (
            <Dashboard
              currentUser={currentUser}
              onLogout={handleLogout}
              onUserUpdated={handleUserUpdated}
              systemEmails={systemEmails}
              onOpenEmailSimulator={() => {
                refreshEmails();
                setIsEmailSimulatorOpen(true);
              }}
            />
          ) : (
            <AuthContainer
              onAuthSuccess={handleAuthSuccess}
              onOpenTerms={() => setIsTermsOpen(true)}
              onRefreshEmails={refreshEmails}
            />
          )}
        </main>

        {/* Footer (Visible when logged in) */}
        {currentUser && (
          <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© {new Date().getFullYear()} EduAsistencia. Sistema de Control de Asistencia y Gestión de Cursos (1.º, 2.º y 3.º Año).</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsTechReqOpen(true)}
                  className="hover:underline text-emerald-600 dark:text-emerald-400 font-bold transition-colors cursor-pointer"
                >
                  Requerimientos Técnicos
                </button>
                <span>•</span>
                <button
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Términos & Privacidad
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    refreshEmails();
                    setIsEmailSimulatorOpen(true);
                  }}
                  className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Bandeja de Códigos ({systemEmails.length})
                </button>
              </div>
            </div>
          </footer>
        )}

        {/* System Email Drawer */}
        <EmailSimulatorDrawer
          isOpen={isEmailSimulatorOpen}
          onClose={() => setIsEmailSimulatorOpen(false)}
          emails={systemEmails}
          onRefresh={refreshEmails}
        />

        {/* Terms and Privacy Modal */}
        <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

        {/* Technical Requirements Obligatorios Modal */}
        <TechnicalRequirementsModal
          isOpen={isTechReqOpen}
          onClose={() => setIsTechReqOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}

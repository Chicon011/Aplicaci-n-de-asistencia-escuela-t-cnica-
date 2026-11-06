/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { User, AuthView } from '../../types/auth';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordFlow } from './ForgotPasswordFlow';

interface AuthContainerProps {
  onAuthSuccess: (user: User) => void;
  onOpenTerms: () => void;
  onRefreshEmails: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  onAuthSuccess,
  onOpenTerms,
  onRefreshEmails,
}) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [prefillEmail, setPrefillEmail] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleForgotPassword = (email?: string) => {
    if (email) setPrefillEmail(email);
    setCurrentView('forgot_password');
    setSuccessNotice(null);
  };

  const handleResetComplete = (email: string) => {
    setPrefillEmail(email);
    setCurrentView('login');
    setSuccessNotice('Contraseña restablecida con éxito.');
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
        
        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/20 mb-3">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentView === 'login' && 'Iniciar Sesión'}
            {currentView === 'register' && 'Crear Cuenta'}
            {currentView === 'forgot_password' && 'Recuperar Contraseña'}
          </h1>
        </div>

        {/* Tab switch for Login / Register */}
        {currentView !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setCurrentView('login');
                setSuccessNotice(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'login'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('register');
                setSuccessNotice(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'register'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        )}

        {/* Forms Content */}
        <div>
          {currentView === 'login' && (
            <LoginForm
              onSuccess={onAuthSuccess}
              onForgotPassword={handleForgotPassword}
              onSwitchToRegister={() => {
                setCurrentView('register');
                setSuccessNotice(null);
              }}
              initialEmail={prefillEmail}
              successMessage={successNotice}
            />
          )}

          {currentView === 'register' && (
            <RegisterForm
              onSuccess={onAuthSuccess}
              onSwitchToLogin={() => {
                setCurrentView('login');
                setSuccessNotice(null);
              }}
              onOpenTerms={onOpenTerms}
            />
          )}

          {currentView === 'forgot_password' && (
            <ForgotPasswordFlow
              initialEmail={prefillEmail}
              onBackToLogin={() => setCurrentView('login')}
              onSuccessReset={handleResetComplete}
              onRefreshSystemEmails={onRefreshEmails}
            />
          )}
        </div>

      </div>
    </div>
  );
};

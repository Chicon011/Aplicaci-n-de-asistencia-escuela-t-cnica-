/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '../../types/auth';
import { changePassword, toggleTwoFactor } from '../../lib/storage';
import { PasswordStrengthMeter } from '../auth/PasswordStrengthMeter';

interface SecurityTabProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
  onRefreshEmails: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  currentUser,
  onUserUpdated,
  onRefreshEmails,
}) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [twoFactorNotice, setTwoFactorNotice] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (newPass.length < 8) {
      setErrorMsg('La nueva contraseña debe contener al menos 8 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setErrorMsg('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = changePassword(currentUser.id, currentPass, newPass);
      setIsLoading(false);

      if (res.success) {
        setSuccessMsg('Contraseña actualizada con éxito.');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        onRefreshEmails();
      } else {
        setErrorMsg(res.error || 'Error al modificar la contraseña.');
      }
    }, 400);
  };

  const handleToggle2FA = () => {
    const res = toggleTwoFactor(currentUser.id);
    if (res.success) {
      onUserUpdated({ ...currentUser, twoFactorEnabled: res.twoFactorEnabled });
      setTwoFactorNotice(
        res.twoFactorEnabled
          ? 'Autenticación de dos factores (2FA) activada con éxito.'
          : 'Autenticación de dos factores (2FA) desactivada.'
      );
      setTimeout(() => setTwoFactorNotice(null), 3500);
    }
  };

  return (
    <div className="space-y-8">
      {/* 2FA Section */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${currentUser.twoFactorEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Autenticación en Dos Pasos (2FA)
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentUser.twoFactorEnabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {currentUser.twoFactorEnabled ? 'Activado' : 'Desactivado'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                Añade una capa adicional de protección requiriendo un código de un solo uso además de tu contraseña para iniciar sesión.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle2FA}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              currentUser.twoFactorEnabled
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
            }`}
          >
            {currentUser.twoFactorEnabled ? 'Desactivar 2FA' : 'Activar 2FA'}
          </button>
        </div>

        {twoFactorNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{twoFactorNotice}</span>
          </div>
        )}
      </div>

      {/* Change Password Form */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Cambiar Contraseña</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Asegúrate de utilizar una contraseña segura y no repetirla en otros sitios
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <PasswordStrengthMeter password={newPass} />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repite la nueva contraseña"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPass && newPass !== confirmPass && (
              <p className="text-[11px] text-rose-500 mt-1">Las contraseñas no coinciden.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !currentPass || newPass.length < 8 || newPass !== confirmPass}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all text-xs disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

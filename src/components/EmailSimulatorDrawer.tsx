/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Mail, Key, ShieldAlert, Sparkles, Copy, Check, Trash2, CheckCheck, Clock } from 'lucide-react';
import { SystemEmail } from '../types/auth';
import { markEmailAsRead, clearSystemEmails } from '../lib/storage';

interface EmailSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  emails: SystemEmail[];
  onRefresh: () => void;
}

export const EmailSimulatorDrawer: React.FC<EmailSimulatorDrawerProps> = ({
  isOpen,
  onClose,
  emails,
  onRefresh,
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0] || null;

  const handleSelect = (email: SystemEmail) => {
    setSelectedEmailId(email.id);
    if (!email.read) {
      markEmailAsRead(email.id);
      onRefresh();
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClear = () => {
    clearSystemEmails();
    setSelectedEmailId(null);
    onRefresh();
  };

  const getEmailIcon = (type: SystemEmail['type']) => {
    switch (type) {
      case 'password_reset':
        return <Key className="w-4 h-4 text-amber-500" />;
      case 'security_alert':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'welcome':
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Bandeja de Correos del Sistema
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulación en tiempo real de correos OTP y notificaciones
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {emails.length > 0 && (
              <button
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Vaciar bandeja de correos"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {emails.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
            <Mail className="w-12 h-12 stroke-[1.2] mb-3 opacity-60" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              La bandeja está vacía
            </p>
            <p className="text-xs mt-1 max-w-xs">
              Cuando solicites recuperar tu contraseña o crees una cuenta nueva, verás los correos con sus códigos de 6 dígitos aquí.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            
            {/* Email list */}
            <div className="sm:w-1/2 border-r border-slate-100 dark:border-slate-800 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => handleSelect(email)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getEmailIcon(email.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs truncate ${email.read ? 'text-slate-600 dark:text-slate-400' : 'font-bold text-slate-900 dark:text-white'}`}>
                          {email.to}
                        </span>
                        {!email.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className={`text-xs truncate ${email.read ? 'text-slate-700 dark:text-slate-300' : 'font-semibold text-indigo-600 dark:text-indigo-400'}`}>
                        {email.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {email.preview}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Email detail view */}
            <div className="sm:w-1/2 flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto p-4 sm:p-5">
              {selectedEmail ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(selectedEmail.sentAt).toLocaleString('es-ES')}</span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {selectedEmail.subject}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      Destinatario: <span className="font-mono font-medium">{selectedEmail.to}</span>
                    </p>
                  </div>

                  {/* OTP Code prominent box if present */}
                  {selectedEmail.code && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-center space-y-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Código de Verificación OTP
                      </span>
                      <div className="text-2xl font-mono font-black tracking-widest text-indigo-600 dark:text-indigo-400">
                        {selectedEmail.code}
                      </div>
                      <button
                        onClick={() => handleCopy(selectedEmail.code!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Código Copiado' : 'Copiar Código'}</span>
                      </button>
                    </div>
                  )}

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-sans">
                      {selectedEmail.body}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                  Selecciona un correo para leerlo
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Simulador de mensajería transaccional para pruebas de autenticación
        </div>

      </div>
    </div>
  );
};

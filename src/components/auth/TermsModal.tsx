/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Shield, Lock, FileText, CheckCircle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Términos de Servicio y Privacidad
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Políticas de seguridad y protección de datos de PortalAuth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-600 dark:text-slate-300">
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4>1. Aceptación de los Términos</h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Al registrar una cuenta en PortalAuth, usted acepta cumplir con estas normas de uso. La plataforma garantiza el acceso exclusivo mediante credenciales verificadas y protocolos de autenticación modernos.
            </p>
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4>2. Seguridad y Contraseñas</h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Usted es responsable de resguardar la confidencialidad de su contraseña y de cualquier acción ejecutada bajo su cuenta. Las contraseñas se almacenan mediante algoritmos de cifrado y nunca son visibles en texto plano por administradores.
            </p>
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4>3. Recuperación de Acceso</h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              La recuperación de contraseña se realiza exclusivamente a través de códigos OTP enviados al correo verificado. Los códigos tienen una validez temporal de 15 minutos y caducan automáticamente tras su uso.
            </p>
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
              <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4>4. Privacidad y Datos Personales</h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Sus datos personales (nombre, correo electrónico y registro de actividad) se almacenan de manera segura y no son comercializados con terceros bajo ninguna circunstancia.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Entendido y Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};

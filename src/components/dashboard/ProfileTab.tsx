/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../../types/auth';
import { updateUserProfile } from '../../lib/storage';
import { UserCheck, Phone, FileText, Palette, Save, CheckCircle2 } from 'lucide-react';

interface ProfileTabProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
}

const COLOR_OPTIONS = [
  { name: 'Índigo', hex: '#4f46e5' },
  { name: 'Esmeralda', hex: '#059669' },
  { name: 'Rosa Coral', hex: '#e11d48' },
  { name: 'Ámbar', hex: '#d97706' },
  { name: 'Cian', hex: '#0891b2' },
  { name: 'Púrpura', hex: '#7c3aed' },
];

export const ProfileTab: React.FC<ProfileTabProps> = ({ currentUser, onUserUpdated }) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [selectedColor, setSelectedColor] = useState(currentUser.avatarBgColor || '#4f46e5');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateUserProfile(currentUser.id, {
      name,
      phone,
      bio,
      avatarBgColor: selectedColor,
    });
    if (res.success && res.user) {
      onUserUpdated(res.user);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Información de Perfil
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personaliza tus datos visibles y distintivo de usuario
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>¡Datos de perfil actualizados con éxito!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar preview and color selection */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md"
            style={{ backgroundColor: selectedColor }}
          >
            {currentUser.avatar}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Color del Avatar
            </label>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c.hex ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Nombre Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        {/* Email (Readonly) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Correo Electrónico (Identificador de acceso)
          </label>
          <input
            type="email"
            value={currentUser.email}
            disabled
            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400 cursor-not-allowed"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            El correo está vinculado a la seguridad de la cuenta y sus procesos de recuperación.
          </span>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Teléfono de Contacto (Opcional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Biografía o Nota Personal
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escribe unas palabras sobre tu perfil..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios del Perfil</span>
        </button>
      </form>
    </div>
  );
};

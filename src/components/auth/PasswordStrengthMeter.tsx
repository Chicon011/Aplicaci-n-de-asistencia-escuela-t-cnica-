/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, X } from 'lucide-react';
import { evaluatePasswordStrength } from '../../lib/storage';

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showRequirements = true,
}) => {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  const getBarColor = (index: number) => {
    if (index >= strength.score) return 'bg-slate-200 dark:bg-slate-700';
    if (strength.score <= 1) return 'bg-rose-500';
    if (strength.score === 2) return 'bg-amber-500';
    if (strength.score === 3) return 'bg-emerald-500';
    return 'bg-emerald-600';
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Bars & Label */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">Fortaleza de contraseña:</span>
          <span className="font-semibold" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          <div className={`rounded-full transition-all duration-300 ${getBarColor(0)}`} />
          <div className={`rounded-full transition-all duration-300 ${getBarColor(1)}`} />
          <div className={`rounded-full transition-all duration-300 ${getBarColor(2)}`} />
          <div className={`rounded-full transition-all duration-300 ${getBarColor(3)}`} />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            {strength.requirements.minLength ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className={strength.requirements.minLength ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>
              Mínimo 8 caracteres
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {strength.requirements.hasUppercase ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className={strength.requirements.hasUppercase ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>
              Una mayúscula (A-Z)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {strength.requirements.hasLowercase ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className={strength.requirements.hasLowercase ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>
              Una minúscula (a-z)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {strength.requirements.hasNumber ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className={strength.requirements.hasNumber ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>
              Al menos un número (0-9)
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:col-span-2">
            {strength.requirements.hasSpecial ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className={strength.requirements.hasSpecial ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>
              Carácter especial (!@#$%...)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

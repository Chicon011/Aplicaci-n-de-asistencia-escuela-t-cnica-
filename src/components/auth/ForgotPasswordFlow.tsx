/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Mail,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Copy,
  Check,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import {
  generatePasswordResetCode,
  verifyPasswordResetCode,
  completePasswordReset,
  findUserByEmail,
} from '../../lib/storage';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface ForgotPasswordFlowProps {
  onBackToLogin: () => void;
  onSuccessReset: (email: string) => void;
  initialEmail?: string;
  onRefreshSystemEmails?: () => void;
}

type Step = 'request' | 'verify' | 'new_password' | 'success';

export const ForgotPasswordFlow: React.FC<ForgotPasswordFlowProps> = ({
  onBackToLogin,
  onSuccessReset,
  initialEmail = '',
  onRefreshSystemEmails,
}) => {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(initialEmail);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // OTP 6 digits input state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending code
  const [resendCooldown, setResendCooldown] = useState(0);

  // New Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // General states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle step 1: Request reset code
  const handleRequestCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    const user = findUserByEmail(normalizedEmail);
    if (!user) {
      setErrorMessage(
        'No se ha encontrado ninguna cuenta asociada a este correo. Verifica que esté bien escrito o regístrate.'
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = generatePasswordResetCode(normalizedEmail);
      setIsLoading(false);

      if (res.success && res.code) {
        setGeneratedCode(res.code);
        setStep('verify');
        setResendCooldown(60);
        onRefreshSystemEmails?.();
      } else {
        setErrorMessage(res.error || 'Ocurrió un error al generar el código.');
      }
    }, 400);
  };

  // Handle digit inputs
  const handleDigitChange = (index: number, val: string) => {
    // Only accept numbers
    const clean = val.replace(/\D/g, '');
    const newOtp = [...otpDigits];

    if (clean.length > 1) {
      // Pasting full code or part
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((char, idx) => {
        if (index + idx < 6) {
          newOtp[index + idx] = char;
        }
      });
      setOtpDigits(newOtp);
      const nextIdx = Math.min(5, index + pasted.length);
      digitInputRefs.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = clean.slice(-1);
    setOtpDigits(newOtp);

    if (clean && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillCode = () => {
    if (!generatedCode) return;
    const split = generatedCode.split('');
    setOtpDigits(split);
    setErrorMessage(null);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Handle step 2: Verify code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Por favor, introduce los 6 dígitos del código de verificación.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = verifyPasswordResetCode(email, fullCode);
      setIsLoading(false);

      if (res.valid) {
        setStep('new_password');
      } else {
        setErrorMessage(res.error || 'El código introducido no es válido.');
      }
    }, 400);
  };

  // Handle step 3: Save new password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Asegúrate de escribirlas idénticas.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const fullCode = otpDigits.join('');
      const res = completePasswordReset(email, fullCode, newPassword);
      setIsLoading(false);

      if (res.success) {
        setStep('success');
        onRefreshSystemEmails?.();
      } else {
        setErrorMessage(res.error || 'No se pudo restablecer la contraseña.');
      }
    }, 500);
  };

  return (
    <div className="w-full">
      {/* Top Breadcrumb & Step Indicators */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio de sesión</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'request'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
              }`}
            >
              {step === 'request' ? '1' : <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Correo</span>
          </div>

          <div className="flex-1 h-0.5 mx-2 bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'verify'
                  ? 'bg-indigo-600 text-white'
                  : step === 'new_password' || step === 'success'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              }`}
            >
              {step === 'new_password' || step === 'success' ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                '2'
              )}
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Código</span>
          </div>

          <div className="flex-1 h-0.5 mx-2 bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'new_password'
                  ? 'bg-indigo-600 text-white'
                  : step === 'success'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              }`}
            >
              {step === 'success' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Contraseña
            </span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 flex items-start gap-3 text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="font-medium text-xs sm:text-sm">{errorMessage}</p>
        </div>
      )}

      {/* ================= STEP 1: REQUEST CODE ================= */}
      {step === 'request' && (
        <div>
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Recuperar Contraseña
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un código de
              seguridad de 6 dígitos para verificar tu identidad.
            </p>
          </div>

          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Correo Electrónico Registrado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm dark:bg-slate-800/80 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Buscando cuenta y generando código...
                </span>
              ) : (
                <>
                  <span>Enviar Código de Recuperación</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick tip */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
              💡 Cuentas de prueba disponibles:
            </p>
            <p>
              Puedes probar con{' '}
              <button
                type="button"
                onClick={() => setEmail('julian0309xx@gmail.com')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                julian0309xx@gmail.com
              </button>{' '}
              o{' '}
              <button
                type="button"
                onClick={() => setEmail('elena.morales@empresa.com')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                elena.morales@empresa.com
              </button>
              .
            </p>
          </div>
        </div>
      )}

      {/* ================= STEP 2: VERIFY OTP CODE ================= */}
      {step === 'verify' && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Verificar Código de Seguridad
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Hemos enviado un código de 6 dígitos a{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>.
            </p>
          </div>

          {/* SIMULATED INBOX FLOATING CARD (Makes testing instant and delighting) */}
          {generatedCode && (
            <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Notificación de Correo Simulada
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Recibido hace un instante
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                Código de verificación de tu correo:
              </p>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-900">
                <span className="font-mono text-base font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
                  {generatedCode}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoFillCode}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                  >
                    Autocompletar
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="space-y-4">
            {/* 6 Digit Inputs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 text-center">
                Ingresa los 6 dígitos:
              </label>
              <div className="flex items-center justify-center gap-1.5 sm:gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      digitInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-9 sm:w-12 h-11 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* Resend timer */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Válido por 15 minutos
              </span>

              {resendCooldown > 0 ? (
                <span className="text-slate-400 dark:text-slate-500 font-medium">
                  Reenviar código en {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRequestCode()}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Reenviar código</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length !== 6}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Validando código...
                </span>
              ) : (
                <>
                  <span>Verificar y Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================= STEP 3: NEW PASSWORD ================= */}
      {step === 'new_password' && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Crear Nueva Contraseña
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Identidad verificada. Introduce tu nueva contraseña para la cuenta{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleSaveNewPassword} className="space-y-4">
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
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm dark:bg-slate-800/80 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showNewPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              <PasswordStrengthMeter password={newPassword} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm dark:bg-slate-800/80 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] text-rose-500 mt-1">Las contraseñas no coinciden aún.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Actualizando contraseña...
                </span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Guardar y Restablecer Contraseña</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================= STEP 4: SUCCESS ================= */}
      {step === 'success' && (
        <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              ¡Contraseña Actualizada!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
              Tu contraseña para <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span> ha
              sido cambiada exitosamente. Todas las sesiones anteriores han sido aseguradas.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 text-left">
            <p className="font-semibold mb-0.5">Consejo de seguridad:</p>
            <p>
              Nunca compartas tu código ni contraseña con terceras personas. Hemos enviado un correo
              de confirmación a tu bandeja.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSuccessReset(email)}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <span>Iniciar Sesión con mi Nueva Contraseña</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

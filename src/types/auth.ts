/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarBgColor?: string;
  role: 'usuario' | 'administrador';
  phone?: string;
  bio?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt: string;
  passwordHash: string;
}

export interface LoginHistoryItem {
  id: string;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  browser: string;
  status: 'success' | 'failed';
  reason?: string;
}

export interface PasswordResetCode {
  email: string;
  code: string;
  expiresAt: number; // timestamp
  used: boolean;
}

export interface SystemEmail {
  id: string;
  to: string;
  subject: string;
  type: 'welcome' | 'password_reset' | 'security_alert';
  preview: string;
  body: string;
  code?: string;
  sentAt: string;
  read: boolean;
}

export type AuthView = 'login' | 'register' | 'forgot_password';

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Muy débil' | 'Débil' | 'Aceptable' | 'Fuerte' | 'Excelente';
  color: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, LoginHistoryItem, PasswordResetCode, SystemEmail, PasswordStrength } from '../types/auth';

const STORAGE_KEYS = {
  USERS: 'portal_auth_users',
  CURRENT_USER: 'portal_auth_current_user',
  SESSION_REMEMBER: 'portal_auth_remember',
  RESET_CODES: 'portal_auth_reset_codes',
  SYSTEM_EMAILS: 'portal_auth_system_emails',
  LOGIN_HISTORY: 'portal_auth_login_history',
  THEME: 'portal_auth_theme',
};

// Simple reliable string hash for client-side demo persistence
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash_v1_${Math.abs(hash).toString(16)}_${password.length * 31}`;
}

// Initial demo users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_demo_1',
    name: 'Julián Pérez',
    email: 'julian0309xx@gmail.com',
    avatar: 'JP',
    avatarBgColor: '#4f46e5',
    role: 'administrador',
    phone: '+34 612 345 678',
    bio: 'Desarrollador y usuario principal del sistema PortalAuth.',
    twoFactorEnabled: false,
    createdAt: '2026-01-15T09:30:00Z',
    lastLoginAt: new Date().toISOString(),
    passwordHash: hashPassword('Password123!'),
  },
  {
    id: 'usr_demo_2',
    name: 'Elena Morales',
    email: 'elena.morales@empresa.com',
    avatar: 'EM',
    avatarBgColor: '#059669',
    role: 'usuario',
    phone: '+34 699 876 543',
    bio: 'Especialista en experiencia de usuario y diseño.',
    twoFactorEnabled: true,
    createdAt: '2026-02-10T14:15:00Z',
    lastLoginAt: '2026-03-01T11:20:00Z',
    passwordHash: hashPassword('Password123!'),
  },
];

// Initialize default storage if empty
export function initStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGIN_HISTORY)) {
    const initialHistory: LoginHistoryItem[] = [
      {
        id: 'hist_1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        ip: '192.168.1.45',
        location: 'Madrid, España',
        device: 'MacBook Pro 16"',
        browser: 'Chrome 122.0',
        status: 'success',
      },
      {
        id: 'hist_2',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        ip: '192.168.1.45',
        location: 'Madrid, España',
        device: 'MacBook Pro 16"',
        browser: 'Chrome 122.0',
        status: 'success',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.LOGIN_HISTORY, JSON.stringify(initialHistory));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SYSTEM_EMAILS)) {
    const welcomeEmail: SystemEmail = {
      id: 'eml_initial_1',
      to: 'julian0309xx@gmail.com',
      subject: '¡Bienvenido a PortalAuth!',
      type: 'welcome',
      preview: 'Tu cuenta ha sido creada con éxito. Explora todas tus funciones.',
      body: 'Hola Julián,\n\nTe damos la bienvenida oficial a PortalAuth. Tu cuenta está activa y lista para ser utilizada. Recuerda mantener tus contraseñas seguras y activar la autenticación de dos factores.',
      sentAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      read: true,
    };
    localStorage.setItem(STORAGE_KEYS.SYSTEM_EMAILS, JSON.stringify([welcomeEmail]));
  }
}

// User CRUD
export function getUsers(): User[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null, remember: boolean = true): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_REMEMBER);
    return;
  }

  if (remember) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.SESSION_REMEMBER, 'true');
  } else {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.removeItem(STORAGE_KEYS.SESSION_REMEMBER);
  }
}

export function registerUser(params: {
  name: string;
  email: string;
  password: string;
  avatarBgColor?: string;
}): { success: boolean; error?: string; user?: User } {
  const normalizedEmail = params.email.trim().toLowerCase();

  if (!params.name.trim()) {
    return { success: false, error: 'Por favor, ingresa tu nombre completo.' };
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, error: 'Por favor, introduce un correo electrónico válido.' };
  }
  if (params.password.length < 8) {
    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  }

  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
  }

  // Generate initials avatar
  const parts = params.name.trim().split(' ').filter(Boolean);
  const initials = parts.length >= 2 
    ? (parts[0][0] + parts[1][0]).toUpperCase() 
    : parts[0]?.slice(0, 2).toUpperCase() || 'US';

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: params.name.trim(),
    email: normalizedEmail,
    avatar: initials,
    avatarBgColor: params.avatarBgColor || '#6366f1',
    role: 'usuario',
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    passwordHash: hashPassword(params.password),
  };

  const users = getUsers();
  users.push(newUser);
  saveUsers(users);

  // Send Welcome Email
  sendSystemEmail({
    to: newUser.email,
    subject: '¡Bienvenido a PortalAuth!',
    type: 'welcome',
    preview: `Hola ${newUser.name}, tu cuenta ha sido creada exitosamente.`,
    body: `¡Hola ${newUser.name}!\n\nGracias por unirte a PortalAuth. Tu cuenta está completamente configurada y segura.\n\nCorreo registrado: ${newUser.email}\nFecha de alta: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}\n\nSi necesitas recuperar tu contraseña en algún momento, puedes hacerlo desde la pantalla de inicio con tu correo.`,
  });

  // Record login history
  addLoginHistoryItem({
    id: `hist_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ip: '185.122.40.12',
    location: 'Conexión Local',
    device: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Ordenador Personal',
    browser: 'Navegador Web',
    status: 'success',
  });

  return { success: true, user: newUser };
}

export function loginUser(email: string, password: string, remember: boolean = true): {
  success: boolean;
  error?: string;
  user?: User;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const user = findUserByEmail(normalizedEmail);

  if (!user) {
    addLoginHistoryItem({
      id: `hist_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ip: '185.122.40.12',
      location: 'Conexión Local',
      device: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Ordenador Personal',
      browser: 'Navegador Web',
      status: 'failed',
      reason: 'Correo electrónico no registrado',
    });
    return { success: false, error: 'No existe ninguna cuenta asociada a este correo electrónico.' };
  }

  const expectedHash = hashPassword(password);
  if (user.passwordHash !== expectedHash) {
    addLoginHistoryItem({
      id: `hist_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ip: '185.122.40.12',
      location: 'Conexión Local',
      device: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Ordenador Personal',
      browser: 'Navegador Web',
      status: 'failed',
      reason: 'Contraseña errónea',
    });
    return { success: false, error: 'La contraseña introducida es incorrecta. Si no la recuerdas, pulsa en "¿Olvidaste tu contraseña?".' };
  }

  // Update user lastLoginAt
  const updatedUser: User = {
    ...user,
    lastLoginAt: new Date().toISOString(),
  };

  const users = getUsers().map((u) => (u.id === user.id ? updatedUser : u));
  saveUsers(users);
  setCurrentUser(updatedUser, remember);

  addLoginHistoryItem({
    id: `hist_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ip: '185.122.40.12',
    location: 'Conexión Local',
    device: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Ordenador Personal',
    browser: 'Navegador Web',
    status: 'success',
  });

  return { success: true, user: updatedUser };
}

export function loginWithSocial(
  provider: 'google' | 'apple',
  customEmail?: string,
  customName?: string,
  remember: boolean = true
): { success: boolean; user?: User; error?: string } {
  try {
    const isGoogle = provider === 'google';
    const email = (
      customEmail && customEmail.trim()
        ? customEmail.trim().toLowerCase()
        : isGoogle
        ? 'julian0309xx@gmail.com'
        : 'usuario.apple@icloud.com'
    );

    const name = (
      customName && customName.trim()
        ? customName.trim()
        : isGoogle
        ? (email === 'julian0309xx@gmail.com' ? 'Julián Pérez' : email.split('@')[0])
        : 'Usuario Apple'
    );

    let user = findUserByEmail(email);

    if (!user) {
      const parts = name.split(' ').filter(Boolean);
      const initials = parts.length >= 2 
        ? (parts[0][0] + parts[1][0]).toUpperCase() 
        : parts[0]?.slice(0, 2).toUpperCase() || (isGoogle ? 'G' : 'AP');

      const newUser: User = {
        id: `usr_${provider}_${Date.now()}`,
        name,
        email,
        avatar: initials,
        avatarBgColor: isGoogle ? '#4285F4' : '#1e293b',
        role: isGoogle ? 'administrador' : 'usuario',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        passwordHash: hashPassword('SocialOAuthToken_2026'),
      };
      const users = getUsers();
      users.push(newUser);
      saveUsers(users);
      user = newUser;
    } else {
      user = {
        ...user,
        lastLoginAt: new Date().toISOString(),
      };
      const users = getUsers().map((u) => (u.id === user!.id ? user! : u));
      saveUsers(users);
    }

    setCurrentUser(user, remember);

    addLoginHistoryItem({
      id: `hist_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ip: '185.122.40.12',
      location: 'Conexión Local',
      device: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Ordenador Personal',
      browser: `${isGoogle ? 'Cuenta Google' : 'Apple ID'} (OAuth)`,
      status: 'success',
    });

    return { success: true, user };
  } catch {
    return { success: false, error: 'No se pudo iniciar sesión con el proveedor seleccionado.' };
  }
}

// Password Reset Flow
export function generatePasswordResetCode(email: string): {
  success: boolean;
  error?: string;
  code?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const user = findUserByEmail(normalizedEmail);

  if (!user) {
    return {
      success: false,
      error: 'No se encontró ninguna cuenta registrada con el correo indicado.',
    };
  }

  // Generate 6-digit random code (e.g. 748291)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const resetCode: PasswordResetCode = {
    email: normalizedEmail,
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes validity
    used: false,
  };

  const existingCodes: PasswordResetCode[] = getStoredResetCodes().filter(
    (c) => c.email !== normalizedEmail || c.expiresAt > Date.now()
  );
  existingCodes.push(resetCode);
  localStorage.setItem(STORAGE_KEYS.RESET_CODES, JSON.stringify(existingCodes));

  // Send system notification email with verification code
  sendSystemEmail({
    to: user.email,
    subject: `🔐 Tu código de recuperación de contraseña: ${code}`,
    type: 'password_reset',
    preview: `Usa el código ${code} para restablecer tu contraseña en PortalAuth.`,
    body: `Hola ${user.name},\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta en PortalAuth.\n\nTu código de verificación de 6 dígitos es:\n👉 ${code} 👈\n\nEste código vencerá en 15 minutos por motivos de seguridad. Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual no se modificará.`,
    code,
  });

  return { success: true, code };
}

function getStoredResetCodes(): PasswordResetCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESET_CODES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function verifyPasswordResetCode(email: string, code: string): {
  valid: boolean;
  error?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const codes = getStoredResetCodes();
  const match = codes.find(
    (c) => c.email === normalizedEmail && c.code === code.trim() && !c.used
  );

  if (!match) {
    return { valid: false, error: 'El código de verificación es inválido o no existe.' };
  }

  if (Date.now() > match.expiresAt) {
    return { valid: false, error: 'El código de verificación ha expirado. Solicita uno nuevo.' };
  }

  return { valid: true };
}

export function completePasswordReset(email: string, code: string, newPassword: string): {
  success: boolean;
  error?: string;
} {
  const verification = verifyPasswordResetCode(email, code);
  if (!verification.valid) {
    return { success: false, error: verification.error };
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.email === normalizedEmail);

  if (userIndex === -1) {
    return { success: false, error: 'Usuario no encontrado.' };
  }

  // Update password
  users[userIndex].passwordHash = hashPassword(newPassword);
  saveUsers(users);

  // Mark code as used
  const codes = getStoredResetCodes().map((c) =>
    c.email === normalizedEmail && c.code === code.trim() ? { ...c, used: true } : c
  );
  localStorage.setItem(STORAGE_KEYS.RESET_CODES, JSON.stringify(codes));

  // If user is currently logged in, update current user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === normalizedEmail) {
    setCurrentUser(users[userIndex]);
  }

  // Security notification
  sendSystemEmail({
    to: users[userIndex].email,
    subject: '⚠️ Contraseña actualizada exitosamente',
    type: 'security_alert',
    preview: 'Tu contraseña de PortalAuth se ha modificado correctamente.',
    body: `Hola ${users[userIndex].name},\n\nTe informamos que la contraseña de tu cuenta ha sido restablecida exitosamente hoy a las ${new Date().toLocaleTimeString('es-ES')}.\n\nSi realizaste este cambio, no es necesario hacer nada más. Si no fuiste tú, ponte en contacto con soporte inmediatamente.`,
  });

  return { success: true };
}

// User Profile & Security updates
export function updateUserProfile(userId: string, data: Partial<Pick<User, 'name' | 'phone' | 'bio' | 'avatarBgColor'>>): {
  success: boolean;
  user?: User;
} {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false };

  // If name changed, update initials
  let avatar = users[idx].avatar;
  if (data.name && data.name !== users[idx].name) {
    const parts = data.name.trim().split(' ').filter(Boolean);
    avatar = parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : parts[0]?.slice(0, 2).toUpperCase() || 'US';
  }

  const updated: User = {
    ...users[idx],
    ...data,
    avatar,
  };

  users[idx] = updated;
  saveUsers(users);

  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    setCurrentUser(updated);
  }

  return { success: true, user: updated };
}

export function toggleTwoFactor(userId: string): { success: boolean; twoFactorEnabled: boolean } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, twoFactorEnabled: false };

  const newValue = !users[idx].twoFactorEnabled;
  users[idx].twoFactorEnabled = newValue;
  saveUsers(users);

  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    setCurrentUser(users[idx]);
  }

  return { success: true, twoFactorEnabled: newValue };
}

export function changePassword(userId: string, currentPass: string, newPass: string): {
  success: boolean;
  error?: string;
} {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, error: 'Usuario no encontrado.' };

  if (users[idx].passwordHash !== hashPassword(currentPass)) {
    return { success: false, error: 'La contraseña actual no es correcta.' };
  }

  if (newPass.length < 8) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' };
  }

  users[idx].passwordHash = hashPassword(newPass);
  saveUsers(users);

  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    setCurrentUser(users[idx]);
  }

  sendSystemEmail({
    to: users[idx].email,
    subject: '⚠️ Cambio de contraseña confirmado',
    type: 'security_alert',
    preview: 'Has cambiado tu contraseña desde el panel de seguridad.',
    body: `Hola ${users[idx].name},\n\nSe ha actualizado tu contraseña desde tu panel de usuario satisfactoriamente.`,
  });

  return { success: true };
}

// System Emails inbox simulation
export function getSystemEmails(): SystemEmail[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYSTEM_EMAILS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function sendSystemEmail(email: Omit<SystemEmail, 'id' | 'sentAt' | 'read'>): SystemEmail {
  const emails = getSystemEmails();
  const newEmail: SystemEmail = {
    ...email,
    id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sentAt: new Date().toISOString(),
    read: false,
  };
  emails.unshift(newEmail);
  localStorage.setItem(STORAGE_KEYS.SYSTEM_EMAILS, JSON.stringify(emails));
  return newEmail;
}

export function markEmailAsRead(emailId: string): void {
  const emails = getSystemEmails().map((e) =>
    e.id === emailId ? { ...e, read: true } : e
  );
  localStorage.setItem(STORAGE_KEYS.SYSTEM_EMAILS, JSON.stringify(emails));
}

export function clearSystemEmails(): void {
  localStorage.setItem(STORAGE_KEYS.SYSTEM_EMAILS, JSON.stringify([]));
}

// Login History
export function getLoginHistory(): LoginHistoryItem[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGIN_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLoginHistoryItem(item: LoginHistoryItem): void {
  const list = getLoginHistory();
  list.unshift(item);
  if (list.length > 20) list.pop(); // keep last 20
  localStorage.setItem(STORAGE_KEYS.LOGIN_HISTORY, JSON.stringify(list));
}

// Password Strength Analyzer
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  let metCount = 0;
  if (requirements.minLength) metCount++;
  if (requirements.hasUppercase) metCount++;
  if (requirements.hasLowercase) metCount++;
  if (requirements.hasNumber) metCount++;
  if (requirements.hasSpecial) metCount++;

  if (password.length === 0) {
    return {
      score: 0,
      label: 'Muy débil',
      color: '#ef4444',
      requirements,
    };
  }

  if (metCount <= 2) {
    return {
      score: 1,
      label: 'Débil',
      color: '#ef4444',
      requirements,
    };
  } else if (metCount === 3) {
    return {
      score: 2,
      label: 'Aceptable',
      color: '#f59e0b',
      requirements,
    };
  } else if (metCount === 4) {
    return {
      score: 3,
      label: 'Fuerte',
      color: '#10b981',
      requirements,
    };
  } else {
    return {
      score: 4,
      label: 'Excelente',
      color: '#059669',
      requirements,
    };
  }
}

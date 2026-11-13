import { db } from './index.ts';
import { usuarios } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    const existing = await db.select().from(usuarios).where(eq(usuarios.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(usuarios)
      .values({
        uid,
        email,
        nombre_usuario: name || email.split('@')[0],
        password_hash: 'firebase_oauth_user',
        rol: 'docente',
      })
      .onConflictDoUpdate({
        target: usuarios.uid,
        set: { email },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

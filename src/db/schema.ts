import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  id_usuario: serial('id_usuario').primaryKey(),
  uid: text('uid').unique(),
  nombre_usuario: varchar('nombre_usuario', { length: 80 }).notNull(),
  email: varchar('email', { length: 120 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  rol: varchar('rol', { length: 20 }).default('docente').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const cursos = pgTable('cursos', {
  id_curso: serial('id_curso').primaryKey(),
  anio: integer('anio').notNull(),
  division: varchar('division', { length: 10 }).notNull(),
  turno: varchar('turno', { length: 20 }).default('Mañana').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const estudiantes = pgTable('estudiantes', {
  id_estudiante: serial('id_estudiante').primaryKey(),
  dni: varchar('dni', { length: 15 }).notNull(),
  apellido: varchar('apellido', { length: 80 }).notNull(),
  nombre: varchar('nombre', { length: 80 }).notNull(),
  id_curso: integer('id_curso')
    .references(() => cursos.id_curso)
    .notNull(),
  estado: boolean('estado').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const asistencias = pgTable('asistencias', {
  id_asistencia: serial('id_asistencia').primaryKey(),
  id_estudiante: integer('id_estudiante')
    .references(() => estudiantes.id_estudiante)
    .notNull(),
  fecha: varchar('fecha', { length: 12 }).notNull(), // Formato YYYY-MM-DD
  estado: varchar('estado', { length: 5 }).notNull(), // 'P', 'A', 'T', 'AJ'
  observacion: varchar('observacion', { length: 255 }).default(''),
  id_usuario: integer('id_usuario').references(() => usuarios.id_usuario),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('idx_asistencia_estudiante_fecha').on(table.id_estudiante, table.fecha),
]);

export const cursosRelations = relations(cursos, ({ many }) => ({
  estudiantes: many(estudiantes),
}));

export const estudiantesRelations = relations(estudiantes, ({ one, many }) => ({
  curso: one(cursos, {
    fields: [estudiantes.id_curso],
    references: [cursos.id_curso],
  }),
  asistencias: many(asistencias),
}));

export const asistenciasRelations = relations(asistencias, ({ one }) => ({
  estudiante: one(estudiantes, {
    fields: [asistencias.id_estudiante],
    references: [estudiantes.id_estudiante],
  }),
  usuario: one(usuarios, {
    fields: [asistencias.id_usuario],
    references: [usuarios.id_usuario],
  }),
}));

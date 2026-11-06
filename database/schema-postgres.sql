-- =====================================================================
-- EduAsistencia - Script DDL para PostgreSQL
-- Sistema de Administración y Control de Asistencia Escolar
-- Tecnologías: HTML5, CSS3, JavaScript, Node.js, Express.js, PostgreSQL
-- =====================================================================

-- 1. Tabla: usuarios
-- Almacena docentes, preceptores y administradores habilitados
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'preceptor' CHECK (rol IN ('administrador', 'docente', 'preceptor', 'usuario'))
);

-- 2. Tabla: cursos
-- Ciclo secundario (1.º, 2.º y 3.º año) con división y turno
CREATE TABLE IF NOT EXISTS cursos (
    id_curso SERIAL PRIMARY KEY,
    anio INT NOT NULL CHECK (anio IN (1, 2, 3)),
    division VARCHAR(5) NOT NULL,
    turno VARCHAR(20) NOT NULL DEFAULT 'Mañana',
    CONSTRAINT uq_curso_anio_division UNIQUE (anio, division, turno)
);

-- 3. Tabla: estudiantes
-- Alumnos matriculados (exactamente 30 por división por especificación)
CREATE TABLE IF NOT EXISTS estudiantes (
    id_estudiante SERIAL PRIMARY KEY,
    dni VARCHAR(15) NOT NULL UNIQUE,
    apellido VARCHAR(80) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    id_curso INT NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_estudiantes_curso FOREIGN KEY (id_curso) 
        REFERENCES cursos(id_curso) ON DELETE CASCADE
);

-- 4. Tabla: asistencias
-- Registro diario con estados normativos: P, A, T, AJ
-- REGLA OBLIGATORIA: UNIQUE (id_estudiante, fecha) para evitar duplicación
CREATE TABLE IF NOT EXISTS asistencias (
    id_asistencia SERIAL PRIMARY KEY,
    id_estudiante INT NOT NULL,
    fecha DATE NOT NULL,
    estado VARCHAR(5) NOT NULL CHECK (estado IN ('P', 'A', 'T', 'AJ')),
    observacion VARCHAR(255),
    id_usuario INT,
    CONSTRAINT fk_asistencias_estudiante FOREIGN KEY (id_estudiante) 
        REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    CONSTRAINT fk_asistencias_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    CONSTRAINT uq_asistencia_estudiante_fecha UNIQUE (id_estudiante, fecha)
);

-- Índices recomendados para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_estudiantes_curso ON estudiantes(id_curso);
CREATE INDEX IF NOT EXISTS idx_asistencias_estudiante ON asistencias(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencias_estado ON asistencias(estado);

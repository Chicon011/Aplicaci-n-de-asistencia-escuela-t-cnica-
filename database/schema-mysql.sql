-- =====================================================================
-- EduAsistencia - Script DDL para MySQL
-- Sistema de Administración y Control de Asistencia Escolar
-- Tecnologías: HTML5, CSS3, JavaScript, Node.js, Express.js, MySQL
-- =====================================================================

-- 1. Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'preceptor'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla: cursos
CREATE TABLE IF NOT EXISTS cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    anio INT NOT NULL,
    division VARCHAR(5) NOT NULL,
    turno VARCHAR(20) NOT NULL DEFAULT 'Mañana',
    CONSTRAINT uq_curso_anio_division UNIQUE (anio, division, turno),
    CONSTRAINT chk_anio CHECK (anio IN (1, 2, 3))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla: estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(15) NOT NULL UNIQUE,
    apellido VARCHAR(80) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    id_curso INT NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_estudiantes_curso FOREIGN KEY (id_curso) 
        REFERENCES cursos(id_curso) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla: asistencias
-- REGLA OBLIGATORIA: UNIQUE (id_estudiante, fecha) para evitar duplicación
CREATE TABLE IF NOT EXISTS asistencias (
    id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    fecha DATE NOT NULL,
    estado VARCHAR(5) NOT NULL,
    observacion VARCHAR(255) NULL,
    id_usuario INT NULL,
    CONSTRAINT fk_asistencias_estudiante FOREIGN KEY (id_estudiante) 
        REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    CONSTRAINT fk_asistencias_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    CONSTRAINT uq_asistencia_estudiante_fecha UNIQUE (id_estudiante, fecha),
    CONSTRAINT chk_estado CHECK (estado IN ('P', 'A', 'T', 'AJ'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices recomendados
CREATE INDEX idx_estudiantes_curso ON estudiantes(id_curso);
CREATE INDEX idx_asistencias_estudiante ON asistencias(id_estudiante);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);

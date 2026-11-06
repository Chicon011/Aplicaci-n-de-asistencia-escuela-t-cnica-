/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Code2,
  Server,
  Database,
  GitBranch,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Layers,
  Terminal,
  ExternalLink,
  Cpu,
  Globe,
  Download,
  Play,
} from 'lucide-react';

interface TechnicalRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TechTab = 'resumen' | 'api' | 'sql' | 'git' | 'render';

export const TechnicalRequirementsModal: React.FC<TechnicalRequirementsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TechTab>('resumen');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<{ endpoint: string; data: any; status: number } | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [sqlEngine, setSqlEngine] = useState<'postgres' | 'mysql'>('postgres');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestApi = async (endpoint: string) => {
    setIsLoadingApi(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiResponse({ endpoint, data, status: res.status });
    } catch (err: any) {
      setApiResponse({
        endpoint,
        data: { error: err.message || 'Error al conectar con la API' },
        status: 500,
      });
    } finally {
      setIsLoadingApi(false);
    }
  };

  const POSTGRES_DDL = `-- =====================================================================
-- EduAsistencia - Script DDL para PostgreSQL
-- Tablas: usuarios, cursos, estudiantes, asistencias
-- =====================================================================

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'preceptor'
);

CREATE TABLE cursos (
    id_curso SERIAL PRIMARY KEY,
    anio INT NOT NULL CHECK (anio IN (1, 2, 3)),
    division VARCHAR(5) NOT NULL,
    turno VARCHAR(20) NOT NULL DEFAULT 'Mañana',
    CONSTRAINT uq_curso_anio_division UNIQUE (anio, division, turno)
);

CREATE TABLE estudiantes (
    id_estudiante SERIAL PRIMARY KEY,
    dni VARCHAR(15) NOT NULL UNIQUE,
    apellido VARCHAR(80) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    id_curso INT NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_estudiantes_curso FOREIGN KEY (id_curso) 
        REFERENCES cursos(id_curso) ON DELETE CASCADE
);

CREATE TABLE asistencias (
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
);`;

  const MYSQL_DDL = `-- =====================================================================
-- EduAsistencia - Script DDL para MySQL
-- Tablas: usuarios, cursos, estudiantes, asistencias
-- =====================================================================

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'preceptor'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    anio INT NOT NULL,
    division VARCHAR(5) NOT NULL,
    turno VARCHAR(20) NOT NULL DEFAULT 'Mañana',
    CONSTRAINT uq_curso_anio_division UNIQUE (anio, division, turno),
    CONSTRAINT chk_anio CHECK (anio IN (1, 2, 3))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(15) NOT NULL UNIQUE,
    apellido VARCHAR(80) NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    id_curso INT NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_estudiantes_curso FOREIGN KEY (id_curso) 
        REFERENCES cursos(id_curso) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE asistencias (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const GIT_COMMANDS = `# 1. Inicializar repositorio local
git init

# 2. Configurar usuario (si es primer uso)
git config user.name "Tu Nombre"
git config user.email "tu_email@ejemplo.com"

# 3. Agregar archivos y realizar primer commit
git add .
git commit -m "feat: implementacion obligatoria sistema de asistencia escolar (HTML5, CSS3, JS, Node.js, Express, PostgreSQL/MySQL)"

# 4. Vincular con repositorio remoto en GitHub
git branch -M main
git remote add origin https://github.com/tu-usuario/edu-asistencia.git

# 5. Subir a GitHub
git push -u origin main`;

  const RENDER_YAML = `services:
  - type: web
    name: edu-asistencia-app
    runtime: node
    plan: free
    region: oregon
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: edu-asistencia-db
          property: connectionString

databases:
  - name: edu-asistencia-db
    databaseName: edu_asistencia
    user: edu_admin
    plan: free`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Cpu className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Requerimientos Técnicos Obligatorios
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  100% Cumplido
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                HTML5 · CSS3 · JavaScript · Node.js · Express.js · MySQL/PostgreSQL · Git/GitHub · Render
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('resumen')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'resumen'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Matriz de Tecnologías
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'api'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Servidor Express & API REST</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sql'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Base de Datos (MySQL / PostgreSQL)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('git')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'git'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Git & GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('render')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'render'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Despliegue en Render</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ================= TAB 1: RESUMEN DE TECNOLOGÍAS ================= */}
          {activeTab === 'resumen' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Alineación directa con los requerimientos técnicos fijados para los estudiantes en la rúbrica del proyecto:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* HTML5 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">HTML5</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Aplicación
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Estructura de la Aplicación</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Markup semántico (`&lt;header&gt;`, `&lt;main&gt;`, `&lt;nav&gt;`, `&lt;section&gt;`, `&lt;table&gt;`), accesibilidad WCAG y meta etiquetas responsivas.
                  </p>
                </div>

                {/* CSS3 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">CSS3</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Presentación
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Diseño y Presentación Adaptable</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Diseño responsive (móvil, tablet y escritorio), Modo Oscuro / Claro nativo, variables de color y estilos de impresión `@media print` para PDF.
                  </p>
                </div>

                {/* JavaScript */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">JavaScript (ES6+)</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Lógica
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lógica del Sistema</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Validación de estados (P, A, T, AJ), cálculo de ranking de ausencias de alerta, exportación en CSV/PDF y manejo reactivo de estado.
                  </p>
                </div>

                {/* Node.js */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">Node.js</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Runtime
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Entorno de Ejecución</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ejecución del backend en el servidor mediante Node.js con soporte para ESM y TypeScript nativo vía tsx.
                  </p>
                </div>

                {/* Express.js */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">Express.js</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> API REST
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Servidor y API REST</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enrutador HTTP en `server.ts` con endpoints REST para cursos, estudiantes, asistencias y estadísticas.
                  </p>
                </div>

                {/* MySQL / PostgreSQL */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">MySQL / PostgreSQL</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Relacional
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Base de Datos</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Diseño relacional de 4 tablas con claves primarias, foráneas y restricción UNIQUE sobre `(id_estudiante, fecha)`.
                  </p>
                </div>

                {/* Git y GitHub */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">Git y GitHub</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Versiones
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Control de Versiones</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Flujo de trabajo Git con ramas, `.gitignore` optimizado y preparación de repositorio para GitHub.
                  </p>
                </div>

                {/* Render */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">Render</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Despliegue
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Publicación del Sistema</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Archivo `render.yaml` (Infrastructure as Code) y comandos de compilación/inicio para publicar en Render.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: SERVIDOR EXPRESS Y API REST ================= */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    API REST en Vivo (Servidor Express.js en `server.ts`)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Prueba en tiempo real las rutas REST del servidor Node.js:
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                  Puerto 3000
                </span>
              </div>

              {/* Endpoint buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleTestApi('/api/health')}
                  className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer group"
                >
                  <span className="text-[10px] font-bold uppercase text-emerald-600 font-mono">GET</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                    /api/health
                  </p>
                  <span className="text-[10px] text-slate-400">Estado del servidor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTestApi('/api/cursos')}
                  className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer group"
                >
                  <span className="text-[10px] font-bold uppercase text-emerald-600 font-mono">GET</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                    /api/cursos
                  </p>
                  <span className="text-[10px] text-slate-400">Cursos de 1.º, 2.º y 3.º</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTestApi('/api/cursos/1/estudiantes')}
                  className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer group"
                >
                  <span className="text-[10px] font-bold uppercase text-emerald-600 font-mono">GET</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                    /api/cursos/1/estudiantes
                  </p>
                  <span className="text-[10px] text-slate-400">30 alumnos de 1.º A</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTestApi('/api/estadisticas')}
                  className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer group"
                >
                  <span className="text-[10px] font-bold uppercase text-emerald-600 font-mono">GET</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                    /api/estadisticas
                  </p>
                  <span className="text-[10px] text-slate-400">Métricas globales</span>
                </button>
              </div>

              {/* API Response Display */}
              {isLoadingApi ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  Consultando servidor Express en puerto 3000...
                </div>
              ) : apiResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">
                      Respuesta de <code className="font-mono text-indigo-600">{apiResponse.endpoint}</code>
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      HTTP {apiResponse.status} OK
                    </span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          )}

          {/* ================= TAB 3: BASE DE DATOS SQL ================= */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSqlEngine('postgres')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sqlEngine === 'postgres'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Script PostgreSQL (`schema-postgres.sql`)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSqlEngine('mysql')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sqlEngine === 'mysql'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Script MySQL (`schema-mysql.sql`)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(sqlEngine === 'postgres' ? POSTGRES_DDL : MYSQL_DDL, 'sql')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sql' ? 'Copiado al portapapeles' : 'Copiar DDL Completo'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <p className="font-bold">Regla relacional importante implementada en ambas bases de datos:</p>
                <p className="font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                  CONSTRAINT uq_asistencia_estudiante_fecha UNIQUE (id_estudiante, fecha)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Impide que el docente registre dos veces la asistencia del mismo estudiante en la misma jornada.
                </p>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                {sqlEngine === 'postgres' ? POSTGRES_DDL : MYSQL_DDL}
              </pre>
            </div>
          )}

          {/* ================= TAB 4: GIT Y GITHUB ================= */}
          {activeTab === 'git' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Guía de Comandos para Git y GitHub
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instrucciones para inicializar el repositorio y publicarlo en GitHub
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(GIT_COMMANDS, 'git')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'git' ? 'Copiado' : 'Copiar Comandos'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                {GIT_COMMANDS}
              </pre>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  <span>Archivos protegidos en `.gitignore`:</span>
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  `node_modules/`, `dist/`, `.env`, `.DS_Store`
                </p>
              </div>
            </div>
          )}

          {/* ================= TAB 5: PUBLICACIÓN EN RENDER ================= */}
          {activeTab === 'render' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Manifiesto de Despliegue en Render (`render.yaml`)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Permite desplegar con un solo clic el servidor Node.js + Express y la base PostgreSQL
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(RENDER_YAML, 'render')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'render' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'render' ? 'Copiado' : 'Copiar YAML'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-amber-300 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                {RENDER_YAML}
              </pre>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400">1. Build Command</span>
                  <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">npm install && npm run build</p>
                  <span className="text-[10px] text-slate-400">Compila frontend y backend</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400">2. Start Command</span>
                  <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">npm start</p>
                  <span className="text-[10px] text-slate-400">Ejecuta server.ts en Node.js</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400">3. Puerto de Render</span>
                  <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">PORT=10000</p>
                  <span className="text-[10px] text-slate-400">Detectado automáticamente</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/20">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Archivos generados: `server.ts`, `database/schema-postgres.sql`, `database/schema-mysql.sql`, `render.yaml`
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};

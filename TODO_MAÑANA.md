# 📝 Plan de Trabajo y TO-DO para Mañana — ObstetrApp 🩺

Este documento resume lo logrado hoy, las pautas de seguridad para el repositorio y las tareas recomendadas para continuar el desarrollo mañana.

---

## 🚀 1. Resumen de los Logros de Hoy

1. **Iniciales Automáticas del Técnico/Médico:**
   - En el registro de controles perinatales, las iniciales del campo **Técnico** se calculan dinámicamente según el médico autenticado (ej. **`AM`** para *Ana Mendoza*).

2. **Indicadores de Peso en Embarazo Activo:**
   - Se agregaron las tarjetas de **Peso Inicial (Preconcepcional)** y **Peso de Última Consulta** en la ficha Bento del Historial Clínico, junto con la variación de peso calculada automáticamente (ej. **`+4.5 kg`**).

3. **Impresiones PDF Membretadas y Personalizadas:**
   - El encabezado de impresión (`PrintHeader.tsx`) y los sellos de firma en Recetas, Reposos, Órdenes de Laboratorio e Historial Clínico ahora consumen los datos reales del médico en sesión (**Nombre**, **Especialidad**, **Registro Profesional**, **Nombre de Clínica** y **Dirección de Consultorio**).

4. **Módulo de Administración de Médicos (`/usuarios`):**
   - Pantalla exclusiva para el Administrador donde se pueden crear médicos, asignarles su dirección de consultorio y matrícula, activar/inactivar accesos y restablecer contraseñas.

5. **Canal de Soporte Directo por WhatsApp (+595 985 944757):**
   - Integrado en la pantalla de inicio de sesión (`/login`) para asistencia técnica o solicitud de cuentas.

6. **Hardening de Ciberseguridad:**
   - **Rate Limiting:** Se configuró `skipSuccessfulRequests: true` en la API de Login. Los inicios de sesión correctos **no consumen** el margen.
   - **Cabeceras HTTP con Helmet:** Protección contra XSS, Clickjacking y ocultamiento de tecnología.
   - **Aislamiento de Cartera:** Filtro estricto por `medico_id` en todas las rutas clínicas de la API (`GET /api/pacientes`, `GET /api/pacientes/:id`, etc.).

---

## 🛡️ 2. Recordatorio de Seguridad para GitHub

### 🚫 LO QUE **NUNCA** SE DEBE SUBIR A GITHUB:
- Archivos `.env` o `.env.production` (contienen la contraseña de la base de datos y la clave `JWT_SECRET`).
- Archivos de base de datos local SQLite (`dev.db`, `*.sqlite`, `*.db-journal`).
- Carpetas `node_modules/` y compilaciones (`dist/`, `build/`).

### ✅ LO QUE **SÍ** SE PUEDE SUBIR:
- Código fuente de la aplicación (`ObstetrApp Backend/src`, `ObstetrApp Frontend/src`).
- Archivos de configuración (`package.json`, `tsconfig.json`, `prisma/schema.prisma`).
- Archivos `.env.example` (plantillas vacías de guía).
- Documentación (`README.md`, `DOCUMENTATION.md`).

---

## 📋 3. Lista de Tareas Recomendadas para Mañana (TO-DO)

- [x] **1. Pruebas de Flujo Completo End-to-End:**
  - Creación de cuenta de médico en `/usuarios` con matrícula profesional, especialidad, nombre de clínica y dirección de consultorio.
  - Verificación de asignación de pacientes al nuevo médico y renderizado dinámico en los membretes de recetas, reposos y órdenes de laboratorio (`PrintHeader.tsx`).

- [ ] **2. Validaciones e Indicadores en Formularios:**
  - Agregar mensajes de confirmación antes de eliminar citas o controles perinatales.
  - Validar campos requeridos en el registro de pacientes antes de enviar.

- [x] **3. Preparación de Entorno de Producción (Docker):**
  - Configuración de `docker-compose.yml` orquestando PostgreSQL 15, Backend Express y Frontend Nginx.
  - Creación de `Dockerfile` multietapa para Frontend React/Vite y `Dockerfile` + `entrypoint.sh` para Backend Node.js/Prisma.
  - Soporte de esquema de producción PostgreSQL (`schema.postgresql.prisma`) con sincronización automática (`npx prisma db push`).

---

### 🔑 Credenciales Rápidas para Pruebas:
- **Administrador:** `admin@obstetrapp.com` / `admin1234`
- **Médico Test:** `doctor@obstetrapp.com` / `doctor123`

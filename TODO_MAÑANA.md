# 📝 Plan de Trabajo y Estado del Proyecto — ObstetrApp 🩺

Este documento contiene la hoja de ruta actualizada, el estado de las tareas del proyecto y las guías rápidas de ejecución.

---

## 🚀 1. Resumen de Logros Recientes

1. **Iniciales Automáticas del Técnico/Médico:**
   - En el registro de controles perinatales, las iniciales del campo **Técnico** se calculan dinámicamente según el médico autenticado (ej. **`AM`** para *Ana Mendoza*).

2. **Indicadores de Peso en Embarazo Activo:**
   - Tarjetas de **Peso Preconcepcional** y **Última Consulta** en la ficha Bento del Historial Clínico con variación automática (**`+4.5 kg`**).

3. **Impresiones PDF Membretadas y Personalizadas:**
   - El encabezado de impresión (`PrintHeader.tsx`) y los sellos de firma en Recetas, Reposos, Órdenes de Laboratorio e Historial Clínico consumen los datos reales del médico en sesión (**Nombre**, **Especialidad**, **Registro Profesional**, **Nombre de Clínica** y **Dirección de Consultorio**).

4. **Módulo de Administración de Médicos (`/usuarios`):**
   - Pantalla exclusiva para Administradores donde se pueden crear médicos, asignar su dirección de consultorio y matrícula, activar/desactivar accesos y restablecer contraseñas.

5. **Hardening de Ciberseguridad & Aislamiento de Cartera:**
   - **Rate Limiting:** `skipSuccessfulRequests: true` y `trust proxy` activado en Express para proxy Nginx.
   - **Cabeceras HTTP con Helmet:** Protección XSS, Clickjacking e inspección MIME.
   - **Cero Credenciales Expuestas:** Cuentas iniciales generadas desde variables de entorno `.env` en lugar de código fuente.
   - **Aislamiento por Médico:** Filtro estricto por `medico_id` en todas las rutas clínicas.
   - **Filtrado Admin en Dashboard y Directorio:** Los usuarios administradores pueden alternar el filtro por médico tratante.

6. **Infraestructura de Despliegue en Producción (Docker & Nginx):**
   - Configuración de `docker-compose.yml` orquestando PostgreSQL 15, Backend Express y Frontend Nginx (con proxy inverso `/api/` y timeouts de 60s).
   - Compatibilidad nativa con Alpine Linux y OpenSSL 3.0 (`apk add --no-cache openssl` y `linux-musl-openssl-3.0.x`).
   - Sistema de siembra automática compilado en TypeScript (`src/seed.ts` → `dist/seed.js`) integrado en el arranque con reintentos para PostgreSQL.

---

## 📋 2. Tareas Pendientes (TO-DO)

- [ ] **1. Validaciones e Indicadores en Formularios:**
  - Agregar diálogos de confirmación antes de eliminar citas agendadas o controles perinatales.
  - Validar campos requeridos en el registro de pacientes antes de enviar.

- [ ] **2. Notificaciones y Alertas de Riesgo Obstétrico:**
  - Añadir indicadores visuales destacados para pacientes con factores de riesgo (menores de 15, mayores de 35, preeclampsia previa, etc.).

---

## 🐳 3. Despliegue Rápido en Docker

```bash
# 1. Copiar plantilla de entorno
cp .env.production.example .env

# 2. Levantar contenedores (Linux / macOS / Windows)
sudo docker compose up -d --build

# 3. (Opcional) Ejecutar siembra manual si la base de datos es nueva:
sudo docker compose exec backend node dist/seed.js
```

---

## 🔑 Credenciales para Pruebas:
- **Administrador:** `admin@obstetrapp.com` / `admin1234`
- **Médico Test:** `doctor@obstetrapp.com` / `doctor123`

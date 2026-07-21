# ObstetrApp Technical Documentation 📚

Welcome to the full technical documentation for **ObstetrApp**. This document covers architectural decisions, database models, API endpoint structures, frontend state management, and deployment strategies.

---

## 🏛️ System Architecture

ObstetrApp uses a decoupled **Client-Server Architecture** managed under a single monorepo repository using NPM Workspaces.

```
+-------------------------------------------------------+
|                 ObstetrApp Frontend                   |
|  (React 19 + TypeScript + Vite + Tailwind CSS v4)     |
+-------------------------------------------------------+
                           |
                           | HTTP / REST API (JSON)
                           v
+-------------------------------------------------------+
|                 ObstetrApp Backend                    |
|       (Node.js + Express.js + TypeScript)             |
+-------------------------------------------------------+
                           |
                           | Prisma ORM
                           v
+-------------------------------------------------------+
|                Database Layer                         |
|           (SQLite / PostgreSQL / Docker)              |
+-------------------------------------------------------+
```

---

## 🗄️ Database Schema & ORM (`Prisma`)

The backend utilizes **Prisma ORM** for database access and schema migrations.

### Key Data Entities

- **User / Healthcare Provider:** Stores authentication credentials, doctor profiles, and roles.
- **Patient / Expectant Mother:** Primary entity storing medical history, personal details, risk classification, and contact information.
- **Pregnancy Record / Obstetric History:** Tracks Gestational Age (GA), Estimated Due Date (EDD), Gravida, Para, Abortions, and Living Children (GPAL indices).
- **Prenatal Visit (Control Prenatal):** Detailed clinical log per appointment including weight, blood pressure, fetal heart rate (FHR), uterine height, and clinical observations.
- **Ultrasound & Lab Studies:** Tracks laboratory test results, ultrasounds, blood work, and prescribed treatments.

---

## 🔌 API Endpoints Summary (`ObstetrApp Backend`)

Base URL: `/api`

### Health Check & Health Status
- `GET /health` - Service status check.

### Pacientes (Patients Management)
- `GET /api/pacientes` - Retrieve list of patients (supports search filter `?q=`).
- `GET /api/pacientes/:id` - Fetch patient medical profile by Cédula ID (`cedula_id`).
- `POST /api/pacientes` - Register a new patient.
- `PUT /api/pacientes/:id` - Update patient information.

### Antecedentes (Medical & Obstetric Background)
- `GET /api/antecedentes/:cedula` - Retrieve patient history by Cédula ID.
- `POST /api/antecedentes` - Create antecedent record.
- `PUT /api/antecedentes/:cedula` - Update antecedent record.

### Embarazos (Pregnancies)
- `GET /api/embarazos` - Retrieve all pregnancies.
- `GET /api/embarazos/paciente/:cedula` - Retrieve pregnancies for a specific patient.
- `GET /api/embarazos/:id` - Get single pregnancy record details.
- `POST /api/embarazos` - Create new pregnancy record.
- `PUT /api/embarazos/:id` - Update pregnancy record.

### Controles Prenatales (Prenatal Visits)
- `GET /api/controles` - Retrieve all prenatal visits.
- `GET /api/controles/embarazo/:id` - Retrieve prenatal visit history for an active pregnancy.
- `POST /api/controles` - Log a new prenatal check-up visit.
- `PUT /api/controles/:id` - Update prenatal visit details.
- `DELETE /api/controles/:id` - Delete prenatal visit record.

### Laboratorios (Lab Studies)
- `GET /api/laboratorios/embarazo/:id` - Get lab records for a pregnancy.
- `POST /api/laboratorios` - Log lab test results.
- `PUT /api/laboratorios/:id` - Update lab test results.

### Citas (Appointments)
- `GET /api/citas` - List all appointments.
- `GET /api/citas/paciente/:cedula` - List appointments for a specific patient.
- `POST /api/citas` - Schedule a new appointment.
- `PUT /api/citas/:id` - Update appointment status or details.

### Recetas & Reposos (Prescriptions & Medical Leaves)
- `GET /api/recetas/paciente/:cedula` - Retrieve prescriptions for a patient.
- `POST /api/recetas` - Emit a new medical prescription.
- `GET /api/reposos/paciente/:cedula` - Retrieve medical leaves for a patient.
- `POST /api/reposos` - Create medical leave record.
- `GET /api/solicitudes-laboratorio/paciente/:cedula` - Retrieve laboratory orders.
- `POST /api/solicitudes-laboratorio` - Issue laboratory order.

---

## 💻 Frontend Architecture (`ObstetrApp Frontend`)

### Directory Breakdown
- `src/domain/entities/`: Domain entities and TypeScript clinical models (`Paciente.ts`, `Cita.ts`, `Control.ts`, `Embarazo.ts`, `Antecedentes.ts`, `Laboratorio.ts`, `Receta.ts`, `Reposo.ts`, `SolicitudLaboratorio.ts`).
- `src/data/`: Data access layer:
  - `src/data/api/`: REST API implementations (`ApiRepositories.ts`).
  - `src/data/mock/`: Browser local storage and mock repositories (`LocalStorageRepository.ts`, `MockRepositories.ts`).
  - `src/data/repositories/`: Repository interfaces (`IRepository.ts`) and data model abstractions (`Interfaces.ts`).
- `src/components/`: Reusable UI elements, global layout, and specialized sub-modules:
  - `src/components/consultorio/`: Consultation sub-forms (`SoapForm.tsx`, `GinecologiaForm.tsx`, `PerinatalForm.tsx`) and CLAP sub-tabs (`perinatal/SharedFields.tsx`, `TabAntecedentes.tsx`, `TabControles.tsx`, `TabInmunizaciones.tsx`, `TabLaboratorios.tsx`).
  - `src/components/historial/`: Clinical history Bento grid view tabs (`TabHistorialFicha.tsx`, `TabHistorialPerinatal.tsx`, `TabHistorialConsultas.tsx`, `TabHistorialEstudios.tsx`) and detail modals.
  - Core components: `AppContext.tsx` (global application context), `Layout.tsx` (main wrapper layout), `PrintHeader.tsx` (printable header component), `Sidebar.tsx` (dynamic sidebar navigation).
- `src/pages/`: Main application view components mapped to user actions (`AgendarCita.tsx`, `Consultorio.tsx`, `Dashboard.tsx`, `Estudios.tsx`, `Ginecologia.tsx`, `HistoriaPerinatal.tsx`, `Historial.tsx`, `Pacientes.tsx`, `Recetas.tsx`).
- `src/lib/`: Application support utilities (`utils.ts`) and Dependency Injection container configuration (`di.ts`).

### State Management
State is managed modularly with **Zustand** and React Context (`AppContext.tsx`), offering high performance, clean state decoupling, and predictable updates without unnecessary re-renders.

---

## 🛡️ Security Guidelines & Environment Protection

1. **Environment Variables:**
   - Always copy `.env.example` to `.env` in `ObstetrApp Backend/` or `.env.local` in `ObstetrApp Frontend/`.
   - Never commit API keys or JWT secrets into GitHub.

2. **CORS Security:**
   - Cross-Origin requests are constrained via the `cors` middleware in Express (`ObstetrApp Backend/src/index.ts`). Update the origin whitelist prior to production deployment.

3. **Input Sanitization:**
   - Payload inputs are validated on Express routes to prevent injection attacks.

---

## 🧪 Testing & Quality Assurance

- **Frontend Tests:** Executed via `vitest`.
  ```bash
  cd "ObstetrApp Frontend"
  npm run test
  ```
- **Linting:** Enforced across packages using ESLint.
  ```bash
  npm run lint
  ```

---

## 📦 Deployment Overview

- **Frontend:** Can be statically hosted on platforms like Vercel, Netlify, or Cloudflare Pages via `npm run build`.
- **Backend:** Can be deployed to Node.js hosting environments (Render, Railway, Fly.io, or AWS EC2) using Docker (`docker-compose.yml`) or direct Node runtime execution.

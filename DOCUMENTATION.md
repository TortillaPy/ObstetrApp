# ObstetrApp Technical Documentation 📚

Welcome to the full technical documentation for **ObstetrApp**. This document covers architectural decisions, database models, API endpoint structures, frontend state management, security measures, and deployment strategies.

---

## 📋 Table of Contents / Tabla de Contenidos

- [🇬🇧 English Documentation](#-english-documentation)
  - [System Architecture](#system-architecture)
  - [Database Schema & ORM (Prisma)](#database-schema--orm-prisma)
  - [Authentication & Role-Based Access Control (RBAC)](#authentication--role-based-access-control-rbac)
  - [API Endpoints Summary](#api-endpoints-summary)
  - [Cybersecurity Measures](#cybersecurity-measures)
- [🇪🇸 Sección en Español: Documentación Técnica Completa](#-sección-en-español-documentación-técnica-completa)
  - [1. Arquitectura del Sistema y Monorepo](#1-arquitectura-del-sistema-y-monorepo)
  - [2. Esquema de Base de Datos y Entidades (Prisma)](#2-esquema-de-base-de-datos-y-entidades-prisma)
  - [3. Sistema de Autenticación y Control de Accesos por Rol (RBAC)](#3-sistema-de-autenticación-y-control-de-accesos-por-rol-rbac)
  - [4. Catálogo de Rutas API REST (Backend Express)](#4-catálogo-de-rutas-api-rest-backend-express)
  - [5. Impresión de Documentos PDF y Firma Personalizada por Médico](#5-impresión-de-documentos-pdf-y-firma-personalizada-por-médico)
  - [6. Ciberseguridad, Hardening y Despliegue](#6-ciberseguridad-hardening-y-despliegue)

---

# 🇬🇧 English Documentation

## System Architecture

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
| (Node.js + Express.js + TypeScript + Helmet + JWT)    |
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

## Database Schema & ORM (Prisma)

The backend utilizes **Prisma ORM** for database access and schema migrations.

### Key Data Entities

- **Usuario (User / Healthcare Provider):** Stores credentials (`password_hash` via bcrypt), user roles (`ADMIN` or `MEDICO`), specialty, medical license (`registro_prof`), clinic name, and clinic address for PDF header customization.
- **Paciente (Patient / Expectant Mother):** Primary entity storing medical history, personal details, risk classification, and contact information. Linked to `Usuario` via `medico_id`.
- **Embarazo (Pregnancy Record):** Tracks Gestational Age (GA), Estimated Due Date (EDD), Gravida, Para, Abortions, and Living Children (GPAL indices).
- **Control (Prenatal Visit):** Detailed clinical log per check-up including maternal weight, blood pressure, fetal heart rate (FHR), uterine height, and warning signs.
- **Cita (Appointment & Consultation):** Manages daily schedule, outpatient SOAP notes, ultrasound data, and Pap smear findings.
- **Receta / Reposo / SolicitudLaboratorio:** Printable records for medical prescriptions, leave certificates, and laboratory orders.

---

## Authentication & Role-Based Access Control (RBAC)

- **JWT Tokens:** Issued upon login with a 24-hour expiration payload.
- **Roles:**
  - `MEDICO`: Access to patient portfolio, consultations, prenatal care, and prescription issuance.
  - `ADMIN`: Full system permissions, including user management (`/usuarios`), medical account creation, practice address assignment, account toggling, and password resets.

---

## API Endpoints Summary

Base URL: `/api`

### Auth & User Management (`/api/auth`)
- `POST /api/auth/login` - Authenticate user (rate limited to 5 attempts per 15 min per IP).
- `GET /api/auth/me` - Fetch authenticated user profile.
- `POST /api/auth/register` - Create user account (Admin only).
- `GET /api/auth/users` - List registered doctors/users (Admin only).
- `PUT /api/auth/users/:id` - Update doctor profile & practice address (Admin only).
- `PATCH /api/auth/users/:id/status` - Toggle user active status (Admin only).
- `PATCH /api/auth/users/:id/reset-password` - Reset user password (Admin only).

### Patients Management (`/api/pacientes`)
- `GET /api/pacientes` - List patients in provider portfolio (`?q=` search supported).
- `GET /api/pacientes/:id` - Fetch single patient by National ID (`cedula_id`).
- `POST /api/pacientes` - Register new patient.
- `PUT /api/pacientes/:id` - Update patient profile.

### Prenatal Records & History
- `GET /api/embarazos/paciente/:cedula` - Fetch pregnancies.
- `POST /api/controles` - Log prenatal visit.
- `POST /api/recetas` - Issue prescription.

---

## Cybersecurity Measures

1. **Rate Limiting:** Login endpoint protected against brute force.
2. **Security Headers:** `helmet()` integration for XSS and Clickjacking prevention.
3. **Password Hashing:** `bcryptjs` with 10 salt rounds.
4. **Parameterised SQL:** Prisma ORM abstraction prevents SQL injection.

---

# 🇪🇸 Sección en Español: Documentación Técnica Completa

## 1. Arquitectura del Sistema y Monorepo

ObstetrApp está estructurado como un **Monorepo gestionado por NPM Workspaces**, separando claramente la lógica de interfaz de usuario de la API de backend.

```
ObstetrApp (Raíz del Proyecto)
 ├── package.json                   # Configuración del Monorepo Workspaces
 ├── DOCUMENTATION.md               # Documentación Técnica del Sistema
 ├── README.md                      # Guía de Inicio Rápido y Despliegue
 ├── ObstetrApp Backend/            # API REST (Node.js + Express + Prisma)
 │    ├── prisma/
 │    │    ├── schema.prisma        # Modelo de Datos y Relaciones
 │    │    └── dev.db               # Base de Datos SQLite (Desarrollo)
 │    ├── src/
 │    │    ├── index.ts             # Servidor Principal Express con Helmet y Rate Limiting
 │    │    ├── authRoutes.ts        # Rutas de Login, Registro y Gestión de Médicos
 │    │    ├── authMiddleware.ts    # Middleware de Verificación JWT y Seguridad
 │    │    └── routes.ts            # Rutas de Servicios Clínicos (Pacientes, Citas, SOAP)
 │    └── .env.example              # Plantilla de Variables del Backend
 └── ObstetrApp Frontend/           # Cliente Web (React 19 + Vite + TailwindCSS v4)
      ├── src/
      │    ├── pages/
      │    │    ├── Login.tsx       # Pantalla de Login con Soporte por WhatsApp
      │    │    ├── Usuarios.tsx    # Panel Admin de Gestión de Médicos
      │    │    ├── Dashboard.tsx   # Centro de Comando de la Clínica
      │    │    ├── Historial.tsx   # Historial Clínico Panorámico Bento Grid
      │    │    └── Recetas.tsx     # Emisión de Prescripciones Imprimibles
      │    ├── components/
      │    │    ├── PrintHeader.tsx # Encabezado de Impresión con Datos del Médico
      │    │    └── Sidebar.tsx     # Navegación con Protección de Rol ADMIN
      │    └── data/stores/
      │         └── useAuthStore.ts # Gestión de Estado de Autenticación (Zustand)
      └── .env.example              # Plantilla de Variables del Frontend
```

---

## 2. Esquema de Base de Datos y Entidades (Prisma)

La base de datos relacional está modelada mediante **Prisma ORM**, garantizando integridad referencial y soporte transparente para **SQLite** en desarrollo local y **PostgreSQL** en producción.

### Entidades Principales:

#### `Usuario` (Médicos y Administradores)
Almacena las credenciales de acceso y la información del consultorio del profesional:
- `id_usuario`: UUID (Clave Primaria).
- `email`: Correo electrónico único.
- `password_hash`: Hash bcrypt de la contraseña.
- `nombre` y `apellido`: Nombre completo del profesional.
- `rol`: `"ADMIN"` o `"MEDICO"`.
- `especialidad`: Especialidad médica (ej. *Ginecología y Obstetricia*).
- `registro_prof`: Número de registro profesional / licencia médica.
- `nombre_clinica`: Nombre de la clínica o consultorio.
- `direccion`: Dirección física del consultorio (se muestra en las recetas PDF).
- `telefono`: Teléfono de contacto del médico.
- `activo`: Estado de la cuenta (`true`/`false`).

#### `Paciente` (Ficha Obstétrica)
- `cedula_id`: Cédula de Identidad (Clave Primaria).
- `nombre`, `apellido`, `fecha_nacimiento`, `edad`, `domicilio`, `telefono`, `localidad`.
- `grupo_sanguineo` y `factor_rh`.
- `menarca`, `fum` (Fecha de Última Menstruación), `ritmo_menstrual`, `metodo_anticonceptivo`.
- `medico_id`: ID del médico asignado a su cartera.

#### `Embarazo` y `Control` (Seguimiento CLAP)
- **`Embarazo`**: Almacena FUM, FPP (Fecha Probable de Parto calculada), EG confiable por ecografía, peso anterior (preconcepcional) y antecedentes de gestas/partos/cesáreas/abortos.
- **`Control`**: Registro evolutivo por visita prenatal conteniendo peso en kg, presión arterial sistólica/diastólica, altura uterina, presentación fetal, frecuencia cardíaca fetal (LCF), proteinuria y signos de alarma.

---

## 3. Sistema de Autenticación y Control de Accesos por Rol (RBAC)

1. **Emisión de Tokens JWT:**
   - Al autenticarse en `/api/auth/login`, el backend devuelve un token firmado con vigencia de 24 horas.
   - El cliente guarda el token en `localStorage` y Zustand (`useAuthStore`).
2. **Inyección en Peticiones HTTP:**
   - La capa de API del frontend (`ApiRepositories.ts`) adjunta automáticamente la cabecera `Authorization: Bearer <token>` a cada solicitud.
3. **División de Accesos:**
   - **Médicos (`MEDICO`):** Acceden a su cartera de pacientes, pueden registrar consultas SOAP, controles perinatales e imprimir recetas.
   - **Administradores (`ADMIN`):** Poseen acceso completo al sistema y a la pantalla exclusiva `/usuarios` para crear nuevos médicos, cambiar estados de cuenta y asignar direcciones de consultorio.

---

## 4. Catálogo de Rutas API REST (Backend Express)

Todas las rutas clínicas están protegidas por `authMiddleware`.

### Módulo de Autenticación y Usuarios (`/api/auth`)
- `POST /api/auth/login`: Autenticación de usuario con límite de 5 intentos por IP cada 15 min.
- `GET /api/auth/me`: Retorna el perfil del usuario autenticado en sesión.
- `POST /api/auth/register`: Registro de nuevos médicos (Exclusivo para ADMIN).
- `GET /api/auth/users`: Obtener lista completa de usuarios (Exclusivo para ADMIN).
- `PUT /api/auth/users/:id`: Actualizar datos de médico y consultorio (Exclusivo para ADMIN).
- `PATCH /api/auth/users/:id/status`: Activar o desactivar cuenta de médico (Exclusivo para ADMIN).
- `PATCH /api/auth/users/:id/reset-password`: Restablecer contraseña de médico (Exclusivo para ADMIN).

### Módulo Clínico (`/api`)
- `GET /api/pacientes`: Listar pacientes de la cartera del médico activo.
- `POST /api/pacientes`: Registrar una nueva paciente.
- `GET /api/controles/embarazo/:id`: Obtener historial de controles perinatales.
- `POST /api/controles`: Registrar un nuevo control prenatal.
- `POST /api/recetas`: Emitir una receta médica imprimible.

---

## 5. Impresión de Documentos PDF y Firma Personalizada por Médico

Los componentes [PrintHeader.tsx](file:///home/marco/Desktop/FCC/ObstetrApp/ObstetrApp%20Frontend/src/components/PrintHeader.tsx), [Recetas.tsx](file:///home/marco/Desktop/FCC/ObstetrApp/ObstetrApp%20Frontend/src/pages/Recetas.tsx) y [Historial.tsx](file:///home/marco/Desktop/FCC/ObstetrApp/ObstetrApp%20Frontend/src/pages/Historial.tsx) están integrados con el perfil del médico en sesión:

- **Encabezado Automático:** El membrete impreso extrae dinámicamente el nombre del médico (`Dr. Nombre Apellido`), la especialidad, la licencia/matrícula profesional (`registro_prof`), el nombre del consultorio y la dirección física.
- **Formato CSS `@media print`:** Aplica estilos limpios eliminando botones, barras laterales y fondos oscuros al momento de generar la vista previa de impresión en el navegador.

---

## 6. Ciberseguridad, Hardening y Despliegue

1. **Helmet.js:** Cabeceras HTTP activas contra XSS, Clickjacking y MIME Sniffing.
2. **Rate Limiting:** Protección anti-bruteforce en la autenticación.
3. **Manejo Seguro de Entorno:**
   - Los secretos nunca se incluyen en el control de versiones (protegidos por `.gitignore`).
   - Se proveen plantillas `.env.example` en backend y frontend para guidar la configuración.

# 🩺 ObstetrApp

> **ObstetrApp** es un sistema integral de gestión clínica especializado en obstetricia y ginecología, diseñado para el seguimiento de embarazos activos, controles perinatales (estándar CLAP), consultas ambulatorias (SOAP), agendas médicas, emisión de recetas impresas y administración de usuarios por rol.

![Status](https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge)
![Access](https://img.shields.io/badge/Access-Private_Commission-blueviolet?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ⚡ Guía Rápida: Ejecución Local y Despliegue

### 💻 1. Configuración y Ejecución Local (Local Development)

Sigue estos pasos para clonar y ejecutar el proyecto en tu entorno local de desarrollo:

#### **Requisitos Previos**
- **Node.js**: v18.0.0 o superior
- **NPM**: v9.0.0 o superior (Soporte Monorepo Workspaces)
- **Git**

#### **Paso 1: Clonar el Repositorio e Instalar Dependencias**
```bash
git clone https://github.com/tu-usuario/ObstetrApp.git
cd ObstetrApp

# Instala todas las dependencias del monorepo (Backend + Frontend)
npm install
```

#### **Paso 2: Configurar las Variables de Entorno (`.env`)**

1. **Backend (`ObstetrApp Backend/.env`):**
```bash
cp "ObstetrApp Backend/.env.example" "ObstetrApp Backend/.env"
```
*Asegúrate de tener en `ObstetrApp Backend/.env`:*
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
JWT_SECRET="super_secreto_obstetrapp_local_2026"
```

2. **Frontend (`ObstetrApp Frontend/.env`):**
```bash
cp "ObstetrApp Frontend/.env.example" "ObstetrApp Frontend/.env"
```
*Verifica en `ObstetrApp Frontend/.env`:*
```env
VITE_API_URL="http://localhost:3001/api"
```

#### **Paso 3: Inicializar la Base de Datos con Prisma**
```bash
cd "ObstetrApp Backend"
npx prisma db push
npx prisma generate
cd ..
```

#### **Paso 4: Iniciar el Servidor de Desarrollo**
Ejecuta el siguiente comando en la raíz del proyecto para arrancar backend y frontend simultáneamente:
```bash
npm run dev
```
- 🌐 **Frontend App**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend API**: [http://localhost:3001](http://localhost:3001)

#### **Credenciales por Defecto para Pruebas Local:**
- **Cuenta Administrador:** `admin@obstetrapp.com` / `admin1234`
- **Cuenta Médico:** `doctor@obstetrapp.com` / `doctor123`

---

### 🐳 2. Despliegue en Producción y Docker (Production Deployment)

Para desplegar la aplicación en un servidor VPS (Ubuntu/Debian) o entorno de producción usando **Docker y PostgreSQL**:

#### **Opción A: Despliegue con Docker Compose (Recomendado)**

1. **Configurar Variables de Entorno de Producción (`.env` en raíz):**
```env
# Base de Datos PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=una_clave_segura_de_db
POSTGRES_DB=obstetrapp_db

# Backend API
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://admin:una_clave_segura_de_db@postgres:5432/obstetrapp_db?schema=public
JWT_SECRET=ingresa_aqui_una_clave_jwt_secreta_y_larga_de_minimo_32_caracteres
CORS_ORIGIN=https://tu-dominio.com

# Frontend
VITE_API_URL=https://tu-dominio.com/api
```

2. **Construir y Levantar Contenedores:**
```bash
docker-compose up -d --build
```

3. **Ejecutar Migraciones de Base de Datos en Producción:**
```bash
docker-compose exec backend npx prisma db push
```

#### **Opción B: Despliegue Manual (Node.js + Nginx + PostgreSQL)**
1. **Compilar Frontend:**
   ```bash
   npm run build --workspace="ObstetrApp Frontend"
   ```
   Sirve el directorio `ObstetrApp Frontend/dist` utilizando Nginx configurado con SSL/TLS (Let's Encrypt / Certbot).
2. **Compilar e Iniciar Backend:**
   ```bash
   npm run build --workspace="ObstetrApp Backend"
   NODE_ENV=production JWT_SECRET=tu_secreto npm run start --workspace="ObstetrApp Backend"
   ```
   Utiliza `PM2` o un servicio de `systemd` para mantener el proceso Node.js activo de forma persistente.

---

## 📋 Tabla de Contenidos

- [⚡ Guía Rápida: Ejecución Local y Despliegue](#-guía-rápida-ejecución-local-y-despliegue)
- [🔍 Resumen Ejecutivo](#-resumen-ejecutivo)
- [✨ Módulos Clínicos y Funcionalidades](#-módulos-clínicos-y-funcionalidades)
- [🛡️ Ciberseguridad y Protección de Datos](#️-ciberseguridad-y-protección-de-datos)
- [🏗️ Arquitectura y Monorepo](#️-arquitectura-y-monorepo)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)

---

## 🔍 Resumen Ejecutivo

**ObstetrApp** satisface de extremo a extremo las necesidades de consulta clínica obstétrica y ginecológica. El sistema integra el carné perinatal estándar de la OPS/CLAP, cálculo automático de semanas de gestación (EG) y Fecha Probable de Parto (FPP), consultas ambulatorias SOAP, ecografías, Papanicolaou, control de agendas diarias, emisión de recetas/reposos en formato PDF e historial clínico panorámico bento-grid.

Además, cuenta con un esquema de seguridad de datos de pacientes por cartera de médico y administración centralizada de usuarios.

---

## ✨ Módulos Clínicos y Funcionalidades

### 1. 🎛️ Centro de Comando (Dashboard)
- **Paciente Activo**: Muestra a la paciente seleccionada en sesión, detalles del próximo turno y botones de acción rápida hacia los módulos médicos.
- **Agenda del Día**: Lista cronológica de turnos del día con cambio de estado ("Pendiente" / "Realizada") a un solo clic.
- **Registro Exprés**: Alta de pacientes de emergencia directo en la ventana de agendamiento.

### 2. 🗂️ Directorio de Pacientes
- **Búsqueda en Tiempo Real**: Filtrado dinámico por Cédula de Identidad, Nombre o Apellido.
- **Identificación de Riesgo**: Alerta visual automática para pacientes de riesgo obstétrico (<15 o >35 años).
- **Ficha Integral**: Datos demográficos, grupo sanguíneo/Rh, menarca, FUM, ritmo menstrual y método anticonceptivo.

### 3. 📝 Consulta General (SOAP, Ecografía y PAP)
- **Metodología SOAP**: Subjetivo (síntomas), Objetivo (signos vitales y examen físico), Apreciación (diagnóstico) y Plan (tratamiento).
- **Registro Ecográfico**: Peso fetal estimado (PFE), Índice de Líquido Amniótico (ILA) y diagnóstico ecográfico.
- **Colposcopía y Papanicolaou**: Registro macroscópico, clasificación de Bethesda y observaciones.

### 4. 🤰 Historia Perinatal (Estándar CLAP)
- **Calculadora FPP/EG**: Cálculo dinámico por regla de Naegele.
- **Pestañas CLAP**: Antecedentes obstétricos (G:P:C:A), vacunas, exámenes de laboratorio (<20s y >20s) y controles evolutivos.

### 5. 🏥 Consulta Ginecológica
- Antecedentes ginecológicos, registro de síntomas (dismenorrea, dispareunia, sangrado anormal) y examen físico especializado (mamas, especuloscopía y tacto bimanual).

### 6. 🛡️ Módulo de Administración de Médicos (`/usuarios`)
- **Acceso Exclusivo ADMIN**: Creación y edición de cuentas de médicos.
- **Datos de Consultorio para PDF**: Registro de Matrícula Profesional, Nombre de Clínica, Dirección de Consultorio y Teléfono por cada médico para estirar automáticamente en recetas y certificados.
- **Control de Accesos**: Interruptor de activación/desactivación de cuentas y restablecimiento de contraseña.

### 7. 📲 Soporte por WhatsApp (+595 985 944757)
- Integración en la pantalla de inicio de sesión (`/login`) para asistencia técnica o solicitud de alta de cuenta de médico.

---

## 🛡️ Ciberseguridad y Protección de Datos

- **Protección contra Fuerza Bruta**: Rate limiting activo en `/api/auth/login` (máximo 5 intentos por IP en 15 minutos).
- **Cabeceras HTTP de Seguridad (Helmet.js)**: Protección contra ataques XSS, Clickjacking, MIME Sniffing y eliminación del encabezado `X-Powered-By`.
- **Encriptación de Contraseñas**: Bcryptjs con 10 rondas de hashing.
- **Validación Estricta de JWT**: El servidor requiere `JWT_SECRET` explícito en producción para evitar claves por defecto.
- **Inmunidad SQL**: Consultas con sintaxis parametrizada abstraídas por Prisma ORM.

---

## 🏗️ Arquitectura y Monorepo

```
ObstetrApp Monorepo
 ├── ObstetrApp Backend   (Express + Prisma ORM + JWT + Helmet)
 └── ObstetrApp Frontend  (React 19 + TypeScript + Vite + TailwindCSS v4)
```

---

## 🔒 Propiedad y Estado del Proyecto

Este proyecto corresponde a una **comisión privada** en desarrollo activo. Todos los derechos reservados.

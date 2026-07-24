# ObstetrApp Technical Documentation 📚

Welcome to the full technical documentation for **ObstetrApp**. This document covers architectural decisions, database models, API endpoint structures, frontend state management, security measures, and multi-platform deployment strategies (Docker for Linux, Windows, and macOS).

---

## 📋 Table of Contents / Tabla de Contenidos / Sumário

- 🇬🇧 [English Section: Technical Specification & Docker Guide](#-english-section-technical-specification--docker-guide)
  - [1. System Architecture](#1-system-architecture)
  - [2. Data Model & Prisma Schema](#2-data-model--prisma-schema)
  - [3. Multi-OS Docker Deployment (Linux, Windows, macOS)](#3-multi-os-docker-deployment-linux-windows-macos)
- 🇪🇸 [Sección en Español: Documentación Técnica y Despliegue](#-sección-en-español-documentación-técnica-y-despliegue)
  - [1. Arquitectura del Sistema](#1-arquitectura-del-sistema)
  - [2. Modelo de Datos y Esquema Prisma (SQLite / PostgreSQL)](#2-modelo-de-datos-y-esquema-prisma)
  - [3. Despliegue con Docker (Linux, Windows, macOS)](#3-despliegue-con-docker-linux-windows-macos)
- 🇵🇹 [Seção em Português: Especificação Técnica e Implantação](#-seção-em-português-especificação-técnica-e-implantação)
  - [1. Arquitetura do Sistema](#1-arquitetura-do-sistema)
  - [2. Implantação com Docker (Linux, Windows, macOS)](#2-implantação-com-docker-linux-windows-macos)

---

# 🇬🇧 English Section: Technical Specification & Docker Guide

## 1. System Architecture

ObstetrApp features a decoupled **Client-Server Architecture** operating under an **NPM Workspaces** monorepo structure.

```
+-------------------------------------------------------+
|                 ObstetrApp Frontend                   |
|  (React 19 + TypeScript + Vite + Tailwind CSS v4)     |
+-------------------------------------------------------+
                           |
                           | HTTP / REST API (JSON) + Bearer JWT
                           v
+-------------------------------------------------------+
|                 ObstetrApp Backend                    |
| (Node.js + Express.js + TypeScript + Helmet + JWT)    |
+-------------------------------------------------------+
                           |
                           | Prisma ORM
                           v
+-------------------------------------------------------+
|                    Database Layer                     |
|        (Dev: SQLite / Production: PostgreSQL 15)      |
+-------------------------------------------------------+
```

### Tech Stack Highlights:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Zustand, React Router v7.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt, Helmet, Express Rate Limit.
- **Database**: SQLite (Dev) / PostgreSQL 15 (Production in Docker).
- **Reverse Proxy**: Nginx Alpine with `/api` upstream proxying and 60s resilience timeouts.

---

## 2. Data Model & Prisma Schema

The backend uses **Prisma ORM** for data access and schema management.

### Key Entities:
- **Usuario**: Stores doctors and administrators (`email`, `password_hash`, `rol`, `especialidad`, `registro_prof`, `nombre_clinica`, `direccion`, `telefono`).
- **Paciente**: Patient records (`cedula_id`, `nombre`, `apellido`, `fecha_nacimiento`, `medico_id`).
- **Embarazo**: Active pregnancy management including Gestational Age (GA), Estimated Due Date (EDD), and obstetric history (Gestas, Partos, Cesáreás, Abortos).
- **Control**: Perinatal prenatal care records (weight, blood pressure, uterine height, FHR, fetal movements, technician initials).
- **Cita**: Appointment scheduling and outpatient clinical notes (SOAP, Ultrasound, Pap smear, Gynecology).
- **Receta / Reposo / SolicitudLaboratorio**: Print-ready letterhead medical PDF documents.

---

## 3. Multi-OS Docker Deployment (Linux, Windows, macOS)

### 🐧 **A. Linux Deployment (Cloud VPS / Ubuntu / Debian)**
1. Install Docker and Compose plugin:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   sudo systemctl enable --now docker
   ```
2. Create environment file:
   ```bash
   cp .env.production.example .env
   ```
3. Build and run containers:
   ```bash
   sudo docker compose up -d --build
   ```
4. (Optional) Run manual DB seed:
   ```bash
   sudo docker compose exec backend node dist/seed.js
   ```

---

### 🪟 **B. Windows Deployment (Docker Desktop + WSL2 / PowerShell)**
1. Install **Docker Desktop for Windows** (with WSL2 enabled).
2. Open **PowerShell** in project root:
   ```powershell
   Copy-Item .env.production.example .env
   docker compose up -d --build
   ```
3. Access app at `http://localhost`.

---

### 🍎 **C. macOS Deployment (Apple Silicon M1/M2/M3 & Intel)**
1. Install **Docker Desktop for Mac**.
2. Open Terminal in project directory:
   ```bash
   cp .env.production.example .env
   docker compose up -d --build
   ```

---

# 🇪🇸 Sección en Español: Documentación Técnica y Despliegue

## 1. Arquitectura del Sistema

ObstetrApp utiliza una **Arquitectura Desacoplada Cliente-Servidor** estructurada bajo un monorepo administrado por **NPM Workspaces**.

---

## 2. Modelo de Datos y Esquema Prisma

El backend utiliza **Prisma ORM** para el acceso a datos y la gestión de esquemas.

---

## 3. Despliegue con Docker (Linux, Windows, macOS)

### 🐧 **A. Despliegue en Linux (VPS / Ubuntu / Debian)**
```bash
cp .env.production.example .env
sudo docker compose up -d --build
```

### 🪟 **B. Despliegue en Windows (Docker Desktop + WSL2 / PowerShell)**
```powershell
Copy-Item .env.production.example .env
docker compose up -d --build
```

### 🍎 **C. Despliegue en macOS (Apple Silicon e Intel)**
```bash
cp .env.production.example .env
docker compose up -d --build
```

---

# 🇵🇹 Seção em Português: Especificação Técnica e Implantação

## 1. Arquitetura do Sistema
O **ObstetrApp** é um sistema completo de gestão clínica para ginecologia e obstetrícia.

---

## 2. Implantação com Docker (Linux, Windows, macOS)
```bash
cp .env.production.example .env
sudo docker compose up -d --build
```

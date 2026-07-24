# ObstetrApp Technical Documentation 📚

Welcome to the full technical documentation for **ObstetrApp**. This document covers architectural decisions, database models, API endpoint structures, frontend state management, security measures, and multi-platform deployment strategies (Docker for Linux, Windows, and macOS).

---

## 📋 Table of Contents / Tabla de Contenidos / Sumário

- 🇪🇸 [Sección en Español: Documentación Técnica y Despliegue](#-sección-en-español-documentación-técnica-y-despliegue)
  - [1. Arquitectura del Sistema](#1-arquitectura-del-sistema)
  - [2. Modelo de Datos y Esquema Prisma (SQLite / PostgreSQL)](#2-modelo-de-datos-y-esquema-prisma)
  - [3. Despliegue con Docker (Linux, Windows, macOS)](#3-despliegue-con-docker-linux-windows-macos)
- 🇬🇧 [English Section: Technical Specification & Docker Guide](#-english-section-technical-specification--docker-guide)
  - [1. System Architecture](#1-system-architecture)
  - [2. Multi-OS Docker Deployment (Linux, Windows, macOS)](#2-multi-os-docker-deployment-linux-windows-macos)
- 🇵🇹 [Seção em Português: Especificação Técnica e Implantação](#-seção-em-português-especificação-técnica-e-implantação)
  - [1. Arquitetura do Sistema](#1-arquitetura-do-sistema)
  - [2. Implantação com Docker (Linux, Windows, macOS)](#2-implantação-com-docker-linux-windows-macos)

---

# 🇪🇸 Sección en Español: Documentación Técnica y Despliegue

## 1. Arquitectura del Sistema

ObstetrApp utiliza una **Arquitectura Desacoplada Cliente-Servidor** estructurada bajo un monorepo administrado por **NPM Workspaces**.

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
|                Capa de Base de Datos                  |
|        (Dev: SQLite / Producción: PostgreSQL 15)     |
+-------------------------------------------------------+
```

---

## 2. Modelo de Datos y Esquema Prisma

El backend utiliza **Prisma ORM** para el acceso a datos y la gestión de esquemas.

### Entidades Principales:
- **Usuario**: Almacena médicos y administradores (`email`, `password_hash`, `rol`, `especialidad`, `registro_prof`, `nombre_clinica`, `direccion`, `telefono`).
- **Paciente**: Registro patronímico de la paciente embarazada o ginecológica (`cedula_id`, `nombre`, `apellido`, `fecha_nacimiento`, `medico_id`).
- **Embarazo**: Control de embarazo activo con Edad Gestacional (EG), Fecha Probable de Parto (FPP), y fórmula obstétrica (Gestas, Partos, Cesáreas, Abortos).
- **Control**: Bitácora de consulta prenatal perinatal (peso, presión arterial, altura uterina, LCF, movimientos fetales, iniciales del técnico).
- **Cita**: Agendamiento y consultas ambulatorias (SOAP, Ecografía, Papanicolaou, Ginecología).
- **Receta / Reposo / SolicitudLaboratorio**: Documentos clínicos imprimibles en formato PDF membretado.

---

## 3. Despliegue con Docker (Linux, Windows, macOS)

### 🐧 **A. Despliegue en Linux (VPS / Ubuntu / Debian)**
1. Instalar Docker y la extensión Compose:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   sudo systemctl enable --now docker
   ```
2. Crear variables de entorno de producción:
   ```bash
   cp .env.production.example .env
   ```
3. Construir e iniciar contenedores:
   ```bash
   sudo docker compose up -d --build
   ```

---

### 🪟 **B. Despliegue en Windows (Docker Desktop + WSL2 / PowerShell)**
1. Instalar **Docker Desktop para Windows** (con WSL2 habilitado).
2. Abrir **PowerShell** en la carpeta del proyecto y ejecutar:
   ```powershell
   Copy-Item .env.production.example .env
   docker compose up -d --build
   ```
3. Abrir navegador en `http://localhost`.

---

### 🍎 **C. Despliegue en macOS (Apple Silicon M1/M2/M3 e Intel)**
1. Instalar **Docker Desktop para Mac**.
2. Abrir la Terminal en la carpeta del proyecto:
   ```bash
   cp .env.production.example .env
   docker compose up -d --build
   ```
3. Abrir navegador en `http://localhost`.

---

# 🇬🇧 English Section: Technical Specification & Docker Guide

## 1. System Architecture

ObstetrApp features a decoupled **Client-Server Architecture** operating under a monorepo.

### Tech Stack:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Zustand, React Router v7.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt, Helmet, Express Rate Limit.
- **Database**: SQLite (Dev) / PostgreSQL 15 (Prod in Docker).

## 2. Multi-OS Docker Deployment (Linux, Windows, macOS)

### Linux Deployment:
```bash
cp .env.production.example .env
sudo docker compose up -d --build
```

### Windows Deployment (PowerShell):
```powershell
Copy-Item .env.production.example .env
docker compose up -d --build
```

### macOS Deployment (Terminal):
```bash
cp .env.production.example .env
docker compose up -d --build
```

---

# 🇵🇹 Seção em Português: Especificação Técnica e Implantação

## 1. Arquitetura do Sistema

O **ObstetrApp** é um sistema completo de gestão clínica para ginecologia e obstetrícia.

### Tecnologias:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM.
- **Banco de Dados**: SQLite (Dev) / PostgreSQL 15 (Produção Docker).

## 2. Implantação com Docker (Linux, Windows, macOS)

### Linux:
```bash
cp .env.production.example .env
sudo docker compose up -d --build
```

### Windows (PowerShell):
```powershell
Copy-Item .env.production.example .env
docker compose up -d --build
```

### macOS (Terminal):
```bash
cp .env.production.example .env
docker compose up -d --build
```

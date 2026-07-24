# 🩺 ObstetrApp

> **ObstetrApp** es un sistema integral de gestión clínica especializado en obstetricia y ginecología, diseñado para el seguimiento de embarazos activos, controles perinatales (estándar CLAP), consultas ambulatorias (SOAP), agendas médicas, emisión de recetas impresas y administración de usuarios por rol.

![Status](https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge)
![Access](https://img.shields.io/badge/Access-Private_Commission-blueviolet?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 🌐 Language Selection / Selección de Idioma / Seleção de Idioma

- 🇪🇸 [Español (Guía de Inicio y Despliegue Docker)](#-español)
- 🇬🇧 [English (Getting Started & Docker Deployment)](#-english)
- 🇵🇹 [Português (Guia de Início e Implantação Docker)](#-português)

---

# 🇪🇸 Español

## ⚡ Guía de Instalación y Ejecución

### 💻 1. Ejecución Local en Desarrollo (Local Development)

#### **Requisitos Previos**
- Node.js (v18 o superior)
- NPM (v9 o superior)
- Git

#### **Pasos**
```bash
# 1. Clonar el repositorio
git clone https://github.com/TortillaPy/ObstetrApp.git
cd ObstetrApp

# 2. Instalar dependencias del monorepo
npm install

# 3. Configurar variables de entorno
cp "ObstetrApp Backend/.env.example" "ObstetrApp Backend/.env"
cp "ObstetrApp Frontend/.env.example" "ObstetrApp Frontend/.env"

# 4. Inicializar base de datos SQLite local
cd "ObstetrApp Backend"
npx prisma db push
npx prisma generate
cd ..

# 5. Ejecutar aplicación en desarrollo (Backend en :3001, Frontend en :3000)
npm run dev
```

---

### 🐳 2. Despliegue con Docker por Sistema Operativo

#### 🐧 **A. Linux (Ubuntu / Debian / CentOS / VPS)**

1. **Instalar Docker y Docker Compose:**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Configurar Entorno de Producción:**
   ```bash
   cp .env.production.example .env
   # Edita .env con tus claves: POSTGRES_PASSWORD, JWT_SECRET, etc.
   ```

3. **Construir y Levantar Contenedores:**
   ```bash
   sudo docker compose up -d --build
   ```

4. **(Opcional) Siembra Manual de Datos Iniciales:**
   ```bash
   sudo docker compose exec backend node dist/seed.js
   ```

5. **Verificar Estado de Servicios:**
   ```bash
   sudo docker compose ps
   sudo docker compose logs -f
   ```

---

#### 🪟 **B. Windows (Docker Desktop + WSL2 / PowerShell / Git Bash)**

1. **Requisitos Previos:**
   - Instalar **Docker Desktop para Windows** (con backend WSL2 habilitado).
   - Abrir **PowerShell** o **Git Bash** como Administrador.

2. **Pasos de Despliegue:**
   ```powershell
   # En PowerShell / Git Bash dentro de la carpeta del proyecto:
   Copy-Item .env.production.example .env
   
   # Levantar los contenedores:
   docker compose up -d --build
   ```

3. **Acceso a la Aplicación:**
   - Navegador: [http://localhost](http://localhost)

---

#### 🍎 **C. macOS (Apple Silicon M1/M2/M3 e Intel)**

1. **Requisitos Previos:**
   - Instalar **Docker Desktop para Mac**.

2. **Pasos de Despliegue:**
   ```bash
   cp .env.production.example .env
   docker compose up -d --build
   ```

3. **Verificar Estado:**
   ```bash
   docker compose ps
   ```

---

### 🔑 Credenciales por Defecto (Entorno de Pruebas):
- **Administrador:** `admin@obstetrapp.com` / `admin1234`
- **Médico:** `doctor@obstetrapp.com` / `doctor123`

---

# 🇬🇧 English

## ⚡ Getting Started & Deployment Guide

### 💻 1. Local Development Setup

#### **Prerequisites**
- Node.js (v18 or higher)
- NPM (v9 or higher)
- Git

#### **Steps**
```bash
# 1. Clone repository
git clone https://github.com/TortillaPy/ObstetrApp.git
cd ObstetrApp

# 2. Install workspace dependencies
npm install

# 3. Setup environment files
cp "ObstetrApp Backend/.env.example" "ObstetrApp Backend/.env"
cp "ObstetrApp Frontend/.env.example" "ObstetrApp Frontend/.env"

# 4. Initialize local SQLite database
cd "ObstetrApp Backend"
npx prisma db push
npx prisma generate
cd ..

# 5. Start dev server (Backend on :3001, Frontend on :3000)
npm run dev
```

---

### 🐳 2. OS-Specific Docker Deployment Guide

#### 🐧 **A. Linux (Ubuntu / Debian / Cloud VPS)**

1. **Install Docker:**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER
   ```

2. **Configure Environment & Launch:**
   ```bash
   cp .env.production.example .env
   sudo docker compose up -d --build
   ```

---

#### 🪟 **B. Windows (Docker Desktop / PowerShell)**

1. Open **PowerShell** in project directory:
   ```powershell
   Copy-Item .env.production.example .env
   docker compose up -d --build
   ```
2. Open browser: `http://localhost`

---

#### 🍎 **C. macOS (Apple Silicon / Intel)**

1. Open Terminal in project directory:
   ```bash
   cp .env.production.example .env
   docker compose up -d --build
   ```
2. Open browser: `http://localhost`

---

# 🇵🇹 Português

## ⚡ Guia de Início e Implantação

### 💻 1. Configuração para Desenvolvimento Local

#### **Requisitos Prévios**
- Node.js (v18 ou superior)
- NPM (v9 ou superior)
- Git

#### **Passos**
```bash
# 1. Clonar o repositório
git clone https://github.com/TortillaPy/ObstetrApp.git
cd ObstetrApp

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp "ObstetrApp Backend/.env.example" "ObstetrApp Backend/.env"
cp "ObstetrApp Frontend/.env.example" "ObstetrApp Frontend/.env"

# 4. Inicializar banco de dados SQLite local
cd "ObstetrApp Backend"
npx prisma db push
npx prisma generate
cd ..

# 5. Executar servidor de desenvolvimento
npm run dev
```

---

### 🐳 2. Implantação com Docker por Sistema Operacional

#### 🐧 **A. Linux (Ubuntu / Debian / Servidor Cloud)**
```bash
cp .env.production.example .env
sudo docker compose up -d --build
```

#### 🪟 **B. Windows (Docker Desktop / PowerShell)**
```powershell
Copy-Item .env.production.example .env
docker compose up -d --build
```

#### 🍎 **C. macOS (Apple Silicon / Intel)**
```bash
cp .env.production.example .env
docker compose up -d --build
```

---

## 📄 License & Contact
- **Developer:** ObstetrApp Core Team
- **Support:** WhatsApp (+595 985 944757)

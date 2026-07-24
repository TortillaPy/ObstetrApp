# 🩺 ObstetrApp

> **ObstetrApp** is a comprehensive clinical management system specialized in obstetrics and gynecology, designed for active pregnancy tracking, perinatal controls (CLAP standard), outpatient consultations (SOAP), appointment scheduling, prescription printing, and role-based access management.

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

- 🇬🇧 [English (Getting Started & Docker Deployment)](#-english)
- 🇪🇸 [Español (Guía de Inicio y Despliegue Docker)](#-español)
- 🇵🇹 [Português (Guia de Início e Implantação Docker)](#-português)

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
   newgrp docker
   ```

2. **Configure Production Environment:**
   ```bash
   cp .env.production.example .env
   # Edit .env with your credentials: POSTGRES_PASSWORD, JWT_SECRET, etc.
   ```

3. **Build & Launch Containers:**
   ```bash
   sudo docker compose up -d --build
   ```

4. **(Optional) Manual Seed Execution:**
   ```bash
   sudo docker compose exec backend node dist/seed.js
   ```

5. **Verify Service Status:**
   ```bash
   sudo docker compose ps
   sudo docker compose logs -f
   ```

---

#### 🪟 **B. Windows (Docker Desktop + WSL2 / PowerShell)**

1. **Prerequisites:**
   - Install **Docker Desktop for Windows** (with WSL2 backend enabled).
   - Open **PowerShell** or **Git Bash** as Administrator.

2. **Deployment Steps:**
   ```powershell
   Copy-Item .env.production.example .env
   docker compose up -d --build
   ```

3. **Access Application:**
   - Browser: [http://localhost](http://localhost)

---

#### 🍎 **C. macOS (Apple Silicon M1/M2/M3 & Intel)**

1. **Prerequisites:**
   - Install **Docker Desktop for Mac**.

2. **Deployment Steps:**
   ```bash
   cp .env.production.example .env
   docker compose up -d --build
   ```

3. **Verify Status:**
   ```bash
   docker compose ps
   ```

---

### 🔑 Test Credentials (Development Environment):
- **Admin:** `admin@obstetrapp.com` / `admin1234`
- **Doctor:** `doctor@obstetrapp.com` / `doctor123`

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

#### 🪟 **B. Windows (Docker Desktop + WSL2 / PowerShell)**

1. **Pasos de Despliegue:**
   ```powershell
   Copy-Item .env.production.example .env
   docker compose up -d --build
   ```

2. **Acceso a la Aplicación:**
   - Navegador: [http://localhost](http://localhost)

---

#### 🍎 **C. macOS (Apple Silicon e Intel)**

1. **Pasos de Despliegue:**
   ```bash
   cp .env.production.example .env
   docker compose up -d --build
   ```

---

### 🔑 Credenciales por Defecto:
- **Administrador:** `admin@obstetrapp.com` / `admin1234`
- **Médico:** `doctor@obstetrapp.com` / `doctor123`

---

# 🇵🇹 Português

## ⚡ Guia de Início e Implantação

### 💻 1. Configuração para Desenvolvimento Local

```bash
# 1. Clonar o repositório
git clone https://github.com/TortillaPy/ObstetrApp.git
cd ObstetrApp

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp "ObstetrApp Backend/.env.example" "ObstetrApp Backend/.env"
cp "ObstetrApp Frontend/.env.example" "ObstetrApp Frontend/.env"

# 4. Executar servidor de desenvolvimento
npm run dev
```

---

### 🐳 2. Implantação com Docker por Sistema Operacional

#### 🐧 **A. Linux (Ubuntu / Debian / Cloud VPS)**
```bash
cp .env.production.example .env
sudo docker compose up -d --build
sudo docker compose exec backend node dist/seed.js
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

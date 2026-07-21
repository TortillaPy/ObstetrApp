# 🩺 ObstetrApp Monorepo

> A comprehensive clinical management system for obstetrics and gynecology, designed to streamline active pregnancy tracking, preventive care appointments, perinatal medical records, and medical prescriptions.

> [!IMPORTANT]
> **Project Status:** This project is a **private commission** and is currently under **active development and refinement**.

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

## 📋 Table of Contents

- [🔍 Overview](#-overview)
- [✨ Clinical Modules & Key Features](#-clinical-modules--key-features)
  - [1. Command Center (Dashboard)](#1-command-center-dashboard)
  - [2. Patient Directory & Registration](#2-patient-directory--registration)
  - [3. General Consultation (SOAP, Ultrasound & Pap Smear)](#3-general-consultation-soap-ultrasound--pap-smear)
  - [4. Perinatal Medical Record (CLAP Standard)](#4-perinatal-medical-record-clap-standard)
  - [5. Gynecological Consultation](#5-gynecological-consultation)
  - [6. Panoramic Medical History (Bento Grid)](#6-panoramic-medical-history-bento-grid)
  - [7. Prescription Issuance & Printing](#7-prescription-issuance--printing)
- [🏗️ Architecture & Tech Stack](#️-architecture--tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running in Development](#running-in-development)
- [📜 Available Scripts](#-available-scripts)
- [🔐 Security & Best Practices](#-security--best-practices)
- [🔒 Ownership & Development Status](#-ownership--development-status)

---

## 🔍 Overview

**ObstetrApp** is a modern full-stack healthcare web application tailored for obstetricians, gynecologists, and maternal health professionals. The system provides end-to-end tracking of pregnant patients, evolutionary pregnancy control using the standard CLAP framework, general outpatient consultations using the SOAP methodology, recording of specialized diagnostic studies (ultrasounds and Pap smears), daily schedule management, and generation of printable dual-page prescriptions.

The repository is structured as an **NPM Monorepo**, uniting the client web application (React + TypeScript) and the API backend service (Node.js + Express + Prisma) in a single unified codebase for efficient maintenance and deployment.

---

## ✨ Clinical Modules & Key Features

### 1. 🎛️ Command Center (Dashboard)
The main operational hub for healthcare providers:
* **Active Workspace**: Displays the currently selected patient, next scheduled appointment details, and quick-action buttons for consultation modules.
* **Daily Queue**: Chronological view of appointments scheduled for the current date with real-time status ("Pending" / "Completed").
* **Quick Appointment Management**: Single-click consultation marking as completed and an interactive modal to schedule new appointments.
* **Express Patient Registration**: Option inside the appointment modal to urgently register new patients (National ID, First Name, Last Name) without interrupting the workflow.

### 2. 🗂️ Patient Directory & Registration
Centralized patient database with automated data sanitization and validation:
* **Real-time Search**: Instant filtering by National ID (`cedula_id`), First Name, or Last Name.
* **Automated Formatting**: Dynamic formatting for National ID numbers (`X.XXX.XXX-X`) and phone numbers, with name string sanitization.
* **Automatic Risk Assessment**: Automated visual indicators for age-related obstetric risk (<15 or >35 years old).
* **Comprehensive Patient Profile**: Demographic details, baseline medical parameters (Blood Type/Rh Factor, LMP/FUM, menstrual cycle rhythm, contraception history), and intended delivery/care centers.
* **🧪 Instant Demo Patient**: One-click button to load a full mock patient (*"Ana María García Pinto"*) populated with historical pregnancies, lab results, and prenatal visits for demonstration purposes.

### 3. 📝 General Consultation
Outpatient clinical documentation structured into three specialized forms:
* **Standard SOAP Consultation**:
  * *Subjective (S)*: Chief complaint and patient-reported symptoms.
  * *Objective (O)*: Vital signs (BP, HR, RR, SatO2, Fasting Blood Glucose, Weight in kg) and general physical exam findings.
  * *Assessment (A)*: Primary clinical diagnosis.
  * *Plan (P)*: Medical treatment, orders, and follow-up guidance.
* **Ultrasound Record**: Date of scan, ultrasound gestational age (GA), estimated fetal weight (EFW in grams), amniotic fluid index (AFI), and diagnostic conclusions.
* **Pap Smear & Colposcopy (PAP)**: Macroscopic cervical appearance, Bethesda cytological classification (NILM, ASC-US, LSIL/HPV, HSIL, Carcinoma), and colposcopic findings.

### 4. 🤰 Perinatal Medical Record (CLAP Standard)
Specialized obstetric tracking module emulating the Latin American Center for Perinatology (CLAP) standard record:
* **EDD Calculator (Naegele's Rule)**: Automatically calculates Estimated Due Date (EDD/FPP) and active gestational weeks from the Last Menstrual Period (LMP/FUM).
* **Interactive CLAP Tabs**:
  1. *Medical & Obstetric History*: Personal/family pathology checklist and obstetric history (Gravida, Para, C-sections, Abortions, Living Children - GPAL).
  2. *Immunizations & Physical Exam*: Vaccination records (Rubella, Tdap), breast examination, and dental health tracking.
  3. *Laboratory Panel*: Serological and chemical panel organized by gestational age thresholds (<20 and >20 weeks) including Toxoplasmosis, Fasting Glucose, Syphilis (VDRL/RPR), HIV, and Hemoglobin.
  4. *Prenatal Controls*: Chronological table logging maternal weight, BP, uterine height, fetal presentation, Fetal Heart Rate (FHR), and warning signs per visit.

### 5. 🏥 Gynecological Consultation
Evolutionary clinical record dedicated to gynecological health:
* **Reproductive Milestones**: Age of menarche, LMP, cycle rhythm, and current contraceptive method.
* **Common Symptom Checklist**: Rapid tracking of dysmenorrhea, dyspareunia, abnormal uterine bleeding, and vaginal discharge.
* **Specialized Physical Exam**: Structured sections for breast exam, abdominal/pelvic examination, speculum inspection, and bimanual vaginal palpation.

### 6. 🗂️ Panoramic Medical History (Bento Grid)
Unified view of the patient's entire medical record rendered in a modern Bento Grid layout:
* **Summary Cards**: Patient demographics, blood type/Rh factor, consolidated obstetric summary (G:P:C:A), and next appointment countdown.
* **Chronological Logs**: Tabbed historical views for SOAP notes, prenatal visits, ultrasounds, and Pap smear results.
* **🖨️ Selective Print Engine**: Print layout rules powered by `@media print` CSS that strip navigation elements and allow selective export (only CLAP card, only ultrasounds, only SOAP notes, or complete medical chart).

### 7. 💊 Prescription Issuance & Printing
Interactive prescription generator for clinical treatment:
* **Dynamic Prescriptions**: Unlimited addition of medications, dosages, frequency, and custom clinical instructions.
* **🖨️ Dual-Page Clinical Print Format**:
  * **Page 1 (Pharmacy)**: Official medical header, patient identification, and prescribed medications formatted specifically for pharmacy dispensing (includes signature and stamp block).
  * **Page 2 (Instructions)**: Patient-friendly guide detailing dosage schedules, dietary/lifestyle recommendations, and required follow-up lab orders.

---

## 🏗️ Architecture & Tech Stack

### 🎨 Frontend (`ObstetrApp Frontend`)
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 + Vanilla CSS
- **State Management:** Zustand + React Context (`AppContext.tsx`)
- **Icons & Animations:** Lucide React + Motion (Framer Motion)
- **Architecture Pattern:** Repository Pattern (`src/data/api/`, `src/data/mock/`, `src/data/repositories/`)
- **Testing:** Vitest + React Testing Library

### ⚙️ Backend (`ObstetrApp Backend`)
- **Runtime:** Node.js + TypeScript
- **Web Server:** Express.js
- **ORM & Database:** Prisma ORM (SQLite for development, PostgreSQL supported)
- **Dev Server:** `ts-node-dev`
- **Containerization:** Docker Compose

---

## 📁 Project Structure

```
ObstetrApp/
├── ObstetrApp Backend/      # Node.js + Express + Prisma REST API service
│   ├── prisma/              # Database schema and migration files
│   │   ├── migrations/      # Prisma migration history
│   │   └── schema.prisma    # Relational data models and configuration
│   ├── src/                 # Server application source code
│   │   ├── index.ts         # Express server entry point & CORS setup
│   │   └── routes.ts        # REST API route handlers
│   ├── .env                 # Backend environment variables
│   ├── docker-compose.yml   # Docker container orchestration setup
│   ├── prisma.config.ts     # Prisma CLI configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── package.json         # Backend dependencies and scripts
│
├── ObstetrApp Frontend/     # React 19 + Vite + TypeScript client application
│   ├── assets/              # Static assets and media files
│   ├── src/                 # Client application source code
│   │   ├── components/      # Reusable UI components
│   │   │   ├── consultorio/ # Clinical forms (SOAP, Perinatal, Gynecology)
│   │   │   ├── historial/   # Patient history tabs and detail modals
│   │   │   ├── AppContext.tsx   # Global React application state context
│   │   │   ├── Layout.tsx       # Main page wrapper layout
│   │   │   ├── PrintHeader.tsx  # Official printable document header
│   │   │   └── Sidebar.tsx      # Dynamic sidebar navigation
│   │   ├── data/            # Data access & repository layer
│   │   │   ├── api/         # REST API implementations (ApiRepositories.ts)
│   │   │   ├── mock/        # Local browser storage (LocalStorageRepository.ts)
│   │   │   └── repositories/# Repository interfaces and contract definitions
│   │   ├── domain/          # Clinical domain models
│   │   │   └── entities/    # Data entities (Paciente, Cita, Control, Embarazo, etc.)
│   │   ├── lib/             # Dependency Injection container (di.ts) & utility helpers
│   │   ├── pages/           # Main application view components (Dashboard, Consultorio, etc.)
│   │   ├── App.tsx          # Main React router component
│   │   ├── index.css        # Global CSS & Tailwind CSS v4 styling
│   │   └── main.tsx         # Client application entry point
│   ├── .env.example         # Template for frontend environment variables
│   ├── .env.local           # Local frontend environment overrides
│   ├── index.html           # HTML entry point template
│   ├── vite.config.ts       # Vite bundler configuration
│   ├── vitest.config.ts     # Vitest testing configuration
│   └── package.json         # Frontend dependencies and scripts
│
├── .gitignore               # Monorepo Git ignore rules
├── .prettierrc              # Code formatting settings
├── package.json             # Root NPM Workspaces monorepo configuration
├── README.md                # Unified main documentation
└── DOCUMENTATION.md         # Detailed technical architecture & API endpoint docs
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher recommended)
- [Docker](https://www.docker.com/) (Optional, for containerized database execution)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ObstetrApp.git
   cd ObstetrApp
   ```

2. **Install all monorepo dependencies:**
   ```bash
   npm install
   ```

---

### Environment Variables

Set up environment files for both packages before launching:

#### 1. Backend (`ObstetrApp Backend/`)
Create a `.env` file in `ObstetrApp Backend/`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

#### 2. Frontend (`ObstetrApp Frontend/`)
Create a `.env.local` file in `ObstetrApp Frontend/`:
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```

---

### Database Setup

Initialize your local SQLite database using Prisma ORM:

```bash
cd "ObstetrApp Backend"
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

---

### Running in Development

Run both Frontend and Backend concurrently from the root directory:

```bash
# Start development servers for all workspaces concurrently
npm run dev
```

Or run each service individually:

- **Frontend only:**
  ```bash
  npm run dev --workspace="ObstetrApp Frontend"
  # Available at: http://localhost:3000
  ```

- **Backend only:**
  ```bash
  npm run dev --workspace="ObstetrApp Backend"
  # Available at: http://localhost:5000
  ```

---

## 📜 Available Scripts

From the monorepo root directory (`ObstetrApp`):

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs development servers for frontend and backend packages concurrently. |
| `npm run build` | Builds production bundles across all workspace packages. |

Inside **`ObstetrApp Backend`**:
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts REST API server with hot-reloading (`ts-node-dev`). |
| `npm run build` | Compiles TypeScript source to JavaScript (`dist/`). |
| `npm start` | Launches compiled production server. |

Inside **`ObstetrApp Frontend`**:
| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches Vite development server (`http://localhost:3000`). |
| `npm run build` | Generates optimized production web build in `dist/`. |
| `npm run test` | Runs unit and component test suites via Vitest. |

---

## 🔐 Security & Best Practices

- **Secrets Protection:** Environment files (`.env`, `.env.local`) and local SQLite database files (`*.db`) are strictly ignored in `.gitignore`.
- **CORS Configuration:** Express `cors` middleware restricts HTTP requests strictly to authorized frontend origins.
- **Data Integrity:** Strict TypeScript interfaces and Prisma ORM schema validation prevent invalid payloads prior to database operations.
- **Repository Pattern:** Complete decoupling between React visual components and data sources, allowing seamless switching between `LocalStorage` and REST API backends.

---

## 🔒 Ownership & Development Status

This software is a **private commission** and is currently under **active development**. All rights regarding intellectual property, source code, and clinical data models are reserved.

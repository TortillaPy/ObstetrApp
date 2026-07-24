import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './authRoutes';
import { router } from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Cabeceras HTTP de Seguridad (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Configuración CORS
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (ej. apps móviles o curl) en desarrollo
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acceso bloqueado por política CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// 3. Rate Limiter contra Ataques de Fuerza Bruta en Login (Solo cuenta intentos fallidos)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 intentos fallidos por IP cada 15 minutos
  skipSuccessfulRequests: true, // Importante: Ignora logins exitosos (HTTP 200 OK)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos fallidos de inicio de sesión. Por seguridad, la cuenta fue bloqueada temporalmente por 15 minutos.' },
});

app.use('/api/auth/login', loginLimiter);

// 4. Rutas
app.get('/', (req, res) => {
  res.json({ message: 'ObstetrApp Secure API v1.0' });
});

app.use('/api/auth', authRouter);
app.use('/api', router);

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDefaultUsers() {
  try {
    const adminCount = await prisma.usuario.count({ where: { rol: 'ADMIN' } });
    if (adminCount === 0) {
      const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@obstetrapp.com';
      const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin1234';
      const doctorEmail = process.env.INITIAL_DOCTOR_EMAIL || 'doctor@obstetrapp.com';
      const doctorPassword = process.env.INITIAL_DOCTOR_PASSWORD || 'doctor123';

      console.log('🌱 Base de datos limpia detectada. Creando cuentas iniciales desde variables de entorno...');
      const adminPassHash = await bcrypt.hash(adminPassword, 10);
      const doctorPassHash = await bcrypt.hash(doctorPassword, 10);

      await prisma.usuario.createMany({
        data: [
          {
            email: adminEmail,
            password_hash: adminPassHash,
            nombre: 'Administrador',
            apellido: 'Sistema',
            rol: 'ADMIN',
            especialidad: 'Administración Clínica',
            registro_prof: 'ADM-001',
            nombre_clinica: 'ObstetrApp Central',
            direccion: 'Asunción, Paraguay',
            telefono: '+595 985 944757',
            activo: true,
          },
          {
            email: doctorEmail,
            password_hash: doctorPassHash,
            nombre: 'Ana',
            apellido: 'Mendoza',
            rol: 'MEDICO',
            especialidad: 'Ginecología y Obstetricia',
            registro_prof: 'Rg. Prof. 12345',
            nombre_clinica: 'Atención Médica Integral',
            direccion: 'Av. España 1450 e/ Pitiantuta, Asunción',
            telefono: '+595 985 000000',
            activo: true,
          },
        ],
      });
      console.log(`✅ Cuentas iniciales (${adminEmail} / ${doctorEmail}) creadas exitosamente.`);
    }
  } catch (e) {
    console.error('Error al sembrar cuentas predeterminadas:', e);
  }
}

app.listen(PORT, async () => {
  await seedDefaultUsers();
  console.log(`🔒 ObstetrApp Secure API corriendo en puerto ${PORT}`);
});

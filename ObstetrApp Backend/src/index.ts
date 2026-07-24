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

app.listen(PORT, () => {
  console.log(`🔒 ObstetrApp Secure API corriendo en puerto ${PORT}`);
});

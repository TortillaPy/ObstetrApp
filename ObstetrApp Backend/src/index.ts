import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './authRoutes';
import { router } from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar trust proxy para Nginx proxy inverso en Docker
app.set('trust proxy', 1);

// 1. Cabeceras HTTP de Seguridad (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Configuración CORS permisiva para proxy Nginx y clientes
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// 3. Rate Limiter contra Ataques de Fuerza Bruta en Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  skipSuccessfulRequests: true,
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

// 5. Manejador Global de Errores (Garantiza respuesta inmediata en 500/400 evitando cuelgues de 14s)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error en el servidor backend:', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({ error: err.message || 'Error interno en el servidor API' });
  }
});

app.listen(PORT, () => {
  console.log(`🔒 ObstetrApp Secure API corriendo en puerto ${PORT}`);
});

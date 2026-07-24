import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id_usuario: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  especialidad?: string;
  registro_prof?: string | null;
  nombre_clinica?: string | null;
  direccion?: string | null;
  telefono?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET no está configurada en las variables de entorno de producción.');
    }
    return 'super_secreto_obstetrapp_2026';
  }
  return secret;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token inválido o expirado' });
  }
}

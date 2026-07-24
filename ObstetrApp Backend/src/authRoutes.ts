import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthenticatedRequest, getJwtSecret } from './authMiddleware';

export const authRouter = Router();
const prisma = new PrismaClient();

// Middleware helper: Exclusivo para administradores
const adminOnlyMiddleware = (req: AuthenticatedRequest, res: Response, next: () => void) => {
  if (!req.user || req.user.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden realizar esta acción.' });
  }
  next();
};

// Helper to format user payload for tokens & responses
const formatUserPayload = (user: any) => ({
  id_usuario: user.id_usuario,
  email: user.email,
  nombre: user.nombre,
  apellido: user.apellido,
  rol: user.rol,
  especialidad: user.especialidad,
  registro_prof: user.registro_prof || null,
  nombre_clinica: user.nombre_clinica || null,
  direccion: user.direccion || null,
  telefono: user.telefono || null,
  activo: user.activo,
  estado_suscripcion: user.estado_suscripcion || 'ACTIVO',
  fecha_vencimiento: user.fecha_vencimiento || null,
  plan: user.plan || 'PREMIUM',
  monto_mensual: user.monto_mensual ? Number(user.monto_mensual) : null,
  notas_admin: user.notas_admin || null,
});

// Registro de usuario (EXCLUSIVO PARA ADMIN)
authRouter.post('/register', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, nombre, apellido, rol, especialidad, registro_prof, nombre_clinica, direccion, telefono } = req.body;

    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await prisma.usuario.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userRole = rol === 'ADMIN' ? 'ADMIN' : 'MEDICO';
    const userSpec = especialidad || 'Ginecólogo';

    const newUser = await prisma.usuario.create({
      data: {
        email: cleanEmail,
        password_hash,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        rol: userRole,
        especialidad: userSpec,
        registro_prof: registro_prof?.trim() || null,
        nombre_clinica: nombre_clinica?.trim() || null,
        direccion: direccion?.trim() || null,
        telefono: telefono?.trim() || null,
      },
    });

    const userPayload = formatUserPayload(newUser);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userPayload,
    });
  } catch (err: any) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error interno del servidor al registrar usuario' });
  }
});

// Inicio de sesión
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Ingrese correo y contraseña' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.usuario.findUnique({ where: { email: cleanEmail } });
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
    }

    // Verificar contraseña ANTES de revelar estado de suscripción (prevención de enumeración de cuentas)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (user.rol !== 'ADMIN' && user.estado_suscripcion === 'SUSPENDIDO') {
      return res.status(403).json({ error: 'Tu suscripción a ObstetrApp se encuentra suspendida o vencida. Por favor contacta a soporte técnico por WhatsApp.' });
    }

    const userPayload = formatUserPayload(user);
    const token = jwt.sign(userPayload, getJwtSecret(), { expiresIn: '24h' });

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: userPayload,
    });
  } catch (err: any) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno al procesar el inicio de sesión' });
  }
});

// Perfil de usuario en sesión
authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const user = await prisma.usuario.findUnique({ where: { id_usuario: req.user.id_usuario } });
  if (!user || !user.activo) {
    return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
  }
  res.json({ user: formatUserPayload(user) });
});

// Listar todos los usuarios (EXCLUSIVO PARA ADMIN)
authRouter.get('/users', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.usuario.findMany({
      where: { rol: { not: 'ADMIN' } },
      orderBy: { createdAt: 'desc' },
      select: {
        id_usuario: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        especialidad: true,
        registro_prof: true,
        nombre_clinica: true,
        direccion: true,
        telefono: true,
        activo: true,
        createdAt: true,
        estado_suscripcion: true,
        fecha_vencimiento: true,
        plan: true,
        monto_mensual: true,
        notas_admin: true,
      },
    });
    res.json(users);
  } catch (err: any) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
  }
});

// Actualizar datos de usuario (EXCLUSIVO PARA ADMIN)
authRouter.put('/users/:id', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, especialidad, registro_prof, nombre_clinica, direccion, telefono, rol } = req.body;

    const user = await prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Proteger cuentas ADMIN de modificación accidental
    if (user.rol === 'ADMIN') {
      return res.status(403).json({ error: 'Protección de Seguridad: Las cuentas de administrador no pueden ser modificadas desde esta interfaz.' });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id_usuario: id },
      data: {
        nombre: nombre?.trim() ?? user.nombre,
        apellido: apellido?.trim() ?? user.apellido,
        email: email?.trim().toLowerCase() ?? user.email,
        especialidad: especialidad?.trim() ?? user.especialidad,
        registro_prof: registro_prof?.trim() ?? user.registro_prof,
        nombre_clinica: nombre_clinica?.trim() ?? user.nombre_clinica,
        direccion: direccion?.trim() ?? user.direccion,
        telefono: telefono?.trim() ?? user.telefono,
        rol: rol === 'ADMIN' ? 'ADMIN' : 'MEDICO',
      },
    });

    res.json({ message: 'Usuario actualizado exitosamente', user: formatUserPayload(updatedUser) });
  } catch (err: any) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar datos del usuario' });
  }
});

// Cambiar estado activo/inactivo (EXCLUSIVO PARA ADMIN)
authRouter.patch('/users/:id/status', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const user = await prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Proteger cuentas ADMIN de desactivación accidental
    if (user.rol === 'ADMIN') {
      return res.status(403).json({ error: 'Protección de Seguridad: Las cuentas de administrador no pueden ser desactivadas desde la aplicación.' });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id_usuario: id },
      data: { activo: Boolean(activo) },
    });

    res.json({ message: `Usuario ${updatedUser.activo ? 'activado' : 'desactivado'} correctamente`, activo: updatedUser.activo });
  } catch (err: any) {
    console.error('Error al cambiar estado:', err);
    res.status(500).json({ error: 'Error al modificar estado del usuario' });
  }
});

// Restablecer contraseña de usuario (EXCLUSIVO PARA ADMIN)
authRouter.patch('/users/:id/reset-password', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await prisma.usuario.update({
      where: { id_usuario: id },
      data: { password_hash },
    });

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (err: any) {
    console.error('Error al restablecer contraseña:', err);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
});

// Actualizar suscripción de usuario (EXCLUSIVO PARA ADMIN)
authRouter.patch('/users/:id/subscription', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { estado_suscripcion, fecha_vencimiento, plan, monto_mensual, notas_admin } = req.body;

    // Proteger cuentas ADMIN de modificación de suscripción
    const targetUser = await prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (targetUser.rol === 'ADMIN') {
      return res.status(403).json({ error: 'Protección de Seguridad: La suscripción de una cuenta de administrador no puede ser modificada desde la aplicación.' });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id_usuario: id },
      data: {
        ...(estado_suscripcion && { estado_suscripcion }),
        ...(fecha_vencimiento !== undefined && { fecha_vencimiento: fecha_vencimiento || null }),
        ...(plan && { plan }),
        ...(monto_mensual !== undefined && { monto_mensual: monto_mensual !== null ? Number(monto_mensual) : null }),
        ...(notas_admin !== undefined && { notas_admin: notas_admin || null }),
      },
    });

    res.json({
      message: 'Suscripción actualizada exitosamente',
      user: formatUserPayload(updatedUser),
    });
  } catch (err: any) {
    console.error('Error al actualizar suscripción:', err);
    res.status(500).json({ error: 'Error interno al actualizar la suscripción' });
  }
});

// Proteger borrado físico de usuarios desde la App Web (EXCLUSIVO PROVEEDOR DE SERVICIO / BASE DE DATOS)
authRouter.delete('/users/:id', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  return res.status(403).json({
    error: 'Acceso Protegido: La eliminación permanente de cuentas de usuarios se realiza exclusivamente desde el panel del proveedor de servicios de infraestructura (Supabase / PostgreSQL Cloud). Para dar de baja el acceso de un médico, utilice la opción "Desactivar Cuenta" o el estado "SUSPENDIDO".'
  });
});

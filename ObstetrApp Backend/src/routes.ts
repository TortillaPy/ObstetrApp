import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from './authMiddleware';

export const router = Router();
const prisma = new PrismaClient();

// Aplicar middleware de autenticación a todas las rutas clínicas
router.use(authMiddleware);

// Pacientes (Filtrados por Cartera de Médico o Visión Global para Admin)
router.get('/pacientes', async (req: AuthenticatedRequest, res: Response) => {
  const query = req.query.q as string;
  const medicoId = req.query.medico_id as string;
  const user = req.user;

  // Filtro por cartera de médico (si es MEDICO, solo sus pacientes; si es ADMIN y se especifica medico_id, solo de ese médico)
  const baseFilter: any = {};
  if (user?.rol === 'MEDICO' && user.id_usuario) {
    baseFilter.medico_id = user.id_usuario;
  } else if (user?.rol === 'ADMIN' && medicoId) {
    baseFilter.medico_id = medicoId;
  }

  if (query) {
    const pacientes = await prisma.paciente.findMany({
      where: {
        ...baseFilter,
        OR: [
          { cedula_id: { contains: query } },
          { nombre: { contains: query } },
          { apellido: { contains: query } },
        ]
      }
    });
    return res.json(pacientes);
  }

  const pacientes = await prisma.paciente.findMany({ where: baseFilter });
  res.json(pacientes);
});

router.get('/pacientes/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const filter: any = { cedula_id: req.params.id };
  if (user?.rol === 'MEDICO' && user.id_usuario) {
    filter.medico_id = user.id_usuario;
  }
  const p = await prisma.paciente.findFirst({ where: filter });
  if (p) res.json(p);
  else res.status(404).json({ error: 'Paciente no encontrado o no pertenece a su cartera' });
});

router.post('/pacientes', async (req: AuthenticatedRequest, res: Response) => {
  const data = {
    ...req.body,
    medico_id: req.body.medico_id || (req.user?.rol === 'MEDICO' ? req.user.id_usuario : null),
  };
  const p = await prisma.paciente.create({ data });
  res.json(p);
});

router.put('/pacientes/:id', async (req: AuthenticatedRequest, res: Response) => {
  const p = await prisma.paciente.update({ where: { cedula_id: req.params.id }, data: req.body });
  res.json(p);
});

// Antecedentes
router.get('/antecedentes/:cedula', async (req: AuthenticatedRequest, res: Response) => {
  const p = await prisma.antecedentes.findUnique({ where: { cedula_id: req.params.cedula } });
  if (p) res.json(p);
  else res.status(404).json({ error: 'Antecedentes no encontrados' });
});

router.post('/antecedentes', async (req: AuthenticatedRequest, res: Response) => {
  const p = await prisma.antecedentes.create({ data: req.body });
  res.json(p);
});

router.put('/antecedentes/:cedula', async (req: AuthenticatedRequest, res: Response) => {
  const p = await prisma.antecedentes.update({ where: { cedula_id: req.params.cedula }, data: req.body });
  res.json(p);
});

// Embarazos
router.get('/embarazos/paciente/:cedula', async (req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.embarazo.findMany({ where: { cedula_id: req.params.cedula } });
  res.json(list);
});

router.get('/embarazos/:id', async (req: AuthenticatedRequest, res: Response) => {
  const e = await prisma.embarazo.findUnique({ where: { id_embarazo: req.params.id } });
  if (e) res.json(e);
  else res.status(404).json({ error: 'Embarazo no encontrado' });
});

router.post('/embarazos', async (req: AuthenticatedRequest, res: Response) => {
  const e = await prisma.embarazo.create({ data: req.body });
  res.json(e);
});

router.put('/embarazos/:id', async (req: AuthenticatedRequest, res: Response) => {
  const e = await prisma.embarazo.update({ where: { id_embarazo: req.params.id }, data: req.body });
  res.json(e);
});

// Controles
router.get('/controles/embarazo/:id', async (req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.control.findMany({ where: { embarazo_id: req.params.id }, orderBy: { fecha_visita: 'asc' } });
  res.json(list);
});

router.post('/controles', async (req: AuthenticatedRequest, res: Response) => {
  const c = await prisma.control.create({ data: req.body });
  res.json(c);
});

router.put('/controles/:id', async (req: AuthenticatedRequest, res: Response) => {
  const c = await prisma.control.update({ where: { id_control: req.params.id }, data: req.body });
  res.json(c);
});

router.delete('/controles/:id', async (req: AuthenticatedRequest, res: Response) => {
  await prisma.control.delete({ where: { id_control: req.params.id } });
  res.json({ success: true });
});

// Laboratorios
router.get('/laboratorios/embarazo/:id', async (req: AuthenticatedRequest, res: Response) => {
  const l = await prisma.laboratorio.findUnique({ where: { embarazo_id: req.params.id } });
  if (l) res.json(l);
  else res.status(404).json({ error: 'Laboratorios no encontrados' });
});

router.post('/laboratorios', async (req: AuthenticatedRequest, res: Response) => {
  const l = await prisma.laboratorio.create({ data: req.body });
  res.json(l);
});

router.put('/laboratorios/:id', async (req: AuthenticatedRequest, res: Response) => {
  const l = await prisma.laboratorio.update({ where: { embarazo_id: req.params.id }, data: req.body });
  res.json(l);
});

// Citas (Filtradas por Médico o Global para Admin)
router.get('/citas/paciente/:cedula', async (req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.cita.findMany({ where: { cedula_id: req.params.cedula }, orderBy: { fecha_cita: 'desc' } });
  res.json(list);
});

router.post('/citas', async (req: AuthenticatedRequest, res: Response) => {
  const data = {
    ...req.body,
    medico_id: req.body.medico_id || (req.user?.rol === 'MEDICO' ? req.user.id_usuario : null),
  };
  const c = await prisma.cita.create({ data });
  res.json(c);
});

router.put('/citas/:id', async (req: AuthenticatedRequest, res: Response) => {
  const c = await prisma.cita.update({ where: { id_cita: req.params.id }, data: req.body });
  res.json(c);
});

// Global endpoints for Dashboard and general listings
router.get('/citas', async (req: AuthenticatedRequest, res: Response) => {
  const medicoId = req.query.medico_id as string;
  const filter: any = {};
  if (req.user?.rol === 'MEDICO' && req.user.id_usuario) {
    filter.medico_id = req.user.id_usuario;
  } else if (req.user?.rol === 'ADMIN' && medicoId) {
    filter.medico_id = medicoId;
  }
  const list = await prisma.cita.findMany({ where: filter });
  res.json(list);
});

router.get('/embarazos', async (req: AuthenticatedRequest, res: Response) => {
  const medicoId = req.query.medico_id as string;
  const filter: any = {};
  if (req.user?.rol === 'MEDICO' && req.user.id_usuario) {
    filter.paciente = { medico_id: req.user.id_usuario };
  } else if (req.user?.rol === 'ADMIN' && medicoId) {
    filter.paciente = { medico_id: medicoId };
  }
  const list = await prisma.embarazo.findMany({ where: filter });
  res.json(list);
});

router.get('/controles', async (req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.control.findMany();
  res.json(list);
});

// Recetas
router.get('/recetas/paciente/:cedula', async (req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.receta.findMany({ where: { cedula_id: req.params.cedula } });
  res.json(list);
});

router.post('/recetas', async (req: AuthenticatedRequest, res: Response) => {
  const r = await prisma.receta.create({ data: req.body });
  res.json(r);
});

// Reposos
router.get('/reposos/paciente/:cedula', async (req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.reposo.findMany({ where: { cedula_id: req.params.cedula } });
  res.json(list);
});

router.post('/reposos', async (req: AuthenticatedRequest, res: Response) => {
  const r = await prisma.reposo.create({ data: req.body });
  res.json(r);
});

// Solicitudes Laboratorio
router.get('/solicitudes-laboratorio/paciente/:cedula', async (req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.solicitudLaboratorio.findMany({ where: { cedula_id: req.params.cedula } });
  res.json(list);
});

router.post('/solicitudes-laboratorio', async (req: AuthenticatedRequest, res: Response) => {
  const s = await prisma.solicitudLaboratorio.create({ data: req.body });
  res.json(s);
});

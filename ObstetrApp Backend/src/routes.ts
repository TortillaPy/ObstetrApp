import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

export const router = Router();
const prisma = new PrismaClient();

// Pacientes
router.get('/pacientes', async (req, res) => {
  const query = req.query.q as string;
  let pacientes;
  if (query) {
    pacientes = await prisma.paciente.findMany({
      where: {
        OR: [
          { cedula_id: { contains: query } },
          { nombre: { contains: query } },
          { apellido: { contains: query } },
        ]
      }
    });
  } else {
    pacientes = await prisma.paciente.findMany();
  }
  res.json(pacientes);
});

router.get('/pacientes/:id', async (req, res) => {
  const p = await prisma.paciente.findUnique({ where: { cedula_id: req.params.id } });
  if (p) res.json(p);
  else res.status(404).json({ error: 'Not found' });
});

router.post('/pacientes', async (req, res) => {
  const p = await prisma.paciente.create({ data: req.body });
  res.json(p);
});

router.put('/pacientes/:id', async (req, res) => {
  const p = await prisma.paciente.update({ where: { cedula_id: req.params.id }, data: req.body });
  res.json(p);
});

// Antecedentes
router.get('/antecedentes/:cedula', async (req, res) => {
  const p = await prisma.antecedentes.findUnique({ where: { cedula_id: req.params.cedula } });
  if (p) res.json(p);
  else res.status(404).json({ error: 'Not found' });
});

router.post('/antecedentes', async (req, res) => {
  const p = await prisma.antecedentes.create({ data: req.body });
  res.json(p);
});

router.put('/antecedentes/:cedula', async (req, res) => {
  const p = await prisma.antecedentes.update({ where: { cedula_id: req.params.cedula }, data: req.body });
  res.json(p);
});

// Embarazos
router.get('/embarazos/paciente/:cedula', async (req, res) => {
  const list = await prisma.embarazo.findMany({ where: { cedula_id: req.params.cedula } });
  res.json(list);
});

router.get('/embarazos/:id', async (req, res) => {
  const e = await prisma.embarazo.findUnique({ where: { id_embarazo: req.params.id } });
  if (e) res.json(e);
  else res.status(404).json({ error: 'Not found' });
});

router.post('/embarazos', async (req, res) => {
  const e = await prisma.embarazo.create({ data: req.body });
  res.json(e);
});

router.put('/embarazos/:id', async (req, res) => {
  const e = await prisma.embarazo.update({ where: { id_embarazo: req.params.id }, data: req.body });
  res.json(e);
});

// Controles
router.get('/controles/embarazo/:id', async (req, res) => {
  const list = await prisma.control.findMany({ where: { embarazo_id: req.params.id }, orderBy: { fecha_visita: 'asc' } });
  res.json(list);
});

router.post('/controles', async (req, res) => {
  const c = await prisma.control.create({ data: req.body });
  res.json(c);
});

router.put('/controles/:id', async (req, res) => {
  const c = await prisma.control.update({ where: { id_control: req.params.id }, data: req.body });
  res.json(c);
});

router.delete('/controles/:id', async (req, res) => {
  await prisma.control.delete({ where: { id_control: req.params.id } });
  res.json({ success: true });
});

// Laboratorios
router.get('/laboratorios/embarazo/:id', async (req, res) => {
  const l = await prisma.laboratorio.findUnique({ where: { embarazo_id: req.params.id } });
  if (l) res.json(l);
  else res.status(404).json({ error: 'Not found' });
});

router.post('/laboratorios', async (req, res) => {
  const l = await prisma.laboratorio.create({ data: req.body });
  res.json(l);
});

router.put('/laboratorios/:id', async (req, res) => {
  const l = await prisma.laboratorio.update({ where: { embarazo_id: req.params.id }, data: req.body });
  res.json(l);
});

// Citas
router.get('/citas/paciente/:cedula', async (req, res) => {
  const list = await prisma.cita.findMany({ where: { cedula_id: req.params.cedula }, orderBy: { fecha_cita: 'desc' } });
  res.json(list);
});

router.post('/citas', async (req, res) => {
  const c = await prisma.cita.create({ data: req.body });
  res.json(c);
});

router.put('/citas/:id', async (req, res) => {
  const c = await prisma.cita.update({ where: { id_cita: req.params.id }, data: req.body });
  res.json(c);
});

// Global endpoints for Dashboard and general listings
router.get('/citas', async (req, res) => {
  const list = await prisma.cita.findMany();
  res.json(list);
});

router.get('/embarazos', async (req, res) => {
  const list = await prisma.embarazo.findMany();
  res.json(list);
});

router.get('/controles', async (req, res) => {
  const list = await prisma.control.findMany();
  res.json(list);
});

// Recetas
router.get('/recetas/paciente/:cedula', async (req, res) => {
  const list = await prisma.receta.findMany({ where: { cedula_id: req.params.cedula } });
  res.json(list);
});

router.post('/recetas', async (req, res) => {
  const r = await prisma.receta.create({ data: req.body });
  res.json(r);
});

// Reposos
router.get('/reposos/paciente/:cedula', async (req, res) => {
  const list = await prisma.reposo.findMany({ where: { cedula_id: req.params.cedula } });
  res.json(list);
});

router.post('/reposos', async (req, res) => {
  const r = await prisma.reposo.create({ data: req.body });
  res.json(r);
});

// Solicitudes Laboratorio
router.get('/solicitudes-laboratorio/paciente/:cedula', async (req, res) => {
  const list = await prisma.solicitudLaboratorio.findMany({ where: { cedula_id: req.params.cedula } });
  res.json(list);
});

router.post('/solicitudes-laboratorio', async (req, res) => {
  const s = await prisma.solicitudLaboratorio.create({ data: req.body });
  res.json(s);
});



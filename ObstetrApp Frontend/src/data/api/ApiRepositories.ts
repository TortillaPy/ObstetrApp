import {
  IPacienteRepository,
  IAntecedentesRepository,
  IEmbarazoRepository,
  ILaboratorioRepository,
  IControlRepository,
  ICitaRepository,
  IRecetaRepository,
  IReposoRepository,
  ISolicitudLaboratorioRepository,
} from '../repositories/Interfaces';
import { Paciente } from '../../domain/entities/Paciente';
import { Antecedentes } from '../../domain/entities/Antecedentes';
import { Embarazo } from '../../domain/entities/Embarazo';
import { Laboratorio } from '../../domain/entities/Laboratorio';
import { Control } from '../../domain/entities/Control';
import { Cita } from '../../domain/entities/Cita';
import { Receta } from '../../domain/entities/Receta';
import { Reposo } from '../../domain/entities/Reposo';
import { SolicitudLaboratorio } from '../../domain/entities/SolicitudLaboratorio';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

async function fetchApi(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('obstetrapp_token');
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Interceptar operaciones de escritura en paciente Mock para proteger la BD real
  if (options?.body && (options.body.toString().includes('9999999-MOCK') || options.body.toString().includes('mock-emb-001'))) {
    if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
      console.log('ℹ️ MODO GUÍA: Operación simulada en paciente mock de prueba.');
      alert('ℹ️ MODO GUÍA DE REFERENCIA Y ASISTENCIA TÉCNICA:\n\nAcción simulada exitosamente con la paciente de prueba (Mock).\nLa base de datos real del médico se mantiene 100% intacta e inalterada.');
      return { success: true, message: 'Operación simulada en modo demo' };
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('obstetrapp_token');
      localStorage.removeItem('obstetrapp_user');
    }
    if (res.status === 404) return null;

    let errorMsg = `Error del servidor (${res.status})`;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const errData = await res.json();
        if (errData?.error) errorMsg = errData.error;
      } catch {}
    }
    throw new Error(errorMsg);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

export const MOCK_PATIENT_DEMO: Paciente = {
  cedula_id: '9999999-MOCK',
  nombre: 'María Elena (MOCK DE REFERENCIA)',
  apellido: 'Benítez',
  domicilio: 'Av. Mcal. López 1230, Asunción',
  telefono: '+595 981 000111',
  localidad: 'Asunción',
  fecha_nacimiento: '1995-04-12',
  edad: 31,
  etnia: 'mestiza',
  estudios_nivel: 'universitaria',
  estudios_alfabetiza: 1,
  estado_civil: 'casada',
  vive_sola: 0,
  menor_15_mayor_35: 0,
};

export const MOCK_EMBARAZO_DEMO: Embarazo = {
  id_embarazo: 'mock-emb-001',
  cedula_id: '9999999-MOCK',
  fum: '2026-01-15',
  fpp: '2026-10-22',
  dudas_fum: 0,
  eg_confiada: 1,
  eco_fum: '2026-02-20',
  antipaludico: 0,
  carne: 1,
  estado: 'activo',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z'
};

export const MOCK_ANTECEDENTES_DEMO: Antecedentes = {
  cedula_id: '9999999-MOCK',
  ant_tbc: 0, ant_diabetes: 0, ant_hipertension: 0, ant_preeclampsia: 0, ant_eclampsia: 0, ant_cardiopatia: 0, ant_nefropatia: 0, ant_infertilidad: 0, ant_cirugia_genito_urinaria: 0, ant_violencia: 0, ant_otra_condicion_grave: 0,
  hist_gestas_previas: 1, hist_partos: 1, hist_vaginales: 1, hist_cesareas: 0, hist_abortos: 0,
  hist_abortos_tres_espontaneos_consecutivos: 0, hist_nacidos_vivos: 1, hist_nacidos_vivos_muertos_1ra_semana: 0, hist_nacidos_vivos_muertos_despues_1ra_semana: 0, hist_nacidos_muertos: 0, hist_viven: 1,
  hist_fin_embarazo_anterior_menos_de_1_anio: 0, hist_embarazo_planeado: 1, hist_fracaso_anticonceptivo: 'no',
  inm_antirubeola: 'si'
};

export const MOCK_CONTROLES_DEMO: Control[] = [
  {
    id_control: 'mock-ctrl-001',
    id_embarazo: 'mock-emb-001',
    fecha: '2026-03-10',
    edad_gestacional_semanas: 8,
    peso: 62.5,
    pa_sistolica: 120,
    pa_diastolica: 80,
    altura_uterina: 12,
    presentacion: 'Cefálica',
    lcf: 145,
    movimientos_fetales: '+',
    tecnico_iniciales: 'AM',
    observaciones: 'Evolución prenatal favorable.'
  },
  {
    id_control: 'mock-ctrl-002',
    id_embarazo: 'mock-emb-001',
    fecha: '2026-05-15',
    edad_gestacional_semanas: 17,
    peso: 65.0,
    pa_sistolica: 118,
    pa_diastolica: 78,
    altura_uterina: 18,
    presentacion: 'Cefálica',
    lcf: 148,
    movimientos_fetales: '++',
    tecnico_iniciales: 'AM',
    observaciones: 'Movimientos fetales activos. Presión normal.'
  }
];

export const MOCK_LABORATORIO_DEMO: Laboratorio = {
  id_laboratorio: 'mock-lab-001',
  id_embarazo: 'mock-emb-001',
  hb_1: 12.5,
  grupo: 'O',
  factor: 'RH+',
  vdrl_1: 'No reactivo',
  vih_1: 'No reactivo',
  glucemia_1: 85,
  chagas: 'No reactivo',
  toxo_igg_1: 'No reactivo',
  toxo_igm_1: 'No reactivo'
};

export const MOCK_CITAS_DEMO: Cita[] = [
  {
    id_cita: 'mock-cita-001',
    cedula_id: '9999999-MOCK',
    fecha_cita: `${new Date().toISOString().split('T')[0]}T09:15`,
    hora_cita: '09:15',
    motivo: 'Control Prenatal Perinatal de Rutina',
    estado: 'pendiente'
  }
];

export class PacienteApiRepository implements IPacienteRepository {
  async getAll(medicoId?: string): Promise<Paciente[]> {
    const param = medicoId ? `?medico_id=${encodeURIComponent(medicoId)}` : '';
    const res = await fetchApi(`/pacientes${param}`);
    const list = res || [];
    if (!list.some((p: any) => p.cedula_id === MOCK_PATIENT_DEMO.cedula_id)) {
      return [MOCK_PATIENT_DEMO, ...list];
    }
    return list;
  }
  async getById(id: string): Promise<Paciente | null> {
    if (id === MOCK_PATIENT_DEMO.cedula_id) return MOCK_PATIENT_DEMO;
    return fetchApi(`/pacientes/${encodeURIComponent(id)}`);
  }
  async save(item: Paciente): Promise<void> {
    await fetchApi('/pacientes', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<Paciente>): Promise<void> {
    await fetchApi(`/pacientes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(item) });
  }
  async delete(id: string): Promise<void> {}
  async getByCedula(cedula: string): Promise<Paciente | null> {
    return this.getById(cedula);
  }
  async search(query: string, medicoId?: string): Promise<Paciente[]> {
    if (query && 'maria elena mock 9999999'.includes(query.toLowerCase())) {
      return [MOCK_PATIENT_DEMO];
    }
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (medicoId) params.append('medico_id', medicoId);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi(`/pacientes${qStr}`);
    const list = res || [];
    if (!list.some((p: any) => p.cedula_id === MOCK_PATIENT_DEMO.cedula_id)) {
      return [MOCK_PATIENT_DEMO, ...list];
    }
    return list;
  }
}

export class AntecedentesApiRepository implements IAntecedentesRepository {
  async getAll(): Promise<Antecedentes[]> { return []; }
  async getById(id: string): Promise<Antecedentes | null> {
    if (id === MOCK_PATIENT_DEMO.cedula_id) return MOCK_ANTECEDENTES_DEMO;
    return fetchApi(`/antecedentes/${encodeURIComponent(id)}`);
  }
  async save(item: Antecedentes): Promise<void> {
    await fetchApi('/antecedentes', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<Antecedentes>): Promise<void> {
    await fetchApi(`/antecedentes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(item) });
  }
  async delete(id: string): Promise<void> {}
}

export class EmbarazoApiRepository implements IEmbarazoRepository {
  async getAll(medicoId?: string): Promise<Embarazo[]> {
    const param = medicoId ? `?medico_id=${encodeURIComponent(medicoId)}` : '';
    const res = await fetchApi(`/embarazos${param}`);
    const list = res || [];
    if (!list.some((e: any) => e.cedula_id === MOCK_PATIENT_DEMO.cedula_id)) {
      return [MOCK_EMBARAZO_DEMO, ...list];
    }
    return list;
  }
  async getById(id: string): Promise<Embarazo | null> {
    if (id === MOCK_EMBARAZO_DEMO.id_embarazo) return MOCK_EMBARAZO_DEMO;
    return fetchApi(`/embarazos/${encodeURIComponent(id)}`);
  }
  async save(item: Embarazo): Promise<void> {
    await fetchApi('/embarazos', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<Embarazo>): Promise<void> {
    await fetchApi(`/embarazos/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(item) });
  }
  async delete(id: string): Promise<void> {}
  
  async getByCedulaId(cedulaId: string): Promise<Embarazo[]> {
    if (cedulaId === MOCK_PATIENT_DEMO.cedula_id) return [MOCK_EMBARAZO_DEMO];
    return fetchApi(`/embarazos/paciente/${encodeURIComponent(cedulaId)}`) || [];
  }
  async getActiveByCedulaId(cedulaId: string): Promise<Embarazo | null> {
    if (cedulaId === MOCK_PATIENT_DEMO.cedula_id) return MOCK_EMBARAZO_DEMO;
    const list = await this.getByCedulaId(cedulaId);
    return list.find(e => e.estado === 'activo') || null;
  }
}

export class LaboratorioApiRepository implements ILaboratorioRepository {
  async getAll(): Promise<Laboratorio[]> { return []; }
  async getById(id: string): Promise<Laboratorio | null> {
    if (id === MOCK_EMBARAZO_DEMO.id_embarazo) return MOCK_LABORATORIO_DEMO;
    return fetchApi(`/laboratorios/embarazo/${encodeURIComponent(id)}`);
  }
  async save(item: Laboratorio): Promise<void> {
    await fetchApi('/laboratorios', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<Laboratorio>): Promise<void> {
    await fetchApi(`/laboratorios/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(item) });
  }
  async delete(id: string): Promise<void> {}
  
  async getByEmbarazoId(embarazoId: string): Promise<Laboratorio | null> {
    if (embarazoId === MOCK_EMBARAZO_DEMO.id_embarazo) return MOCK_LABORATORIO_DEMO;
    return this.getById(embarazoId);
  }
}

export class ControlApiRepository implements IControlRepository {
  async getAll(): Promise<Control[]> {
    return fetchApi('/controles') || [];
  }
  async getById(id: string): Promise<Control | null> { return null; }
  async save(item: Control): Promise<void> {
    await fetchApi('/controles', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<Control>): Promise<void> {
    await fetchApi(`/controles/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(item) });
  }
  async delete(id: string): Promise<void> {
    await fetchApi(`/controles/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
  
  async getByEmbarazoId(embarazoId: string): Promise<Control[]> {
    if (embarazoId === MOCK_EMBARAZO_DEMO.id_embarazo) return MOCK_CONTROLES_DEMO;
    return fetchApi(`/controles/embarazo/${encodeURIComponent(embarazoId)}`) || [];
  }
}

export class CitaApiRepository implements ICitaRepository {
  async getAll(medicoId?: string): Promise<Cita[]> {
    const param = medicoId ? `?medico_id=${encodeURIComponent(medicoId)}` : '';
    const res = await fetchApi(`/citas${param}`);
    const list = res || [];
    if (!list.some((c: any) => c.cedula_id === MOCK_PATIENT_DEMO.cedula_id)) {
      return [...MOCK_CITAS_DEMO, ...list];
    }
    return list;
  }
  async getById(id: string): Promise<Cita | null> { return null; }
  async save(item: Cita): Promise<void> {
    await fetchApi('/citas', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<Cita>): Promise<void> {
    await fetchApi(`/citas/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(item) });
  }
  async delete(id: string): Promise<void> {}
  
  async getByCedulaId(cedulaId: string): Promise<Cita[]> {
    if (cedulaId === MOCK_PATIENT_DEMO.cedula_id) return MOCK_CITAS_DEMO;
    return fetchApi(`/citas/paciente/${encodeURIComponent(cedulaId)}`) || [];
  }
}

export class RecetaApiRepository implements IRecetaRepository {
  async getAll(): Promise<Receta[]> { return []; }
  async getById(id: string): Promise<Receta | null> { return null; }
  async save(item: Receta): Promise<void> {
    await fetchApi('/recetas', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<Receta>): Promise<void> {}
  async delete(id: string): Promise<void> {}
  async getByCedulaId(cedulaId: string): Promise<Receta[]> {
    return fetchApi(`/recetas/paciente/${encodeURIComponent(cedulaId)}`) || [];
  }
}

export class ReposoApiRepository implements IReposoRepository {
  async getAll(): Promise<Reposo[]> { return []; }
  async getById(id: string): Promise<Reposo | null> { return null; }
  async save(item: Reposo): Promise<void> {
    await fetchApi('/reposos', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<Reposo>): Promise<void> {}
  async delete(id: string): Promise<void> {}
  async getByCedulaId(cedulaId: string): Promise<Reposo[]> {
    return fetchApi(`/reposos/paciente/${encodeURIComponent(cedulaId)}`) || [];
  }
}

export class SolicitudLaboratorioApiRepository implements ISolicitudLaboratorioRepository {
  async getAll(): Promise<SolicitudLaboratorio[]> { return []; }
  async getById(id: string): Promise<SolicitudLaboratorio | null> { return null; }
  async save(item: SolicitudLaboratorio): Promise<void> {
    await fetchApi('/solicitudes-laboratorio', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<SolicitudLaboratorio>): Promise<void> {}
  async delete(id: string): Promise<void> {}
  async getByCedulaId(cedulaId: string): Promise<SolicitudLaboratorio[]> {
    return fetchApi(`/solicitudes-laboratorio/paciente/${encodeURIComponent(cedulaId)}`) || [];
  }
}

export async function updateDoctorSubscription(id: string, data: {
  estado_suscripcion?: string;
  fecha_vencimiento?: string | null;
  plan?: string;
  monto_mensual?: number | null;
  notas_admin?: string | null;
}) {
  return fetchApi(`/auth/users/${id}/subscription`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

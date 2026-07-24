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

export class PacienteApiRepository implements IPacienteRepository {
  async getAll(medicoId?: string): Promise<Paciente[]> {
    const param = medicoId ? `?medico_id=${encodeURIComponent(medicoId)}` : '';
    return fetchApi(`/pacientes${param}`) || [];
  }
  async getById(id: string): Promise<Paciente | null> {
    return fetchApi(`/pacientes/${encodeURIComponent(id)}`);
  }
  async save(item: Paciente): Promise<void> {
    await fetchApi('/pacientes', { method: 'POST', body: JSON.stringify(item) });
  }
  async update(id: string, item: Partial<Paciente>): Promise<void> {
    await fetchApi(`/pacientes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(item) });
  }
  async delete(id: string): Promise<void> {
    // not implemented on backend yet, but required by BaseRepository interface if any
  }
  async getByCedula(cedula: string): Promise<Paciente | null> {
    return this.getById(cedula);
  }
  async search(query: string, medicoId?: string): Promise<Paciente[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (medicoId) params.append('medico_id', medicoId);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/pacientes${qStr}`) || [];
  }
}

export class AntecedentesApiRepository implements IAntecedentesRepository {
  async getAll(): Promise<Antecedentes[]> { return []; }
  async getById(id: string): Promise<Antecedentes | null> {
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
    return fetchApi(`/embarazos${param}`) || [];
  }
  async getById(id: string): Promise<Embarazo | null> {
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
    return fetchApi(`/embarazos/paciente/${encodeURIComponent(cedulaId)}`) || [];
  }
  async getActiveByCedulaId(cedulaId: string): Promise<Embarazo | null> {
    const list = await this.getByCedulaId(cedulaId);
    return list.find(e => e.estado === 'activo') || null;
  }
}

export class LaboratorioApiRepository implements ILaboratorioRepository {
  async getAll(): Promise<Laboratorio[]> { return []; }
  async getById(id: string): Promise<Laboratorio | null> {
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
    return fetchApi(`/controles/embarazo/${encodeURIComponent(embarazoId)}`) || [];
  }
}

export class CitaApiRepository implements ICitaRepository {
  async getAll(medicoId?: string): Promise<Cita[]> {
    const param = medicoId ? `?medico_id=${encodeURIComponent(medicoId)}` : '';
    return fetchApi(`/citas${param}`) || [];
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

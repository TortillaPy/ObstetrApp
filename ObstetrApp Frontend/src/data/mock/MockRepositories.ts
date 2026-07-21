import {
  IPacienteRepository,
  IAntecedentesRepository,
  IEmbarazoRepository,
  ILaboratorioRepository,
  IControlRepository,
  ICitaRepository,
} from '../repositories/Interfaces';
import { LocalStorageRepository } from './LocalStorageRepository';
import { Paciente } from '../../domain/entities/Paciente';
import { Antecedentes } from '../../domain/entities/Antecedentes';
import { Embarazo } from '../../domain/entities/Embarazo';
import { Laboratorio } from '../../domain/entities/Laboratorio';
import { Control } from '../../domain/entities/Control';
import { Cita } from '../../domain/entities/Cita';

export class PacienteMockRepository extends LocalStorageRepository<Paciente> implements IPacienteRepository {
  constructor() {
    super('obstetrapp_pacientes', 'cedula_id');
  }

  async getByCedula(cedula: string): Promise<Paciente | null> {
    const items = this.getItems();
    return items.find((p) => p.cedula_id === cedula) || null;
  }

  async search(query: string): Promise<Paciente[]> {
    const items = this.getItems();
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (p) =>
        p.cedula_id.toLowerCase().includes(lowerQuery) ||
        p.nombre.toLowerCase().includes(lowerQuery) ||
        p.apellido.toLowerCase().includes(lowerQuery)
    );
  }
}

export class AntecedentesMockRepository extends LocalStorageRepository<Antecedentes> implements IAntecedentesRepository {
  constructor() {
    super('obstetrapp_antecedentes', 'cedula_id');
  }
}

export class EmbarazoMockRepository extends LocalStorageRepository<Embarazo> implements IEmbarazoRepository {
  constructor() {
    super('obstetrapp_embarazos', 'id_embarazo');
  }

  async getByCedulaId(cedulaId: string): Promise<Embarazo[]> {
    const items = this.getItems();
    return items.filter((e) => e.cedula_id === cedulaId);
  }

  async getActiveByCedulaId(cedulaId: string): Promise<Embarazo | null> {
    const items = this.getItems();
    return items.find((e) => e.cedula_id === cedulaId && e.estado === 'activo') || null;
  }
}

export class LaboratorioMockRepository extends LocalStorageRepository<Laboratorio> implements ILaboratorioRepository {
  constructor() {
    super('obstetrapp_laboratorios', 'embarazo_id');
  }

  async getByEmbarazoId(embarazoId: string): Promise<Laboratorio | null> {
    const items = this.getItems();
    return items.find((l) => l.embarazo_id === embarazoId) || null;
  }
}

export class ControlMockRepository extends LocalStorageRepository<Control> implements IControlRepository {
  constructor() {
    super('obstetrapp_controles', 'id_control');
  }

  async getByEmbarazoId(embarazoId: string): Promise<Control[]> {
    const items = this.getItems();
    return items.filter((c) => c.embarazo_id === embarazoId).sort((a, b) => new Date(a.fecha_visita).getTime() - new Date(b.fecha_visita).getTime());
  }
}

export class CitaMockRepository extends LocalStorageRepository<Cita> implements ICitaRepository {
  constructor() {
    super('obstetrapp_citas', 'id_cita');
  }

  async getByCedulaId(cedulaId: string): Promise<Cita[]> {
    const items = this.getItems();
    return items.filter((c) => c.cedula_id === cedulaId).sort((a, b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime());
  }
}

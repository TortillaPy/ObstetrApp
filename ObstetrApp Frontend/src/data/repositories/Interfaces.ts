import { IRepository } from './IRepository';
import { Paciente } from '../../domain/entities/Paciente';
import { Antecedentes } from '../../domain/entities/Antecedentes';
import { Embarazo } from '../../domain/entities/Embarazo';
import { Laboratorio } from '../../domain/entities/Laboratorio';
import { Control } from '../../domain/entities/Control';
import { Cita } from '../../domain/entities/Cita';
import { Receta } from '../../domain/entities/Receta';
import { Reposo } from '../../domain/entities/Reposo';
import { SolicitudLaboratorio } from '../../domain/entities/SolicitudLaboratorio';

export interface IPacienteRepository extends IRepository<Paciente> {
  getByCedula(cedula: string): Promise<Paciente | null>;
  search(query: string): Promise<Paciente[]>;
}

export interface IAntecedentesRepository extends IRepository<Antecedentes> {}

export interface IEmbarazoRepository extends IRepository<Embarazo> {
  getByCedulaId(cedulaId: string): Promise<Embarazo[]>;
  getActiveByCedulaId(cedulaId: string): Promise<Embarazo | null>;
}

export interface ILaboratorioRepository extends IRepository<Laboratorio> {
  getByEmbarazoId(embarazoId: string): Promise<Laboratorio | null>;
}

export interface IControlRepository extends IRepository<Control> {
  getByEmbarazoId(embarazoId: string): Promise<Control[]>;
}

export interface ICitaRepository extends IRepository<Cita> {
  getByCedulaId(cedulaId: string): Promise<Cita[]>;
}

export interface IRecetaRepository extends IRepository<Receta> {
  getByCedulaId(cedulaId: string): Promise<Receta[]>;
}

export interface IReposoRepository extends IRepository<Reposo> {
  getByCedulaId(cedulaId: string): Promise<Reposo[]>;
}

export interface ISolicitudLaboratorioRepository extends IRepository<SolicitudLaboratorio> {
  getByCedulaId(cedulaId: string): Promise<SolicitudLaboratorio[]>;
}


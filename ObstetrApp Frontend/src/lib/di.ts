import { PacienteApiRepository, AntecedentesApiRepository, EmbarazoApiRepository, LaboratorioApiRepository, ControlApiRepository, CitaApiRepository, RecetaApiRepository, ReposoApiRepository, SolicitudLaboratorioApiRepository } from '../data/api/ApiRepositories';

export const repositories = {
  pacientes: new PacienteApiRepository(),
  antecedentes: new AntecedentesApiRepository(),
  embarazos: new EmbarazoApiRepository(),
  laboratorios: new LaboratorioApiRepository(),
  controles: new ControlApiRepository(),
  citas: new CitaApiRepository(),
  recetas: new RecetaApiRepository(),
  reposos: new ReposoApiRepository(),
  solicitudesLaboratorio: new SolicitudLaboratorioApiRepository(),
};


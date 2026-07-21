export type EstadoCita = 'pendiente' | 'realizada' | 'cancelada';

export interface Cita {
  id_cita: string;
  cedula_id: string; // FK -> Paciente.cedula_id
  fecha_cita: string;
  hora_cita?: string;
  motivo?: string;
  comentarios?: string; // used for SOAP plan/etc or diagnostico
  diagnostico?: string;
  plan?: string;
  sintomas?: string; // S in SOAP
  examen_fisico?: string; // O in SOAP
  pa?: string;
  fc?: string;
  fr?: string;
  sato2?: string;
  glicemia?: string;
  peso?: string;
  estado: EstadoCita;
  
  // Tipo de registro
  tipo?: 'consulta' | 'eco' | 'pap';
  
  // Campos de Ecografía
  eco_eg?: string;
  eco_peso?: string;
  eco_ila?: string;
  eco_diagnostico?: string;
  
  // Campos de PAP
  pap_aspecto?: string;
  pap_resultado?: string;
  pap_observaciones?: string;

  // Campos de Ginecología
  gyn_motivo?: string;
  gyn_examen_mamario?: string;
  gyn_abdomen_pelvis?: string;
  gyn_especuloscopia?: string;
  gyn_tacto_vaginal?: string;
}

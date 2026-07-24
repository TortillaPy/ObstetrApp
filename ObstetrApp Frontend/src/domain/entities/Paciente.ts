export type Etnia = 'blanca' | 'indigena' | 'mestiza' | 'negra' | 'otra';
export type NivelEstudio = 'ninguno' | 'primaria' | 'secundaria' | 'universitaria';
export type EstadoCivil = 'soltera' | 'casada' | 'union_estable' | 'otro';

export interface Paciente {
  cedula_id: string; // Clave primaria
  nombre: string;
  apellido: string;
  domicilio?: string;
  telefono?: string;
  localidad?: string;
  fecha_nacimiento: string;
  edad: number; // Campo autocalculado
  menor_15_mayor_35: 0 | 1; // Campo autocalculado
  etnia: Etnia;
  estudios_nivel: NivelEstudio;
  estudios_alfabetiza: 0 | 1;
  estudios_anios_mayor_nivel?: number;
  estado_civil: EstadoCivil;
  vive_sola: 0 | 1;
  lugar_control_habitual?: string;
  lugar_parto_aborto_previsto?: string;
  identificacion_manual?: string;
  grupo_sanguineo?: string;
  factor_rh?: string;
  // Antecedentes Ginecológicos
  menarca?: number;
  fum?: string;
  ritmo_menstrual?: string;
  metodo_anticonceptivo?: string;
  tiene_dismenorrea?: boolean;
  tiene_dispareunia?: boolean;
  tiene_sangrado_anormal?: boolean;
  tiene_flujo_vaginal?: boolean;
  medico_id?: string;
}

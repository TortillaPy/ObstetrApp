export type EstadoEmbarazo = 'activo' | 'finalizado';
export type EGConfiablePor = 'FUM' | 'Eco_Menor_20s';

export type CervixEvalStatus = 'normal' | 'anormal' | 'no_se_hizo';

export interface Embarazo {
  id_embarazo: string;
  cedula_id: string; // FK -> Paciente.cedula_id
  estado: EstadoEmbarazo;
  peso_anterior_kg: number;
  talla_cm: number;
  fum: string; // FK -> Paciente.fum (obligatorio aquí)
  fpp: string; // Calculado de fum
  eg_confiable_por?: EGConfiablePor;
  dudas_fum?: boolean;
  notas_parto?: string;
  anotaciones_margen_superior?: string;
  
  // Hábitos de riesgo y violencia por trimestre
  fumadora_activa_1tr: 0 | 1;
  fumadora_activa_2tr: 0 | 1;
  fumadora_activa_3tr: 0 | 1;
  fumadora_pasiva_1tr: 0 | 1;
  fumadora_pasiva_2tr: 0 | 1;
  fumadora_pasiva_3tr: 0 | 1;
  drogas_1tr: 0 | 1;
  drogas_2tr: 0 | 1;
  drogas_3tr: 0 | 1;
  alcohol_1tr: 0 | 1;
  alcohol_2tr: 0 | 1;
  alcohol_3tr: 0 | 1;
  violencia_1tr: 0 | 1;
  violencia_2tr: 0 | 1;
  violencia_3tr: 0 | 1;

  // Vacunas del embarazo
  inm_antitetanica_vigente: 0 | 1;
  inm_antitetanica_dosis1: 0 | 1;
  inm_antitetanica_dosis2: 0 | 1;
  inm_antitetanica_dosis_1_mes?: number;
  inm_antitetanica_dosis_2_mes?: number;
  inm_antitetanica_dosis_3_mes?: number;

  // Exámenes físicos / Inmunizaciones
  inm_examen_odontologico: 0 | 1;
  inm_examen_mamas: 0 | 1;
  inm_cervix_inspeccion: CervixEvalStatus;
  inm_cervix_pap: CervixEvalStatus;
  inm_cervix_colp: CervixEvalStatus;
  
  eval_trimestres_json?: string;
}

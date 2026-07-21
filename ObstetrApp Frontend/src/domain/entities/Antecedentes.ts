export interface Antecedentes {
  cedula_id: string; // PK y FK -> Paciente.cedula_id
  
  // Patologías Familiares/Personales
  ant_tbc: 0 | 1;
  ant_diabetes: 0 | 1;
  ant_hipertension: 0 | 1;
  ant_preeclampsia: 0 | 1;
  ant_eclampsia: 0 | 1;
  ant_cardiopatia: 0 | 1;
  ant_nefropatia: 0 | 1;
  ant_infertilidad: 0 | 1;
  ant_cirugia_genito_urinaria: 0 | 1;
  ant_violencia: 0 | 1;
  ant_otra_condicion_grave: 0 | 1;
  ant_cirugias_especificas_texto?: string;

  // Antecedentes Obstétricos Previos
  hist_gestas_previas: number;
  hist_partos: number;
  hist_vaginales: number;
  hist_cesareas: number;
  hist_abortos: number;
  hist_nacidos_vivos: number;
  hist_nacidos_muertos: number;
  hist_viven: number;
  hist_abortos_tres_espontaneos_consecutivos: 0 | 1;
  hist_nacidos_vivos_muertos_1ra_semana: 0 | 1;
  hist_nacidos_vivos_muertos_despues_1ra_semana: 0 | 1;
  hist_fin_embarazo_anterior_fecha?: string;
  hist_fin_embarazo_anterior_menos_de_1_anio: 0 | 1;
  hist_embarazo_planeado: 0 | 1;
  hist_fracaso_anticonceptivo: 'no' | 'barrera' | 'diu' | 'hormonal' | 'emergencia' | 'natural';
  
  // Vacunas
  inm_antirubeola: 'previa' | 'no_sabe' | 'embarazo' | 'no';
}

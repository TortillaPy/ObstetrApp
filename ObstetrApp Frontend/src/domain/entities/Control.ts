export type PresentacionFetal = 'Cefalica' | 'Podalica' | 'Transversa';
export type MovimientosFetales = '+' | '-';
export type Proteinuria = '+' | '-';

export interface Control {
  id_control: string;
  embarazo_id: string;
  fecha_visita: string;
  eg_semanas: number;
  peso_kg: number;
  pa_sistolica?: number;
  pa_diastolica?: number;
  altura_uterina_cm?: number;
  presentacion_fetal?: PresentacionFetal;
  lcf_lpm?: string;
  movimientos_fetales?: MovimientosFetales;
  proteinuria?: Proteinuria;
  signos_alarma_examenes_tratamientos?: string;
  iniciales_tecnico: string;
  proxima_cita: string;
}

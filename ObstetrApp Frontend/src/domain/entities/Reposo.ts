export interface Reposo {
  id_reposo: string;
  cedula_id: string;
  fecha_emision: string;
  dias_reposo: number;
  diagnostico: string;
  fecha_inicio: string;
  tipo_reposo: string; // "Fisico" | "Laboral" | "Absoluto"
  observaciones?: string;
}

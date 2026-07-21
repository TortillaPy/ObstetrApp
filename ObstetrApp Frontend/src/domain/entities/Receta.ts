export interface Receta {
  id_receta: string;
  cedula_id: string;
  fecha_emision: string;
  medicamentos: string; // JSON string containing array of { medicamento: string, posologia: string }
  indicaciones?: string;
}

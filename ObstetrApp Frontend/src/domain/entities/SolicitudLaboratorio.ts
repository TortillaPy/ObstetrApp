export interface SolicitudLaboratorio {
  id_solicitud: string;
  cedula_id: string;
  fecha_emision: string;
  estudios_solicitados: string; // JSON string containing list of requested test keys
  observaciones?: string;
}

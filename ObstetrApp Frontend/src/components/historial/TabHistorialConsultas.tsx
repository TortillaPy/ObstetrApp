import React from 'react';
import { FileText, CheckCircle2, Eye, Trash2, Clock } from 'lucide-react';
import { Cita } from '../../domain/entities/Cita';

interface TabHistorialConsultasProps {
  consultasG: Cita[];
  onSelectConsulta: (c: Cita) => void;
  onDeleteConsulta: (e: React.MouseEvent, id: string) => void;
  title?: string;
  description?: string;
  listTitle?: string;
}

export function TabHistorialConsultas({
  consultasG,
  onSelectConsulta,
  onDeleteConsulta,
  title = "Consultas Clínicas",
  description = "Historial de consultas normales (SOAP) y evoluciones ginecológicas.",
  listTitle = "Historial de Consultas Médicas"
}: TabHistorialConsultasProps) {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#2C3333]">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 mb-4">
        <h3 className="font-bold text-xs uppercase text-[#1E3A8A] tracking-wider">{listTitle}</h3>
        <span className="text-xs text-gray-500 font-semibold">{consultasG.length} registros</span>
      </div>

      {consultasG.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {consultasG.map(c => (
            <div key={c.id_cita} className="p-4 border border-[#E2E8F0] bg-white rounded-2xl flex items-start gap-4 relative group hover:shadow-sm transition-shadow">
              <div className="p-2 bg-[#F8FAFC] rounded-xl text-[#2563EB]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-16">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{new Date(c.fecha_cita).toLocaleDateString()}</span>
                  <span className="text-xs text-gray-400 font-semibold">• {new Date(c.fecha_cita).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hs</span>
                </div>
                <p className="text-xs font-bold text-[#2563EB] mt-1 uppercase tracking-wide">{c.motivo || 'Consulta General'}</p>
                {c.diagnostico && (
                  <p className="text-xs text-gray-700 mt-2 font-semibold">
                    <strong className="text-gray-400 uppercase text-[9px] mr-1 block">Diagnóstico:</strong> {c.diagnostico}
                  </p>
                )}
                {c.plan && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    <strong className="text-gray-400 uppercase text-[9px] mr-1 block">Plan:</strong> {c.plan}
                  </p>
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onSelectConsulta(c)}
                  className="p-1.5 text-gray-400 hover:text-[#1E3A8A] bg-white rounded-md shadow-sm border border-gray-200 cursor-pointer"
                  title="Ver Detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => onDeleteConsulta(e, c.id_cita)}
                  className="p-1.5 text-red-400 hover:text-red-600 bg-white rounded-md shadow-sm border border-gray-200 cursor-pointer"
                  title="Eliminar Registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E2E8F0]">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400 italic">No hay consultas de consultorio registradas en esta paciente.</p>
        </div>
      )}
    </div>
  );
}

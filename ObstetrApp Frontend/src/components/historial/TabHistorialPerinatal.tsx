import React from 'react';
import { FileText, Eye, Trash2, Clock } from 'lucide-react';
import { Control } from '../../domain/entities/Control';

interface TabHistorialPerinatalProps {
  controles: Control[];
  onSelectControl: (c: Control) => void;
  onDeleteControl: (e: React.MouseEvent, id: string) => void;
}

export function TabHistorialPerinatal({
  controles,
  onSelectControl,
  onDeleteControl
}: TabHistorialPerinatalProps) {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#2C3333]">Seguimiento y Control Prenatal</h3>
          <p className="text-xs text-gray-500">Carnet y registro evolutivo de visitas de control prenatal.</p>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 mb-4">
        <h3 className="font-bold text-xs uppercase text-[#1E3A8A] tracking-wider">Carnet de Control Prenatal</h3>
        <span className="text-xs text-gray-500 font-semibold">{controles.length} visitas</span>
      </div>

      {controles.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
          <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-sm text-gray-700">
            <thead className="bg-[#F8FAFC] text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 border-b border-r border-[#E2E8F0]">Fecha</th>
                <th className="px-4 py-3 border-b border-r border-[#E2E8F0]">EG</th>
                <th className="px-4 py-3 border-b border-r border-[#E2E8F0]">Peso</th>
                <th className="px-4 py-3 border-b border-r border-[#E2E8F0]">P.A.</th>
                <th className="px-4 py-3 border-b border-r border-[#E2E8F0]">Alt. Ut.</th>
                <th className="px-4 py-3 border-b border-r border-[#E2E8F0]">LCF</th>
                <th className="px-4 py-3 border-b border-r border-[#E2E8F0]">Presentación</th>
                <th className="px-4 py-3 border-b border-r border-[#E2E8F0]">Signos / Tratamientos</th>
                <th className="px-4 py-3 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {controles.map(c => (
                <tr key={c.id_control} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold border-r border-[#E2E8F0]">{new Date(c.fecha_visita).toLocaleDateString()}</td>
                  <td className="px-4 py-3 border-r border-[#E2E8F0]">{c.eg_semanas} sem</td>
                  <td className="px-4 py-3 border-r border-[#E2E8F0]">{c.peso_kg || '-'} kg</td>
                  <td className="px-4 py-3 border-r border-[#E2E8F0]">{c.pa_sistolica}/{c.pa_diastolica}</td>
                  <td className="px-4 py-3 border-r border-[#E2E8F0]">{c.altura_uterina_cm ? `${c.altura_uterina_cm} cm` : '-'}</td>
                  <td className="px-4 py-3 border-r border-[#E2E8F0]">{c.lcf_lpm ? `${c.lcf_lpm} lpm` : '-'}</td>
                  <td className="px-4 py-3 border-r border-[#E2E8F0] capitalize">{c.presentacion_fetal || '-'}</td>
                  <td className="px-4 py-3 border-r border-[#E2E8F0] max-w-xs truncate" title={c.signos_alarma_examenes_tratamientos}>
                    {c.signos_alarma_examenes_tratamientos || '-'}
                  </td>
                  <td className="px-4 py-3 text-center flex items-center justify-center gap-1.5">
                    <button 
                      onClick={() => onSelectControl(c)}
                      className="p-1 text-gray-400 hover:text-[#1E3A8A] border border-gray-100 bg-white rounded cursor-pointer"
                      title="Ver detalles"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => onDeleteControl(e, c.id_control)}
                      className="p-1 text-red-400 hover:text-red-600 border border-gray-100 bg-white rounded cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E2E8F0]">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400 italic">No hay controles perinatales registrados para esta paciente.</p>
        </div>
      )}
    </div>
  );
}

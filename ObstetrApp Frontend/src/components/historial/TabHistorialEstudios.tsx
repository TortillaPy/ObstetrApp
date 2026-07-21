import React from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { Cita } from '../../domain/entities/Cita';
import { Laboratorio } from '../../domain/entities/Laboratorio';

interface TabHistorialEstudiosProps {
  ecografias: Cita[];
  paps: Cita[];
  laboratorio: Laboratorio | null;
  onDeleteConsulta: (e: React.MouseEvent, id: string) => void;
}

export function TabHistorialEstudios({
  ecografias,
  paps,
  laboratorio,
  onDeleteConsulta
}: TabHistorialEstudiosProps) {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#2C3333]">Estudios y Exámenes Diagnósticos</h3>
          <p className="text-xs text-gray-500">Resultados e informes de ecografías, PAP y laboratorios gestacionales.</p>
        </div>
      </div>
      {/* Sub-Bento: Ecografías y PAP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Ecografías */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 flex flex-col">
          <h3 className="font-bold uppercase tracking-wider text-xs border-b border-[#E2E8F0] pb-2 mb-4 text-[#1E3A8A] flex justify-between items-center">
            <span>Ecografías Obstétricas</span>
            <span className="text-[10px] text-gray-400 font-semibold">{ecografias.length} estudios</span>
          </h3>
          {ecografias.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
              {ecografias.map(e => (
                <div key={e.id_cita} className="p-3 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors relative group text-xs text-gray-700">
                  <div className="flex justify-between font-bold text-[#1E3A8A] mb-1">
                    <span>{new Date(e.fecha_cita).toLocaleDateString()}</span>
                    <span>{e.eco_eg || '-'} Semanas</span>
                  </div>
                  <p className="mt-1"><strong className="text-gray-400 uppercase text-[9px] mr-1 block">Diagnóstico:</strong> <span className="font-medium text-gray-800">{e.eco_diagnostico || 'S/D'}</span></p>
                  <div className="flex gap-4 mt-2 text-[10px] text-gray-500 bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0] justify-around">
                    <span><strong>PFE:</strong> {e.eco_peso ? `${e.eco_peso}g` : '-'}</span>
                    <span><strong>ILA:</strong> {e.eco_ila || '-'}</span>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(ev) => onDeleteConsulta(ev, e.id_cita)} className="p-1 text-red-400 hover:text-red-600 bg-white rounded shadow-sm border border-gray-200 cursor-pointer" title="Eliminar Registro"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic py-6 text-center">No hay ecografías registradas.</p>
          )}
        </div>

        {/* Papanicolaou */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 flex flex-col">
          <h3 className="font-bold uppercase tracking-wider text-xs border-b border-[#E2E8F0] pb-2 mb-4 text-[#1E3A8A] flex justify-between items-center">
            <span>Papanicolaou / Colposcopia</span>
            <span className="text-[10px] text-gray-400 font-semibold">{paps.length} estudios</span>
          </h3>
          {paps.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
              {paps.map(p => (
                <div key={p.id_cita} className="p-3 border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors relative group text-xs text-gray-700">
                  <div className="font-bold text-[#1E3A8A] mb-2">{new Date(p.fecha_cita).toLocaleDateString()}</div>
                  <p className="mt-1"><strong className="text-gray-400 uppercase text-[9px] mr-1 block">Aspecto C.U.:</strong> <span className="font-medium text-gray-800">{p.pap_aspecto || 'S/D'}</span></p>
                  <p className="mt-1"><strong className="text-gray-400 uppercase text-[9px] mr-1 block">Resultado (Bethesda):</strong> <span className="font-bold text-gray-800">{p.pap_resultado || 'S/D'}</span></p>
                  {p.pap_observaciones && <p className="mt-1 text-gray-500 italic">Obs: {p.pap_observaciones}</p>}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(ev) => onDeleteConsulta(ev, p.id_cita)} className="p-1 text-red-400 hover:text-red-600 bg-white rounded shadow-sm border border-gray-200 cursor-pointer" title="Eliminar Registro"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic py-6 text-center">No hay PAP registrados.</p>
          )}
        </div>
      </div>

      {/* Laboratorio summary read-only */}
      {laboratorio ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5">
          <h3 className="font-bold uppercase tracking-wider text-xs border-b border-[#E2E8F0] pb-3 mb-4 text-[#1E3A8A]">Resultados de Laboratorio Gestacional Activo</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <span className="font-bold text-[#1E3A8A] uppercase text-[9px] block mb-2">Toxoplasmosis</span>
              <p className="flex justify-between"><span>&lt;20 sem IgG:</span> <span className="font-semibold text-gray-800 capitalize">{laboratorio.toxo_menor_20sem_igg || 'S/D'}</span></p>
              <p className="flex justify-between mt-1"><span>&ge;20 sem IgG:</span> <span className="font-semibold text-gray-800 capitalize">{laboratorio.toxo_mayor_20sem_igg || 'S/D'}</span></p>
              <p className="flex justify-between mt-1"><span>1ra cons IgM:</span> <span className="font-semibold text-gray-800 capitalize">{laboratorio.toxo_primera_consulta_igm || 'S/D'}</span></p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <span className="font-bold text-[#1E3A8A] uppercase text-[9px] block mb-2">Glucemia en Ayunas</span>
              <p className="flex justify-between"><span>&lt;20 sem:</span> <span className="font-semibold text-gray-800">{laboratorio.glucemia_menor_20sem ? `${laboratorio.glucemia_menor_20sem} mg/dl` : 'S/D'}</span></p>
              <p className="flex justify-between mt-1"><span>&ge;30 sem:</span> <span className="font-semibold text-gray-800">{laboratorio.glucemia_mayor_30sem ? `${laboratorio.glucemia_mayor_30sem} mg/dl` : 'S/D'}</span></p>
              <p className="flex justify-between mt-1"><span>TTGO:</span> <span className="font-semibold text-gray-800">{laboratorio.ttgo_resultado_mg_dl ? `${laboratorio.ttgo_resultado_mg_dl} mg/dl` : 'S/D'}</span></p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <span className="font-bold text-[#1E3A8A] uppercase text-[9px] block mb-2">Sífilis & VIH</span>
              <p className="flex justify-between"><span>&lt;20 sem VDRL:</span> <span className="font-semibold text-gray-800 capitalize">{laboratorio.sifilis_vdrl_menor_20sem || 'S/D'}</span></p>
              <p className="flex justify-between mt-1"><span>&ge;20 sem VDRL:</span> <span className="font-semibold text-gray-800 capitalize">{laboratorio.sifilis_vdrl_mayor_20sem || 'S/D'}</span></p>
              <p className="flex justify-between mt-1"><span>VIH &lt;20 sem:</span> <span className="font-bold text-gray-800">{laboratorio.vih_menor_20sem_resultado || 'S/D'}</span></p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <span className="font-bold text-[#1E3A8A] uppercase text-[9px] block mb-2">Hemoglobina & Otros</span>
              <p className="flex justify-between"><span>Hb &lt;20 sem:</span> <span className="font-semibold text-gray-800">{laboratorio.hb_menor_20sem ? `${laboratorio.hb_menor_20sem} g/dl` : 'S/D'}</span></p>
              <p className="flex justify-between mt-1"><span>Hb &ge;20 sem:</span> <span className="font-semibold text-gray-800">{laboratorio.hb_mayor_20sem ? `${laboratorio.hb_mayor_20sem} g/dl` : 'S/D'}</span></p>
              <p className="flex justify-between mt-1"><span>TSH:</span> <span className="font-semibold text-gray-800">{laboratorio.tsh_valor ? `${laboratorio.tsh_valor} uUI/ml` : 'S/D'}</span></p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">No se registran laboratorios del embarazo activo.</p>
      )}
    </div>
  );
}

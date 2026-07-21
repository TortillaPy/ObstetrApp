import React from 'react';
import { Activity, X } from 'lucide-react';
import { Control } from '../../domain/entities/Control';

interface ModalControlDetailsProps {
  selectedControl: Control;
  onClose: () => void;
}

export function ModalControlDetails({ selectedControl, onClose }: ModalControlDetailsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-bold text-lg text-[#2C3333]">Detalle de Control Prenatal</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-[#E2E8F0]">
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha</p>
               <p className="text-sm font-semibold text-[#2C3333]">{new Date(selectedControl.fecha_visita).toLocaleDateString()}</p>
             </div>
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Edad Gestacional</p>
               <p className="text-sm font-semibold text-[#2C3333]">{selectedControl.eg_semanas} semanas</p>
             </div>
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Peso</p>
               <p className="text-sm font-semibold text-[#2C3333]">{selectedControl.peso_kg || '-'} kg</p>
             </div>
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Presión Arterial</p>
               <p className="text-sm font-semibold text-[#2C3333]">{selectedControl.pa_sistolica}/{selectedControl.pa_diastolica}</p>
             </div>
          </div>

          <div>
             <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Examen Obstétrico</p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
               <div><span className="text-[10px] text-gray-500 block">Altura Uterina</span><span className="text-sm font-semibold">{selectedControl.altura_uterina_cm ? `${selectedControl.altura_uterina_cm} cm` : '-'}</span></div>
               <div><span className="text-[10px] text-gray-500 block">LCF</span><span className="text-sm font-semibold">{selectedControl.lcf_lpm ? `${selectedControl.lcf_lpm} lpm` : '-'}</span></div>
               <div><span className="text-[10px] text-gray-500 block">Mov. Fetales</span><span className="text-sm font-semibold capitalize">{selectedControl.movimientos_fetales || '-'}</span></div>
               <div><span className="text-[10px] text-gray-500 block">Proteinuria</span><span className="text-sm font-semibold capitalize">{selectedControl.proteinuria || '-'}</span></div>
             </div>
          </div>

          {selectedControl.signos_alarma_examenes_tratamientos && (
            <div>
               <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Observaciones, Alarmas & Indicaciones</p>
               <div className="bg-[#F8FAFC] rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-[#E2E8F0]">
                 {selectedControl.signos_alarma_examenes_tratamientos}
               </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-[#E2E8F0] flex justify-end bg-gray-50">
           <button 
             onClick={onClose}
             className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider hover:bg-gray-300 transition-colors cursor-pointer"
           >
             Cerrar
           </button>
        </div>
      </div>
    </div>
  );
}

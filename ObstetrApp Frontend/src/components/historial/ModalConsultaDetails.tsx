import React from 'react';
import { FileText, X } from 'lucide-react';
import { Cita } from '../../domain/entities/Cita';

interface ModalConsultaDetailsProps {
  selectedConsulta: Cita;
  onClose: () => void;
}

export function ModalConsultaDetails({ selectedConsulta, onClose }: ModalConsultaDetailsProps) {
  const isGyn = selectedConsulta.motivo === 'Consulta Ginecológica' || selectedConsulta.gyn_motivo !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-bold text-lg text-[#2C3333]">
              {isGyn 
                ? 'Detalle de Consulta Ginecológica' 
                : 'Detalle de Consulta Normal (SOAP)'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E2E8F0]">
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Motivo Principal</p>
               <p className="text-sm font-semibold text-[#2C3333]">{selectedConsulta.motivo || 'Consulta General'}</p>
             </div>
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha y Hora</p>
               <p className="text-sm font-semibold text-[#2C3333]">{new Date(selectedConsulta.fecha_cita).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
             </div>
          </div>

          {isGyn ? (
            // Vista de Consulta Ginecológica
            <>
              {selectedConsulta.gyn_motivo && (
                <div>
                   <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Motivo y Enfermedad Actual</p>
                   <div className="bg-[#F8FAFC] rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-[#E2E8F0]">
                     {selectedConsulta.gyn_motivo}
                   </div>
                </div>
              )}

              {(selectedConsulta.gyn_examen_mamario || selectedConsulta.gyn_abdomen_pelvis || selectedConsulta.gyn_especuloscopia || selectedConsulta.gyn_tacto_vaginal) && (
                <div>
                   <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Examen Físico Especializado</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {selectedConsulta.gyn_examen_mamario && (
                       <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                         <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Examen Mamario</span>
                         <p className="text-xs text-gray-700 whitespace-pre-wrap">{selectedConsulta.gyn_examen_mamario}</p>
                       </div>
                     )}
                     {selectedConsulta.gyn_abdomen_pelvis && (
                       <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                         <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Abdomen y Pelvis</span>
                         <p className="text-xs text-gray-700 whitespace-pre-wrap">{selectedConsulta.gyn_abdomen_pelvis}</p>
                       </div>
                     )}
                     {selectedConsulta.gyn_especuloscopia && (
                       <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                         <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Especuloscopía</span>
                         <p className="text-xs text-gray-700 whitespace-pre-wrap">{selectedConsulta.gyn_especuloscopia}</p>
                       </div>
                     )}
                     {selectedConsulta.gyn_tacto_vaginal && (
                       <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                         <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Tacto Vaginal Bimanual</span>
                         <p className="text-xs text-gray-700 whitespace-pre-wrap">{selectedConsulta.gyn_tacto_vaginal}</p>
                       </div>
                     )}
                   </div>
                </div>
              )}
            </>
          ) : (
            // Vista de Consulta Normal SOAP
            <>
              {(selectedConsulta.pa || selectedConsulta.fc || selectedConsulta.fr || selectedConsulta.sato2 || selectedConsulta.glicemia || selectedConsulta.peso) && (
                <div>
                   <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Constantes Vitales</p>
                   <div className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                     {selectedConsulta.pa && <div><span className="text-[10px] text-gray-500 block">PA</span><span className="text-sm font-semibold">{selectedConsulta.pa}</span></div>}
                     {selectedConsulta.fc && <div><span className="text-[10px] text-gray-500 block">FC</span><span className="text-sm font-semibold">{selectedConsulta.fc}</span></div>}
                     {selectedConsulta.fr && <div><span className="text-[10px] text-gray-500 block">FR</span><span className="text-sm font-semibold">{selectedConsulta.fr}</span></div>}
                     {selectedConsulta.sato2 && <div><span className="text-[10px] text-gray-500 block">SatO2</span><span className="text-sm font-semibold">{selectedConsulta.sato2}%</span></div>}
                     {selectedConsulta.glicemia && <div><span className="text-[10px] text-gray-500 block">Glicemia</span><span className="text-sm font-semibold">{selectedConsulta.glicemia}</span></div>}
                     {selectedConsulta.peso && <div><span className="text-[10px] text-gray-500 block">Peso</span><span className="text-sm font-semibold">{selectedConsulta.peso} kg</span></div>}
                   </div>
                </div>
              )}

              {selectedConsulta.sintomas && (
                <div>
                   <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Subjetivo (Síntomas)</p>
                   <div className="bg-[#F8FAFC] rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-[#E2E8F0]">
                     {selectedConsulta.sintomas}
                   </div>
                </div>
              )}

              {selectedConsulta.examen_fisico && (
                <div>
                   <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Examen Físico (Objetivo)</p>
                   <div className="bg-[#F8FAFC] rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-[#E2E8F0]">
                     {selectedConsulta.examen_fisico}
                   </div>
                </div>
              )}
            </>
          )}

          {selectedConsulta.diagnostico && (
            <div>
               <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Apreciación / Diagnóstico</p>
               <div className="bg-white rounded-lg p-3 text-sm text-gray-800 font-bold whitespace-pre-wrap border-l-4 border-[#2563EB] shadow-sm">
                 {selectedConsulta.diagnostico}
               </div>
            </div>
          )}

          {selectedConsulta.plan && (
            <div>
               <p className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">Plan y Tratamiento</p>
               <div className="bg-[#F8FAFC] rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-[#E2E8F0]">
                 {selectedConsulta.plan}
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

import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { repositories } from '../../lib/di';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Save, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Cita } from '../../domain/entities/Cita';

interface SoapFormProps {
  onCancel: () => void;
}

export function SoapForm({ onCancel }: SoapFormProps) {
  const { activePaciente } = useAppContext();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // SOAP Form State
  const [subjetivo, setSubjetivo] = useState('');
  const [examenFisico, setExamenFisico] = useState('');
  const [pa, setPa] = useState('');
  const [fc, setFc] = useState('');
  const [fr, setFr] = useState('');
  const [sato2, setSato2] = useState('');
  const [glicemia, setGlicemia] = useState('');
  const [peso, setPeso] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [plan, setPlan] = useState('');

  if (!activePaciente) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8">
        <p className="text-gray-500 mb-4">Debe seleccionar una paciente primero.</p>
      </div>
    );
  }

  const handleGuardarConsulta = async () => {
    const nuevaCita: Cita = {
      id_cita: uuidv4(),
      cedula_id: activePaciente.cedula_id,
      fecha_cita: new Date().toISOString(),
      estado: 'realizada',
      tipo: 'consulta',
      sintomas: subjetivo,
      motivo: "Consulta Normal (SOAP)",
      examen_fisico: examenFisico,
      pa: pa,
      fc: fc,
      fr: fr,
      sato2: sato2,
      glicemia: glicemia,
      peso: peso,
      diagnostico: diagnostico,
      plan: plan
    };
    
    await repositories.citas.save(nuevaCita);
    setShowConfirmModal(false);
    alert('Consulta SOAP guardada exitosamente.');
    navigate('/historial');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Volver al Menú">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2C3333]">Consulta Médica Normal (SOAP)</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Evolución clínica para: <strong className="text-[#1E3A8A]">{activePaciente.nombre} {activePaciente.apellido}</strong> (CI: {activePaciente.cedula_id})
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-sm">
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); setShowConfirmModal(true); }}>
           <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">Subjetivo (S)</label>
              <textarea value={subjetivo} onChange={e => setSubjetivo(e.target.value)} rows={3} placeholder="Motivo de consulta y síntomas referidos por la paciente..." className="border border-[#CBD5E1] rounded-lg p-3 text-sm focus:outline-none focus:border-[#2563EB] resize-none focus:ring-1 focus:ring-[#2563EB]" required></textarea>
           </div>

           <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">Objetivo (O) - Examen Físico y Constantes</label>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">PA</label>
                   <input value={pa} onChange={e => setPa(e.target.value)} type="text" placeholder="120/80" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">FC (lpm)</label>
                   <input value={fc} onChange={e => setFc(e.target.value)} type="number" min="0" placeholder="75" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">FR (rpm)</label>
                   <input value={fr} onChange={e => setFr(e.target.value)} type="number" min="0" placeholder="16" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SatO2 (%)</label>
                   <input value={sato2} onChange={e => setSato2(e.target.value)} type="number" min="0" placeholder="98" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Glicemia</label>
                   <input value={glicemia} onChange={e => setGlicemia(e.target.value)} type="number" min="0" placeholder="90" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Peso (kg)</label>
                   <input value={peso} onChange={e => setPeso(e.target.value)} type="number" min="0" step="0.1" placeholder="65.5" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
              </div>
              <textarea value={examenFisico} onChange={e => setExamenFisico(e.target.value)} rows={3} placeholder="Observaciones al examen físico general y regional..." className="border border-[#CBD5E1] rounded-lg p-3 text-sm focus:outline-none focus:border-[#2563EB] resize-none focus:ring-1 focus:ring-[#2563EB]" required></textarea>
           </div>

           <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">Apreciación / Diagnóstico (A)</label>
              <input value={diagnostico} onChange={e => setDiagnostico(e.target.value)} type="text" placeholder="Ej. Control Prenatal / ITU / Candidiasis..." className="border border-[#CBD5E1] rounded p-2.5 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" required/>
           </div>

           <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">Plan y Tratamiento (P)</label>
              <textarea value={plan} onChange={e => setPlan(e.target.value)} rows={3} placeholder="Indicaciones farmacológicas, solicitudes de estudio, reposo, etc..." className="border border-[#CBD5E1] rounded-lg p-3 text-sm focus:outline-none focus:border-[#2563EB] resize-none focus:ring-1 focus:ring-[#2563EB]" required></textarea>
           </div>
           
           <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
             <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors">Cancelar</button>
             <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1D4ED8] shadow-sm transition-colors cursor-pointer">
                <Save className="w-4 h-4 mr-2" /> Registrar SOAP
             </button>
           </div>
        </form>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#2C3333]">Confirmar Registro</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Este registro de consulta SOAP se añadirá permanentemente a la historia clínica. ¿Desea confirmarlo ahora?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-[#E2E8F0] text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleGuardarConsulta}
                  className="flex-1 py-2.5 rounded-lg bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                >
                  Confirmar y Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

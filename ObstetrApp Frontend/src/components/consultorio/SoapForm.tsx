import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { repositories } from '../../lib/di';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Save, AlertTriangle, ArrowLeft, CheckCircle2, FileText, History } from 'lucide-react';
import { Cita } from '../../domain/entities/Cita';

interface SoapFormProps {
  onCancel: () => void;
}

export function SoapForm({ onCancel }: SoapFormProps) {
  const { activePaciente } = useAppContext();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    if (isSaving) return;
    setIsSaving(true);
    try {
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
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error guardando consulta SOAP:", error);
      alert("Ocurrió un error al guardar la consulta.");
    } finally {
      setIsSaving(false);
    }
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
                   <input value={fc} onFocus={e => e.target.select()} onChange={e => setFc(e.target.value)} type="number" min="0" placeholder="75" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">FR (rpm)</label>
                   <input value={fr} onFocus={e => e.target.select()} onChange={e => setFr(e.target.value)} type="number" min="0" placeholder="16" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SatO2 (%)</label>
                   <input value={sato2} onFocus={e => e.target.select()} onChange={e => setSato2(e.target.value)} type="number" min="0" placeholder="98" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Glicemia</label>
                   <input value={glicemia} onFocus={e => e.target.select()} onChange={e => setGlicemia(e.target.value)} type="number" min="0" placeholder="90" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Peso (kg)</label>
                   <input value={peso} onFocus={e => e.target.select()} onChange={e => setPeso(e.target.value)} type="number" min="0" step="0.1" placeholder="65.5" className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
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
                  disabled={isSaving}
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-[#E2E8F0] text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  disabled={isSaving}
                  onClick={handleGuardarConsulta}
                  className="flex-1 py-2.5 rounded-lg bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1D4ED8] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? 'Guardando...' : 'Confirmar y Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito tras guardar */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-[#2C3333] mb-2">¡Consulta SOAP Guardada!</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                La evolución clínica se guardó correctamente en el expediente de <strong className="text-[#1E3A8A]">{activePaciente.nombre} {activePaciente.apellido}</strong>.
              </p>
              
              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => navigate('/recetas')}
                  className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Ir a Receta / Documentos
                </button>
                <button 
                  onClick={() => navigate('/historial')}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E2E8F0] text-gray-700 hover:bg-gray-50 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4" /> Ver Historial Clínico
                </button>
                <button 
                  onClick={onCancel}
                  className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 font-semibold transition-colors cursor-pointer"
                >
                  Volver al Menú del Consultorio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


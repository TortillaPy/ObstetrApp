import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Save, ArrowLeft, CheckCircle2, FileText, History } from 'lucide-react';
import { repositories } from '../../lib/di';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Cita } from '../../domain/entities/Cita';

interface GinecologiaFormProps {
  onCancel: () => void;
}

export function GinecologiaForm({ onCancel }: GinecologiaFormProps) {
  const { activePaciente, setActivePaciente } = useAppContext();
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Antecedentes
  const [menarca, setMenarca] = useState<number | ''>('');
  const [fum, setFum] = useState('');
  const [ritmoMenstrual, setRitmoMenstrual] = useState('');
  const [metodoAnticonc, setMetodoAnticonc] = useState('no');
  const [dismenorrea, setDismenorrea] = useState(false);
  const [dispareunia, setDispareunia] = useState(false);
  const [sangradoAnormal, setSangradoAnormal] = useState(false);
  const [flujoVaginal, setFlujoVaginal] = useState(false);

  // Evolución actual
  const [motivo, setMotivo] = useState('');
  const [examenMamario, setExamenMamario] = useState('');
  const [abdomenPelvis, setAbdomenPelvis] = useState('');
  const [especuloscopia, setEspeculoscopia] = useState('');
  const [tactoVaginal, setTactoVaginal] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [plan, setPlan] = useState('');

  useEffect(() => {
    if (activePaciente) {
      setMenarca(activePaciente.menarca !== undefined ? activePaciente.menarca : '');
      setFum(activePaciente.fum || '');
      setRitmoMenstrual(activePaciente.ritmo_menstrual || '');
      setMetodoAnticonc(activePaciente.metodo_anticonceptivo || 'no');
      setDismenorrea(activePaciente.tiene_dismenorrea || false);
      setDispareunia(activePaciente.tiene_dispareunia || false);
      setSangradoAnormal(activePaciente.tiene_sangrado_anormal || false);
      setFlujoVaginal(activePaciente.tiene_flujo_vaginal || false);
    }
  }, [activePaciente]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaciente || isSaving) return;

    setIsSaving(true);
    try {
      // Actualizar paciente con los antecedentes (para que sean visibles cuando se edite y se usen en H. Perinatal)
      const updatedPaciente = {
        ...activePaciente,
        menarca: menarca !== '' ? Number(menarca) : undefined,
        fum,
        ritmo_menstrual: ritmoMenstrual,
        metodo_anticonceptivo: metodoAnticonc,
        tiene_dismenorrea: dismenorrea,
        tiene_dispareunia: dispareunia,
        tiene_sangrado_anormal: sangradoAnormal,
        tiene_flujo_vaginal: flujoVaginal
      };

      await repositories.pacientes.update(activePaciente.cedula_id, updatedPaciente);
      setActivePaciente(updatedPaciente);

      // Guardar la evolución como una Cita en el historial clínico
      const nuevaConsultaGyn: Cita = {
        id_cita: uuidv4(),
        cedula_id: activePaciente.cedula_id,
        fecha_cita: new Date().toISOString(),
        estado: 'realizada',
        tipo: 'consulta',
        motivo: 'Consulta Ginecológica',
        diagnostico: diagnostico,
        plan: plan,
        
        // Campos ginecológicos especializados
        gyn_motivo: motivo,
        gyn_examen_mamario: examenMamario,
        gyn_abdomen_pelvis: abdomenPelvis,
        gyn_especuloscopia: especuloscopia,
        gyn_tacto_vaginal: tactoVaginal
      };

      await repositories.citas.save(nuevaConsultaGyn);

      // Limpiamos los estados
      setMotivo('');
      setExamenMamario('');
      setAbdomenPelvis('');
      setEspeculoscopia('');
      setTactoVaginal('');
      setDiagnostico('');
      setPlan('');
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error guardando consulta ginecológica:", error);
      alert("Ocurrió un error al guardar la consulta ginecológica.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!activePaciente) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8">
        <p className="text-gray-500 mb-4">Debe seleccionar una paciente primero.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Volver al Menú">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#2C3333]">Consulta Ginecológica</h2>
          <p className="text-xs text-gray-500 mt-0.5">Evaluación ginecológica integral para: <strong className="text-[#0D9488]">{activePaciente.nombre} {activePaciente.apellido}</strong> (CI: {activePaciente.cedula_id})</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-6 md:p-8">
        <form onSubmit={handleGuardar} className="space-y-8">
          
          {/* Motivo e Historia Atual */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0D9488] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">Motivo y Enfermedad Actual</h3>
            <div>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)} className="w-full rounded-lg border border-[#CBD5E1] bg-white p-3 text-sm focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488] resize-none" rows={3} placeholder="Describa el motivo principal de la consulta y la evolución de los síntomas..."></textarea>
            </div>
          </div>

          {/* Antecedentes Ginecológicos */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-[#0D9488] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">Hitos y Antecedentes Ginecológicos</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Menarca (Edad)</label>
                  <input type="number" min="0" value={menarca} onChange={e => setMenarca(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ej. 12" className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">F.U.M.</label>
                  <input type="date" value={fum} onChange={e => setFum(e.target.value)} className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ritmo Menstrual</label>
                  <input type="text" value={ritmoMenstrual} onChange={e => setRitmoMenstrual(e.target.value)} placeholder="Ej. 28/4" className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Método Anticonc. (MAC)</label>
                  <select value={metodoAnticonc} onChange={e => setMetodoAnticonc(e.target.value)} className="border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] bg-white">
                    <option value="no">No usa</option>
                    <option value="barrera">Barrera</option>
                    <option value="diu">DIU</option>
                    <option value="hormonal">Hormonal</option>
                    <option value="emergencia">Emergencia</option>
                    <option value="natural">Natural</option>
                  </select>
                </div>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
               <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer">
                 <input type="checkbox" checked={dismenorrea} onChange={e => setDismenorrea(e.target.checked)} className="rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]" />
                 Dismenorrea
               </label>
               <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer">
                 <input type="checkbox" checked={dispareunia} onChange={e => setDispareunia(e.target.checked)} className="rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]" />
                 Dispareunia
               </label>
               <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer">
                 <input type="checkbox" checked={sangradoAnormal} onChange={e => setSangradoAnormal(e.target.checked)} className="rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]" />
                 Sangrado Anormal
               </label>
               <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer">
                 <input type="checkbox" checked={flujoVaginal} onChange={e => setFlujoVaginal(e.target.checked)} className="rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]" />
                 Flujo Vaginal
               </label>
             </div>
          </div>

          {/* Examen Físico */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-[#0D9488] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">Examen Físico Especializado</h3>
             <div className="grid md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Examen Mamario</label>
                 <textarea value={examenMamario} onChange={e => setExamenMamario(e.target.value)} rows={2} placeholder="Inspección y palpación. Simetría, nódulos, secreciones..." className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] resize-none"></textarea>
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Abdomen y Pelvis</label>
                 <textarea value={abdomenPelvis} onChange={e => setAbdomenPelvis(e.target.value)} rows={2} placeholder="Dolor a la palpación profunda en FII, sin masas palpables..." className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] resize-none"></textarea>
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Especuloscopía</label>
                 <textarea value={especuloscopia} onChange={e => setEspeculoscopia(e.target.value)} rows={2} placeholder="Vulva trófica, cuello sano, flujo fisiológico..." className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] resize-none"></textarea>
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tacto Vaginal Bimanual</label>
                 <textarea value={tactoVaginal} onChange={e => setTactoVaginal(e.target.value)} rows={2} placeholder="Útero en AVF, tamaño normal, anexos libres no dolorosos..." className="border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] resize-none"></textarea>
               </div>
             </div>
          </div>

          {/* Diagnóstico y Plan */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-[#0D9488] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">Conclusiones y Conducta</h3>
             <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Diagnóstico Principal</label>
                <input value={diagnostico} onChange={e => setDiagnostico(e.target.value)} type="text" placeholder="Ej. Candidiasis Vaginal / Control Ginecológico en Salud" className="w-full border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]" />
             </div>
             <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Plan de Tratamiento y Estudios</label>
                <textarea value={plan} onChange={e => setPlan(e.target.value)} rows={3} placeholder="Óvulos, cremas, solicitud de ecografía transvaginal, mamografía..." className="w-full border border-[#CBD5E1] rounded p-2 text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] resize-none"></textarea>
             </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
             <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors">Cancelar</button>
             <button 
               disabled={isSaving}
               type="submit" 
               className="inline-flex items-center gap-2 rounded-lg bg-[#0D9488] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0F766E] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
             >
                <Save className="w-4 h-4"/> {isSaving ? 'Guardando...' : 'Guardar Evolución'}
             </button>
          </div>
        </form>
      </div>

      {/* Modal de éxito tras guardar */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 text-[#0D9488] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-[#2C3333] mb-2">¡Consulta Ginecológica Guardada!</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                La evolución clínica ginecológica se guardó correctamente en el expediente de <strong className="text-[#0D9488]">{activePaciente.nombre} {activePaciente.apellido}</strong>.
              </p>
              
              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => navigate('/recetas')}
                  className="w-full py-3 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
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

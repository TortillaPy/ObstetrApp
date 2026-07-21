import React, { useState, useEffect } from 'react';
import { useAppContext } from '../components/AppContext';
import { repositories } from '../lib/di';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Save, Image, FileText, FlaskConical, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Cita } from '../domain/entities/Cita';
import { Laboratorio, ToxoplasmosisVal, SifilisVDLR, SifilisTratamiento, EstreptococoB } from '../domain/entities/Laboratorio';

const optionsNormalAnormal = [
  { value: 'normal', label: 'NORMAL' },
  { value: 'anormal', label: 'ANORMAL' },
  { value: 'no_se_hizo', label: 'NO SE HIZO' }
];

export function Estudios() {
  const { activePaciente, activeEmbarazo } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'eco' | 'pap' | 'lab'>('eco');

  // Eco form state
  const [ecoFecha, setEcoFecha] = useState(new Date().toISOString().split('T')[0]);
  const [ecoEg, setEcoEg] = useState('');
  const [ecoPeso, setEcoPeso] = useState('');
  const [ecoIla, setEcoIla] = useState('');
  const [ecoDiagnostico, setEcoDiagnostico] = useState('');

  // PAP form state
  const [papFecha, setPapFecha] = useState(new Date().toISOString().split('T')[0]);
  const [papAspecto, setPapAspecto] = useState('Sano');
  const [papResultado, setPapResultado] = useState('Negativo para lesión intraepitelial o malignidad (NILM)');
  const [papObservaciones, setPapObservaciones] = useState('');

  // Lab form state
  const [laboratorio, setLaboratorio] = useState<Laboratorio | null>(null);
  const [loadingLab, setLoadingLab] = useState(false);
  const [savingLab, setSavingLab] = useState(false);

  // Load laboratorios if pregnancy is active
  useEffect(() => {
    async function loadLab() {
      if (!activePaciente || !activeEmbarazo || activeTab !== 'lab') return;
      setLoadingLab(true);
      try {
        let lab = await repositories.laboratorios.getByEmbarazoId(activeEmbarazo.id_embarazo);
        if (!lab) {
          lab = {
            embarazo_id: activeEmbarazo.id_embarazo,
            isoinmunizacion_rh: 0
          };
          await repositories.laboratorios.save(lab);
        }
        setLaboratorio(lab);
      } finally {
        setLoadingLab(false);
      }
    }
    loadLab();
  }, [activePaciente, activeEmbarazo, activeTab]);

  if (!activePaciente) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8">
        <p className="text-gray-500 mb-4">Debe seleccionar una paciente primero en el módulo de Pacientes.</p>
        <button onClick={() => navigate('/pacientes')} className="px-4 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#172554] font-bold text-sm">
          Ir al Directorio
        </button>
      </div>
    );
  }

  const handleGuardarEco = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevaCita: Cita = {
      id_cita: uuidv4(),
      cedula_id: activePaciente.cedula_id,
      fecha_cita: ecoFecha ? new Date(ecoFecha).toISOString() : new Date().toISOString(),
      estado: 'realizada',
      tipo: 'eco',
      motivo: "Ecografía Obstétrica / Ginecológica",
      eco_eg: ecoEg,
      eco_peso: ecoPeso,
      eco_ila: ecoIla,
      eco_diagnostico: ecoDiagnostico
    };
    await repositories.citas.save(nuevaCita);
    alert('Estudio ecográfico guardado exitosamente.');
    navigate('/historial');
  };

  const handleGuardarPap = async (e: React.FormEvent) => {
    e.preventDefault();
    const nuevaCita: Cita = {
      id_cita: uuidv4(),
      cedula_id: activePaciente.cedula_id,
      fecha_cita: papFecha ? new Date(papFecha).toISOString() : new Date().toISOString(),
      estado: 'realizada',
      tipo: 'pap',
      motivo: "Papanicolaou y Colposcopia",
      pap_aspecto: papAspecto,
      pap_resultado: papResultado,
      pap_observaciones: papObservaciones
    };
    await repositories.citas.save(nuevaCita);
    alert('Estudio de Papanicolaou guardado exitosamente.');
    navigate('/historial');
  };

  const handleGuardarLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laboratorio) return;
    setSavingLab(true);
    try {
      await repositories.laboratorios.update(laboratorio.embarazo_id, laboratorio);
      alert('Resultados de laboratorio guardados exitosamente.');
      navigate('/historial');
    } catch (err) {
      console.error(err);
      alert('Error al guardar laboratorios.');
    } finally {
      setSavingLab(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-4 md:p-8 w-full max-w-5xl mx-auto overflow-y-auto custom-scrollbar">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#2C3333]">Carga de Estudios</h2>
          <p className="text-gray-500 mt-1">
            Registro de resultados diagnósticos para: <strong className="text-[#1E3A8A]">{activePaciente.nombre} {activePaciente.apellido}</strong> (CI: {activePaciente.cedula_id})
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col min-h-[500px] overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
          <button
            onClick={() => setActiveTab('eco')}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === 'eco'
                ? "text-[#1E3A8A] border-[#1E3A8A]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            )}
          >
            <Image className="w-4 h-4" /> Ecografía
          </button>
          <button
            onClick={() => setActiveTab('pap')}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === 'pap'
                ? "text-[#1E3A8A] border-[#1E3A8A]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            )}
          >
            <FileText className="w-4 h-4" /> Papanicolaou
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors",
              activeTab === 'lab'
                ? "text-[#1E3A8A] border-[#1E3A8A]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            )}
          >
            <FlaskConical className="w-4 h-4" /> Laboratorio
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto custom-scrollbar">
          {activeTab === 'eco' && (
            <form onSubmit={handleGuardarEco} className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha del Estudio *</label>
                  <input required type="date" value={ecoFecha} onChange={e => setEcoFecha(e.target.value)} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Edad Gestacional (Semanas)</label>
                  <input type="text" placeholder="Ej: 22" value={ecoEg} onChange={e => setEcoEg(e.target.value)} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Peso Fetal Estimado (PFE - gramos)</label>
                  <input type="number" placeholder="Ej: 450" value={ecoPeso} onChange={e => setEcoPeso(e.target.value)} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Índice de Líquido Amniótico (ILA)</label>
                  <input type="text" placeholder="Ej: 14 o Normal" value={ecoIla} onChange={e => setEcoIla(e.target.value)} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Diagnóstico / Conclusión Ecográfica *</label>
                  <textarea required value={ecoDiagnostico} onChange={e => setEcoDiagnostico(e.target.value)} rows={3} placeholder="Detalle las mediciones, vitalidad fetal y conclusiones del estudio..." className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] resize-none"></textarea>
                </div>
              </div>
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#172554] shadow-sm transition-colors">
                  <Save className="w-4 h-4" /> Guardar Ecografía
                </button>
              </div>
            </form>
          )}

          {activeTab === 'pap' && (
            <form onSubmit={handleGuardarPap} className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha de Toma *</label>
                  <input required type="date" value={papFecha} onChange={e => setPapFecha(e.target.value)} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aspecto de Cuello Uterino *</label>
                  <input required type="text" value={papAspecto} onChange={e => setPapAspecto(e.target.value)} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Resultado (Sistema Bethesda) *</label>
                  <input required type="text" value={papResultado} onChange={e => setPapResultado(e.target.value)} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Observaciones Colposcópicas / Detalles</label>
                  <textarea value={papObservaciones} onChange={e => setPapObservaciones(e.target.value)} rows={3} placeholder="Describa hallazgos colposcópicos complementarios..." className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] resize-none"></textarea>
                </div>
              </div>
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#172554] shadow-sm transition-colors">
                  <Save className="w-4 h-4" /> Guardar Papanicolaou
                </button>
              </div>
            </form>
          )}

          {activeTab === 'lab' && (
            !activeEmbarazo ? (
              <div className="flex flex-col items-center justify-center p-8 bg-amber-50/50 rounded-xl border border-amber-100 text-center max-w-lg mx-auto">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                <h4 className="font-bold text-sm text-amber-800 uppercase tracking-wider mb-2">No hay embarazo activo</h4>
                <p className="text-xs text-amber-700/80 leading-relaxed mb-4">
                  El panel de laboratorios está vinculado a los resultados gestacionales del embarazo en curso. Por favor, inicie primero un control de embarazo activo en el carnet de la paciente.
                </p>
                <button onClick={() => navigate('/perinatal')} className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#172554] transition-colors">
                  Ir a Control Perinatal
                </button>
              </div>
            ) : loadingLab ? (
              <p className="text-gray-500 text-xs italic">Cargando datos del laboratorio...</p>
            ) : laboratorio ? (
              <form onSubmit={handleGuardarLab} className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {/* Toxoplasmosis */}
                   <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
                       <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">Toxoplasmosis</h4>
                       <div className="space-y-4">
                          <SelectLabEnum label="<20 sem IgG" value={laboratorio.toxo_menor_20sem_igg || ''} onChange={(v) => setLaboratorio({ ...laboratorio, toxo_menor_20sem_igg: v as ToxoplasmosisVal })} />
                          <SelectLabEnum label=">=20 sem IgG" value={laboratorio.toxo_mayor_20sem_igg || ''} onChange={(v) => setLaboratorio({ ...laboratorio, toxo_mayor_20sem_igg: v as ToxoplasmosisVal })} />
                          <SelectLabEnum label="1ra consulta IgM" value={laboratorio.toxo_primera_consulta_igm || ''} onChange={(v) => setLaboratorio({ ...laboratorio, toxo_primera_consulta_igm: v as ToxoplasmosisVal })} />
                       </div>
                   </div>

                   {/* Glucemia */}
                   <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
                       <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">Glucemia en Ayunas</h4>
                       <div className="space-y-4 flex flex-col">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 font-medium">&lt;20 sem (mg/dl)</label>
                            <input type="number" min="0" value={laboratorio.glucemia_menor_20sem || ''} onChange={(e) => setLaboratorio({ ...laboratorio, glucemia_menor_20sem: e.target.value ? Number(e.target.value) : undefined })} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 font-medium">&ge;30 sem (mg/dl)</label>
                            <input type="number" min="0" value={laboratorio.glucemia_mayor_30sem || ''} onChange={(e) => setLaboratorio({ ...laboratorio, glucemia_mayor_30sem: e.target.value ? Number(e.target.value) : undefined })} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 font-medium">TTGO (mg/dl)</label>
                            <input type="number" min="0" value={laboratorio.ttgo_resultado_mg_dl || ''} onChange={(e) => setLaboratorio({ ...laboratorio, ttgo_resultado_mg_dl: e.target.value ? Number(e.target.value) : undefined })} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                          </div>
                       </div>
                   </div>

                   {/* Sífilis */}
                   <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
                       <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">Sífilis (VDRL/RPR)</h4>
                       <div className="space-y-4">
                          <SelectLabEnum label="<20 sem VDRL" value={laboratorio.sifilis_vdrl_menor_20sem || ''} onChange={(v) => setLaboratorio({ ...laboratorio, sifilis_vdrl_menor_20sem: v as SifilisVDLR })} />
                          <SelectLabEnum label=">=20 sem VDRL" value={laboratorio.sifilis_vdrl_mayor_20sem || ''} onChange={(v) => setLaboratorio({ ...laboratorio, sifilis_vdrl_mayor_20sem: v as SifilisVDLR })} />
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer mt-2">
                             <input type="checkbox" checked={laboratorio.sifilis_confirmada_fta === 1} onChange={() => setLaboratorio({ ...laboratorio, sifilis_confirmada_fta: laboratorio.sifilis_confirmada_fta === 1 ? 0 : 1 })} className="rounded border-[#E2E8F0] text-[#2563EB]" />
                             Confirmada FTA
                          </label>
                          <div className="flex flex-col gap-1.5 mt-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tratamiento</label>
                            <select value={laboratorio.sifilis_tratamiento || 'no_corresponde'} onChange={(e) => setLaboratorio({ ...laboratorio, sifilis_tratamiento: e.target.value as SifilisTratamiento })} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]">
                              <option value="no_corresponde">No Corresponde</option>
                              <option value="si">Sí</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                       </div>
                   </div>

                   {/* VIH */}
                   <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
                       <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">VIH</h4>
                       <div className="space-y-4">
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">&lt;20 semanas</p>
                             <div className="flex gap-4 items-center mb-2">
                               <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                  <input type="checkbox" checked={laboratorio.vih_menor_20sem_solicitado === 1} onChange={() => setLaboratorio({ ...laboratorio, vih_menor_20sem_solicitado: laboratorio.vih_menor_20sem_solicitado === 1 ? 0 : 1 })} className="rounded border-[#E2E8F0] text-[#2563EB]" /> Sol.
                               </label>
                               <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                  <input type="checkbox" checked={laboratorio.vih_menor_20sem_realizado === 1} onChange={() => setLaboratorio({ ...laboratorio, vih_menor_20sem_realizado: laboratorio.vih_menor_20sem_realizado === 1 ? 0 : 1 })} className="rounded border-[#E2E8F0] text-[#2563EB]" /> Real.
                               </label>
                             </div>
                             <SelectLabEnum label="Resultado" value={laboratorio.vih_menor_20sem_resultado || ''} onChange={(v) => setLaboratorio({ ...laboratorio, vih_menor_20sem_resultado: v as any })} options={[{ value: '-', label: 'NEGATIVO (-)' }, { value: '+', label: 'POSITIVO (+)' }]} />
                          </div>
                          <div className="border-t border-[#E2E8F0] pt-4">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">&ge;20 semanas</p>
                             <div className="flex gap-4 items-center mb-2">
                               <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                  <input type="checkbox" checked={laboratorio.vih_mayor_20sem_solicitado === 1} onChange={() => setLaboratorio({ ...laboratorio, vih_mayor_20sem_solicitado: laboratorio.vih_mayor_20sem_solicitado === 1 ? 0 : 1 })} className="rounded border-[#E2E8F0] text-[#2563EB]" /> Sol.
                               </label>
                               <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                  <input type="checkbox" checked={laboratorio.vih_mayor_20sem_realizado === 1} onChange={() => setLaboratorio({ ...laboratorio, vih_mayor_20sem_realizado: laboratorio.vih_mayor_20sem_realizado === 1 ? 0 : 1 })} className="rounded border-[#E2E8F0] text-[#2563EB]" /> Real.
                               </label>
                             </div>
                             <SelectLabEnum label="Resultado" value={laboratorio.vih_mayor_20sem_resultado || ''} onChange={(v) => setLaboratorio({ ...laboratorio, vih_mayor_20sem_resultado: v as any })} options={[{ value: '-', label: 'NEGATIVO (-)' }, { value: '+', label: 'POSITIVO (+)' }]} />
                          </div>
                       </div>
                   </div>

                   {/* Hemoglobina */}
                   <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
                       <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">Hemoglobina (Hb)</h4>
                       <div className="space-y-4 flex flex-col">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 font-medium">&lt;20 sem (g/dl)</label>
                            <input type="number" step="0.1" min="0" value={laboratorio.hb_menor_20sem || ''} onChange={(e) => setLaboratorio({ ...laboratorio, hb_menor_20sem: e.target.value ? Number(e.target.value) : undefined })} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 font-medium">&ge;20 sem (g/dl)</label>
                            <input type="number" step="0.1" min="0" value={laboratorio.hb_mayor_20sem || ''} onChange={(e) => setLaboratorio({ ...laboratorio, hb_mayor_20sem: e.target.value ? Number(e.target.value) : undefined })} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                          </div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer mt-2">
                             <input type="checkbox" checked={laboratorio.hierro_folatos_indicados === 1} onChange={() => setLaboratorio({ ...laboratorio, hierro_folatos_indicados: laboratorio.hierro_folatos_indicados === 1 ? 0 : 1 })} className="rounded border-[#E2E8F0] text-[#2563EB]" />
                             Hierro/Folatos Indicados
                          </label>
                       </div>
                   </div>

                   {/* Otros Exámenes */}
                   <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
                       <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">Otros Exámenes</h4>
                       <div className="space-y-3 flex flex-col">
                          <SelectLabEnum label="Chagas" value={laboratorio.chagas || ''} onChange={(v) => setLaboratorio({ ...laboratorio, chagas: v as any })} />
                          <SelectLabEnum label="Paludismo / Malaria" value={laboratorio.paludismo_malaria || ''} onChange={(v) => setLaboratorio({ ...laboratorio, paludismo_malaria: v as any })} />
                          <SelectLabEnum label="Estreptococo B" value={laboratorio.estreptococo_b || ''} onChange={(v) => setLaboratorio({ ...laboratorio, estreptococo_b: v as any })} />
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 font-medium">TSH (uUI/ml)</label>
                            <input type="number" step="0.01" min="0" value={laboratorio.tsh_valor || ''} onChange={(e) => setLaboratorio({ ...laboratorio, tsh_valor: e.target.value ? Number(e.target.value) : undefined })} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 font-medium">Hepatitis B (HBsAg)</label>
                            <input type="text" value={laboratorio.hb_hepatitis_b || ''} onChange={(e) => setLaboratorio({ ...laboratorio, hb_hepatitis_b: e.target.value })} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
                          </div>
                       </div>
                   </div>

                   {/* Educación y Prevención */}
                   <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5 md:col-span-2 lg:col-span-3">
                       <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">Educación y Prevención</h4>
                       <div className="flex gap-8 items-center flex-wrap">
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer">
                             <input type="checkbox" checked={laboratorio.preparacion_parto === 1} onChange={() => setLaboratorio({ ...laboratorio, preparacion_parto: laboratorio.preparacion_parto === 1 ? 0 : 1 })} className="rounded border-[#E2E8F0] text-[#2563EB]" />
                             Preparación Parto
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer">
                             <input type="checkbox" checked={laboratorio.consejeria_lactancia === 1} onChange={() => setLaboratorio({ ...laboratorio, consejeria_lactancia: laboratorio.consejeria_lactancia === 1 ? 0 : 1 })} className="rounded border-[#E2E8F0] text-[#2563EB]" />
                             Consejería Lactancia
                          </label>
                          <SelectLabEnum label="Bacteriuria Resultado" value={laboratorio.bacteriuria_resultado || ''} onChange={(v) => setLaboratorio({ ...laboratorio, bacteriuria_resultado: v as any })} options={optionsNormalAnormal} />
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bacteriuria Semanas</label>
                            <select value={laboratorio.bacteriuria_semanas || ''} onChange={(e) => setLaboratorio({ ...laboratorio, bacteriuria_semanas: e.target.value as any })} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]">
                              <option value="">Seleccione...</option>
                              <option value="<20_sem">&lt;20 Semanas</option>
                              <option value=">=20_sem">&ge;20 Semanas</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer">
                             <input type="checkbox" checked={laboratorio.isoinmunizacion_rh === 1} onChange={() => setLaboratorio({ ...laboratorio, isoinmunizacion_rh: laboratorio.isoinmunizacion_rh === 1 ? 0 : 1 })} className="rounded border-[#E2E8F0] text-[#2563EB]" />
                             Isoinmunización Rh
                          </label>
                       </div>
                   </div>
                </div>
                <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                  <button type="submit" disabled={savingLab} className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#172554] shadow-sm transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" /> {savingLab ? 'Guardando...' : 'Guardar Laboratorios'}
                  </button>
                </div>
              </form>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

function SelectLabEnum({ label, value, onChange, options }: { label: string, value: string, onChange: (v: any) => void, options?: { value: string, label: string }[] }) {
  const defaultOpts = [
    { value: 'negativo', label: 'NEGATIVO' },
    { value: 'positivo', label: 'POSITIVO' },
    { value: 'no_se_hizo', label: 'NO SE HIZO' }
  ];
  const list = options || defaultOpts;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]">
        <option value="">Seleccione...</option>
        {list.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

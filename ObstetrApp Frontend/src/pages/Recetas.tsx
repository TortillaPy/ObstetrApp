import React, { useState, useEffect } from 'react';
import { useAppContext } from '../components/AppContext';
import { repositories } from '../lib/di';
import { Printer, CalendarDays, User, Plus, Trash2, FileText, Activity, FlaskConical, CalendarClock, Stethoscope, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrintHeader } from '../components/PrintHeader';
import { DOCTOR_CONFIG } from '../lib/config';
import { v4 as uuidv4 } from 'uuid';
import { Receta } from '../domain/entities/Receta';
import { Reposo } from '../domain/entities/Reposo';
import { SolicitudLaboratorio } from '../domain/entities/SolicitudLaboratorio';

const labExams = [
  {
    category: 'Hematología / Bioquímica',
    items: [
      { key: 'hemoglobina', label: 'Hemoglobina (Hb) / Hemograma Completo' },
      { key: 'glucemia_ayunas', label: 'Glucemia en Ayunas' },
      { key: 'ttgo', label: 'TTGO (Test de Tolerancia Oral a la Glucosa)' }
    ]
  },
  {
    category: 'Serología e Inmunología',
    items: [
      { key: 'toxoplasmosis', label: 'Toxoplasmosis (IgG / IgM)' },
      { key: 'vih', label: 'VIH (Test Rápido / ELISA)' },
      { key: 'sifilis', label: 'Sífilis (VDRL / RPR / FTA-Abs)' },
      { key: 'hepatitis_b', label: 'Hepatitis B (HBsAg)' },
      { key: 'chagas', label: 'Chagas (ELISA)' },
      { key: 'paludismo', label: 'Paludismo / Malaria' }
    ]
  },
  {
    category: 'Microbiología y Orina',
    items: [
      { key: 'estreptococo_b', label: 'Cultivo de Estreptococo B (Beta-hemolítico)' },
      { key: 'urocultivo', label: 'Urocultivo / Orina Simple y Sedimento' }
    ]
  },
  {
    category: 'Endocrinología',
    items: [
      { key: 'tsh', label: 'TSH (Función Tiroidea)' }
    ]
  }
];

export function Recetas() {
  const { activePaciente } = useAppContext();
  const navigate = useNavigate();

  // Tab navigation: 'receta' | 'reposo' | 'laboratorio'
  const [activeTab, setActiveTab] = useState<'receta' | 'reposo' | 'laboratorio'>('receta');
  const [historyLoading, setHistoryLoading] = useState(false);

  // History states
  const [recetasEmitidas, setRecetasEmitidas] = useState<Receta[]>([]);
  const [repososEmitidos, setRepososEmitidos] = useState<Reposo[]>([]);
  const [laboratoriosEmitidos, setLaboratoriosEmitidos] = useState<SolicitudLaboratorio[]>([]);

  // 1. Receta Form State
  const [medicamentos, setMedicamentos] = useState([{ medicamento: '', posologia: '' }]);
  const [indicaciones, setIndicaciones] = useState<string>('');

  // 2. Reposo Form State
  const [diasReposo, setDiasReposo] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [tipoReposo, setTipoReposo] = useState('Físico y Laboral');
  const [reposoObservaciones, setReposoObservaciones] = useState('');

  // 3. Laboratorio Form State
  const [checkedEstudios, setCheckedEstudios] = useState<Record<string, boolean>>({});
  const [labObservaciones, setLabObservaciones] = useState('');

  // Print execution states
  const [printDocType, setPrintDocType] = useState<'receta' | 'reposo' | 'laboratorio'>('receta');
  const [printData, setPrintData] = useState<any>(null);

  const loadHistory = async () => {
    if (!activePaciente) return;
    setHistoryLoading(true);
    try {
      const recs = await repositories.recetas.getByCedulaId(activePaciente.cedula_id);
      setRecetasEmitidas(recs.sort((a,b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime()));

      const reps = await repositories.reposos.getByCedulaId(activePaciente.cedula_id);
      setRepososEmitidos(reps.sort((a,b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime()));

      const labs = await repositories.solicitudesLaboratorio.getByCedulaId(activePaciente.cedula_id);
      setLaboratoriosEmitidos(labs.sort((a,b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime()));
    } catch (e) {
      console.error("Error al cargar historial de recetas/documentos:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [activePaciente]);

  if (!activePaciente) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8 print:hidden">
        <p className="text-gray-500 mb-4">Debe seleccionar una paciente primero.</p>
        <button onClick={() => navigate('/pacientes')} className="px-4 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#172554] font-bold text-sm cursor-pointer shadow-sm">
          Ir al Directorio
        </button>
      </div>
    );
  }

  // Medications Helpers
  const addMedicamento = () => setMedicamentos([...medicamentos, { medicamento: '', posologia: '' }]);
  const updateMedicamento = (index: number, key: string, value: string) => {
    const newMeds = [...medicamentos];
    newMeds[index] = { ...newMeds[index], [key]: value };
    setMedicamentos(newMeds);
  };
  const removeMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const getEdad = (fn?: string) => {
    if (!fn) return 'N/A';
    const birth = new Date(fn);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' años';
  };

  // Emit document commands (Save to SQLite & Trigger window.print())
  const emitirReceta = async (e: React.FormEvent) => {
    e.preventDefault();
    const validMeds = medicamentos.filter(m => m.medicamento.trim() !== '');
    if (validMeds.length === 0) {
      alert("Ingrese al menos un medicamento válido antes de emitir.");
      return;
    }

    const newDoc: Receta = {
      id_receta: uuidv4(),
      cedula_id: activePaciente.cedula_id,
      fecha_emision: new Date().toISOString(),
      medicamentos: JSON.stringify(validMeds),
      indicaciones: indicaciones.trim() || undefined
    };

    try {
      await repositories.recetas.save(newDoc);
      setPrintDocType('receta');
      setPrintData(newDoc);
      await loadHistory();
      
      // Reset Form
      setMedicamentos([{ medicamento: '', posologia: '' }]);
      setIndicaciones('');
      
      setTimeout(() => {
        window.print();
      }, 150);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la receta en la base de datos.");
    }
  };

  const emitirReposo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diasReposo || !diagnostico || !fechaInicio) {
      alert("Complete los campos obligatorios (*) para el reposo.");
      return;
    }

    const newDoc: Reposo = {
      id_reposo: uuidv4(),
      cedula_id: activePaciente.cedula_id,
      fecha_emision: new Date().toISOString(),
      dias_reposo: Number(diasReposo),
      diagnostico: diagnostico.trim(),
      fecha_inicio: fechaInicio,
      tipo_reposo: tipoReposo,
      observaciones: reposoObservaciones.trim() || undefined
    };

    try {
      await repositories.reposos.save(newDoc);
      setPrintDocType('reposo');
      setPrintData(newDoc);
      await loadHistory();

      // Reset Form
      setDiasReposo('');
      setDiagnostico('');
      setReposoObservaciones('');

      setTimeout(() => {
        window.print();
      }, 150);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el reposo médico.");
    }
  };

  const emitirLaboratorio = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected = Object.keys(checkedEstudios).filter(k => checkedEstudios[k]);
    if (selected.length === 0 && !labObservaciones.trim()) {
      alert("Seleccione al menos un análisis o complete observaciones.");
      return;
    }

    const newDoc: SolicitudLaboratorio = {
      id_solicitud: uuidv4(),
      cedula_id: activePaciente.cedula_id,
      fecha_emision: new Date().toISOString(),
      estudios_solicitados: JSON.stringify(selected),
      observaciones: labObservaciones.trim() || undefined
    };

    try {
      await repositories.solicitudesLaboratorio.save(newDoc);
      setPrintDocType('laboratorio');
      setPrintData(newDoc);
      await loadHistory();

      // Reset Form
      setCheckedEstudios({});
      setLabObservaciones('');

      setTimeout(() => {
        window.print();
      }, 150);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la solicitud de laboratorio.");
    }
  };

  // Re-print previous documents from History panel
  const handleReimprimirReceta = (doc: Receta) => {
    setPrintDocType('receta');
    setPrintData(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleReimprimirReposo = (doc: Reposo) => {
    setPrintDocType('reposo');
    setPrintData(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleReimprimirLab = (doc: SolicitudLaboratorio) => {
    setPrintDocType('laboratorio');
    setPrintData(doc);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-4 md:p-8 w-full max-w-7xl mx-auto overflow-y-auto custom-scrollbar print:h-auto print:overflow-visible print:block">
      
      {/* HEADER NO IMPRIMIBLE */}
      <div className="mb-6 flex justify-between items-end print:hidden shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#2C3333]">Generación de Documentos</h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
            Paciente activa: <strong className="text-[#1E3A8A] text-lg">{activePaciente.nombre} {activePaciente.apellido}</strong> 
            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full font-semibold">CI: {activePaciente.cedula_id}</span>
          </p>
        </div>
      </div>

      {/* CONTENT GRID: FORM PANEL (LEFT) & HISTORY PANEL (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 print:hidden">
        
        {/* Left Side: Document Creation Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
            <button
              onClick={() => setActiveTab('receta')}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeTab === 'receta' ? 'text-[#2563EB] border-[#2563EB] bg-white' : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <FileText className="w-4 h-4" /> Receta de Farmacia
            </button>
            <button
              onClick={() => setActiveTab('reposo')}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeTab === 'reposo' ? 'text-[#1E3A8A] border-[#1E3A8A] bg-white' : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <Activity className="w-4 h-4" /> Certificado de Reposo
            </button>
            <button
              onClick={() => setActiveTab('laboratorio')}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeTab === 'laboratorio' ? 'text-[#0D9488] border-[#0D9488] bg-white' : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <FlaskConical className="w-4 h-4" /> Orden de Laboratorio
            </button>
          </div>

          {/* Form tab Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
            
            {/* 1. RECETA DE MEDICAMENTOS */}
            {activeTab === 'receta' && (
              <form onSubmit={emitirReceta} className="space-y-6 animate-in fade-in duration-200">
                <section>
                  <h3 className="font-bold text-sm text-[#2563EB] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Prescripción de Medicamentos</h3>
                  <div className="space-y-4">
                    {medicamentos.map((med, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Medicamento / Principio Activo *</label>
                            <input 
                              required
                              type="text" 
                              value={med.medicamento} 
                              onChange={e => updateMedicamento(idx, 'medicamento', e.target.value)}
                              placeholder="Ej. Paracetamol 500mg (Comprimidos)"
                              className="w-full border border-slate-300 rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Posología / Indicación de toma *</label>
                            <textarea
                              required
                              rows={2}
                              value={med.posologia}
                              onChange={e => updateMedicamento(idx, 'posologia', e.target.value)}
                              placeholder="Ej. Tomar 1 comprimido cada 8hs por 5 días"
                              className="w-full border border-slate-300 rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                            ></textarea>
                          </div>
                        </div>
                        {medicamentos.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeMedicamento(idx)} 
                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors shrink-0 mt-6 border border-slate-200 hover:border-red-200 bg-white rounded-lg cursor-pointer"
                            title="Eliminar medicamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={addMedicamento}
                    className="mt-4 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Añadir otro medicamento
                  </button>
                </section>

                <section className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-sm text-[#2563EB] uppercase tracking-wider mb-2">Indicaciones Adicionales o Exámenes</h3>
                  <textarea
                    rows={4}
                    value={indicaciones}
                    onChange={e => setIndicaciones(e.target.value)}
                    placeholder="Escriba indicaciones dietarias, reposos breves, cuidados higiénicos u órdenes de estudios..."
                    className="w-full text-sm text-gray-700 bg-white rounded-xl border border-slate-300 p-3 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                  ></textarea>
                </section>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1D4ED8] shadow-sm transition-colors cursor-pointer">
                    <Printer className="w-4 h-4" /> Guardar e Imprimir Receta
                  </button>
                </div>
              </form>
            )}

            {/* 2. CERTIFICADO DE REPOSO */}
            {activeTab === 'reposo' && (
              <form onSubmit={emitirReposo} className="space-y-6 animate-in fade-in duration-200">
                <section className="space-y-4">
                  <h3 className="font-bold text-sm text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Certificado de Reposo Médico</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha de Inicio *</label>
                      <input required type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="border border-slate-300 rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Días de Reposo Requeridos *</label>
                      <input required type="number" min="1" placeholder="Ej. 5" value={diasReposo} onChange={e => setDiasReposo(e.target.value)} className="border border-slate-300 rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tipo de Reposo *</label>
                      <select value={tipoReposo} onChange={e => setTipoReposo(e.target.value)} className="border border-slate-300 rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]">
                        <option value="Físico y Laboral">Físico y Laboral (Trabajo/Estudios)</option>
                        <option value="Físico Absoluto">Físico Absoluto (Cama)</option>
                        <option value="Laboral Únicamente">Laboral Únicamente</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Diagnóstico / Causa *</label>
                      <input required type="text" placeholder="Ej. Amenaza de parto pretérmino / Lumbalgia gestacional" value={diagnostico} onChange={e => setDiagnostico(e.target.value)} className="border border-slate-300 rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Observaciones adicionales</label>
                    <textarea
                      rows={4}
                      value={reposoObservaciones}
                      onChange={e => setReposoObservaciones(e.target.value)}
                      placeholder="Indique cuidados especiales, restricción de viajes o detalles de control posterior..."
                      className="w-full text-sm text-gray-700 bg-white rounded-xl border border-slate-300 p-3 focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] resize-none"
                    ></textarea>
                  </div>
                </section>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#172554] shadow-sm transition-colors cursor-pointer">
                    <Printer className="w-4 h-4" /> Guardar e Imprimir Certificado
                  </button>
                </div>
              </form>
            )}

            {/* 3. ORDEN DE LABORATORIO */}
            {activeTab === 'laboratorio' && (
              <form onSubmit={emitirLaboratorio} className="space-y-6 animate-in fade-in duration-200">
                <section>
                  <h3 className="font-bold text-sm text-[#0D9488] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Selección de Análisis Clínicos</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {labExams.map((cat, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 shadow-sm flex flex-col">
                        <h4 className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">{cat.category}</h4>
                        <div className="space-y-2.5 flex-1">
                          {cat.items.map(item => (
                            <label key={item.key} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium cursor-pointer py-0.5 hover:text-slate-900 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={checkedEstudios[item.key] || false}
                                onChange={(e) => setCheckedEstudios({ ...checkedEstudios, [item.key]: e.target.checked })}
                                className="rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488] mt-0.5" 
                              />
                              {item.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5 pt-6">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Otros exámenes u observaciones específicas</label>
                    <textarea
                      rows={3}
                      value={labObservaciones}
                      onChange={e => setLabObservaciones(e.target.value)}
                      placeholder="Escriba determinaciones de laboratorio no listadas arriba o instrucciones de ayuno..."
                      className="w-full text-sm text-gray-700 bg-white rounded-xl border border-slate-300 p-3 focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] resize-none"
                    ></textarea>
                  </div>
                </section>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#0D9488] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0F766E] shadow-sm transition-colors cursor-pointer">
                    <Printer className="w-4 h-4" /> Guardar e Imprimir Orden
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Right Side: History of Issued Documents */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full max-h-[700px]">
          <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CalendarClock className="w-5 h-5 text-[#1E3A8A]" /> Historial de Emisión
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mb-3"></div>
                Cargando histórico...
              </div>
            ) : activeTab === 'receta' ? (
              recetasEmitidas.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-10">No hay recetas registradas.</p>
              ) : (
                recetasEmitidas.map((r) => {
                  const meds = JSON.parse(r.medicamentos) as any[];
                  return (
                    <div key={r.id_receta} className="border border-slate-200 rounded-xl p-3.5 hover:border-[#2563EB] transition-all bg-slate-50 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(r.fecha_emision).toLocaleDateString()} - {new Date(r.fecha_emision).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs</span>
                        <button onClick={() => handleReimprimirReceta(r)} className="text-[#2563EB] hover:text-[#1D4ED8] text-xs font-bold flex items-center gap-0.5 cursor-pointer">
                          <Printer className="w-3.5 h-3.5" /> Re-imprimir
                        </button>
                      </div>
                      <div className="space-y-1">
                        {meds.map((m, i) => (
                          <p key={i} className="text-xs text-slate-700 font-semibold truncate">&bull; {m.medicamento}</p>
                        ))}
                      </div>
                    </div>
                  );
                })
              )
            ) : activeTab === 'reposo' ? (
              repososEmitidos.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-10">No hay certificados registrados.</p>
              ) : (
                repososEmitidos.map((rep) => (
                  <div key={rep.id_reposo} className="border border-slate-200 rounded-xl p-3.5 hover:border-[#1E3A8A] transition-all bg-slate-50 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-gray-400 font-bold">{new Date(rep.fecha_emision).toLocaleDateString()}</span>
                      <button onClick={() => handleReimprimirReposo(rep)} className="text-[#1E3A8A] hover:text-[#172554] text-xs font-bold flex items-center gap-0.5 cursor-pointer">
                        <Printer className="w-3.5 h-3.5" /> Re-imprimir
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 font-bold leading-tight">{rep.dias_reposo} días de reposo ({rep.tipo_reposo})</p>
                    <p className="text-[11px] text-slate-500 italic truncate">Diag: {rep.diagnostico}</p>
                  </div>
                ))
              )
            ) : activeTab === 'laboratorio' ? (
              laboratoriosEmitidos.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-10">No hay órdenes registradas.</p>
              ) : (
                laboratoriosEmitidos.map((lab) => {
                  const studies = JSON.parse(lab.estudios_solicitados) as string[];
                  return (
                    <div key={lab.id_solicitud} className="border border-slate-200 rounded-xl p-3.5 hover:border-[#0D9488] transition-all bg-slate-50 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(lab.fecha_emision).toLocaleDateString()}</span>
                        <button onClick={() => handleReimprimirLab(lab)} className="text-[#0D9488] hover:text-[#0F766E] text-xs font-bold flex items-center gap-0.5 cursor-pointer">
                          <Printer className="w-3.5 h-3.5" /> Re-imprimir
                        </button>
                      </div>
                      <p className="text-xs text-slate-800 font-bold">{studies.length} exámenes solicitados</p>
                      <div className="flex flex-wrap gap-1">
                        {studies.slice(0, 3).map(s => (
                          <span key={s} className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium capitalize">{s}</span>
                        ))}
                        {studies.length > 3 && <span className="text-[9px] text-slate-400 px-1 py-0.5">+{studies.length - 3}</span>}
                      </div>
                    </div>
                  );
                })
              )
            ) : null}
          </div>
        </div>

      </div>

      {/* ========================================================== */}
      {/* ==================== SECCIÓN DE IMPRESIÓN ================ */}
      {/* ========================================================== */}
      {printData && (
        <div className="hidden print:block w-full bg-white text-black">
          
          {/* A. IMPRESIÓN RECETA DE FARMACIA */}
          {printDocType === 'receta' && (
            <div className="w-full">
              {/* HOJA 1 - FARMACIA */}
              <div className="print:break-after-page w-full flex flex-col relative pt-8">
                <PrintHeader />
                <div className="flex justify-between items-center border-t-2 border-b-2 border-black py-2 mb-8 text-[12px] font-bold text-black uppercase tracking-wider">
                  <span><strong>Paciente:</strong> {activePaciente.nombre} {activePaciente.apellido}</span>
                  <span><strong>CI:</strong> {activePaciente.cedula_id}</span>
                  <span><strong>Edad:</strong> {getEdad(activePaciente.fecha_nacimiento)}</span>
                  <span><strong>Fecha:</strong> {new Date(printData.fecha_emision).toLocaleDateString('es-ES')}</span>
                </div>
                
                <h3 className="font-bold text-xl uppercase tracking-wider mb-8 pb-2 border-b border-black inline-block text-black">Prescripción Médica (Farmacia)</h3>
                
                <div className="flex-1 space-y-4 pt-4">
                  {(JSON.parse(printData.medicamentos) as any[]).map((med, idx) => (
                    <div key={idx} className="flex gap-2 items-baseline">
                      <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0 relative top-[-4px]"></div>
                      <p className="font-black text-lg text-black">{med.medicamento}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 pt-6 border-t border-dashed border-gray-400 flex flex-col items-center justify-center opacity-70 break-inside-avoid">
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-black">--- Fin de Prescripción ---</p>
                  <p className="text-[9px] uppercase mt-1 text-black">Espacio inferior anulado</p>
                </div>

                <div className="mt-20 pt-8 pb-10 flex flex-col items-center w-full break-inside-avoid">
                  <div className="border-t-2 border-black w-64 pt-2 text-center">
                    <p className="font-bold text-sm text-black">{DOCTOR_CONFIG.name}</p>
                    <p className="text-xs text-black">{DOCTOR_CONFIG.specialty} - {DOCTOR_CONFIG.license}</p>
                  </div>
                </div>
              </div>

              {/* HOJA 2 - PACIENTE */}
              <div className="w-full flex flex-col relative pt-8">
                <PrintHeader />
                <div className="flex justify-between items-center border-t-2 border-b-2 border-black py-2 mb-8 text-[12px] font-bold text-black uppercase tracking-wider">
                  <span><strong>Paciente:</strong> {activePaciente.nombre} {activePaciente.apellido}</span>
                  <span><strong>CI:</strong> {activePaciente.cedula_id}</span>
                  <span><strong>Edad:</strong> {getEdad(activePaciente.fecha_nacimiento)}</span>
                  <span><strong>Fecha:</strong> {new Date(printData.fecha_emision).toLocaleDateString('es-ES')}</span>
                </div>
                
                <h3 className="font-bold text-xl uppercase tracking-wider mb-8 pb-2 border-b border-black inline-block text-black">Indicaciones (Para la Paciente)</h3>
                
                <div className="flex-1 space-y-4 pt-4 border-l-2 border-black pl-4">
                  {(JSON.parse(printData.medicamentos) as any[]).map((med, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <p className="text-black text-lg leading-snug">
                        <span className="font-black mr-2">{med.medicamento}</span>
                        {med.posologia && <span className="font-medium">- {med.posologia}</span>}
                      </p>
                    </div>
                  ))}

                  {printData.indicaciones && (
                    <div className="mt-8 pt-6 border-t border-gray-300">
                      <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-black">Indicaciones Adicionales</h4>
                      <p className="whitespace-pre-wrap text-black font-medium text-lg leading-snug">{printData.indicaciones}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-12 pt-6 border-t border-dashed border-gray-400 flex flex-col items-center justify-center opacity-70 break-inside-avoid">
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-black">--- Fin de Indicaciones ---</p>
                  <p className="text-[9px] uppercase mt-1 text-black">Espacio inferior anulado</p>
                </div>

                <div className="mt-20 pt-8 pb-10 flex flex-col items-center w-full justify-end break-inside-avoid">
                  <div className="border-t-2 border-black w-64 pt-2 text-center">
                    <p className="font-bold text-sm text-black">{DOCTOR_CONFIG.name}</p>
                    <p className="text-xs text-black">{DOCTOR_CONFIG.specialty} - {DOCTOR_CONFIG.license}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. IMPRESIÓN CERTIFICADO DE REPOSO */}
          {printDocType === 'reposo' && (
            <div className="w-full flex flex-col relative pt-4 max-w-2xl mx-auto border-4 border-double border-black p-6 rounded-xl my-2 print:my-0 print:pt-0">
              <PrintHeader />
              <h2 className="text-center font-bold text-xl uppercase tracking-wider my-4 border-b-2 border-black pb-1 text-black">Certificado de Reposo Médico</h2>
              
              <div className="text-sm leading-relaxed text-justify space-y-4 text-black mt-2 flex-1">
                <p>
                  Por medio del presente, se certifica que la paciente <strong>{activePaciente.nombre} {activePaciente.apellido}</strong>, con Cédula de Identidad N° <strong>{activePaciente.cedula_id}</strong> y edad de <strong>{getEdad(activePaciente.fecha_nacimiento)}</strong>, se encuentra bajo mi cuidado médico profesional.
                </p>
                <p>
                  Por motivos de salud y evolución obstétrica/ginecológica, se le indica guardar <strong>reposo de tipo {printData.tipo_reposo}</strong> por el término de <strong>{printData.dias_reposo} días</strong>.
                </p>
                <p>
                  El mismo deberá ser cumplido a partir de la fecha de inicio: <strong>{new Date(printData.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                </p>
                <p>
                  <strong>Diagnóstico Clínico:</strong> {printData.diagnostico}
                </p>
                {printData.observaciones && (
                  <p>
                    <strong>Observaciones / Indicaciones especiales:</strong> {printData.observaciones}
                  </p>
                )}
                <p className="text-right text-xs text-gray-500 mt-6">
                  Fecha de emisión: {new Date(printData.fecha_emision).toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className="mt-8 pt-4 pb-2 flex flex-col items-center w-full justify-end break-inside-avoid">
                <div className="border-t border-black w-56 pt-1 text-center">
                  <p className="font-bold text-xs text-black">{DOCTOR_CONFIG.name}</p>
                  <p className="text-[10px] text-black">{DOCTOR_CONFIG.specialty} - {DOCTOR_CONFIG.license}</p>
                </div>
              </div>
            </div>
          )}

          {/* C. IMPRESIÓN ORDEN DE LABORATORIO */}
          {printDocType === 'laboratorio' && (
            <div className="w-full flex flex-col relative pt-2 max-w-2xl mx-auto px-4 print:pt-0 print:my-0">
              <PrintHeader />
              <h2 className="font-bold text-lg uppercase tracking-wider mb-2 border-b-2 border-black pb-1 mt-2 text-black text-center">Solicitud de Análisis de Laboratorio</h2>
              
              <div className="flex justify-between items-center border-b border-gray-300 pb-1 mb-4 text-[11px] font-bold text-black uppercase tracking-wider">
                <span><strong>Paciente:</strong> {activePaciente.nombre} {activePaciente.apellido}</span>
                <span><strong>CI:</strong> {activePaciente.cedula_id}</span>
                <span><strong>Fecha:</strong> {new Date(printData.fecha_emision).toLocaleDateString('es-ES')}</span>
              </div>

              <div className="space-y-3 flex-1 text-black">
                <p className="font-bold text-[11px] text-gray-700 uppercase tracking-widest mb-2">Estudios Solicitados:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-6 text-sm font-semibold pl-2">
                  {(JSON.parse(printData.estudios_solicitados) as string[]).map((key: string) => {
                    let label = key;
                    for (const cat of labExams) {
                      const item = cat.items.find(i => i.key === key);
                      if (item) {
                        label = item.label;
                        break;
                      }
                    }
                    return (
                      <div key={key} className="flex gap-2 items-center">
                        <div className="w-4 h-4 border border-black flex items-center justify-center text-[10px] font-black shrink-0 bg-white">✓</div>
                        <span className="text-black text-xs font-bold">{label}</span>
                      </div>
                    );
                  })}
                </div>

                {printData.observaciones && (
                  <div className="mt-4 pt-3 border-t border-gray-300">
                    <h4 className="font-bold text-xs mb-1 uppercase tracking-wider text-black font-sans">Observaciones e Instrucciones adicionales:</h4>
                    <p className="whitespace-pre-wrap text-black font-semibold text-xs leading-relaxed">{printData.observaciones}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 pb-2 flex flex-col items-center w-full justify-end break-inside-avoid">
                <div className="border-t border-black w-56 pt-1 text-center">
                  <p className="font-bold text-xs text-black">{DOCTOR_CONFIG.name}</p>
                  <p className="text-[10px] text-black">{DOCTOR_CONFIG.specialty} - {DOCTOR_CONFIG.license}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

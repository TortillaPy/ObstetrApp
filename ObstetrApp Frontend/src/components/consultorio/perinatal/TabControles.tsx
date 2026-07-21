import React, { useState, useEffect } from 'react';
import { Control } from '../../../domain/entities/Control';
import { Cita } from '../../../domain/entities/Cita';
import { repositories } from '../../../lib/di';
import { Plus, Trash2, X, Activity, Baby, CalendarClock, Stethoscope, FileText, Scale, CalendarDays, Clock, AlertTriangle } from 'lucide-react';

const TIME_SLOTS = [
  '07:00', '07:45', '08:30', '09:15', '10:00', '10:45', '11:30', '12:15',
  '13:00', '13:45', '14:30', '15:15', '16:00', '16:45', '17:30', '18:15', '19:00'
];

interface TabControlesProps {
  controles: Control[];
  onAddControl: (
    ctrl: Omit<Control, 'id_control' | 'embarazo_id'>,
    proximaCitaDetails?: { hora: string; motivo: string }
  ) => Promise<void>;
  onDeleteControl: (id: string) => Promise<void>;
  fum?: string;
}

export function TabControles({ controles, onAddControl, onDeleteControl, fum }: TabControlesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [eg, setEg] = useState('');
  const [peso, setPeso] = useState('');
  const [paSistolica, setPaSistolica] = useState('');
  const [paDiastolica, setPaDiastolica] = useState('');
  const [alturaUt, setAlturaUt] = useState('');
  const [presentacion, setPresentacion] = useState<'Cefalica' | 'Podalica' | 'Transversa'>('Cefalica');
  const [lcf, setLcf] = useState('');
  const [movimientos, setMovimientos] = useState<'+' | '-'>('+');
  const [proteinuria, setProteinuria] = useState<'+' | '-'>('-');
  const [signos, setSignos] = useState('');
  const [iniciales, setIniciales] = useState('JN');
  
  // Next appointment state
  const [proxima, setProxima] = useState('');
  const [proximaHora, setProximaHora] = useState('');
  const [proximaMotivo, setProximaMotivo] = useState('Control Prenatal');
  const [isProximaManuallyEdited, setIsProximaManuallyEdited] = useState(false);

  // States for conflict checking
  const [citasList, setCitasList] = useState<Cita[]>([]);
  const [pacientesMap, setPacientesMap] = useState<Record<string, string>>({});

  // Load appointments for conflict checking
  useEffect(() => {
    async function loadAgendaData() {
      if (!modalOpen && !subModalOpen) return;
      try {
        const allCitas = await repositories.citas.getAll();
        setCitasList(allCitas);
        const allPacs = await repositories.pacientes.getAll();
        const pMap: Record<string, string> = {};
        allPacs.forEach(p => {
          pMap[p.cedula_id] = `${p.nombre} ${p.apellido}`;
        });
        setPacientesMap(pMap);
      } catch (e) {
        console.error("Error loading agenda data for conflict checks:", e);
      }
    }
    loadAgendaData();
  }, [modalOpen, subModalOpen]);

  // Helper: Convert time string "HH:MM" to absolute minutes
  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Check if a time slot has a conflict with an existing appointment (< 45 minutes gap)
  const getSlotConflict = (slot: string, dateStr: string) => {
    if (!dateStr) return null;
    const selectedDateCitas = citasList.filter(c => 
      c.estado === 'pendiente' && 
      c.fecha_cita.startsWith(dateStr)
    );
    const minS = parseTimeToMinutes(slot);
    for (const c of selectedDateCitas) {
      if (!c.hora_cita) continue;
      const minC = parseTimeToMinutes(c.hora_cita);
      if (Math.abs(minS - minC) < 45) {
        return c; // Conflict found
      }
    }
    return null;
  };

  // Quick Date Calculation Helpers
  const addDaysToDate = (days: number) => {
    const baseDate = fecha ? new Date(fecha) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    setProxima(baseDate.toISOString().split('T')[0]);
    setIsProximaManuallyEdited(true);
  };

  // 1. Calculate gestational age (EG) in weeks based on visit date and FUM
  useEffect(() => {
    if (fum && fecha) {
      const fumDate = new Date(fum);
      const visitDate = new Date(fecha);
      const diffTime = visitDate.getTime() - fumDate.getTime();
      if (diffTime >= 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(diffDays / 7);
        setEg(String(weeks));
      }
    }
  }, [fecha, fum]);

  // 2. Suggest next appointment date based on WHO standards (if not manually edited yet)
  useEffect(() => {
    if (fecha && !isProximaManuallyEdited) {
      const visitDate = new Date(fecha);
      const weeks = Number(eg) || 0;
      let daysToAdd = 28; // Default 4 weeks
      if (weeks >= 28 && weeks <= 36) {
        daysToAdd = 14; // 2 weeks
      } else if (weeks > 36) {
        daysToAdd = 7; // 1 week
      }
      visitDate.setDate(visitDate.getDate() + daysToAdd);
      setProxima(visitDate.toISOString().split('T')[0]);
    }
  }, [fecha, eg, isProximaManuallyEdited]);

  // 3. Automatically select the first free time slot on next appointment date (Sugerencia A)
  useEffect(() => {
    if (proxima && citasList.length > 0 && !isProximaManuallyEdited) {
      const firstFreeSlot = TIME_SLOTS.find(slot => !getSlotConflict(slot, proxima));
      if (firstFreeSlot) {
        setProximaHora(firstFreeSlot);
      }
    }
  }, [proxima, citasList, isProximaManuallyEdited]);

  const lastControl = [...controles].sort((a, b) => new Date(b.fecha_visita).getTime() - new Date(a.fecha_visita).getTime())[0];
  const pesoAnterior = lastControl ? lastControl.peso_kg : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha || !eg || !peso || !iniciales || !proxima) {
      alert("Por favor complete los campos obligatorios (*)");
      return;
    }
    await onAddControl({
      fecha_visita: fecha,
      eg_semanas: Number(eg),
      peso_kg: Number(peso),
      pa_sistolica: paSistolica ? Number(paSistolica) : undefined,
      pa_diastolica: paDiastolica ? Number(paDiastolica) : undefined,
      altura_uterina_cm: alturaUt ? Number(alturaUt) : undefined,
      presentacion_fetal: presentacion,
      lcf_lpm: lcf || undefined,
      movimientos_fetales: movimientos,
      proteinuria: proteinuria,
      signos_alarma_examenes_tratamientos: signos || undefined,
      iniciales_tecnico: iniciales,
      proxima_cita: proxima
    }, {
      hora: proximaHora || '08:00',
      motivo: proximaMotivo
    });
    setModalOpen(false);
    // Reset fields
    setFecha(new Date().toISOString().split('T')[0]);
    setEg(''); setPeso(''); setPaSistolica(''); setPaDiastolica('');
    setAlturaUt(''); setPresentacion('Cefalica'); setLcf('');
    setMovimientos('+'); setProteinuria('-'); setSignos('');
    setIniciales('JN'); setProxima(''); setProximaHora(''); setProximaMotivo('Control Prenatal');
    setIsProximaManuallyEdited(false);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-200">
       <div className="flex justify-between items-center mb-4">
          <h3 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider">Consultas Prenatales</h3>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer">
             <Plus className="w-4 h-4" /> Añadir Control
          </button>
       </div>
       <div className="rounded-xl border border-slate-200 overflow-x-auto flex-1 bg-slate-50">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-100/50">
                <tr>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Fecha</th>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Edad Gest.</th>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Peso</th>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">PA</th>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Alt. Ut.</th>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Presentación</th>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">FCF</th>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Signos/Alarmas</th>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Técnico</th>
                   <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Próx. Cita</th>
                   <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
             </thead>
             <tbody className="bg-white divide-y divide-slate-200 text-sm">
                {controles.length === 0 ? (
                  <tr>
                     <td className="px-4 py-8 text-slate-400 text-center text-xs" colSpan={11}>
                       <div className="flex flex-col items-center justify-center">
                         <Activity className="w-8 h-8 text-slate-300 mb-2" />
                         Aún no hay controles registrados para esta paciente.
                       </div>
                     </td>
                  </tr>
                ) : (
                  controles.map((c) => (
                    <tr key={c.id_control} className="hover:bg-slate-50 transition-colors">
                       <td className="px-4 py-3 text-slate-800 font-semibold border-r border-slate-200">{new Date(c.fecha_visita).toLocaleDateString()}</td>
                       <td className="px-4 py-3 text-slate-600 border-r border-slate-200">{c.eg_semanas} sem</td>
                       <td className="px-4 py-3 text-slate-600 border-r border-slate-200">{c.peso_kg} kg</td>
                       <td className="px-4 py-3 text-slate-600 border-r border-slate-200">{c.pa_sistolica}/{c.pa_diastolica}</td>
                       <td className="px-4 py-3 text-slate-600 border-r border-slate-200">{c.altura_uterina_cm ? `${c.altura_uterina_cm} cm` : '-'}</td>
                       <td className="px-4 py-3 text-slate-600 border-r border-slate-200 capitalize">{c.presentacion_fetal || '-'}</td>
                       <td className="px-4 py-3 text-slate-600 border-r border-slate-200">{c.lcf_lpm ? `${c.lcf_lpm} lpm` : '-'}</td>
                       <td className="px-4 py-3 text-slate-600 border-r border-slate-200 max-w-xs truncate" title={c.signos_alarma_examenes_tratamientos}>{c.signos_alarma_examenes_tratamientos || '-'}</td>
                       <td className="px-4 py-3 text-slate-600 border-r border-slate-200 font-bold">{c.iniciales_tecnico}</td>
                       <td className="px-4 py-3 text-slate-600 border-r border-slate-200">{new Date(c.proxima_cita).toLocaleDateString()}</td>
                       <td className="px-4 py-3 text-center">
                          <button onClick={() => onDeleteControl(c.id_control)} className="text-red-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer" title="Eliminar Control">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </td>
                    </tr>
                  ))
                )}
             </tbody>
          </table>
       </div>

       {modalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-slate-50 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">
             <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">Registrar Control Prenatal</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
                
                {/* Signos Vitales y Clínicos */}
                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                   <h4 className="flex items-center gap-2 text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                     <Activity className="w-4 h-4" /> Signos Vitales y Clínicos
                   </h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1.5 col-span-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha de Visita *</label>
                         <input required type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Edad Gest. (Sem) *</label>
                         <input required type="number" min="0" value={eg} onChange={(e) => setEg(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                           <span>Peso (kg) *</span>
                           {pesoAnterior !== null && (
                             <span className="text-blue-600 font-semibold inline-flex items-center gap-0.5 normal-case">
                               <Scale className="w-3 h-3" /> Ant: {pesoAnterior} kg
                             </span>
                           )}
                         </label>
                         <input required type="number" step="0.1" min="0" value={peso} onChange={(e) => setPeso(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PA Sistólica</label>
                         <input type="number" min="0" value={paSistolica} onChange={(e) => setPaSistolica(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Ej. 120" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PA Diastólica</label>
                         <input type="number" min="0" value={paDiastolica} onChange={(e) => setPaDiastolica(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Ej. 80" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proteinuria</label>
                         <select value={proteinuria} onChange={(e) => setProteinuria(e.target.value as any)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option value="-">Negativo (-)</option>
                            <option value="+">Positivo (+)</option>
                         </select>
                      </div>
                   </div>
                </section>

                {/* Evaluación Fetal */}
                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                   <h4 className="flex items-center gap-2 text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                     <Baby className="w-4 h-4" /> Evaluación Fetal
                   </h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alt. Uterina (cm)</label>
                         <input type="number" min="0" value={alturaUt} onChange={(e) => setAlturaUt(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Presentación</label>
                         <select value={presentacion} onChange={(e) => setPresentacion(e.target.value as any)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option value="Cefalica">Cefálica</option>
                            <option value="Podalica">Podálica</option>
                            <option value="Transversa">Transversa</option>
                         </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LCF (lpm)</label>
                         <input type="text" placeholder="140" value={lcf} onChange={(e) => setLcf(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mov. Fetales</label>
                         <select value={movimientos} onChange={(e) => setMovimientos(e.target.value as any)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option value="+">Normal (+)</option>
                            <option value="-">Disminuido/Ausente (-)</option>
                         </select>
                      </div>
                   </div>
                </section>

                {/* Notas y Próxima Cita */}
                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                   <h4 className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                     <FileText className="w-4 h-4" /> Notas y Próxima Cita
                   </h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1.5 col-span-4">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Signos de Alarma / Exámenes / Tratamientos</label>
                         <textarea value={signos} onChange={(e) => setSignos(e.target.value)} rows={2} className="border border-slate-300 rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Indicar si hay alarmas, indicaciones especiales o tratamientos indicados en la visita..."></textarea>
                      </div>
                      
                      {proxima ? (
                        <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/20 rounded-xl p-4 flex items-center justify-between col-span-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#1E3A8A]/10 p-2 rounded-lg text-[#1E3A8A]">
                              <CalendarClock className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-[9px] text-slate-500 uppercase tracking-wider">Cita de Seguimiento Programada</h5>
                              <p className="text-xs font-bold text-slate-800 mt-0.5">
                                {new Date(proxima + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })} a las <span className="text-[#1E3A8A] font-extrabold">{proximaHora || '08:00'} hs</span>
                              </p>
                              <p className="text-[10px] text-slate-650 mt-0.5">Motivo: <span className="font-semibold text-slate-700">"{proximaMotivo}"</span></p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 text-right shrink-0">
                            <button
                              type="button"
                              onClick={() => setSubModalOpen(true)}
                              className="px-2.5 py-1 border border-slate-350 text-slate-700 bg-white hover:bg-slate-50 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Modificar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setProxima('');
                                setProximaHora('');
                                setIsProximaManuallyEdited(false);
                              }}
                              className="px-2.5 py-1 text-red-500 hover:text-red-750 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center col-span-3 flex flex-col items-center justify-center min-h-[90px]">
                          <CalendarClock className="w-6 h-6 text-slate-400 mb-1" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Próxima Cita de Control Prenatal</p>
                          <button
                            type="button"
                            onClick={() => setSubModalOpen(true)}
                            className="mt-2 px-3 py-1.5 bg-[#1E3A8A] text-white hover:bg-[#172554] rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Programar Turno
                          </button>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-1.5 justify-center">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Técnico *</label>
                         <input required type="text" placeholder="Iniciales" value={iniciales} onChange={(e) => setIniciales(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-bold text-center" />
                      </div>
                   </div>
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                   <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 rounded-lg text-slate-500 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer border border-transparent">Cancelar</button>
                   <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md hover:shadow-lg transition-all cursor-pointer">Guardar Control</button>
                </div>
             </form>
           </div>
         </div>
       )}
       {/* subModalOpen */}
       {subModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
             <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-3">
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                   <CalendarDays className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-base text-slate-800">Agendar Turno de Seguimiento</h3>
               </div>
               <button 
                 type="button" 
                 onClick={() => setSubModalOpen(false)} 
                 className="text-slate-400 hover:text-slate-650 p-1.5 rounded-md hover:bg-slate-200 cursor-pointer transition-colors"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>

             <div className="p-6 space-y-5">
               {/* Date Selection */}
               <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de la Cita *</label>
                   <div className="flex gap-1.5">
                     <button type="button" onClick={() => addDaysToDate(7)} className="text-[9px] font-bold text-[#1E3A8A] bg-[#1E3A8A]/5 hover:bg-[#1E3A8A]/10 px-2 py-0.5 rounded transition-colors cursor-pointer">+7d</button>
                     <button type="button" onClick={() => addDaysToDate(14)} className="text-[9px] font-bold text-[#1E3A8A] bg-[#1E3A8A]/5 hover:bg-[#1E3A8A]/10 px-2 py-0.5 rounded transition-colors cursor-pointer">+14d</button>
                     <button type="button" onClick={() => addDaysToDate(28)} className="text-[9px] font-bold text-[#1E3A8A] bg-[#1E3A8A]/5 hover:bg-[#1E3A8A]/10 px-2 py-0.5 rounded transition-colors cursor-pointer">+28d</button>
                   </div>
                 </div>
                 <input 
                   required 
                   type="date" 
                   value={proxima} 
                   onChange={e => {
                     setProxima(e.target.value);
                     setIsProximaManuallyEdited(true);
                   }} 
                   className="border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white w-full" 
                 />
               </div>

               {/* Slot Selection */}
               <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Horario de Turno *</label>
                 <select 
                   value={proximaHora} 
                   onChange={e => {
                     setProximaHora(e.target.value);
                     setIsProximaManuallyEdited(true);
                   }} 
                   className="border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white w-full"
                 >
                   <option value="" disabled>Seleccione un horario...</option>
                   {TIME_SLOTS.map(slot => {
                     const conflict = getSlotConflict(slot, proxima);
                     const isOccupied = !!conflict;
                     const conflictPac = conflict ? (pacientesMap[conflict.cedula_id] || "Ocupado") : "";

                     return (
                       <option key={slot} value={slot} disabled={isOccupied} className={isOccupied ? "text-red-400 bg-red-50/20 font-normal" : "text-slate-800 font-semibold"}>
                         {slot} {isOccupied ? `(Ocupado - ${conflictPac})` : '(Libre)'}
                       </option>
                     );
                   })}
                 </select>
                 <p className="text-[9px] text-gray-400 font-medium italic">Turnos configurados cada 45 minutos. Los ocupados están deshabilitados.</p>
               </div>

               {/* Motivo / Notas */}
               <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo de Consulta</label>
                 <input 
                   type="text" 
                   value={proximaMotivo} 
                   onChange={e => setProximaMotivo(e.target.value)} 
                   className="border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white w-full"
                   placeholder="Ej. Control Prenatal + Eco"
                 />
               </div>
             </div>

             <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
               <button 
                 type="button" 
                 onClick={() => setSubModalOpen(false)} 
                 className="px-4 py-2 border border-slate-300 text-slate-650 bg-white hover:bg-slate-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
               >
                 Cancelar
               </button>
               <button 
                 type="button" 
                 onClick={() => {
                   if (!proxima || !proximaHora) {
                     alert("Por favor seleccione la fecha y el horario del turno.");
                     return;
                   }
                   setSubModalOpen(false);
                 }}
                 className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
               >
                 Confirmar Turno
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

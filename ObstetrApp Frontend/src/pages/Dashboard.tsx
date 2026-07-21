import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, CalendarPlus, Clock, User, FileText, X, Stethoscope, Activity, FileStack, Plus, Play, Info } from 'lucide-react';
import { useAppContext } from '../components/AppContext';
import { repositories } from '../lib/di';
import { v4 as uuidv4 } from 'uuid';
import { Cita, EstadoCita } from '../domain/entities/Cita';
import { Paciente } from '../domain/entities/Paciente';
import { Antecedentes } from '../domain/entities/Antecedentes';

type AgendaItem = Cita & { pacienteNombre: string; pacienteId: string; hora: string };

const TIME_SLOTS = [
  '07:00', '07:45', '08:30', '09:15', '10:00', '10:45', '11:30', '12:15',
  '13:00', '13:45', '14:30', '15:15', '16:00', '16:45', '17:30', '18:15', '19:00'
];

export function Dashboard() {
  const { activePaciente, setActivePaciente } = useAppContext();
  const navigate = useNavigate();

  // Agenda / Lists
  const [agendaHoy, setAgendaHoy] = useState<AgendaItem[]>([]);
  const [allCitas, setAllCitas] = useState<Cita[]>([]);
  const [citaAConfirmar, setCitaAConfirmar] = useState<AgendaItem | null>(null);
  const [isAgendando, setIsAgendando] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [pacientesOptions, setPacientesOptions] = useState<Paciente[]>([]);
  const [pacientesMap, setPacientesMap] = useState<Record<string, string>>({});

  // Global Statistics States
  const [stats, setStats] = useState({
    citasHoy: 0,
    atendidosHoy: 0,
    embarazosActivos: 0
  });

  // Active Patient Vitals & Pregnancy Summary States
  const [activeEmb, setActiveEmb] = useState<any>(null);
  const [latestVitals, setLatestVitals] = useState<any>(null);

  // New Booking State
  const [nuevaCita, setNuevaCita] = useState({ 
    pacienteId: '', 
    fecha_cita: new Date().toISOString().split('T')[0], 
    hora: '08:30', 
    motivo: '' 
  });
  const [quickAddData, setQuickAddData] = useState({ cedula_identidad: '', nombre: '', apellido: '' });

  // Details Modal States
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsModalTitle, setDetailsModalTitle] = useState('');
  const [detailsModalType, setDetailsModalType] = useState<'todas' | 'completadas' | 'embarazos'>('todas');
  const [activeEmbarazosList, setActiveEmbarazosList] = useState<any[]>([]);

  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper: Conflict checker for the modal booking
  const getSlotConflict = (slot: string) => {
    const minS = parseTimeToMinutes(slot);
    const dateStr = nuevaCita.fecha_cita;
    const sameDayCitas = allCitas.filter(c => 
      c.estado === 'pendiente' && 
      c.fecha_cita.startsWith(dateStr)
    );
    for (const c of sameDayCitas) {
      if (!c.hora_cita) continue;
      const minC = parseTimeToMinutes(c.hora_cita);
      if (Math.abs(minS - minC) < 45) {
        return c;
      }
    }
    return null;
  };

  const loadData = async () => {
    try {
      const citas = await repositories.citas.getAll();
      setAllCitas(citas);

      const pacs = await repositories.pacientes.getAll();
      setPacientesOptions(pacs);

      const pMap: Record<string, string> = {};
      pacs.forEach(p => {
        pMap[p.cedula_id] = `${p.nombre} ${p.apellido}`;
      });
      setPacientesMap(pMap);

      // 1. Filter both pending and completed appointments for today's agenda list
      const todayDateStr = new Date().toISOString().split('T')[0];
      const todayAppointments = citas.filter(c => 
        (c.estado === 'pendiente' || c.estado === 'realizada') && 
        c.fecha_cita.startsWith(todayDateStr)
      );
      const enriched = await Promise.all(todayAppointments.map(async (c) => {
        const pac = pacs.find(p => p.cedula_id === c.cedula_id);
        return {
          ...c,
          hora: c.hora_cita || new Date(c.fecha_cita).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pacienteNombre: pac ? `${pac.nombre} ${pac.apellido}` : 'Sin nombre',
          pacienteId: pac ? pac.cedula_id : ''
        };
      }));
      setAgendaHoy(enriched.sort((a,b) => parseTimeToMinutes(a.hora) - parseTimeToMinutes(b.hora)));

      // 2. Calculate Dashboard Stats
      const todayAllCitas = citas.filter(c => c.fecha_cita.startsWith(todayDateStr));
      const activeEmbs = await repositories.embarazos.getAll();
      const filteredActiveEmbs = activeEmbs.filter(e => e.estado === 'activo');
      setActiveEmbarazosList(filteredActiveEmbs);
      
      setStats({
        citasHoy: todayAllCitas.length,
        atendidosHoy: todayAllCitas.filter(c => c.estado === 'realizada').length,
        embarazosActivos: filteredActiveEmbs.length
      });

    } catch (e) {
      console.error("Error al cargar los datos del Dashboard:", e);
    }
  };

  // Vitals & Pregnancy Summary for Active Patient
  const loadActivePatientDetails = async () => {
    if (!activePaciente) {
      setActiveEmb(null);
      setLatestVitals(null);
      return;
    }
    try {
      // Load active pregnancy details
      const emb = await repositories.embarazos.getActiveByCedulaId(activePaciente.cedula_id);
      setActiveEmb(emb);

      // Load latest signs
      const citas = await repositories.citas.getByCedulaId(activePaciente.cedula_id);
      const completed = citas
        .filter(c => c.estado === 'realizada' && (c.pa || c.peso || c.fc))
        .sort((a,b) => new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime());

      if (completed.length > 0) {
        setLatestVitals({
          pa: completed[0].pa || 'N/A',
          peso: completed[0].peso ? `${completed[0].peso} kg` : 'N/A',
          fc: completed[0].fc ? `${completed[0].fc} lpm` : 'N/A',
          fecha: new Date(completed[0].fecha_cita).toLocaleDateString('es-ES')
        });
      } else {
        setLatestVitals(null);
      }
    } catch (e) {
      console.error("Error al cargar detalles de paciente activa:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activePaciente]);

  useEffect(() => {
    loadActivePatientDetails();
  }, [activePaciente]);

  const abrirModalAgendar = async () => {
    setIsAgendando(true);
  };

  const guardarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCita.pacienteId || !nuevaCita.fecha_cita || !nuevaCita.hora) return;

    // Check conflict
    const conflict = getSlotConflict(nuevaCita.hora);
    if (conflict) {
      const pName = pacientesMap[conflict.cedula_id] || "Otro paciente";
      alert(`No se puede agendar. El turno de las ${nuevaCita.hora} está a menos de 45 minutos del turno ocupado por ${pName} (${conflict.hora_cita}hs).`);
      return;
    }

    const fechaCompleta = `${nuevaCita.fecha_cita}T${nuevaCita.hora}`;

    const cita: Cita = {
      id_cita: uuidv4(),
      cedula_id: nuevaCita.pacienteId,
      fecha_cita: fechaCompleta,
      hora_cita: nuevaCita.hora,
      motivo: nuevaCita.motivo,
      estado: 'pendiente'
    };

    await repositories.citas.save(cita);
    setIsAgendando(false);
    setNuevaCita({ pacienteId: '', fecha_cita: new Date().toISOString().split('T')[0], hora: '08:30', motivo: '' });
    loadData();
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddData.cedula_identidad || !quickAddData.nombre || !quickAddData.apellido) return;
    
    const newPaciente: Paciente = {
      cedula_id: quickAddData.cedula_identidad,
      nombre: quickAddData.nombre,
      apellido: quickAddData.apellido,
      fecha_nacimiento: new Date().toISOString().split('T')[0],
      edad: 0,
      etnia: 'mestiza',
      estudios_nivel: 'secundaria',
      estudios_alfabetiza: 1,
      estado_civil: 'soltera',
      vive_sola: 0,
      menor_15_mayor_35: 0
    };

    await repositories.pacientes.save(newPaciente);

    const newAntecedentes: Antecedentes = {
      cedula_id: newPaciente.cedula_id,
      ant_tbc: 0, ant_diabetes: 0, ant_hipertension: 0, ant_preeclampsia: 0, ant_eclampsia: 0, ant_cardiopatia: 0, ant_nefropatia: 0, ant_infertilidad: 0, ant_cirugia_genito_urinaria: 0, ant_violencia: 0, ant_otra_condicion_grave: 0,
      hist_gestas_previas: 0, hist_partos: 0, hist_vaginales: 0, hist_cesareas: 0, hist_abortos: 0,
      hist_abortos_tres_espontaneos_consecutivos: 0, hist_nacidos_vivos: 0, hist_nacidos_vivos_muertos_1ra_semana: 0, hist_nacidos_vivos_muertos_despues_1ra_semana: 0, hist_nacidos_muertos: 0, hist_viven: 0,
      hist_fin_embarazo_anterior_menos_de_1_anio: 0, hist_embarazo_planeado: 0, hist_fracaso_anticonceptivo: 'no',
      inm_antirubeola: 'no'
    };
    await repositories.antecedentes.save(newAntecedentes);

    setShowQuickAdd(false);
    setQuickAddData({ cedula_identidad: '', nombre: '', apellido: '' });
    
    // Refresh and auto-fill
    await loadData();
    setIsAgendando(true);
    setNuevaCita({...nuevaCita, pacienteId: newPaciente.cedula_id});
  };

  const confirmarCitaRealizada = async () => {
    if (!citaAConfirmar) return;
    await repositories.citas.update(citaAConfirmar.id_cita, { ...citaAConfirmar, estado: 'realizada' });
    setCitaAConfirmar(null);
    loadData();
  };

  const getEdad = (fn?: string) => {
    if (!fn) return 'N/A';
    const birth = new Date(fn);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' años';
  };

  const calcularEG = (fumStr?: string) => {
    if (!fumStr) return null;
    const fumDate = new Date(fumStr + 'T00:00:00');
    const diffMs = Date.now() - fumDate.getTime();
    const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    const days = Math.floor((diffMs % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    return `${weeks} sem y ${days} días`;
  };

  const getProximaCita = (cedulaId: string) => {
    const futureCitas = allCitas.filter(c => 
      c.cedula_id === cedulaId && 
      c.estado === 'pendiente' &&
      new Date(c.fecha_cita) >= new Date()
    );
    if (futureCitas.length === 0) return 'Sin citas programadas';
    futureCitas.sort((a,b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime());
    const next = futureCitas[0];
    const datePart = new Date(next.fecha_cita).toLocaleDateString('es-ES');
    return `${datePart} a las ${next.hora_cita || 'N/A'} hs`;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto relative flex flex-col h-full overflow-y-auto custom-scrollbar">

      {/* MODAL: BOOK APPOINTMENT */}
      {isAgendando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold tracking-tight text-slate-800 text-sm uppercase">Agendar Nueva Cita</h3>
              <button onClick={() => setIsAgendando(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={guardarCita} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Paciente *</label>
                <div className="flex gap-2">
                  <select 
                    required 
                    value={nuevaCita.pacienteId} 
                    onChange={e => setNuevaCita({...nuevaCita, pacienteId: e.target.value})} 
                    className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] flex-1"
                  >
                    <option value="">Seleccione una paciente...</option>
                    {pacientesOptions.map(p => (
                      <option key={p.cedula_id} value={p.cedula_id}>{p.nombre} {p.apellido} (CI: {p.cedula_id})</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => { setIsAgendando(false); navigate('/pacientes'); }} className="px-3 py-2 border border-[#CBD5E1] rounded bg-slate-50 hover:bg-slate-100 transition-colors text-gray-600 flex items-center justify-center shrink-0 cursor-pointer" title="Registro Completo">
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => { setShowQuickAdd(true); setIsAgendando(false); }} className="px-3 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#172554] transition-colors flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer" title="Registro Rápido">
                    Rápido
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                 <div className="flex flex-col gap-1.5 flex-1">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha *</label>
                   <input required type="date" value={nuevaCita.fecha_cita} onChange={e => setNuevaCita({...nuevaCita, fecha_cita: e.target.value})} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                 </div>
                 <div className="flex flex-col gap-1.5 flex-1">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Turno *</label>
                   <select 
                     required 
                     value={nuevaCita.hora} 
                     onChange={e => setNuevaCita({...nuevaCita, hora: e.target.value})} 
                     className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                   >
                     {TIME_SLOTS.map(slot => {
                       const conflict = getSlotConflict(slot);
                       const isOccupied = !!conflict;
                       const conflictName = conflict ? (pacientesMap[conflict.cedula_id] || "Ocupado") : "";
                       return (
                         <option key={slot} value={slot} disabled={isOccupied}>
                           {slot} {isOccupied ? `(Ocupado - ${conflictName})` : '(Libre)'}
                         </option>
                       );
                     })}
                   </select>
                 </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Motivo de consulta</label>
                <input type="text" value={nuevaCita.motivo} onChange={e => setNuevaCita({...nuevaCita, motivo: e.target.value})} placeholder="Ej. Control obstétrico mensual" className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
              </div>
              
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsAgendando(false)} className="flex-1 py-2.5 rounded-lg border border-[#CBD5E1] text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[#1E3A8A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#172554] shadow-sm transition-colors cursor-pointer">Confirmar Cita</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ADD PATIENT */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold tracking-tight text-slate-800 text-sm uppercase">Registro Rápido</h3>
              <button onClick={() => { setShowQuickAdd(false); abrirModalAgendar(); }} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cédula o ID *</label>
                <input required autoFocus type="text" value={quickAddData.cedula_identidad} onChange={e => setQuickAddData({...quickAddData, cedula_identidad: e.target.value})} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nombres *</label>
                <input required type="text" value={quickAddData.nombre} onChange={e => setQuickAddData({...quickAddData, nombre: e.target.value})} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Apellidos *</label>
                <input required type="text" value={quickAddData.apellido} onChange={e => setQuickAddData({...quickAddData, apellido: e.target.value})} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
              </div>
              
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => { setShowQuickAdd(false); abrirModalAgendar(); }} className="flex-1 py-2.5 rounded-lg border border-[#CBD5E1] text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer">Volver</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[#1E3A8A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#172554] shadow-sm transition-colors cursor-pointer">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM APPOINTMENT COMPLETED */}
      {citaAConfirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold tracking-tight text-slate-800 text-sm uppercase">Finalizar Consulta</h3>
              <button onClick={() => setCitaAConfirmar(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                ¿Marcar la consulta de <strong className="text-[#1E3A8A]">{citaAConfirmar.pacienteNombre}</strong> como <strong>Realizada</strong>? Se quitará de la lista de pacientes pendientes de hoy.
              </p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setCitaAConfirmar(null)}
                  className="flex-1 py-2.5 rounded-lg border border-[#CBD5E1] text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmarCitaRealizada}
                  className="flex-1 py-2.5 rounded-lg bg-[#1E3A8A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#172554] shadow-sm transition-colors cursor-pointer"
                >
                  Marcar Realizada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details List Modal for appointments */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold tracking-tight text-slate-800 text-sm uppercase">{detailsModalTitle}</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[450px] overflow-y-auto custom-scrollbar">
              {(() => {
                if (detailsModalType === 'embarazos') {
                  if (activeEmbarazosList.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-500 text-sm italic">
                        No hay embarazos activos registrados bajo control.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm divide-y divide-slate-200">
                        <thead>
                          <tr className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 border-b border-slate-200">
                            <th className="px-4 py-2.5">Paciente</th>
                            <th className="px-4 py-2.5">Semanas (EG)</th>
                            <th className="px-4 py-2.5">Próxima Cita</th>
                            <th className="px-4 py-2.5 text-right">Contacto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeEmbarazosList.map(emb => {
                            const pacName = pacientesMap[emb.cedula_id] || "Paciente Desconocido";
                            const pac = pacientesOptions.find(p => p.cedula_id === emb.cedula_id);
                            const eg = calcularEG(emb.fum);
                            const proxima = getProximaCita(emb.cedula_id);
                            const tel = pac?.telefono;

                            return (
                              <tr key={emb.id_embarazo} className="hover:bg-slate-50/55 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-[#1E3A8A] shrink-0">
                                      {pacName.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800 text-xs">{pacName}</p>
                                      <p className="text-[10px] text-gray-400">CI: {emb.cedula_id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs bg-teal-50 text-teal-700 font-bold border border-teal-200 px-2 py-0.5 rounded-full inline-block">
                                    {eg || 'FUM no disp.'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                                  {proxima}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {tel ? (
                                    <a 
                                      href={`tel:${tel}`} 
                                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:text-[#172554] bg-[#1E3A8A]/5 hover:bg-[#1E3A8A]/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                      title="Llamar a paciente"
                                    >
                                      📞 {tel}
                                    </a>
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">No registrado</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                const items = agendaHoy.filter(c => 
                  detailsModalType === 'todas' ? true : c.estado === 'realizada'
                );

                if (items.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500 text-sm italic">
                      No hay citas para mostrar en este listado.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm divide-y divide-slate-200">
                      <thead>
                        <tr className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 border-b border-slate-200">
                          <th className="px-4 py-2.5">Hora</th>
                          <th className="px-4 py-2.5">Paciente</th>
                          <th className="px-4 py-2.5">Motivo</th>
                          <th className="px-4 py-2.5">Estado</th>
                          <th className="px-4 py-2.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map(cita => (
                          <tr key={cita.id_cita} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-800 text-xs">{cita.hora} hs</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800 text-xs">{cita.pacienteNombre}</p>
                              <p className="text-[10px] text-gray-400">CI: {cita.pacienteId}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 truncate max-w-[120px]" title={cita.motivo || ''}>
                              {cita.motivo || 'Consulta General'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                                cita.estado === 'realizada' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {cita.estado === 'realizada' ? 'Atendida' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {cita.estado === 'pendiente' ? (
                                <div className="flex gap-1.5 justify-end">
                                  <button 
                                    onClick={() => {
                                      const pac = pacientesOptions.find(p => p.cedula_id === cita.pacienteId);
                                      if (pac) {
                                        setActivePaciente(pac);
                                        setShowDetailsModal(false);
                                        navigate('/consultorio');
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-[#0D9488] hover:bg-[#0F766E] text-white text-[9px] font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Play className="w-2.5 h-2.5 fill-white" /> Atender
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setCitaAConfirmar(cita);
                                      setShowDetailsModal(false);
                                    }}
                                    className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg text-[9px] font-bold uppercase transition-colors cursor-pointer"
                                  >
                                    Finalizar
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">Listo</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* METRIC COUNTERS ROW: GLOBAL OR PATIENT SPECIFIC SUMMARY */}
      {!activePaciente && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden shrink-0">
          <div 
            onClick={() => {
              setDetailsModalType('todas');
              setDetailsModalTitle('Citas Agendadas Hoy');
              setShowDetailsModal(true);
            }}
            className="bg-gradient-to-tr from-[#1E3A8A]/90 to-[#2563EB] rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200"
          >
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Citas Agendadas Hoy</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold">{stats.citasHoy}</span>
              <span className="text-xs text-white/80">pacientes</span>
            </div>
          </div>
          <div 
            onClick={() => {
              setDetailsModalType('completadas');
              setDetailsModalTitle('Consultas Completadas Hoy');
              setShowDetailsModal(true);
            }}
            className="bg-gradient-to-tr from-[#0D9488]/90 to-[#0F766E] rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200"
          >
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Consultas Completadas</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold">{stats.atendidosHoy}</span>
              <span className="text-xs text-white/80">hoy</span>
            </div>
          </div>
          <div 
            onClick={() => {
              setDetailsModalType('embarazos');
              setDetailsModalTitle('Control de Embarazos Activos');
              setShowDetailsModal(true);
            }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Embarazos Activos</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-[#1E3A8A]">{stats.embarazosActivos}</span>
              <span className="text-xs text-slate-500">bajo control</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. LAYOUTS: WHEN PATIENT IS ACTIVE */}
      {activePaciente ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
             <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Paciente bajo atención</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#2C3333]">{activePaciente.nombre} {activePaciente.apellido}</h2>
             </div>
             
             {/* Quick calculate details */}
             <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-6 shrink-0">
               <div>
                 <span className="text-[10px] text-gray-400 uppercase font-bold block">Edad</span>
                 <span className="font-bold text-slate-800">{getEdad(activePaciente.fecha_nacimiento)}</span>
               </div>
               <div className="border-l border-slate-200 h-8"></div>
               <div>
                 <span className="text-[10px] text-gray-400 uppercase font-bold block">Cédula</span>
                 <span className="font-bold text-slate-800">{activePaciente.cedula_id}</span>
               </div>
             </div>
          </div>

          {/* ACTIVE PATIENT CLINICAL SUMMARY & PREGNANCY WIDGET */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Left Card: Latest Vitals Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Activity className="w-4 h-4 text-[#1E3A8A]" /> Últimos Signos Vitales
              </h4>
              {latestVitals ? (
                <div className="grid grid-cols-3 gap-4 py-1">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">PA</span>
                    <span className="font-extrabold text-sm text-slate-800 block mt-1">{latestVitals.pa}</span>
                  </div>
                  <div className="text-center border-l border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Peso</span>
                    <span className="font-extrabold text-sm text-slate-800 block mt-1">{latestVitals.peso}</span>
                  </div>
                  <div className="text-center border-l border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">FC</span>
                    <span className="font-extrabold text-sm text-slate-800 block mt-1">{latestVitals.fc}</span>
                  </div>
                  <p className="col-span-3 text-[10px] text-gray-400 text-right mt-2 font-medium">Registrado el: {latestVitals.fecha}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-4 italic">
                  <Info className="w-4 h-4 shrink-0" /> Sin signos vitales registrados aún.
                </div>
              )}
            </div>

            {/* Middle Card: Pregnancy Active Status (Gestational Age) */}
            <div className="lg:col-span-2 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <h4 className="font-bold text-xs text-[#0D9488] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Stethoscope className="w-4 h-4" /> Estado Obstétrico Activo
              </h4>
              {activeEmb ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">F.U.M. (Última Regla)</span>
                    <span className="font-bold text-sm text-slate-800 block mt-0.5">{new Date(activeEmb.fum).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">F.P.P. (Probable Parto)</span>
                    <span className="font-bold text-sm text-slate-800 block mt-0.5">{new Date(activeEmb.fpp).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="bg-[#0D9488]/10 rounded-lg p-2 text-center flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-[#0D9488] uppercase tracking-wider block">Edad Gestacional</span>
                    <span className="font-extrabold text-xs text-[#0F766E] block mt-0.5">{calcularEG(activeEmb.fum) || "N/A"}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-4 italic">
                  <Info className="w-4 h-4 shrink-0" /> Paciente ginecológica sin embarazo activo en curso.
                </div>
              )}
            </div>

          </div>

          {/* Core Modules Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Link to="/consultorio" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#2563EB] transition-all group flex flex-col h-full">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-[#2563EB] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Consulta General / SOAP</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">Atenciones clínicas rápidas, evolución clásica subjetiva y objetiva.</p>
              <span className="text-[#2563EB] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-auto">
                 Ingresar <span className="text-lg leading-none">&rsaquo;</span>
              </span>
            </Link>
            
            <Link to="/perinatal" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#1E3A8A] transition-all group flex flex-col h-full">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-[#1E3A8A] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Historia Perinatal (CLAP)</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">Control prenatal integral de embarazo en curso, curvas y carnet de control.</p>
              <span className="text-[#1E3A8A] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-auto">
                 Ingresar <span className="text-lg leading-none">&rsaquo;</span>
              </span>
            </Link>

            <Link to="/ginecologia" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#0D9488] transition-all group flex flex-col h-full">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-[#0D9488] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0D9488] group-hover:text-white transition-colors">
                <FileStack className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Consulta de Ginecología</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">Anotaciones médicas, exámenes de mama, vulva, cuello y planes ginecológicos.</p>
              <span className="text-[#0D9488] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-auto">
                 Ingresar <span className="text-lg leading-none">&rsaquo;</span>
              </span>
            </Link>
          </div>
        </div>
      ) : (
        
        // 3. LAYOUTS: WHEN NO PATIENT IS ACTIVE (DASHBOARD)
        <div className="space-y-8 flex-1 flex flex-col">
          <div className="mb-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">Centro de Comando</h2>
            <p className="text-gray-600 max-w-2xl">
              Sistema integral para el control y seguimiento de pacientes obstétricas y consultas ginecológicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Link to="/pacientes" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#1E3A8A] transition-all group flex flex-col h-full">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-[#1E3A8A] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Iniciar Atención (Directorio de Pacientes)</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">Busque una paciente en el registro histórico o cree una ficha nueva de historia clínica para habilitar los expedientes.</p>
              <span className="text-[#1E3A8A] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                 Ingresar Consultorio <span className="text-lg leading-none">&rsaquo;</span>
              </span>
            </Link>

            <button onClick={abrirModalAgendar} className="text-left rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#0D9488] transition-all group flex flex-col h-full cursor-pointer">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-[#0D9488] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0D9488] group-hover:text-white transition-colors">
                <CalendarPlus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Agendar Próxima Cita</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">Programe una próxima visita para un control obstétrico o revisión de resultados en la agenda médica.</p>
              <span className="text-[#0D9488] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-auto">
                 Abrir Calendario <span className="text-lg leading-none">&rsaquo;</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

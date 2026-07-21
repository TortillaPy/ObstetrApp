import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../components/AppContext';
import { repositories } from '../lib/di';
import { Cita, EstadoCita } from '../domain/entities/Cita';
import { Paciente } from '../domain/entities/Paciente';
import { Calendar, Clock, User, Search, Trash2, Play, CalendarPlus, Plus, ChevronRight, AlertCircle, X } from 'lucide-react';

const TIME_SLOTS = [
  '07:00', '07:45', '08:30', '09:15', '10:00', '10:45', '11:30', '12:15',
  '13:00', '13:45', '14:30', '15:15', '16:00', '16:45', '17:30', '18:15', '19:00'
];

export function AgendarCita() {
  const { activePaciente, setActivePaciente } = useAppContext();
  const navigate = useNavigate();

  // General States
  const [loading, setLoading] = useState(false);
  const [citasList, setCitasList] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacientesMap, setPacientesMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Form State
  const [nuevaCita, setNuevaCita] = useState({ 
    fecha_cita: new Date().toISOString().split('T')[0], 
    hora: '08:30', 
    motivo: '' 
  });

  // Modal State for General Booking (when no active patient)
  const [isAgendandoGeneral, setIsAgendandoGeneral] = useState(false);
  const [nuevaCitaGeneral, setNuevaCitaGeneral] = useState({
    pacienteId: '',
    fecha_cita: new Date().toISOString().split('T')[0],
    hora: '08:30',
    motivo: ''
  });

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const allCitas = await repositories.citas.getAll();
      setCitasList(allCitas);

      const allPacs = await repositories.pacientes.getAll();
      setPacientes(allPacs);

      // Build quick lookup map for names
      const pMap: Record<string, string> = {};
      allPacs.forEach(p => {
        pMap[p.cedula_id] = `${p.nombre} ${p.apellido}`;
      });
      setPacientesMap(pMap);
    } catch (e) {
      console.error("Error al cargar la agenda:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activePaciente]);

  // Helper: Convert time string "HH:MM" to absolute minutes
  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Filter pending appointments for the selected date
  const selectedDateCitas = citasList.filter(c => 
    c.estado === 'pendiente' && 
    c.fecha_cita.startsWith(nuevaCita.fecha_cita)
  );

  // Check if a time slot has a conflict with an existing appointment (< 45 minutes gap)
  const getSlotConflict = (slot: string) => {
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
    const date = new Date();
    date.setDate(date.getDate() + days);
    setNuevaCita(prev => ({ ...prev, fecha_cita: date.toISOString().split('T')[0] }));
  };

  // Save Booking
  const guardarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaciente || !nuevaCita.fecha_cita || !nuevaCita.hora) return;

    // Check conflict one last time before saving
    const conflict = getSlotConflict(nuevaCita.hora);
    if (conflict) {
      const pName = pacientesMap[conflict.cedula_id] || "Otro paciente";
      alert(`No se puede agendar. El horario de las ${nuevaCita.hora} tiene un conflicto de menos de 45 minutos con la cita de ${pName} (${conflict.hora_cita}hs).`);
      return;
    }

    const fechaCompleta = `${nuevaCita.fecha_cita}T${nuevaCita.hora}`;

    const cita: Cita = {
      id_cita: uuidv4(),
      cedula_id: activePaciente.cedula_id,
      fecha_cita: fechaCompleta,
      hora_cita: nuevaCita.hora,
      motivo: nuevaCita.motivo,
      estado: 'pendiente' as EstadoCita
    };

    try {
      await repositories.citas.save(cita);
      alert("Cita agendada exitosamente.");
      
      // Reset form and reload
      setNuevaCita(prev => ({ ...prev, motivo: '' }));
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error al agendar la cita.");
    }
  };

  // Action: Iniciar Consulta (Activate patient and navigate to consultorio)
  const handleIniciarConsulta = async (cita: Cita) => {
    const pac = pacientes.find(p => p.cedula_id === cita.cedula_id);
    if (pac) {
      setActivePaciente(pac);
      navigate('/consultorio');
    }
  };

  // Action: Cancelar Cita
  const handleCancelarCita = async (cita: Cita) => {
    if (!window.confirm("¿Está seguro que desea cancelar esta cita?")) return;
    try {
      const updated: Cita = { ...cita, estado: 'cancelada' as EstadoCita };
      await repositories.citas.update(cita.id_cita, updated);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Error al cancelar la cita.");
    }
  };

  // Check conflict for general modal
  const getGeneralSlotConflict = (slot: string) => {
    const minS = parseTimeToMinutes(slot);
    const dateStr = nuevaCitaGeneral.fecha_cita;
    const sameDayCitas = citasList.filter(c => 
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

  // Save general modal booking
  const guardarCitaGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCitaGeneral.pacienteId || !nuevaCitaGeneral.fecha_cita || !nuevaCitaGeneral.hora) return;

    const conflict = getGeneralSlotConflict(nuevaCitaGeneral.hora);
    if (conflict) {
      const pName = pacientesMap[conflict.cedula_id] || "Otro paciente";
      alert(`No se puede agendar. El turno de las ${nuevaCitaGeneral.hora} tiene un conflicto de menos de 45 minutos con la cita de ${pName} (${conflict.hora_cita}hs).`);
      return;
    }

    const fechaCompleta = `${nuevaCitaGeneral.fecha_cita}T${nuevaCitaGeneral.hora}`;

    const cita: Cita = {
      id_cita: uuidv4(),
      cedula_id: nuevaCitaGeneral.pacienteId,
      fecha_cita: fechaCompleta,
      hora_cita: nuevaCitaGeneral.hora,
      motivo: nuevaCitaGeneral.motivo,
      estado: 'pendiente'
    };

    try {
      await repositories.citas.save(cita);
      alert("Cita agendada exitosamente.");
      setIsAgendandoGeneral(false);
      setNuevaCitaGeneral({
        pacienteId: '',
        fecha_cita: new Date().toISOString().split('T')[0],
        hora: '08:30',
        motivo: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error al agendar la cita.");
    }
  };

  // Filtering for patient search autocomplete
  const filteredPacientes = searchQuery.trim() === '' ? [] : pacientes.filter(p => 
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.cedula_id.includes(searchQuery)
  );

  // Active patient's specific appointments
  const activePacienteCitas = activePaciente 
    ? citasList.filter(c => c.cedula_id === activePaciente.cedula_id)
    : [];

  // General Agenda View list (All pending appointments)
  const pendingAppointments = citasList
    .filter(c => c.estado === 'pendiente')
    .sort((a, b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime());

  // Formatted date string for selected date
  const getFormattedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-4 md:p-8 w-full max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      
      {/* 1. GENERAL AGENDA VIEW: WHEN NO PATIENT IS ACTIVE */}
      {!activePaciente ? (
        <div className="space-y-6">
          {/* Modal de Agendar Cita General */}
          {isAgendandoGeneral && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
                <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold tracking-tight text-slate-800 text-sm uppercase">Agendar Nueva Cita</h3>
                  <button type="button" onClick={() => setIsAgendandoGeneral(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={guardarCitaGeneral} className="p-6 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paciente *</label>
                    <select 
                      required 
                      value={nuevaCitaGeneral.pacienteId} 
                      onChange={e => setNuevaCitaGeneral({...nuevaCitaGeneral, pacienteId: e.target.value})} 
                      className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                    >
                      <option value="">Seleccione una paciente...</option>
                      {pacientes.map(p => (
                        <option key={p.cedula_id} value={p.cedula_id}>{p.nombre} {p.apellido} (CI: {p.cedula_id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex flex-col gap-1.5 flex-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha *</label>
                       <input required type="date" value={nuevaCitaGeneral.fecha_cita} onChange={e => setNuevaCitaGeneral({...nuevaCitaGeneral, fecha_cita: e.target.value})} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                     </div>
                     <div className="flex flex-col gap-1.5 flex-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Turno *</label>
                       <select 
                         required 
                         value={nuevaCitaGeneral.hora} 
                         onChange={e => setNuevaCitaGeneral({...nuevaCitaGeneral, hora: e.target.value})} 
                         className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
                       >
                         {TIME_SLOTS.map(slot => {
                           const conflict = getGeneralSlotConflict(slot);
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
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Motivo de consulta</label>
                    <input type="text" value={nuevaCitaGeneral.motivo} onChange={e => setNuevaCitaGeneral({...nuevaCitaGeneral, motivo: e.target.value})} placeholder="Ej. Control obstétrico mensual" className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
                  </div>
                  
                  <div className="flex gap-3 mt-8">
                    <button type="button" onClick={() => setIsAgendandoGeneral(false)} className="flex-1 py-2.5 rounded-lg border border-[#CBD5E1] text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer">Cancelar</button>
                    <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[#1E3A8A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#172554] shadow-sm transition-colors cursor-pointer">Confirmar Cita</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#2C3333]">Agenda del Consultorio</h2>
                <p className="text-slate-600 mt-1">Gestione sus citas pendientes e inicie consultas.</p>
              </div>
              
              {/* Header Actions: Search and New Booking Button */}
              <div className="flex items-center gap-3 w-full max-w-2xl justify-end flex-wrap sm:flex-nowrap">
                
                {/* Nueva Cita Button */}
                <button 
                  type="button"
                  onClick={() => setIsAgendandoGeneral(true)} 
                  className="bg-[#1E3A8A] text-white hover:bg-[#172554] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Nueva Cita
                </button>

                {/* Quick Patient Selector Search */}
                <div className="relative w-full max-w-md">
                  <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#1E3A8A] focus-within:ring-1 focus-within:ring-[#1E3A8A]">
                    <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Buscar paciente para agendar..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full text-sm bg-transparent outline-none placeholder:text-gray-400"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="p-0.5 text-gray-400 hover:text-gray-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {/* Autocomplete suggestions */}
                  {filteredPacientes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 mt-1 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
                      {filteredPacientes.map(p => (
                        <button
                          key={p.cedula_id}
                          onClick={() => {
                            setActivePaciente(p);
                            setSearchQuery('');
                          }}
                          className="w-full text-left px-4 py-3 text-xs hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{p.nombre} {p.apellido}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">CI: {p.cedula_id}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          {/* Agenda List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-[#1E3A8A]" /> Citas Pendientes Programadas
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mb-3"></div>
                Cargando agenda...
              </div>
            ) : pendingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <CalendarPlus className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-semibold">No hay citas pendientes programadas.</p>
                <p className="text-xs text-gray-400 mt-1">Busque una paciente arriba para agendar una nueva cita.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-slate-200">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 border-b border-slate-200">
                      <th className="px-6 py-3">Fecha y Hora</th>
                      <th className="px-6 py-3">Paciente</th>
                      <th className="px-6 py-3">Motivo / Notas</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingAppointments.map(cita => {
                      const dateObj = new Date(cita.fecha_cita);
                      const formattedDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                      const formattedTime = cita.hora_cita || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const pacName = pacientesMap[cita.cedula_id] || "Paciente Desconocido";

                      return (
                        <tr key={cita.id_cita} className="hover:bg-slate-50/55 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{formattedTime} hs</p>
                                <p className="text-xs text-slate-700 font-bold mt-0.5">{formattedDate}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-[#1E3A8A] shrink-0">
                                {pacName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{pacName}</p>
                                <p className="text-[11px] text-slate-500 font-bold mt-0.5">CI: {cita.cedula_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate" title={cita.motivo || ''}>
                            {cita.motivo || <span className="italic text-gray-300">Sin descripción</span>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => handleIniciarConsulta(cita)} 
                                className="inline-flex items-center gap-1 bg-[#0D9488] hover:bg-[#0F766E] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                              >
                                <Play className="w-3 h-3" /> Iniciar Consulta
                              </button>
                              <button 
                                onClick={() => handleCancelarCita(cita)} 
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                                title="Cancelar Cita"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        
        // 2. ACTIVE PATIENT SCHEDULING SCREEN (SPLIT VIEW)
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#2C3333]">Agendar Cita</h2>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                Agendando para: <strong className="text-[#1E3A8A] text-lg">{activePaciente.nombre} {activePaciente.apellido}</strong>
                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full font-semibold">CI: {activePaciente.cedula_id}</span>
              </p>
            </div>
            <button 
              onClick={() => setActivePaciente(null)} 
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <X className="w-4 h-4" /> Cambiar Paciente / Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Scheduling Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col justify-between">
              <form onSubmit={guardarCita} className="space-y-6">
                
                {/* Date Picker & Quick Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de la cita *</label>
                    
                    {/* Quick Date Adding Helpers */}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => addDaysToDate(7)} className="text-[10px] font-bold text-[#1E3A8A] bg-[#1E3A8A]/5 hover:bg-[#1E3A8A]/10 px-2 py-1 rounded transition-colors cursor-pointer">+7 días</button>
                      <button type="button" onClick={() => addDaysToDate(15)} className="text-[10px] font-bold text-[#1E3A8A] bg-[#1E3A8A]/5 hover:bg-[#1E3A8A]/10 px-2 py-1 rounded transition-colors cursor-pointer">+15 días</button>
                      <button type="button" onClick={() => addDaysToDate(30)} className="text-[10px] font-bold text-[#1E3A8A] bg-[#1E3A8A]/5 hover:bg-[#1E3A8A]/10 px-2 py-1 rounded transition-colors cursor-pointer">+30 días</button>
                    </div>
                  </div>
                  
                  <input 
                    required 
                    type="date" 
                    value={nuevaCita.fecha_cita} 
                    onChange={e => setNuevaCita({...nuevaCita, fecha_cita: e.target.value})} 
                    className="border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white" 
                  />
                </div>

                {/* 45-Minute Interval Time Select */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Horario de Turno *</label>
                  <select 
                    value={nuevaCita.hora} 
                    onChange={e => setNuevaCita({ ...nuevaCita, hora: e.target.value })} 
                    className="border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white"
                  >
                    {TIME_SLOTS.map(slot => {
                      const conflict = getSlotConflict(slot);
                      const isOccupied = !!conflict;
                      const conflictPac = conflict ? (pacientesMap[conflict.cedula_id] || "Ocupado") : "";

                      return (
                        <option key={slot} value={slot} disabled={isOccupied} className={isOccupied ? "text-red-400 bg-red-50/20 font-normal" : "text-slate-800 font-medium"}>
                          {slot} {isOccupied ? `(Ocupado - ${conflictPac})` : '(Libre)'}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-gray-400 font-medium italic mt-0.5">Los turnos del consultorio están preestablecidos cada 45 minutos para asegurar un intervalo adecuado entre pacientes.</p>
                </div>

                {/* Reason/Motivo */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo de Consulta / Notas</label>
                  <textarea 
                    rows={3} 
                    value={nuevaCita.motivo} 
                    onChange={e => setNuevaCita({...nuevaCita, motivo: e.target.value})} 
                    className="border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white resize-none" 
                    placeholder="Ej. Control Prenatal Mensual, Entrega de Resultados de Laboratorio..." 
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => navigate('/')} 
                    className="px-6 py-3 border border-slate-300 text-gray-600 rounded-lg hover:bg-[#F8FAFC] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#172554] font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                  >
                    Confirmar Cita
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Daily schedule list for selected date */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full max-h-[500px]">
              <h3 className="font-bold text-sm text-slate-800 mb-4 flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold"><Clock className="w-4 h-4 text-[#1E3A8A]" /> Disponibilidad Horaria</span>
                <span className="text-[10px] text-gray-400 capitalize normal-case font-medium">{getFormattedDate(nuevaCita.fecha_cita)}</span>
              </h3>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {selectedDateCitas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">Día Completamente Libre</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">No hay citas agendadas para esta fecha.</p>
                  </div>
                ) : (
                  selectedDateCitas
                    .sort((a,b) => parseTimeToMinutes(a.hora_cita || '00:00') - parseTimeToMinutes(b.hora_cita || '00:00'))
                    .map(c => {
                      const pacName = pacientesMap[c.cedula_id] || "Paciente Desconocido";
                      return (
                        <div key={c.id_cita} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{c.hora_cita} hs</p>
                            <p className="text-[11px] text-slate-600 font-semibold truncate max-w-[150px] mt-0.5">{pacName}</p>
                          </div>
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">Ocupado</span>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

          </div>

          {/* Bottom Panel: Active patient's appointment history */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-[#1E3A8A]" /> Historial de Citas de {activePaciente.nombre} {activePaciente.apellido}
            </h3>

            {activePacienteCitas.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-8">Esta paciente no tiene antecedentes de citas agendadas.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePacienteCitas
                  .sort((a, b) => new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime())
                  .map(c => {
                    const dateObj = new Date(c.fecha_cita);
                    const formattedDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const formattedTime = c.hora_cita || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isUpcoming = c.estado === 'pendiente' && new Date(c.fecha_cita) >= new Date();

                    return (
                      <div key={c.id_cita} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{formattedDate}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">{formattedTime} hs</p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                            c.estado === 'realizada' ? 'bg-green-50 text-green-700 border-green-200' :
                            c.estado === 'pendiente' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {c.estado.toUpperCase()}
                          </span>
                        </div>
                        {c.motivo && <p className="text-[11px] text-slate-600 line-clamp-2 italic">"{c.motivo}"</p>}
                        
                        {isUpcoming && (
                          <div className="flex justify-end pt-1 border-t border-slate-100">
                            <button 
                              onClick={() => handleCancelarCita(c)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Cancelar Cita
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

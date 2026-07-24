import React from 'react';
import { User, Droplet, Activity, Pill, Calendar, Clock, FileText, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Antecedentes } from '../../domain/entities/Antecedentes';
import { Embarazo } from '../../domain/entities/Embarazo';
import { Control } from '../../domain/entities/Control';
import { Cita } from '../../domain/entities/Cita';
import { cn } from '../../lib/utils';
import { Paciente as PacienteEntity } from '../../domain/entities/Paciente';

interface TabHistorialFichaProps {
  activePaciente: PacienteEntity;
  antecedentes: Antecedentes | null;
  embarazoActivo: Embarazo | undefined;
  controles: Control[];
  proximaCita: Cita | undefined;
  getEdad: (fn?: string) => string;
  ultimoPeso: string;
  estudiosPendientes: string[];
}

export function TabHistorialFicha({
  activePaciente,
  antecedentes,
  embarazoActivo,
  controles,
  proximaCita,
  getEdad,
  ultimoPeso,
  estudiosPendientes
}: TabHistorialFichaProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#2C3333]">Ficha del Paciente y Antecedentes</h3>
          <p className="text-xs text-gray-500">Datos personales, contacto, grupo sanguíneo y antecedentes ginecobstétricos basales.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bento: Datos Demográficos */}
        <div className="md:col-span-4 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#2563EB]/20 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-4 text-[#0D9488]">
             <User className="w-5 h-5"/>
             <h3 className="font-bold uppercase tracking-wider text-xs">Datos Demográficos</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
             <div>
               <p className="text-[10px] uppercase font-bold text-gray-400">Edad</p>
               <p className="font-semibold text-gray-800 tracking-tight">{getEdad(activePaciente.fecha_nacimiento)}</p>
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold text-gray-400">Teléfono</p>
               <p className="font-semibold text-gray-800 tracking-tight">{activePaciente.telefono || 'N/A'}</p>
             </div>
             <div className="col-span-2">
               <p className="text-[10px] uppercase font-bold text-gray-400">Dirección / Domicilio</p>
               <p className="font-semibold text-gray-800 truncate">{activePaciente?.domicilio || 'N/A'}</p>
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold text-gray-400">Grupo Sanguíneo</p>
               <p className="font-semibold text-gray-800 tracking-tight inline-flex items-center gap-1">
                 <Droplet className="w-3.5 h-3.5 text-red-500" /> {activePaciente?.grupo_sanguineo || '?'} {activePaciente?.factor_rh || ''}
               </p>
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold text-gray-400">Último Peso</p>
               <p className="font-semibold text-slate-800 tracking-tight inline-flex items-center gap-1">
                 <Scale className="w-3.5 h-3.5 text-slate-500" /> {ultimoPeso}
               </p>
             </div>
          </div>
        </div>

        {/* Bento: Antecedentes Ginecobstétricos */}
        <div className="md:col-span-5 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5">
          <div className="flex items-center gap-2 mb-4 text-[#1E3A8A]">
             <Activity className="w-5 h-5"/>
             <h3 className="font-bold uppercase tracking-wider text-xs">Antecedentes Ginecobstétricos</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
             <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-[#E2E8F0]">
               <p className="text-[10px] uppercase font-bold text-gray-500">Gestas</p>
               <p className="text-xl font-bold text-[#1E3A8A]">{antecedentes?.hist_gestas_previas ?? 0}</p>
             </div>
             <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-[#E2E8F0]">
               <p className="text-[10px] uppercase font-bold text-gray-500">Partos</p>
               <p className="text-xl font-bold text-[#1E3A8A]">{antecedentes?.hist_partos ?? 0}</p>
             </div>
             <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-[#E2E8F0]">
               <p className="text-[10px] uppercase font-bold text-gray-500">Cesáreas</p>
               <p className="text-xl font-bold text-[#1E3A8A]">{antecedentes?.hist_cesareas ?? 0}</p>
             </div>
             <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-[#E2E8F0]">
               <p className="text-[10px] uppercase font-bold text-gray-500">Abortos</p>
               <p className="text-xl font-bold text-[#1E3A8A]">{antecedentes?.hist_abortos ?? 0}</p>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-sm mt-4 border-t border-[#E2E8F0] pt-4">
            <div>
               <p className="text-[10px] uppercase font-bold text-gray-400">F.U.M</p>
               <p className="font-semibold text-gray-800">{activePaciente?.fum ? new Date(activePaciente.fum).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
               <p className="text-[10px] uppercase font-bold text-gray-400">Menarca</p>
               <p className="font-semibold text-gray-800">{activePaciente?.menarca ? activePaciente.menarca + ' años' : 'N/A'}</p>
            </div>
            <div>
               <p className="text-[10px] uppercase font-bold text-gray-400">MAC Actual</p>
               <p className="font-semibold text-gray-800 capitalize"><Pill className="w-3 h-3 inline mr-1 text-[#0D9488]"/> {activePaciente?.metodo_anticonceptivo || 'Ninguno'}</p>
            </div>
          </div>
        </div>

        {/* Bento: Siguiente Cita */}
        <div className={cn(
          "md:col-span-3 rounded-2xl shadow-sm border p-5 flex flex-col justify-center",
          proximaCita ? "border-[#1E3A8A]/30 bg-[#1E3A8A]/5" : "border-[#E2E8F0] bg-white"
        )}>
           <div className="flex items-center gap-2 mb-2 text-[#1E3A8A]">
             <Calendar className="w-5 h-5"/>
             <h3 className="font-bold uppercase tracking-wider text-xs">Siguiente Cita</h3>
           </div>
           {proximaCita ? (
             <div className="mt-2">
               <p className="text-2xl font-black text-[#1E3A8A] tracking-tight">{proximaCita.hora_cita || ''} hs</p>
               <p className="text-sm font-semibold text-gray-600 mt-1">{new Date(proximaCita.fecha_cita).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
               <p className="text-xs text-gray-500 mt-3 bg-white p-2 border border-[#E2E8F0] rounded-lg">"{proximaCita.motivo || 'Control de rutina'}"</p>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center mt-4 opacity-50">
               <Clock className="w-8 h-8 mb-2" />
               <p className="text-xs font-bold uppercase tracking-wider text-center">Sin citas programadas</p>
             </div>
           )}
        </div>

        {/* Bento: Estado del Embarazo Actual */}
        {embarazoActivo && (() => {
          const pesoInicialVal = embarazoActivo.peso_anterior_kg && embarazoActivo.peso_anterior_kg > 0
            ? embarazoActivo.peso_anterior_kg
            : (controles.length > 0 ? controles[controles.length - 1].peso_kg : null);

          const pesoUltimaVal = controles.length > 0
            ? controles[0].peso_kg
            : (ultimoPeso && ultimoPeso !== 'N/A' ? parseFloat(ultimoPeso) : null);

          const diferenciaPeso = (pesoUltimaVal !== null && pesoInicialVal !== null)
            ? (pesoUltimaVal - pesoInicialVal).toFixed(1)
            : null;

          return (
            <div className="md:col-span-12 bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#0D9488] rounded-2xl shadow-md p-6 text-white flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
              <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                   <p className="text-xs uppercase tracking-widest font-bold opacity-90">Embarazo Activo</p>
                 </div>
                 <div className="flex items-baseline gap-3">
                   <h3 className="text-3xl font-black">{embarazoActivo.fpp ? new Date(embarazoActivo.fpp).toLocaleDateString() : 'N/A'}</h3>
                   <span className="text-sm font-semibold opacity-90">FPP Estimada</span>
                 </div>
                 <p className="text-xs opacity-80 mt-1">FUM: {new Date(embarazoActivo.fum).toLocaleDateString()}</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full xl:w-auto">
                 <div className="bg-white/10 p-3.5 rounded-xl text-center border border-white/20">
                   <p className="text-2xl font-black">{controles.length}</p>
                   <p className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-0.5">Controles<br/>Realizados</p>
                 </div>

                 {controles.length > 0 && (
                   <div className="bg-white/10 p-3.5 rounded-xl text-center border border-white/20">
                     <p className="text-2xl font-black">{controles[0].eg_semanas} <span className="text-xs font-semibold">sem</span></p>
                     <p className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-0.5">Semanas de<br/>Gestación (EG)</p>
                   </div>
                 )}

                 {/* Peso Inicial */}
                 <div className="bg-white/10 p-3.5 rounded-xl text-center border border-white/20 min-w-[110px]">
                   <p className="text-xl font-bold">
                     {pesoInicialVal ? `${pesoInicialVal} kg` : 'N/A'}
                   </p>
                   <p className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-0.5">Peso Inicial<br/>(Preconcepcional)</p>
                 </div>

                 {/* Peso Última Consulta */}
                 <div className="bg-white/10 p-3.5 rounded-xl text-center border border-white/20 min-w-[110px] relative">
                   <p className="text-xl font-bold">
                     {pesoUltimaVal ? `${pesoUltimaVal} kg` : 'N/A'}
                   </p>
                   <p className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-0.5">Peso Última<br/>Consulta</p>
                   {diferenciaPeso !== null && (
                     <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${Number(diferenciaPeso) >= 0 ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' : 'bg-amber-500/30 text-amber-200 border border-amber-400/30'}`}>
                       {Number(diferenciaPeso) >= 0 ? `+${diferenciaPeso}` : diferenciaPeso} kg
                     </span>
                   )}
                 </div>
              </div>
            </div>
          );
        })()}

        {/* Bento: Estudios / Exámenes Pendientes */}
        <div className="md:col-span-12 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-slate-650" />
              <h3 className="font-bold uppercase tracking-wider text-xs text-slate-700">Estudios y Exámenes Pendientes</h3>
            </div>
            <button
              onClick={() => navigate('/estudios')}
              className="px-3 py-1.5 text-xs font-bold bg-[#1E3A8A] text-white hover:bg-[#172554] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" /> Cargar Resultados
            </button>
          </div>

          <div className="mt-4">
            {estudiosPendientes.length > 0 ? (
              <div className="bg-amber-50/75 border border-amber-200/80 rounded-xl p-4 flex gap-3.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wide">Exámenes pendientes de resultados</h4>
                  <p className="text-xs text-amber-700/90 mt-0.5">Se han detectado análisis indicados en la última consulta u órdenes pendientes de reporte:</p>
                  <ul className="list-disc list-inside mt-3 space-y-1.5 text-xs text-[#78350F] font-semibold pl-1">
                    {estudiosPendientes.map((estudio, idx) => (
                      <li key={idx} className="marker:text-amber-500">{estudio}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/75 border border-emerald-200/80 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-emerald-800 uppercase tracking-wide">Estudios al día</h4>
                  <p className="text-xs text-emerald-700/90 mt-0.5">La paciente tiene todos sus análisis de laboratorio y estudios ecográficos/PAP actualizados.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAppContext } from '../components/AppContext';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Activity, Heart } from 'lucide-react';
import { SoapForm } from '../components/consultorio/SoapForm';
import { GinecologiaForm } from '../components/consultorio/GinecologiaForm';
import { PerinatalForm } from '../components/consultorio/PerinatalForm';

export function Consultorio() {
  const { activePaciente } = useAppContext();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'menu' | 'soap' | 'perinatal' | 'ginecologia'>('menu');

  if (!activePaciente) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8 animate-in fade-in duration-200">
        <p className="text-gray-500 mb-4">Debe seleccionar una paciente primero en el módulo de Pacientes.</p>
        <button onClick={() => navigate('/pacientes')} className="px-4 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#172554] font-bold text-sm cursor-pointer shadow-sm">
          Ir al Directorio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent p-4 md:p-8 w-full max-w-6xl mx-auto overflow-y-auto custom-scrollbar">
      
      {activeView === 'menu' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#2C3333]">Nueva Consulta</h2>
            <p className="text-gray-500 mt-1">
              Seleccione el tipo de atención médica para: <strong className="text-[#1E3A8A]">{activePaciente.nombre} {activePaciente.apellido}</strong> (CI: {activePaciente.cedula_id})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Consulta Normal SOAP */}
            <button
              onClick={() => setActiveView('soap')}
              className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-8 text-left shadow-sm hover:shadow-md transition-all hover:border-[#2563EB] flex flex-col min-h-[20rem] cursor-pointer"
            >
              <div className="w-14 h-14 bg-[#F8FAFC] border border-[#E2E8F0] text-[#2563EB] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-[#2C3333] mb-2">Consulta Normal (SOAP)</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Evolución clínica general estructurada en formato Subjetivo, Objetivo, Apreciación y Plan. Control de vitales y recetas.
              </p>
              <span className="text-[#2563EB] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-auto">
                Iniciar Ficha &rarr;
              </span>
            </button>

            {/* Card 2: Control Perinatal */}
            <button
              onClick={() => setActiveView('perinatal')}
              className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-8 text-left shadow-sm hover:shadow-md transition-all hover:border-[#1E3A8A] flex flex-col min-h-[20rem] cursor-pointer"
            >
              <div className="w-14 h-14 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E3A8A] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#1E3A8A] group-hover:text-white transition-all">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-[#2C3333] mb-2">Control Perinatal</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Seguimiento específico del embarazo, carnet perinatal, hitos gestacionales, vacunas, laboratorios y ecografías de control.
              </p>
              <span className="text-[#1E3A8A] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-auto">
                Iniciar Control &rarr;
              </span>
            </button>

            {/* Card 3: Ginecología */}
            <button
              onClick={() => setActiveView('ginecologia')}
              className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-8 text-left shadow-sm hover:shadow-md transition-all hover:border-[#0D9488] flex flex-col min-h-[20rem] cursor-pointer"
            >
              <div className="w-14 h-14 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0D9488] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0D9488] group-hover:text-white transition-all">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-[#2C3333] mb-2">Ginecología</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Atención ginecológica general. Examen mamario, especuloscopía, tacto vaginal, hitos y patologías del tracto reproductor.
              </p>
              <span className="text-[#0D9488] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-auto">
                Abrir Consulta &rarr;
              </span>
            </button>
          </div>
        </div>
      )}

      {activeView === 'soap' && <SoapForm onCancel={() => setActiveView('menu')} />}
      {activeView === 'perinatal' && <PerinatalForm onCancel={() => setActiveView('menu')} />}
      {activeView === 'ginecologia' && <GinecologiaForm onCancel={() => setActiveView('menu')} />}
      
    </div>
  );
}

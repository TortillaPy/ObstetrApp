import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { AppProvider, useAppContext } from '../components/AppContext';
import { useAuthStore } from '../data/stores/useAuthStore';
import { Headphones, X } from 'lucide-react';

function LayoutContent() {
  const { selectedDoctorId, setSelectedDoctorId, medicosList } = useAppContext();
  const { user } = useAuthStore();

  const selectedDoctor = medicosList.find(d => d.id_usuario === selectedDoctorId);

  return (
    <div className="flex h-screen w-full bg-[#F3F4ED] font-sans text-[#2C3333] overflow-hidden print:h-auto print:min-h-screen print:bg-white print:block">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[#F3F4ED] flex flex-col h-full print:bg-white print:overflow-visible print:h-auto print:block">
        {/* BANNER FLOTANTE GLOBAL DE ASISTENCIA TÉCNICA A MÉDICOS */}
        {user?.rol === 'ADMIN' && selectedDoctorId && selectedDoctor && (
          <div className="bg-[#1E3A8A] text-white px-6 py-2.5 flex items-center justify-between border-b border-blue-900 shadow-sm shrink-0 print:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 shadow">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold uppercase text-amber-300 tracking-wider">Modo Asistencia Técnica Activo:</span>{' '}
                <span className="font-bold text-white">Visualizando datos y expediente del Dr. {selectedDoctor.nombre} {selectedDoctor.apellido} ({selectedDoctor.especialidad || 'Ginecólogo'})</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedDoctorId(null)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-white/20"
              title="Salir del modo asistencia técnica"
            >
              <X className="w-3.5 h-3.5" /> Salir de Asistencia
            </button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export function Layout() {
  return (
    <AppProvider>
      <LayoutContent />
    </AppProvider>
  );
}

import { Search, Users, Stethoscope, Activity, FileStack, LayoutDashboard, FileText, CalendarPlus, Pill } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from './AppContext';
import { cn } from '../lib/utils';

export function Sidebar() {
  // Estado de ruta y navegación para resaltar la opción actual.
  const location = useLocation();
  const navigate = useNavigate();
  const { activePaciente, setActivePaciente } = useAppContext();

  // Menú principal disponible sin necesidad de paciente seleccionado.
  const globalNav = [
    { name: 'Inicio', icon: LayoutDashboard, path: '/' },
    { name: 'Directorio', icon: Users, path: '/pacientes' },
    { name: 'Agenda', icon: CalendarPlus, path: '/agendar' },
  ];

  // Menú de módulos específicos del paciente, deshabilitado si no hay uno activo.
  const patientNav = [
    { name: 'Nueva Consulta', icon: Stethoscope, path: '/consultorio' },
    { name: 'Historial Clínico', icon: FileText, path: '/historial' },
    { name: 'Carga de Estudios', icon: FileStack, path: '/estudios' },
    { name: 'Emitir Receta', icon: Pill, path: '/recetas' },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#1E3A8A] text-white print:hidden">
      <div className="p-6 border-b border-white/10 shrink-0">
        {/* Encabezado de la aplicación visible en la barra lateral. */}
        <h1 className="text-2xl font-bold tracking-tight italic">ObstetrApp</h1>
        <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Dr. Nicora</p>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto custom-scrollbar">
        <nav className="flex flex-col py-6 px-4 space-y-1">
          {/* Navegación general del sistema. */}
          <p className="text-[10px] uppercase font-semibold text-white/40 mb-2 px-2">Gestión y Agenda</p>
          {globalNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5",
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#D4E2D4]" : "opacity-70")} />
                <span className="truncate">{item.name}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#D4E2D4] absolute right-3 shrink-0"></div>}
              </Link>
            );
          })}
        </nav>

        <nav className="flex flex-col pb-6 px-4 space-y-1">
          {/* Accesos a módulos de atención del paciente. */}
          <p className="text-[10px] uppercase font-semibold text-[#0D9488] mb-2 px-2 mt-4 flex items-center gap-2">
            Módulos del Paciente
          </p>
          {patientNav.map((item) => {
            const isActive = location.pathname === item.path;
            const disabled = !activePaciente;
            return (
              <Link
                key={item.name}
                to={disabled ? '#' : item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-[#0D9488]/20 text-[#0D9488]"
                    : "text-white/70 hover:bg-white/5",
                  disabled && "opacity-30 cursor-not-allowed pointer-events-none"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#0D9488]" : "opacity-70", disabled ? "opacity-30" : "")} />
                <span className="truncate">{item.name}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488] absolute right-3 shrink-0"></div>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 bg-black/10">
        {/* Panel inferior con información del paciente activo y acceso rápido a edición. */}
        <p className="text-[10px] uppercase font-semibold text-white/40 mb-2">Paciente Activa</p>
        {activePaciente ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0 text-white">
              {activePaciente.nombre.charAt(0)}{activePaciente.apellido.charAt(0)}
            </div>
            <Link 
              to="/pacientes" 
              state={{ edit: true }}
              className="overflow-hidden flex-1 hover:bg-white/5 p-1 -ml-1 rounded transition-colors cursor-pointer"
              title="Editar datos del paciente"
            >
              <p className="text-xs font-semibold truncate">{activePaciente.nombre} {activePaciente.apellido}</p>
              <p className="text-[10px] opacity-60 truncate">CI: {activePaciente.cedula_id}</p>
            </Link>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActivePaciente(null);
                navigate('/');
              }}
              className="p-1.5 shrink-0 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer relative z-10"
              title="Cerrar Sesión Paciente"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        ) : (
          <div className="text-sm text-white/50 text-center py-2 bg-white/5 rounded-lg border border-white/10">
            Sin paciente
          </div>
        )}
      </div>
    </aside>
  );
}

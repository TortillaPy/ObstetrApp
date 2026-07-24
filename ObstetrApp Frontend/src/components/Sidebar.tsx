import { Search, Users, Stethoscope, Activity, FileStack, LayoutDashboard, FileText, CalendarPlus, Pill, LogOut, UserCheck, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from './AppContext';
import { useAuthStore } from '../data/stores/useAuthStore';
import { cn } from '../lib/utils';
import { DOCTOR_CONFIG } from '../lib/config';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activePaciente, setActivePaciente } = useAppContext();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const globalNav = [
    { name: 'Inicio', icon: LayoutDashboard, path: '/' },
    { name: 'Directorio', icon: Users, path: '/pacientes' },
    { name: 'Agenda', icon: CalendarPlus, path: '/agendar' },
    ...(user?.rol === 'ADMIN' ? [{ name: 'Gestión de Médicos', icon: ShieldCheck, path: '/usuarios' }] : []),
  ];

  const patientNav = [
    { name: 'Nueva Consulta', icon: Stethoscope, path: '/consultorio' },
    { name: 'Historial Clínico', icon: FileText, path: '/historial' },
    { name: 'Carga de Estudios', icon: FileStack, path: '/estudios' },
    { name: 'Emitir Receta', icon: Pill, path: '/recetas' },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#1E3A8A] text-white print:hidden">
      <div className="p-6 border-b border-white/10 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight italic">ObstetrApp</h1>
        <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{user ? `Dr. ${user.nombre} ${user.apellido}` : DOCTOR_CONFIG.sidebarName}</p>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto custom-scrollbar">
        <nav className="flex flex-col py-6 px-4 space-y-1">
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

      {/* Perfil del Médico en Sesión */}
      <div className="p-4 bg-black/20 border-t border-white/10 space-y-3">
        {user && (
          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-md">
              {user.nombre.charAt(0)}{user.apellido.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Dr. {user.nombre} {user.apellido}</p>
              <p className="text-[10px] text-emerald-300 font-medium truncate">{user.especialidad || 'Ginecólogo'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-300 transition-colors"
              title="Cerrar Sesión Médico"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Información de Paciente Activa */}
        <div>
          <p className="text-[10px] uppercase font-semibold text-white/40 mb-1 px-1">Paciente Activa</p>
          {activePaciente ? (
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-[10px] shrink-0 text-white">
                {activePaciente.nombre.charAt(0)}{activePaciente.apellido.charAt(0)}
              </div>
              <Link 
                to="/pacientes" 
                state={{ edit: true }}
                className="overflow-hidden flex-1 hover:bg-white/5 p-1 rounded transition-colors cursor-pointer"
                title="Editar datos del paciente"
              >
                <p className="text-xs font-semibold truncate">{activePaciente.nombre} {activePaciente.apellido}</p>
              </Link>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActivePaciente(null);
                  navigate('/');
                }}
                className="p-1 shrink-0 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Desseleccionar Paciente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-white/50 text-center py-1.5 bg-white/5 rounded-lg border border-white/5">
              Sin paciente activa
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

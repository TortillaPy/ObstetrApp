import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../data/stores/useAuthStore';
import { 
  ShieldCheck, UserPlus, Users, KeyRound, CheckCircle2, XCircle, 
  Search, Edit3, Lock, Building2, MapPin, Phone, Award, Mail, 
  Stethoscope, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserItem {
  id_usuario: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'MEDICO' | 'ADMIN';
  especialidad: string;
  registro_prof?: string | null;
  nombre_clinica?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  activo: boolean;
  createdAt: string;
}

export function Usuarios() {
  const { user, token, isLoading: isAuthLoading } = useAuthStore();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    especialidad: 'Ginecología y Obstetricia',
    registro_prof: '',
    nombre_clinica: '',
    direccion: '',
    telefono: '',
    rol: 'MEDICO' as 'MEDICO' | 'ADMIN',
  });

  const apiBase = (import.meta.env.VITE_API_URL as string) || '/api';

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user || user.rol !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, isAuthLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${apiBase}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al cargar la lista de usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      especialidad: 'Ginecología y Obstetricia',
      registro_prof: '',
      nombre_clinica: '',
      direccion: '',
      telefono: '',
      rol: 'MEDICO',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (u: UserItem) => {
    setEditingUser(u);
    setFormData({
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      password: '', // Blank unless editing/resetting
      especialidad: u.especialidad || 'Ginecología y Obstetricia',
      registro_prof: u.registro_prof || '',
      nombre_clinica: u.nombre_clinica || '',
      direccion: u.direccion || '',
      telefono: u.telefono || '',
      rol: u.rol,
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (editingUser) {
        // Update user
        const res = await fetch(`${apiBase}/auth/users/${editingUser.id_usuario}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario');
        setSuccessMsg('Datos del médico actualizados correctamente');
      } else {
        // Create user
        if (!formData.password) {
          throw new Error('Debe asignar una contraseña para la cuenta del médico');
        }
        const res = await fetch(`${apiBase}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al registrar médico');
        setSuccessMsg('Nuevo médico registrado exitosamente');
      }

      setIsFormOpen(false);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la solicitud');
    }
  };

  const handleToggleStatus = async (u: UserItem) => {
    try {
      const res = await fetch(`${apiBase}/auth/users/${u.id_usuario}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !u.activo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al modificar estado');
      
      setSuccessMsg(`Usuario ${!u.activo ? 'activado' : 'desactivado'} exitosamente`);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cambiar estado');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser || !newPassword) return;

    try {
      const res = await fetch(`${apiBase}/auth/users/${resetUser.id_usuario}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al restablecer contraseña');

      setSuccessMsg(`Contraseña restablecida exitosamente para ${resetUser.nombre} ${resetUser.apellido}`);
      setIsResetOpen(false);
      setNewPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al restablecer contraseña');
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.apellido.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.registro_prof && u.registro_prof.toLowerCase().includes(q)) ||
      (u.direccion && u.direccion.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] p-4 md:p-8 w-full max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      
      {/* Notifications */}
      {errorMsg && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-700 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Cerrar</button>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs uppercase">Cerrar</button>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1E3A8A]" />
            <h1 className="text-2xl font-black text-slate-800">Gestión de Médicos y Usuarios</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Panel de administración para la creación de cuentas, asignación de registros profesionales y direcciones de consulta.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Nuevo Médico</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Usuarios</p>
            <p className="text-2xl font-black text-slate-800">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Médicos Activos</p>
            <p className="text-2xl font-black text-emerald-600">{users.filter(u => u.activo).length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Administradores</p>
            <p className="text-2xl font-black text-indigo-600">{users.filter(u => u.rol === 'ADMIN').length}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por médico, matrícula o ciudad..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <button
          onClick={fetchUsers}
          className="px-3 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* Doctors Grid / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargando directorio de médicos...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-sm">No se encontraron médicos o usuarios con ese criterio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((u) => (
            <div 
              key={u.id_usuario} 
              className={`bg-white rounded-2xl border ${u.activo ? 'border-slate-200' : 'border-red-200 bg-red-50/20'} p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 flex items-center justify-center text-[#1E3A8A] font-black text-base shrink-0">
                      {u.nombre.charAt(0)}{u.apellido.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-800 leading-tight">Dr. {u.nombre} {u.apellido}</h3>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">{u.especialidad || 'Ginecólogo y Obstetra'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${u.rol === 'ADMIN' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {u.rol}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${u.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{u.email}</span>
                  </div>

                  {u.registro_prof && (
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">Licencia / Registro: <strong className="text-slate-900">{u.registro_prof}</strong></span>
                    </div>
                  )}

                  {u.nombre_clinica && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{u.nombre_clinica}</span>
                    </div>
                  )}

                  {u.direccion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700 font-medium">{u.direccion}</span>
                    </div>
                  )}

                  {u.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{u.telefono}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${u.activo ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}
                >
                  {u.activo ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{u.activo ? 'Desactivar Cuenta' : 'Activar Cuenta'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetUser(u);
                      setNewPassword('');
                      setIsResetOpen(true);
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    title="Restablecer Contraseña"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(u)}
                    className="px-3 py-1.5 bg-[#1E3A8A]/10 hover:bg-[#1E3A8A]/20 text-[#1E3A8A] rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-[#1E3A8A]/20"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL 1: FORMULARIO ALTA / EDICIÓN DE MÉDICO  */}
      {/* ============================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-200 my-8">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {editingUser ? `Editar Datos del Médico: ${editingUser.nombre} ${editingUser.apellido}` : 'Registrar Nuevo Médico'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Asigne el nombre, registro profesional y la dirección para los PDF de recetas.</p>
                </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ana"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Mendoza"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="dra.mendoza@obstetrapp.com"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Especialidad Médica *</label>
                  <input
                    type="text"
                    required
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    placeholder="Ginecología y Obstetricia"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Registro / Licencia Profesional</label>
                  <input
                    type="text"
                    value={formData.registro_prof}
                    onChange={(e) => setFormData({ ...formData, registro_prof: e.target.value })}
                    placeholder="Rg. Prof. 12345"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre de Clínica / Consultorio</label>
                  <input
                    type="text"
                    value={formData.nombre_clinica}
                    onChange={(e) => setFormData({ ...formData, nombre_clinica: e.target.value })}
                    placeholder="Atención Médica Integral"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+595 985 000000"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Dirección del Consultorio (Para recetas impresas) *</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Av. España 1450 e/ Pitiantuta, Asunción"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Rol de Usuario</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'MEDICO' | 'ADMIN' })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="MEDICO">Médico Tratante (Ginecólogo / Obstetra)</option>
                  <option value="ADMIN">Administrador del Sistema (Acceso Total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-slate-500 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#1E3A8A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#172554] shadow-md transition-all cursor-pointer"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar Médico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL 2: RESTABLECER CONTRASEÑA DE MÉDICO      */}
      {/* ============================================== */}
      {isResetOpen && resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Restablecer Contraseña</h3>
                  <p className="text-[11px] text-slate-500">Médico: {resetUser.nombre} {resetUser.apellido}</p>
                </div>
              </div>
              <button onClick={() => setIsResetOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nueva Contraseña de Acceso *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingrese nueva contraseña..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-500 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 shadow-md transition cursor-pointer"
                >
                  Restablecer Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

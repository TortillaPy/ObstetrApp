import React, { useState, useEffect } from 'react';
import { Search, Plus, UserCheck, X, UserPlus, ArrowLeft, Play, FileText, Edit2, Stethoscope } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { repositories } from '../lib/di';
import { Paciente, Etnia, NivelEstudio, EstadoCivil } from '../domain/entities/Paciente';
import { Antecedentes } from '../domain/entities/Antecedentes';
import { useAppContext } from '../components/AppContext';
import { useAuthStore } from '../data/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function Pacientes() {
  const [query, setQuery] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const { setActivePaciente, activePaciente, selectedDoctorId, setSelectedDoctorId, medicosList } = useAppContext();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'buscar' | 'crear' | 'editar'>('buscar');
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<Partial<Paciente>>({
    etnia: 'mestiza',
    estudios_nivel: 'secundaria',
    estudios_alfabetiza: 1,
    estado_civil: 'soltera',
    menor_15_mayor_35: 0,
    vive_sola: 0,
  });

  const fetchPacientes = async (q: string) => {
    setLoading(true);
    try {
      const targetDoctorId = selectedDoctorId || undefined;
      const results = q ? await repositories.pacientes.search(q, targetDoctorId) : await repositories.pacientes.getAll(targetDoctorId);
      setPacientes(results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes(query);
  }, [viewMode, selectedDoctorId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPacientes(query);
  };

  const handleSelect = (p: Paciente, route: string) => {
    setActivePaciente(p);
    navigate(route);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: any = value;

    if (name === 'nombre' || name === 'apellido') {
      // Normalizar: Solo letras y espacios
      newValue = value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    if (name === 'cedula_id') {
      // Normalizar: Solo números formateados con puntos
      const numbers = value.replace(/\D/g, '');
      newValue = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    if (name === 'telefono') {
      // Normalizar: Formato XXX-XXX-XXXX
      const numbers = value.replace(/\D/g, '');
      const match = numbers.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        newValue = !match[2] ? match[1] : `${match[1]}-${match[2]}` + (match[3] ? `-${match[3]}` : '');
      }
    }
    
    if (name === 'estudios_alfabetiza' || name === 'menor_15_mayor_35' || name === 'vive_sola') newValue = Number(newValue) as 0 | 1;
    if (name === 'estudios_anios_mayor_nivel') newValue = newValue ? Number(newValue) : undefined;
    if (name === 'menarca') newValue = newValue ? Number(newValue) : undefined;

    const newFormData = { ...formData, [name]: newValue };

    // Auto-calculo Inteligente: menor_15_mayor_35 basado en fecha_nacimiento
    if (name === 'fecha_nacimiento') {
      const today = new Date();
      const birthDate = new Date(newValue);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      newFormData.edad = age;
      newFormData.menor_15_mayor_35 = (age < 15 || age > 35) ? 1 : 0;
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cedula_id || !formData.nombre || !formData.apellido || !formData.fecha_nacimiento) {
      alert("Por favor complete los campos obligatorios (*)");
      return;
    }

    // Calcular edad
    const today = new Date();
    const birthDate = new Date(formData.fecha_nacimiento!);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    const pacienteData: Paciente = {
      cedula_id: formData.cedula_id!,
      nombre: formData.nombre!,
      apellido: formData.apellido!,
      fecha_nacimiento: formData.fecha_nacimiento!,
      edad: age,
      menor_15_mayor_35: (age < 15 || age > 35) ? 1 : 0,
      etnia: formData.etnia as Etnia,
      estudios_nivel: formData.estudios_nivel as NivelEstudio,
      estudios_alfabetiza: formData.estudios_alfabetiza as 0|1,
      estado_civil: formData.estado_civil as EstadoCivil,
      vive_sola: Number(formData.vive_sola || 0) as 0|1,
      domicilio: formData.domicilio,
      telefono: formData.telefono,
      localidad: formData.localidad,
      estudios_anios_mayor_nivel: formData.estudios_anios_mayor_nivel,
      lugar_control_habitual: formData.lugar_control_habitual,
      lugar_parto_aborto_previsto: formData.lugar_parto_aborto_previsto,
      identificacion_manual: formData.identificacion_manual,
      grupo_sanguineo: formData.grupo_sanguineo,
      factor_rh: formData.factor_rh,
      menarca: formData.menarca,
      fum: formData.fum,
      ritmo_menstrual: formData.ritmo_menstrual,
      metodo_anticonceptivo: formData.metodo_anticonceptivo,
      medico_id: selectedDoctorId || user?.id_usuario
    };

    try {
      if (viewMode === 'editar') {
        await repositories.pacientes.update(pacienteData.cedula_id, pacienteData);
        alert("Paciente actualizada exitosamente.");
      } else {
        await repositories.pacientes.save(pacienteData);
        alert("Paciente registrada exitosamente.");

        // Inicializar antecedentes en blanco para la nueva paciente
        const newAntecedentes: Antecedentes = {
          cedula_id: pacienteData.cedula_id,
          ant_tbc: 0, ant_diabetes: 0, ant_hipertension: 0, ant_preeclampsia: 0, ant_eclampsia: 0, ant_cardiopatia: 0, ant_nefropatia: 0, ant_infertilidad: 0, ant_cirugia_genito_urinaria: 0, ant_violencia: 0, ant_otra_condicion_grave: 0,
          hist_gestas_previas: 0, hist_partos: 0, hist_vaginales: 0, hist_cesareas: 0, hist_abortos: 0,
          hist_abortos_tres_espontaneos_consecutivos: 0, hist_nacidos_vivos: 0, hist_nacidos_vivos_muertos_1ra_semana: 0, hist_nacidos_vivos_muertos_despues_1ra_semana: 0, hist_nacidos_muertos: 0, hist_viven: 0,
          hist_fin_embarazo_anterior_menos_de_1_anio: 0, hist_embarazo_planeado: 0, hist_fracaso_anticonceptivo: 'no',
          inm_antirubeola: 'no'
        };
        await repositories.antecedentes.save(newAntecedentes);
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar la paciente.");
      return;
    }
    
    // Reset form and return
    setFormData({ etnia: 'mestiza', estudios_nivel: 'secundaria', estudios_alfabetiza: 1, estado_civil: 'soltera', menor_15_mayor_35: 0, vive_sola: 0 });
    setActivePaciente(pacienteData);
    setViewMode('buscar');
  };

  const handleEditInit = (p: Paciente) => {
    setFormData(p);
    setViewMode('editar');
  };

  const handleCreateInit = () => {
    setFormData({ etnia: 'mestiza', estudios_nivel: 'secundaria', estudios_alfabetiza: 1, estado_civil: 'soltera', menor_15_mayor_35: 0, vive_sola: 0 });
    setViewMode('crear');
  };

  const getEdad = (fn: string) => {
    const birth = new Date(fn);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' años';
  };

  return (
    <div className="flex flex-col h-full bg-transparent max-w-7xl mx-auto w-full">
      
      {/* 1. HEADER SECTION */}
      <div className="border-b border-slate-200 bg-white p-6 px-8 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {(viewMode === 'crear' || viewMode === 'editar') && (
            <button onClick={() => setViewMode('buscar')} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer mr-1">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#2C3333]">
              {viewMode === 'buscar' ? 'Directorio de Pacientes' : viewMode === 'editar' ? 'Editar Paciente' : 'Registro de Nueva Paciente'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {viewMode === 'buscar' ? 'Busque, registre y gestione la atención de pacientes.' : viewMode === 'editar' ? 'Actualice los datos patronímicos.' : 'Complete los datos patronímicos de la paciente.'}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        {viewMode === 'buscar' && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Admin Doctor Selector */}
            {user?.rol === 'ADMIN' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shrink-0">
                <Stethoscope className="w-4 h-4 text-[#1E3A8A]" />
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">Médico:</span>
                <select
                  value={selectedDoctorId || ''}
                  onChange={(e) => setSelectedDoctorId(e.target.value || null)}
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] cursor-pointer"
                >
                  {medicosList.map((doc) => (
                    <option key={doc.id_usuario} value={doc.id_usuario}>
                      Dr. {doc.nombre} {doc.apellido}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por CI, nombre o apellido..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] placeholder:text-gray-400 text-slate-800"
              />
            </form>

            {/* Nueva Paciente Button */}
            <button 
              onClick={handleCreateInit}
              className="bg-[#1E3A8A] text-white hover:bg-[#172554] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 transition-colors"
            >
              <Plus className="w-4 h-4" /> Registrar Paciente
            </button>
          </div>
        )}
      </div>

      {/* 2. BODY CONTENT SECTION */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        
        {/* Form View (Crear / Editar) */}
        {(viewMode === 'crear' || viewMode === 'editar') ? (
           <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm max-w-4xl mx-auto text-slate-800">
             <form onSubmit={handleSubmit} className="space-y-8">
                {/* ID e Información Personal */}
                <section>
                   <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Información Personal</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cédula de Identidad *</label>
                        <input required type="text" name="cedula_id" value={formData.cedula_id || ''} onChange={handleInputChange} disabled={viewMode === 'editar'} placeholder="x.xxx.xxx" className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A] disabled:bg-slate-50 disabled:text-gray-400" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nombres *</label>
                        <input required type="text" name="nombre" value={formData.nombre || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Apellidos *</label>
                        <input required type="text" name="apellido" value={formData.apellido || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha de Nacimiento *</label>
                        <input required type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Edad de Riesgo (&lt;15 o &gt;35)</label>
                        <select disabled name="menor_15_mayor_35" value={formData.menor_15_mayor_35} className="border border-[#CBD5E1] rounded p-2 text-sm bg-slate-50 text-gray-400">
                          <option value={0}>No</option>
                          <option value={1}>Sí</option>
                        </select>
                        <span className="text-[9px] text-gray-400 mt-0.5 italic">Calculado en base a fecha de nacimiento</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estado Civil *</label>
                        <select required name="estado_civil" value={formData.estado_civil} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]">
                          <option value="soltera">Soltera</option>
                          <option value="casada">Casada</option>
                          <option value="union_estable">Unión Estable</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">¿Vive Sola? *</label>
                        <select required name="vive_sola" value={formData.vive_sola !== undefined ? formData.vive_sola : 0} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]">
                          <option value={0}>No</option>
                          <option value={1}>Sí</option>
                        </select>
                      </div>
                   </div>
                </section>

                <hr className="border-slate-100" />

                {/* Contacto y Ubicación */}
                <section>
                   <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Contacto y Ubicación</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Domicilio</label>
                        <input type="text" name="domicilio" value={formData.domicilio || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Localidad / Barrio</label>
                        <input type="text" name="localidad" value={formData.localidad || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teléfono de contacto</label>
                        <input type="tel" name="telefono" placeholder="XXX-XXX-XXXX" value={formData.telefono || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]" />
                      </div>
                   </div>
                </section>

                <hr className="border-slate-100" />

                {/* Demografía y Estudios */}
                <section>
                   <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Demografía y Estudios</h4>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Etnia *</label>
                        <select required name="etnia" value={formData.etnia} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]">
                          <option value="blanca">Blanca</option>
                          <option value="indigena">Indígena</option>
                          <option value="mestiza">Mestiza</option>
                          <option value="negra">Negra</option>
                          <option value="otra">Otra</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nivel de Estudios *</label>
                        <select required name="estudios_nivel" value={formData.estudios_nivel} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]">
                          <option value="ninguno">Ninguno</option>
                          <option value="primaria">Primaria</option>
                          <option value="secundaria">Secundaria</option>
                          <option value="universitaria">Universitaria</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Años en el Mayor Nivel</label>
                        <input min={0} type="number" name="estudios_anios_mayor_nivel" value={formData.estudios_anios_mayor_nivel || ''} onFocus={(e) => e.target.select()} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">¿Sabe Leer/Escribir? *</label>
                         <div className="flex items-center gap-4 mt-1">
                            <label className="flex items-center gap-1.5 text-sm text-[#2C3333] cursor-pointer">
                               <input type="radio" name="estudios_alfabetiza" value={1} checked={formData.estudios_alfabetiza === 1} onChange={handleInputChange} className="text-[#1E3A8A] focus:ring-[#1E3A8A]" /> Sí
                            </label>
                            <label className="flex items-center gap-1.5 text-sm text-[#2C3333] cursor-pointer">
                               <input type="radio" name="estudios_alfabetiza" value={0} checked={formData.estudios_alfabetiza === 0} onChange={handleInputChange} className="text-[#1E3A8A] focus:ring-[#1E3A8A]" /> No
                            </label>
                         </div>
                      </div>
                   </div>
                </section>
                
                <hr className="border-slate-100" />

                {/* Otros Datos */}
                <section>
                   <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Otros Datos de Seguimiento</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lugar de Control Habitual</label>
                        <input type="text" name="lugar_control_habitual" value={formData.lugar_control_habitual || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lugar de Parto Previsto</label>
                        <input type="text" name="lugar_parto_aborto_previsto" value={formData.lugar_parto_aborto_previsto || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#1E3A8A]" />
                      </div>
                   </div>
                </section>

                <hr className="border-slate-100" />

                {/* Ginecología */}
                <section>
                   <h4 className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Antecedentes Ginecológicos y Grupo Sanguíneo</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Menarca (Edad de primer regla)</label>
                        <input type="number" min="0" name="menarca" value={formData.menarca || ''} onFocus={(e) => e.target.select()} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#0D9488]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">F.U.M. (Última Menstruación)</label>
                        <input type="date" name="fum" value={formData.fum || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#0D9488]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ritmo Menstrual</label>
                        <input type="text" name="ritmo_menstrual" value={formData.ritmo_menstrual || ''} onChange={handleInputChange} placeholder="Ej. 28/4" className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#0D9488]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Método Anticonceptivo</label>
                        <select name="metodo_anticonceptivo" value={formData.metodo_anticonceptivo || 'no'} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#0D9488]">
                          <option value="no">No usa</option>
                          <option value="barrera">Barrera</option>
                          <option value="diu">DIU</option>
                          <option value="hormonal">Hormonal</option>
                          <option value="emergencia">Emergencia</option>
                          <option value="natural">Natural</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Grupo Sanguíneo</label>
                        <select name="grupo_sanguineo" value={formData.grupo_sanguineo || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#0D9488]">
                          <option value="">Seleccione...</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="O">O</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Factor Rh</label>
                        <select name="factor_rh" value={formData.factor_rh || ''} onChange={handleInputChange} className="border border-[#CBD5E1] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#0D9488]">
                          <option value="">Seleccione...</option>
                          <option value="+">+</option>
                          <option value="-">-</option>
                        </select>
                      </div>
                   </div>
                </section>

                <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setViewMode('buscar')} className="px-6 py-3 border border-slate-300 text-gray-600 rounded-lg hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">Cancelar</button>
                  <button type="submit" className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#172554] shadow-sm font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">Guardar Ficha</button>
                </div>
             </form>
           </div>
        ) : (
          
          /* Patients Grid View */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-16 text-slate-400 text-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mx-auto mb-3"></div>
                Cargando directorio...
              </div>
            ) : pacientes.length === 0 ? (
              <div className="text-slate-400 text-sm col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center font-medium">
                No se encontraron pacientes registradas. Utilice "+ Registrar Paciente" para comenzar.
              </div>
            ) : (
              pacientes.map((p) => {
                const isActive = activePaciente && activePaciente.cedula_id === p.cedula_id;
                const isRisk = p.menor_15_mayor_35 === 1;

                return (
                  <div 
                    key={p.cedula_id} 
                    className={`flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                      isActive ? 'border-[#1E3A8A] ring-1 ring-[#1E3A8A]' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Name & Badges */}
                      <div className="flex justify-between items-start mb-2 gap-2">
                         <div className="flex items-center gap-2 min-w-0">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                             {p.nombre.charAt(0)}
                           </div>
                           <h3 className="font-bold text-slate-800 truncate text-sm" title={`${p.nombre} ${p.apellido}`}>
                             {p.nombre} {p.apellido}
                           </h3>
                         </div>
                         <div className="flex flex-col gap-1 shrink-0 text-right">
                           {isActive && (
                             <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 justify-center">
                               🟢 ACTIVA
                             </span>
                           )}
                           {isRisk && (
                             <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 justify-center">
                               ⚠️ RIESGO
                             </span>
                           )}
                         </div>
                      </div>

                      {/* Patient metadata */}
                      <div className="space-y-1 mt-4">
                        <p className="text-xs text-slate-700 font-bold">CI: {p.cedula_id}</p>
                        <p className="text-xs text-slate-500 font-medium">Edad: {getEdad(p.fecha_nacimiento)}</p>
                        <p className="text-[11px] text-slate-400">Tel: {p.telefono || 'Sin registrar'}</p>
                      </div>
                    </div>

                    {/* Ficha actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                      {/* Attending options */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSelect(p, '/consultorio')}
                          className="inline-flex items-center justify-center gap-1 bg-[#0D9488] hover:bg-[#0F766E] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Atender
                        </button>
                        <button
                          onClick={() => handleSelect(p, '/historial')}
                          className="inline-flex items-center justify-center gap-1 bg-[#1E3A8A] hover:bg-[#172554] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" /> Historial
                        </button>
                      </div>

                      {/* Edit option */}
                      <button 
                        onClick={() => handleEditInit(p)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 py-1 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Editar Datos Patronímicos
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

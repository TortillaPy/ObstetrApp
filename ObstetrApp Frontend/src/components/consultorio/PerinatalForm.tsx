import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { cn } from '../../lib/utils';
import { Save, ArrowLeft } from 'lucide-react';
import { repositories } from '../../lib/di';
import { v4 as uuidv4 } from 'uuid';
import { Antecedentes } from '../../domain/entities/Antecedentes';
import { Embarazo } from '../../domain/entities/Embarazo';
import { Laboratorio } from '../../domain/entities/Laboratorio';
import { Control } from '../../domain/entities/Control';
import { Cita } from '../../domain/entities/Cita';

// Import split components
import { TabAntecedentes } from './perinatal/TabAntecedentes';
import { TabInmunizaciones } from './perinatal/TabInmunizaciones';
import { TabLaboratorios } from './perinatal/TabLaboratorios';
import { TabControles } from './perinatal/TabControles';

interface PerinatalFormProps {
  onCancel: () => void;
}

// Formulario principal para iniciar y completar la historia perinatal del embarazo actual.
export function PerinatalForm({ onCancel }: PerinatalFormProps) {
  const { activePaciente, activeEmbarazo, refreshActiveEmbarazo } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);
  const [showInitForm, setShowInitForm] = useState(false);
  const [fum, setFum] = useState('');
  const [fpp, setFpp] = useState('');

  // Estados locales usados para editar antecedentes, embarazo, laboratorio y controles.
  const [antecedentes, setAntecedentes] = useState<Antecedentes | null>(null);
  const [embarazo, setEmbarazo] = useState<Embarazo | null>(null);
  const [laboratorio, setLaboratorio] = useState<Laboratorio | null>(null);
  const [controles, setControles] = useState<Control[]>([]);
  const [saving, setSaving] = useState(false);

  // Sincroniza la FUM del paciente y calcula la FPP cuando se inicia la historia.
  useEffect(() => {
    if (activePaciente?.fum && !fum && showInitForm) {
      const pFum = activePaciente.fum;
      setFum(pFum);
      const fumDate = new Date(pFum);
      if (!isNaN(fumDate.getTime())) {
        fumDate.setDate(fumDate.getDate() + 7);
        fumDate.setMonth(fumDate.getMonth() - 3);
        fumDate.setFullYear(fumDate.getFullYear() + 1);
        setFpp(fumDate.toISOString().split('T')[0]);
      }
    }
  }, [activePaciente, fum, showInitForm]);

  // Carga o crea los registros perinatales asociados al paciente y al embarazo activo.
  useEffect(() => {
    async function loadPerinatalData() {
      if (!activePaciente) return;

      // Load/Create Antecedentes
      let ant = await repositories.antecedentes.getById(activePaciente.cedula_id);
      if (!ant) {
        ant = {
          cedula_id: activePaciente.cedula_id,
          ant_tbc: 0, ant_diabetes: 0, ant_hipertension: 0, ant_preeclampsia: 0, ant_eclampsia: 0, ant_cardiopatia: 0, ant_nefropatia: 0, ant_infertilidad: 0, ant_cirugia_genito_urinaria: 0, ant_violencia: 0, ant_otra_condicion_grave: 0,
          hist_gestas_previas: 0, hist_partos: 0, hist_vaginales: 0, hist_cesareas: 0, hist_abortos: 0,
          hist_abortos_tres_espontaneos_consecutivos: 0, hist_nacidos_vivos: 0, hist_nacidos_vivos_muertos_1ra_semana: 0, hist_nacidos_vivos_muertos_despues_1ra_semana: 0, hist_nacidos_muertos: 0, hist_viven: 0,
          hist_fin_embarazo_anterior_menos_de_1_anio: 0, hist_embarazo_planeado: 0, hist_fracaso_anticonceptivo: 'no',
          inm_antirubeola: 'no'
        };
        await repositories.antecedentes.save(ant);
      }
      setAntecedentes(ant);

      if (activeEmbarazo) {
        setEmbarazo(activeEmbarazo);

        // Load/Create Laboratorio
        let lab = await repositories.laboratorios.getByEmbarazoId(activeEmbarazo.id_embarazo);
        if (!lab) {
          lab = {
            embarazo_id: activeEmbarazo.id_embarazo,
            isoinmunizacion_rh: 0,
          };
          await repositories.laboratorios.save(lab);
        }
        setLaboratorio(lab);

        // Load Controles
        const ctrls = await repositories.controles.getByEmbarazoId(activeEmbarazo.id_embarazo);
        setControles(ctrls);
      } else {
        setEmbarazo(null);
        setLaboratorio(null);
        setControles([]);
      }
    }

    loadPerinatalData();
  }, [activePaciente, activeEmbarazo]);

  // Calcula la fecha probable de parto al cambiar la FUM ingresada por el usuario.
  const handleCalcFpp = (e: React.ChangeEvent<HTMLInputElement>) => {
     setFum(e.target.value);
     if (e.target.value) {
       const fumDate = new Date(e.target.value);
       fumDate.setDate(fumDate.getDate() + 7);
       fumDate.setMonth(fumDate.getMonth() - 3);
       fumDate.setFullYear(fumDate.getFullYear() + 1);
       setFpp(fumDate.toISOString().split('T')[0]);
     } else {
       setFpp('');
     }
  };

  // Inicia un nuevo embarazo con los datos básicos y crea los registros iniciales.
  const handleInitEmbarazo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fum && fpp && activePaciente) {
      const eId = uuidv4();
      await repositories.embarazos.save({
         id_embarazo: eId,
         cedula_id: activePaciente.cedula_id,
         estado: 'activo',
         peso_anterior_kg: 0,
         talla_cm: 0,
         fum: fum,
         fpp: fpp,
         eg_confiable_por: 'FUM',
         fumadora_activa_1tr: 0, fumadora_activa_2tr: 0, fumadora_activa_3tr: 0,
         fumadora_pasiva_1tr: 0, fumadora_pasiva_2tr: 0, fumadora_pasiva_3tr: 0,
         drogas_1tr: 0, drogas_2tr: 0, drogas_3tr: 0,
         alcohol_1tr: 0, alcohol_2tr: 0, alcohol_3tr: 0,
         violencia_1tr: 0, violencia_2tr: 0, violencia_3tr: 0,
         inm_antitetanica_vigente: 0, inm_antitetanica_dosis1: 0, inm_antitetanica_dosis2: 0,
         inm_examen_odontologico: 0, inm_examen_mamas: 0,
         inm_cervix_inspeccion: 'no_se_hizo', inm_cervix_pap: 'no_se_hizo', inm_cervix_colp: 'no_se_hizo',
      });

      await repositories.laboratorios.save({
         embarazo_id: eId,
         isoinmunizacion_rh: 0,
      });

      await refreshActiveEmbarazo();
      setShowInitForm(false);
    }
  };

  // Guarda los avances editados en las pestañas abiertas del formulario.
  const handleSaveAvances = async () => {
    if (!activePaciente) return;
    setSaving(true);
    try {
      if (antecedentes) {
        await repositories.antecedentes.update(activePaciente.cedula_id, antecedentes);
      }
      if (embarazo) {
        await repositories.embarazos.update(embarazo.id_embarazo, embarazo);
      }
      if (laboratorio) {
        await repositories.laboratorios.update(laboratorio.embarazo_id, laboratorio);
      }
      alert('Avances guardados exitosamente.');
      await refreshActiveEmbarazo();
    } catch (error) {
      console.error(error);
      alert('Error al guardar los avances.');
    } finally {
      setSaving(false);
    }
  };

  // Agrega un control prenatal nuevo al embarazo activo, programa la cita de seguimiento en la BD y refresca la lista visible.
  const handleAddControl = async (
    newCtrl: Omit<Control, 'id_control' | 'embarazo_id'>,
    proximaCitaDetails?: { hora: string; motivo: string }
  ) => {
    if (!activeEmbarazo || !activePaciente) return;
    const ctrl: Control = {
      ...newCtrl,
      id_control: uuidv4(),
      embarazo_id: activeEmbarazo.id_embarazo
    };
    await repositories.controles.save(ctrl);

    // Save the new scheduled appointment to repositories.citas
    if (newCtrl.proxima_cita && proximaCitaDetails?.hora) {
      const fechaCompleta = `${newCtrl.proxima_cita}T${proximaCitaDetails.hora}`;
      const nuevaCita: Cita = {
        id_cita: uuidv4(),
        cedula_id: activePaciente.cedula_id,
        fecha_cita: fechaCompleta,
        hora_cita: proximaCitaDetails.hora,
        motivo: proximaCitaDetails.motivo || 'Control Prenatal',
        estado: 'pendiente'
      };
      await repositories.citas.save(nuevaCita);
    }

    const ctrls = await repositories.controles.getByEmbarazoId(activeEmbarazo.id_embarazo);
    setControles(ctrls);
  };

  // Elimina un control prenatal con confirmación antes de persistir la modificación.
  const handleDeleteControl = async (id: string) => {
    if (!activeEmbarazo) return;
    if (confirm('¿Está seguro de que desea eliminar este control prenatal?')) {
       await repositories.controles.delete(id);
       const ctrls = await repositories.controles.getByEmbarazoId(activeEmbarazo.id_embarazo);
       setControles(ctrls);
    }
  };

  // Calcula la edad gestacional aproximada en semanas desde la FUM.
  const getGestationalAgeInWeeks = (fumStr?: string) => {
    if (!fumStr) return '--';
    const fumDate = new Date(fumStr);
    const diffTime = Math.abs(new Date().getTime() - fumDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} Semanas`;
  };

  // Busca el control más reciente para mostrar el último pesaje en la cabecera.
  const ultimoPesaje = [...controles]
    .sort((a, b) => new Date(b.fecha_visita).getTime() - new Date(a.fecha_visita).getTime())[0];

  if (!activePaciente) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8">
        <p className="text-gray-500 mb-4">Por favor, seleccione una paciente en el módulo de Pacientes.</p>
      </div>
    );
  }

  const tabs = [
    { id: 0, title: 'Antecedentes Clínicos y Obstétricos' },
    { id: 1, title: 'Inmunizaciones y Examen Físico' },
    { id: 2, title: 'Laboratorios' },
    { id: 3, title: 'Controles Prenatales' },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Encabezado superior con datos del paciente, embarazo y acceso rápido a guardar. */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between shrink-0 rounded-t-2xl">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Volver al Menú">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#2C3333]">{activePaciente.nombre} {activePaciente.apellido}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-500 uppercase">ID: {activePaciente.cedula_id}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="text-xs font-bold text-[#1E3A8A]">EG: {activeEmbarazo ? getGestationalAgeInWeeks(activeEmbarazo.fum) : '-- Semanas'}</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-gray-200"></div>
          <div className="flex gap-4">
            <div className="text-center px-3">
              <p className="text-[10px] text-gray-400 uppercase">FUM</p>
              <p className="text-xs font-semibold">{activeEmbarazo?.fum || '--/--/----'}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] text-gray-400 uppercase font-bold text-[#0D9488]">FPP</p>
              <p className="text-xs font-bold text-[#0D9488]">{activeEmbarazo?.fpp || '--/--/----'}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] text-gray-400 uppercase">Último Pesaje</p>
              <p className="text-xs font-semibold text-[#1E3A8A]">{ultimoPesaje ? `${ultimoPesaje.peso_kg} kg` : '-- kg'}</p>
            </div>
          </div>
          {!activeEmbarazo && (
            <div className="ml-4 inline-flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800">
               <span>No hay embarazo activo</span>
               <button onClick={() => setShowInitForm(true)} className="underline hover:text-amber-900 border-l border-amber-200 pl-2 ml-1 cursor-pointer">INICIAR NUEVO</button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pr-6">
          {activeEmbarazo && activeTab !== 3 && (
            <button
              type="button"
              onClick={handleSaveAvances}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#172554] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Guardando...' : 'Guardar Avances'}
            </button>
          )}
        </div>
      </header>

      {showInitForm ? (
         /* Vista para iniciar un embarazo cuando aún no existe uno activo. */
         <div className="flex-1 flex justify-center items-center p-8 bg-gray-50/50">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E8F0] max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
               <h3 className="text-xl font-bold tracking-tight text-[#2C3333] mb-2">Iniciar Embarazo</h3>
               <p className="text-sm text-gray-500 mb-6">Indique la FUM para calcular la Fecha Probable de Parto e iniciar la historia perinatal.</p>
               
               <form onSubmit={handleInitEmbarazo} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha de Última Menstruación (FUM) *</label>
                     <input required type="date" value={fum} onChange={handleCalcFpp} className="border border-[#E2E8F0] rounded p-2.5 text-sm bg-white focus:outline-none focus:border-[#2563EB]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <label className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">Fecha Probable de Parto (FPP)</label>
                     <input required type="date" value={fpp} onChange={(e) => setFpp(e.target.value)} className="border border-[#E2E8F0] rounded p-2.5 text-sm bg-amber-50/50 focus:outline-none focus:border-[#0D9488]" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] mt-6">
                     <button type="button" onClick={() => setShowInitForm(false)} className="px-5 py-2.5 rounded-lg text-gray-500 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer">Cancelar</button>
                     <button type="submit" disabled={!fum || !fpp} className="px-5 py-2.5 rounded-lg bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1D4ED8] shadow-sm transition-colors disabled:opacity-50 cursor-pointer">Iniciar Control</button>
                  </div>
               </form>
            </div>
         </div>
      ) : activeEmbarazo ? (
        // Vista principal del formulario con pestañas de seguimiento perinatal.
        <div className="flex flex-col flex-1 overflow-hidden p-6 w-full">
           <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col h-full overflow-hidden relative">
             <div className="flex justify-between items-end border-b border-[#E2E8F0] pr-4 shrink-0 bg-[#F8FAFC]">
               {/* Navegación entre las pestañas del seguimiento perinatal. */}
               <div className="flex overflow-x-auto hide-scrollbar pl-2 pt-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors",
                      activeTab === tab.id
                        ? "text-[#1E3A8A] border-[#1E3A8A]"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                    )}
                  >
                    {tab.title}
                  </button>
                ))}
               </div>
             </div>

             <div className="flex-1 overflow-auto p-6 bg-white">
               {activeTab === 0 && <TabAntecedentes antecedentes={antecedentes} setAntecedentes={setAntecedentes} embarazo={embarazo} setEmbarazo={setEmbarazo} />}
               {activeTab === 1 && <TabInmunizaciones antecedentes={antecedentes} setAntecedentes={setAntecedentes} embarazo={embarazo} setEmbarazo={setEmbarazo} />}
               {activeTab === 2 && <TabLaboratorios laboratorio={laboratorio} setLaboratorio={setLaboratorio} />}
               {activeTab === 3 && <TabControles controles={controles} onAddControl={handleAddControl} onDeleteControl={handleDeleteControl} fum={activeEmbarazo?.fum} />}
             </div>
           </div>
        </div>
      ) : (
        <div className="p-8 text-gray-500 text-center flex flex-col items-center justify-center flex-1">
           <div className="w-16 h-16 bg-[#F8FAFC] rounded-full border border-[#E2E8F0] flex items-center justify-center mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
           </div>
           <p className="text-sm">Inicie un nuevo embarazo desde la cabecera para visualizar la historia perinatal.</p>
        </div>
      )}
    </div>
  );
}

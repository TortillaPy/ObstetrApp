import React from 'react';
import { Antecedentes } from '../../../domain/entities/Antecedentes';
import { Embarazo } from '../../../domain/entities/Embarazo';
import { CheckboxField, NumField, RadioField } from './SharedFields';

interface TabAntecedentesProps {
  antecedentes: Antecedentes | null;
  setAntecedentes: React.Dispatch<React.SetStateAction<Antecedentes | null>>;
  embarazo: Embarazo | null;
  setEmbarazo: React.Dispatch<React.SetStateAction<Embarazo | null>>;
}

// Pestaña de antecedentes maternos y obstétricos del formulario de perinatal.
export function TabAntecedentes({ antecedentes, setAntecedentes, embarazo, setEmbarazo }: TabAntecedentesProps) {
  if (!antecedentes || !embarazo) return null;

  // Alterna valores binarios de los antecedentes (sí/no) dentro del estado local.
  const handleCheckbox = (field: keyof Antecedentes) => {
    setAntecedentes(prev => prev ? { ...prev, [field]: prev[field] === 1 ? 0 : 1 } : null);
  };

  // Actualiza campos numéricos de antecedentes con respaldo a 0 si el valor no es válido.
  const handleNumber = (field: keyof Antecedentes, val: number) => {
    setAntecedentes(prev => prev ? { ...prev, [field]: isNaN(val) ? 0 : val } : null);
  };

  // Actualiza los datos básicos del embarazo actual desde inputs numéricos.
  const handleEmbarazoNumber = (field: keyof Embarazo, val: number) => {
    setEmbarazo(prev => prev ? { ...prev, [field]: isNaN(val) ? 0 : val } : null);
  };

  // Guarda opciones seleccionadas de texto o enum en el estado de antecedentes.
  const handleSelectAntecedentes = (field: keyof Antecedentes, val: any) => {
    setAntecedentes(prev => prev ? { ...prev, [field]: val } : null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        {/* Sección de antecedentes familiares y personales del paciente. */}
        <h3 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">Antecedentes Familiares y Personales</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
          <CheckboxField label="TBC" checked={antecedentes.ant_tbc === 1} onChange={() => handleCheckbox('ant_tbc')} />
          <CheckboxField label="Diabetes" checked={antecedentes.ant_diabetes === 1} onChange={() => handleCheckbox('ant_diabetes')} />
          <CheckboxField label="Hipertensión" checked={antecedentes.ant_hipertension === 1} onChange={() => handleCheckbox('ant_hipertension')} />
          <CheckboxField label="Preeclampsia" checked={antecedentes.ant_preeclampsia === 1} onChange={() => handleCheckbox('ant_preeclampsia')} />
          <CheckboxField label="Eclampsia" checked={antecedentes.ant_eclampsia === 1} onChange={() => handleCheckbox('ant_eclampsia')} />
          <CheckboxField label="Cardiopatía" checked={antecedentes.ant_cardiopatia === 1} onChange={() => handleCheckbox('ant_cardiopatia')} />
          <CheckboxField label="Nefropatía" checked={antecedentes.ant_nefropatia === 1} onChange={() => handleCheckbox('ant_nefropatia')} />
          <CheckboxField label="Infertilidad" checked={antecedentes.ant_infertilidad === 1} onChange={() => handleCheckbox('ant_infertilidad')} />
          <CheckboxField label="Cirugía G-U" checked={antecedentes.ant_cirugia_genito_urinaria === 1} onChange={() => handleCheckbox('ant_cirugia_genito_urinaria')} />
          <CheckboxField label="Violencia" checked={antecedentes.ant_violencia === 1} onChange={() => handleCheckbox('ant_violencia')} />
          <CheckboxField label="Otra Condición" checked={antecedentes.ant_otra_condicion_grave === 1} onChange={() => handleCheckbox('ant_otra_condicion_grave')} />
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cirugías Específicas / Detalles</label>
           <input type="text" value={antecedentes.ant_cirugias_especificas_texto || ''} onChange={(e) => setAntecedentes({ ...antecedentes, ant_cirugias_especificas_texto: e.target.value })} className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]" />
        </div>
      </div>

      <div>
        {/* Historial obstétrico previo y datos cuantitativos relevantes. */}
        <h3 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">Antecedentes Obstétricos Anteriores</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <NumField label="Gestas previas" value={antecedentes.hist_gestas_previas} onChange={(v) => handleNumber('hist_gestas_previas', v)} />
          <NumField label="Partos" value={antecedentes.hist_partos} onChange={(v) => handleNumber('hist_partos', v)} />
          <NumField label="Vaginales" value={antecedentes.hist_vaginales} onChange={(v) => handleNumber('hist_vaginales', v)} />
          <NumField label="Cesáreas" value={antecedentes.hist_cesareas} onChange={(v) => handleNumber('hist_cesareas', v)} />
          <NumField label="Abortos" value={antecedentes.hist_abortos} onChange={(v) => handleNumber('hist_abortos', v)} />
          <NumField label="Nacidos vivos" value={antecedentes.hist_nacidos_vivos} onChange={(v) => handleNumber('hist_nacidos_vivos', v)} />
          <NumField label="Nacidos muertos" value={antecedentes.hist_nacidos_muertos} onChange={(v) => handleNumber('hist_nacidos_muertos', v)} />
          <NumField label="Viven" value={antecedentes.hist_viven} onChange={(v) => handleNumber('hist_viven', v)} />
          <CheckboxField label="3 Abortos Espontáneos Consecutivos" checked={antecedentes.hist_abortos_tres_espontaneos_consecutivos === 1} onChange={() => handleCheckbox('hist_abortos_tres_espontaneos_consecutivos')} className="col-span-2 self-center mt-4" />
          <CheckboxField label="Muerto 1ra sem" checked={antecedentes.hist_nacidos_vivos_muertos_1ra_semana === 1} onChange={() => handleCheckbox('hist_nacidos_vivos_muertos_1ra_semana')} className="col-span-2 self-center mt-4" />
          <CheckboxField label="Muerto después 1ra sem" checked={antecedentes.hist_nacidos_vivos_muertos_despues_1ra_semana === 1} onChange={() => handleCheckbox('hist_nacidos_vivos_muertos_despues_1ra_semana')} className="col-span-2 self-center mt-4" />
          <div className="flex flex-col gap-1.5 col-span-2">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fecha de fin de embarazo anterior</label>
             <input type="date" value={antecedentes.hist_fin_embarazo_anterior_fecha || ''} onChange={(e) => setAntecedentes({ ...antecedentes, hist_fin_embarazo_anterior_fecha: e.target.value })} className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]" />
          </div>
          <CheckboxField label="Fin embarazo ant. < 1 año" checked={antecedentes.hist_fin_embarazo_anterior_menos_de_1_anio === 1} onChange={() => handleCheckbox('hist_fin_embarazo_anterior_menos_de_1_anio')} className="col-span-2 self-center mt-4" />
        </div>
      </div>

      <div>
        {/* Datos generales del embarazo actual para seguimiento clínico. */}
        <h3 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">Datos Básicos del Embarazo Actual</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumField label="Peso Anterior (kg)" value={embarazo.peso_anterior_kg} onChange={(v) => handleEmbarazoNumber('peso_anterior_kg', v)} step="0.1" />
          <NumField label="Talla (cm)" value={embarazo.talla_cm} onChange={(v) => handleEmbarazoNumber('talla_cm', v)} />
          <div className="flex flex-col gap-1.5 flex-1">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Planificado</label>
             <div className="flex gap-4 p-2">
                 <RadioField name="hist_embarazo_planeado" label="Sí" checked={antecedentes.hist_embarazo_planeado === 1} onChange={() => setAntecedentes({ ...antecedentes, hist_embarazo_planeado: 1 })} />
                 <RadioField name="hist_embarazo_planeado" label="No" checked={antecedentes.hist_embarazo_planeado === 0} onChange={() => setAntecedentes({ ...antecedentes, hist_embarazo_planeado: 0 })} />
             </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Método Fracasado</label>
             <select value={antecedentes.hist_fracaso_anticonceptivo || 'no'} onChange={(e) => handleSelectAntecedentes('hist_fracaso_anticonceptivo', e.target.value)} className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]">
               <option value="no">No usaba</option>
               <option value="barrera">Barrera</option>
               <option value="diu">DIU</option>
               <option value="hormonal">Hormonal</option>
               <option value="emergencia">Emergencia</option>
               <option value="natural">Natural</option>
             </select>
          </div>
        </div>
      </div>
    </div>
  );
}

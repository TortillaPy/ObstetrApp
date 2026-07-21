import React from 'react';
import { Antecedentes } from '../../../domain/entities/Antecedentes';
import { Embarazo, CervixEvalStatus } from '../../../domain/entities/Embarazo';
import { CheckboxField, NumField } from './SharedFields';

interface TabInmunizacionesProps {
  antecedentes: Antecedentes | null;
  setAntecedentes: React.Dispatch<React.SetStateAction<Antecedentes | null>>;
  embarazo: Embarazo | null;
  setEmbarazo: React.Dispatch<React.SetStateAction<Embarazo | null>>;
}

// Pestaña de inmunizaciones, examen físico y hábitos de riesgo del embarazo actual.
export function TabInmunizaciones({ antecedentes, setAntecedentes, embarazo, setEmbarazo }: TabInmunizacionesProps) {
  if (!antecedentes || !embarazo) return null;

  // Alterna valores binarios del embarazo (0/1) para controles rápidos.
  const handleCheckboxEmbarazo = (field: keyof Embarazo) => {
    setEmbarazo(prev => prev ? { ...prev, [field]: prev[field] === 1 ? 0 : 1 } : null);
  };

  // Actualiza campos numéricos del embarazo con valor seguro si la entrada no es válida.
  const handleEmbarazoNum = (field: keyof Embarazo, val: number) => {
    setEmbarazo(prev => prev ? { ...prev, [field]: isNaN(val) ? 0 : val } : null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">

      {/* Sección de hábitos de riesgo y violencia por trimestre. */}
      <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0] mt-6">
         <p className="text-xs font-bold text-gray-600 mb-4 uppercase tracking-wider">Hábitos de Riesgo y Violencia por Trimestre</p>
         <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
               <thead>
                  <tr className="border-b border-[#E2E8F0]">
                     <th className="py-2 font-bold text-gray-500 uppercase">Hábito / Condición</th>
                     <th className="py-2 text-center font-bold text-gray-500 uppercase">1º Trimestre</th>
                     <th className="py-2 text-center font-bold text-gray-500 uppercase">2º Trimestre</th>
                     <th className="py-2 text-center font-bold text-gray-500 uppercase">3º Trimestre</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className="border-b border-[#E2E8F0]">
                     <td className="py-3 font-semibold text-gray-700">Fumadora Activa</td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.fumadora_activa_1tr === 1} onChange={() => setEmbarazo({ ...embarazo, fumadora_activa_1tr: embarazo.fumadora_activa_1tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.fumadora_activa_2tr === 1} onChange={() => setEmbarazo({ ...embarazo, fumadora_activa_2tr: embarazo.fumadora_activa_2tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.fumadora_activa_3tr === 1} onChange={() => setEmbarazo({ ...embarazo, fumadora_activa_3tr: embarazo.fumadora_activa_3tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0]">
                     <td className="py-3 font-semibold text-gray-700">Fumadora Pasiva</td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.fumadora_pasiva_1tr === 1} onChange={() => setEmbarazo({ ...embarazo, fumadora_pasiva_1tr: embarazo.fumadora_pasiva_1tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.fumadora_pasiva_2tr === 1} onChange={() => setEmbarazo({ ...embarazo, fumadora_pasiva_2tr: embarazo.fumadora_pasiva_2tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.fumadora_pasiva_3tr === 1} onChange={() => setEmbarazo({ ...embarazo, fumadora_pasiva_3tr: embarazo.fumadora_pasiva_3tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0]">
                     <td className="py-3 font-semibold text-gray-700">Consumo de Drogas</td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.drogas_1tr === 1} onChange={() => setEmbarazo({ ...embarazo, drogas_1tr: embarazo.drogas_1tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.drogas_2tr === 1} onChange={() => setEmbarazo({ ...embarazo, drogas_2tr: embarazo.drogas_2tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.drogas_3tr === 1} onChange={() => setEmbarazo({ ...embarazo, drogas_3tr: embarazo.drogas_3tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0]">
                     <td className="py-3 font-semibold text-gray-700">Consumo de Alcohol</td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.alcohol_1tr === 1} onChange={() => setEmbarazo({ ...embarazo, alcohol_1tr: embarazo.alcohol_1tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.alcohol_2tr === 1} onChange={() => setEmbarazo({ ...embarazo, alcohol_2tr: embarazo.alcohol_2tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.alcohol_3tr === 1} onChange={() => setEmbarazo({ ...embarazo, alcohol_3tr: embarazo.alcohol_3tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0]">
                     <td className="py-3 font-semibold text-gray-700">Situación de Violencia</td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.violencia_1tr === 1} onChange={() => setEmbarazo({ ...embarazo, violencia_1tr: embarazo.violencia_1tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.violencia_2tr === 1} onChange={() => setEmbarazo({ ...embarazo, violencia_2tr: embarazo.violencia_2tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                     <td className="py-3 text-center">
                        <input type="checkbox" checked={embarazo.violencia_3tr === 1} onChange={() => setEmbarazo({ ...embarazo, violencia_3tr: embarazo.violencia_3tr === 1 ? 0 : 1 })} className="rounded text-[#2563EB]" />
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
      
      {/* Inmunizaciones principales del embarazo y su estado de aplicación. */}
      <div>
        <h3 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">Inmunizaciones Principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0]">
              <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Antirrubéola</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estado</label>
                <select
                  value={antecedentes.inm_antirubeola || 'no'}
                  onChange={(e) => setAntecedentes({ ...antecedentes, inm_antirubeola: e.target.value as any })}
                  className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="previa">Previa</option>
                  <option value="no_sabe">No Sabe</option>
                  <option value="embarazo">Embarazo</option>
                  <option value="no">No</option>
                </select>
              </div>
           </div>
           <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0]">
              <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Antitetánica / Antidiftérica</p>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center flex-wrap">
                  <CheckboxField label="Vigente" checked={embarazo.inm_antitetanica_vigente === 1} onChange={() => handleCheckboxEmbarazo('inm_antitetanica_vigente')} />
                  <CheckboxField label="Dosis 1" checked={embarazo.inm_antitetanica_dosis1 === 1} onChange={() => handleCheckboxEmbarazo('inm_antitetanica_dosis1')} />
                  <CheckboxField label="Dosis 2" checked={embarazo.inm_antitetanica_dosis2 === 1} onChange={() => handleCheckboxEmbarazo('inm_antitetanica_dosis2')} />
                </div> 
               </div>
           </div>
        </div>
      </div>
     
      {/* Evaluación física adicional del control prenatal. */}
      <div>
        <h3 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">Examen Físico Adicional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] items-end">
           <CheckboxField label="Examen Odontológico" checked={embarazo.inm_examen_odontologico === 1} onChange={() => handleCheckboxEmbarazo('inm_examen_odontologico')} className="mb-2" />
           <CheckboxField label="Examen Mamas Normal" checked={embarazo.inm_examen_mamas === 1} onChange={() => handleCheckboxEmbarazo('inm_examen_mamas')} className="mb-2" />
           <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cérvix Inspección</label>
             <select value={embarazo.inm_cervix_inspeccion || 'no_se_hizo'} onChange={(e) => setEmbarazo({ ...embarazo, inm_cervix_inspeccion: e.target.value as CervixEvalStatus })} className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]">
               <option value="no_se_hizo">No se hizo</option>
               <option value="normal">Normal</option>
               <option value="anormal">Anormal</option>
             </select>
           </div>
           <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cérvix PAP</label>
             <select value={embarazo.inm_cervix_pap || 'no_se_hizo'} onChange={(e) => setEmbarazo({ ...embarazo, inm_cervix_pap: e.target.value as CervixEvalStatus })} className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]">
               <option value="no_se_hizo">No se hizo</option>
               <option value="normal">Normal</option>
               <option value="anormal">Anormal</option>
             </select>
           </div>
           <div className="flex flex-col gap-1.5 lg:col-start-3">
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cérvix Colposcopia</label>
             <select value={embarazo.inm_cervix_colp || 'no_se_hizo'} onChange={(e) => setEmbarazo({ ...embarazo, inm_cervix_colp: e.target.value as CervixEvalStatus })} className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]">
               <option value="no_se_hizo">No se hizo</option>
               <option value="normal">Normal</option>
               <option value="anormal">Anormal</option>
             </select>
           </div>
        </div>
      </div>

    </div>
  );
}

import React from "react";
import {
  Laboratorio,
  ToxoplasmosisVal,
  SifilisVDLR,
  SifilisTratamiento,
  EstreptococoB,
} from "../../../domain/entities/Laboratorio";
import { CheckboxField, NumField, SelectLabEnum } from "./SharedFields";

interface TabLaboratoriosProps {
  laboratorio: Laboratorio | null;
  setLaboratorio: React.Dispatch<React.SetStateAction<Laboratorio | null>>;
}

// Pestaña de laboratorio para registrar resultados clínicos del embarazo actual.
export function TabLaboratorios({
  laboratorio,
  setLaboratorio,
}: TabLaboratoriosProps) {
  if (!laboratorio) return null;

  // Actualiza campos de selección de enum o texto en el estado del laboratorio.
  const handleSelect = (field: keyof Laboratorio, val: any) => {
    setLaboratorio((prev) => (prev ? { ...prev, [field]: val } : null));
  };

  // Guarda valores numéricos de laboratorio con validación para evitar entradas inválidas.
  const handleNumber = (field: keyof Laboratorio, val: number) => {
    setLaboratorio((prev) =>
      prev ? { ...prev, [field]: isNaN(val) ? undefined : val } : null,
    );
  };

  // Alterna valores binarios para indicadores como solicitado, realizado o indicado.
  const handleCheckbox = (field: keyof Laboratorio) => {
    setLaboratorio((prev) =>
      prev ? { ...prev, [field]: prev[field] === 1 ? 0 : 1 } : null,
    );
  };

  const optionsPosNeg: {
    value: ToxoplasmosisVal | SifilisVDLR | EstreptococoB;
    label: string;
  }[] = [
    { value: "negativo", label: "NEGATIVO" },
    { value: "positivo", label: "POSITIVO" },
    { value: "no_se_hizo", label: "NO SE HIZO" },
  ];

  const optionsNormalAnormal = [
    { value: "normal", label: "NORMAL" },
    { value: "anormal", label: "ANORMAL" },
    { value: "no_se_hizo", label: "NO SE HIZO" },
  ];

  const optionsHbsAg = [
    { value: "positivo", label: "POSITIVO" },
    { value: "negativo", label: "NEGATIVO" },
    { value: "no_se_hizo", label: "NO SE HIZO" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado de la sección de resultados de laboratorio. */}
      <h3 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">
        Panel de Laboratorios
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Ingrese los resultados de los exámenes de laboratorio del embarazo
        actual.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Grupo de toxoplasmosis y serología inicial. */}
        <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
          <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">
            Toxoplasmosis
          </h4>
          <div className="space-y-4">
            <SelectLabEnum
              label="<20 sem IgG"
              value={laboratorio.toxo_menor_20sem_igg || ""}
              onChange={(v) => handleSelect("toxo_menor_20sem_igg", v)}
              options={optionsPosNeg}
            />
            <SelectLabEnum
              label=">=20 sem IgG"
              value={laboratorio.toxo_mayor_20sem_igg || ""}
              onChange={(v) => handleSelect("toxo_mayor_20sem_igg", v)}
              options={optionsPosNeg}
            />
            <SelectLabEnum
              label="1ra consulta IgM"
              value={laboratorio.toxo_primera_consulta_igm || ""}
              onChange={(v) => handleSelect("toxo_primera_consulta_igm", v)}
              options={optionsPosNeg}
            />
          </div>
        </div>

        {/* Resultados de glucemia y tolerancia a la glucosa. */}
        <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
          <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">
            Glucemia en Ayunas
          </h4>
          <div className="space-y-4 flex flex-col">
            <NumField
              label="<20 sem (mg/dl)"
              value={laboratorio.glucemia_menor_20sem ?? 0}
              onChange={(v) => handleNumber("glucemia_menor_20sem", v)}
              min="0"
              step="0.1"
              className="w-full"
            />
            <NumField
              label="≥30 sem (mg/dl)"
              value={laboratorio.glucemia_mayor_30sem ?? 0}
              onChange={(v) => handleNumber("glucemia_mayor_30sem", v)}
              min="0"
              step="0.1"
              className="w-full"
            />
            <NumField
              label="TTGO (mg/dl)"
              value={laboratorio.ttgo_resultado_mg_dl ?? 0}
              onChange={(v) => handleNumber("ttgo_resultado_mg_dl", v)}
              min="0"
              step="0.1"
              className="w-full"
            />
          </div>
        </div>

        {/* Serología de sífilis y tratamiento correspondiente. */}
        <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
          <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">
            Sífilis (VDRL/RPR)
          </h4>
          <div className="space-y-4">
            <SelectLabEnum
              label="<20 sem VDRL"
              value={laboratorio.sifilis_vdrl_menor_20sem || ""}
              onChange={(v) => handleSelect("sifilis_vdrl_menor_20sem", v)}
              options={optionsPosNeg}
            />
            <SelectLabEnum
              label=">=20 sem VDRL"
              value={laboratorio.sifilis_vdrl_mayor_20sem || ""}
              onChange={(v) => handleSelect("sifilis_vdrl_mayor_20sem", v)}
              options={optionsPosNeg}
            />
            <CheckboxField
              label="Confirmada FTA"
              checked={laboratorio.sifilis_confirmada_fta === 1}
              onChange={() => handleCheckbox("sifilis_confirmada_fta")}
              className="mt-2"
            />
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Tratamiento
              </label>
              <select
                value={laboratorio.sifilis_tratamiento || "no_corresponde"}
                onChange={(e) =>
                  handleSelect(
                    "sifilis_tratamiento",
                    e.target.value as SifilisTratamiento,
                  )
                }
                className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value="no_corresponde">No Corresponde</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estado de solicitud, realización y resultado de VIH por trimestre. */}
        <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
          <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">
            VIH
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                &lt;20 semanas
              </p>
              <div className="flex gap-4 items-center mb-2">
                <CheckboxField
                  label="Sol."
                  checked={laboratorio.vih_menor_20sem_solicitado === 1}
                  onChange={() => handleCheckbox("vih_menor_20sem_solicitado")}
                />
                <CheckboxField
                  label="Real."
                  checked={laboratorio.vih_menor_20sem_realizado === 1}
                  onChange={() => handleCheckbox("vih_menor_20sem_realizado")}
                />
              </div>
              <SelectLabEnum
                label="Resultado"
                value={laboratorio.vih_menor_20sem_resultado || ""}
                onChange={(v) => handleSelect("vih_menor_20sem_resultado", v)}
                options={[
                  { value: "-", label: "NEGATIVO (-)" },
                  { value: "+", label: "POSITIVO (+)" },
                ]}
              />
            </div>
            <div className="border-t border-[#E2E8F0] pt-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                &ge;20 semanas
              </p>
              <div className="flex gap-4 items-center mb-2">
                <CheckboxField
                  label="Sol."
                  checked={laboratorio.vih_mayor_20sem_solicitado === 1}
                  onChange={() => handleCheckbox("vih_mayor_20sem_solicitado")}
                />
                <CheckboxField
                  label="Real."
                  checked={laboratorio.vih_mayor_20sem_realizado === 1}
                  onChange={() => handleCheckbox("vih_mayor_20sem_realizado")}
                />
              </div>
              <SelectLabEnum
                label="Resultado"
                value={laboratorio.vih_mayor_20sem_resultado || ""}
                onChange={(v) => handleSelect("vih_mayor_20sem_resultado", v)}
                options={[
                  { value: "-", label: "NEGATIVO (-)" },
                  { value: "+", label: "POSITIVO (+)" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Hemoglobina y manejo con hierro/folatos. */}
        <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
          <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">
            Hemoglobina (Hb)
          </h4>
          <div className="space-y-4 flex flex-col">
            <NumField
              label="<20 sem (g/dl)"
              value={laboratorio.hb_menor_20sem ?? 0}
              onChange={(v) => handleNumber("hb_menor_20sem", v)}
              min="0"
              step="0.1"
              className="w-full"
            />
            <NumField
              label="≥20 sem (g/dl)"
              value={laboratorio.hb_mayor_20sem ?? 0}
              onChange={(v) => handleNumber("hb_mayor_20sem", v)}
              min="0"
              step="0.1"
              className="w-full"
            />
            <CheckboxField
              label="Hierro/Folatos Indicados"
              checked={laboratorio.hierro_folatos_indicados === 1}
              onChange={() => handleCheckbox("hierro_folatos_indicados")}
              className="mt-2"
            />
          </div>
        </div>

        {/* Otros exámenes complementarios y resultados auxiliares. */}
        <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5">
          <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">
            Otros Exámenes
          </h4>
          <div className="space-y-3 flex flex-col">
            <SelectLabEnum
              label="Chagas"
              value={laboratorio.chagas || ""}
              onChange={(v) => handleSelect("chagas", v)}
              options={optionsPosNeg}
            />
            <SelectLabEnum
              label="Paludismo / Malaria"
              value={laboratorio.paludismo_malaria || ""}
              onChange={(v) => handleSelect("paludismo_malaria", v)}
              options={optionsPosNeg}
            />
            <SelectLabEnum
              label="Estreptococo B"
              value={laboratorio.estreptococo_b || ""}
              onChange={(v) => handleSelect("estreptococo_b", v)}
              options={optionsPosNeg}
            />
            <NumField
              label="TSH (uUI/ml)"
              value={laboratorio.tsh_valor ?? 0}
              onChange={(v) => handleNumber("tsh_valor", v)}
              min="0"
              step="0.01"
              className="w-full"
            />
            <SelectLabEnum
              label="Hepatitis B (HBsAg)"
              value={laboratorio.hb_hepatitis_b || ""}
              onChange={(v) => handleSelect("hb_hepatitis_b", v)}
              options={optionsHbsAg}
            />
          </div>
        </div>

        <SelectLabEnum
          label="Bacteriuria Resultado"
          value={laboratorio.bacteriuria_resultado || ""}
          onChange={(v) => handleSelect("bacteriuria_resultado", v)}
          options={optionsNormalAnormal}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Bacteriuria Semanas
          </label>
          <select
            value={laboratorio.bacteriuria_semanas || ""}
            onChange={(e) =>
              handleSelect("bacteriuria_semanas", e.target.value)
            }
            className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">Seleccione...</option>
            <option value="<20_sem">&lt;20 Semanas</option>
            <option value=">=20_sem">&ge;20 Semanas</option>
          </select>
        </div>
        <CheckboxField
          label="Isoinmunización Rh"
          checked={laboratorio.isoinmunizacion_rh === 1}
          onChange={() => handleCheckbox("isoinmunizacion_rh")}
        />
      </div>

      {/* Educación preparto, prevención y bacteriuria. */}
      <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-5 md:col-span-3">
        <h4 className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 mb-4">
          Educación y Prevención
        </h4>
        <div className="flex gap-8 items-center flex-wrap">
          <CheckboxField
            label="Preparación para el parto"
            checked={laboratorio.preparacion_parto === 1}
            onChange={() => handleCheckbox("preparacion_parto")}
          />
          <CheckboxField
            label="Consejería en lactancia materna"
            checked={laboratorio.consejeria_lactancia === 1}
            onChange={() => handleCheckbox("consejeria_lactancia")}
          />
        </div>
      </div>
    </div>
  );
}

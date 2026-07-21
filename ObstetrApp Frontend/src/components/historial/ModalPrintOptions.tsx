import React, { useState } from 'react';
import { X, Printer, Stethoscope, Heart, Activity, FileText } from 'lucide-react';

interface ModalPrintOptionsProps {
  onClose: () => void;
  onPrint: (options: { consulta: boolean; ginecologia: boolean; perinatal: boolean; estudios: boolean }) => void;
}

export function ModalPrintOptions({ onClose, onPrint }: ModalPrintOptionsProps) {
  const [options, setOptions] = useState({
    consulta: true,
    ginecologia: true,
    perinatal: true,
    estudios: true,
  });

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrint = () => {
    onPrint(options);
  };

  // Check if at least one option is selected
  const hasSelection = Object.values(options).some(val => val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <Printer className="w-5 h-5" />
            <h3 className="font-bold text-lg text-[#2C3333]">Configurar Impresión</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-500">
            Los datos demográficos y la ficha de contacto de la paciente se incluirán de forma automática. Seleccione qué módulos clínicos desea añadir al reporte impreso:
          </p>

          <div className="grid grid-cols-1 gap-3">
            {/* Option 1: SOAP Consultations */}
            <button
              type="button"
              onClick={() => toggleOption('consulta')}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                options.consulta 
                  ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-sm' 
                  : 'border-[#E2E8F0] bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${
                options.consulta 
                  ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800">Consulta Normal (SOAP)</h4>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Síntomas, Examen Físico, Diagnósticos y Recetas</p>
              </div>
              <input 
                type="checkbox" 
                checked={options.consulta} 
                onChange={() => {}} // Controlled via button click
                className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] w-4 h-4 pointer-events-none" 
              />
            </button>

            {/* Option 2: Gynecology Consultations */}
            <button
              type="button"
              onClick={() => toggleOption('ginecologia')}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                options.ginecologia 
                  ? 'border-[#0D9488] bg-[#0D9488]/5 shadow-sm' 
                  : 'border-[#E2E8F0] bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${
                options.ginecologia 
                  ? 'bg-[#0D9488] border-[#0D9488] text-white' 
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800">Evolución Ginecológica</h4>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Hitos, MAC, Mamas, Especuloscopía y Tacto</p>
              </div>
              <input 
                type="checkbox" 
                checked={options.ginecologia} 
                onChange={() => {}}
                className="rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488] w-4 h-4 pointer-events-none" 
              />
            </button>

            {/* Option 3: Perinatal Control */}
            <button
              type="button"
              onClick={() => toggleOption('perinatal')}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                options.perinatal 
                  ? 'border-[#1E3A8A] bg-[#1E3A8A]/5 shadow-sm' 
                  : 'border-[#E2E8F0] bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${
                options.perinatal 
                  ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white' 
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800">Control Perinatal (Carnet)</h4>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">FUM/FPP, Gestas/Partos, Controles Evolutivos y Peso</p>
              </div>
              <input 
                type="checkbox" 
                checked={options.perinatal} 
                onChange={() => {}}
                className="rounded border-[#E2E8F0] text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4 pointer-events-none" 
              />
            </button>

            {/* Option 4: Diagnostic Studies */}
            <button
              type="button"
              onClick={() => toggleOption('estudios')}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                options.estudios 
                  ? 'border-[#5c808f] bg-[#5c808f]/5 shadow-sm' 
                  : 'border-[#E2E8F0] bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${
                options.estudios 
                  ? 'bg-[#5c808f] border-[#5c808f] text-white' 
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800">Estudios y Exámenes</h4>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Ecografías Obstétricas, PAP/Colpo y Laboratorios</p>
              </div>
              <input 
                type="checkbox" 
                checked={options.estudios} 
                onChange={() => {}}
                className="rounded border-[#E2E8F0] text-[#5c808f] focus:ring-[#5c808f] w-4 h-4 pointer-events-none" 
              />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E2E8F0] flex justify-end gap-3 bg-gray-50">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-gray-500 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handlePrint}
            disabled={!hasSelection}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#172554] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Imprimir Reporte
          </button>
        </div>

      </div>
    </div>
  );
}

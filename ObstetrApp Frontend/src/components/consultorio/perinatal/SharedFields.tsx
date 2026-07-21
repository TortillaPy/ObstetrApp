import React from 'react';
import { cn } from '../../../lib/utils';

// Componentes reutilizables para los formularios de perinatal.

export function CheckboxField({ label, checked, onChange, className }: { label: string, checked: boolean, onChange: () => void, className?: string }) {
  // Campo tipo checkbox con estilo consistente para opciones binarias.
  return (
    <label className={cn("flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer", className)}>
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]" />
      {label}
    </label>
  );
}

export function RadioField({ label, name, checked, onChange }: { label: string, name: string, checked: boolean, onChange: () => void }) {
  // Opción de radio compacta para seleccionar una alternativa dentro de un grupo.
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-wider cursor-pointer bg-white px-2 py-1 rounded border border-[#E2E8F0] hover:bg-[#F8FAFC]">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]" />
      {label}
    </label>
  );
}

export function NumField({ label, value, onChange, className, step, min = "0" }: { label: string, value: number, onChange: (v: number) => void, className?: string, step?: string, min?: string }) {
  // Campo numérico para valores médicos o de control con validación básica.
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <input type="number" step={step} min={min} value={value !== undefined && value !== null ? value : ''} onChange={(e) => onChange(Number(e.target.value))} className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]" />
    </div>
  );
}

export function SelectLabEnum({ label, value, onChange, options }: { label: string, value: string, onChange: (v: any) => void, options: { value: string, label: string }[] }) {
  // Selector desplegable para enums de laboratorio con opción inicial vacía.
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="border border-[#E2E8F0] rounded p-2 text-sm bg-white focus:outline-none focus:border-[#2563EB]">
        <option value="">Seleccione...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

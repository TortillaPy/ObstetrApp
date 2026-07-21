import React from 'react';

export function PrintHeader() {
  return (
    <div className="hidden print:block mb-6 border-b-2 border-black pb-4 w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black leading-tight text-black">Dr. José Nicora</h2>
          <p className="text-sm font-bold text-black uppercase tracking-wider mt-1">Ginecología y Obstetricia</p>
          <p className="text-xs font-semibold text-black mt-1">Especialista en Ecografía General, Ginecológica y Obstetricia</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-black bg-gray-100 px-3 py-1 rounded-sm inline-block border border-gray-300 shadow-sm">Rg. Prof. 13606</p>
          <div className="mt-2 text-[11px] text-black">
             <p className="font-bold uppercase tracking-wider">Atención Médica Integral</p>
             <p>Asunción, Paraguay</p>
          </div>
        </div>
      </div>
    </div>
  );
}

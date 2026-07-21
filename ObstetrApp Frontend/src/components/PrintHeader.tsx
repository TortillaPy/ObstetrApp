import React from 'react';
import { DOCTOR_CONFIG } from '../lib/config';

export function PrintHeader() {
  return (
    <div className="hidden print:block mb-6 border-b-2 border-black pb-4 w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black leading-tight text-black">{DOCTOR_CONFIG.name}</h2>
          <p className="text-sm font-bold text-black uppercase tracking-wider mt-1">{DOCTOR_CONFIG.specialty}</p>
          <p className="text-xs font-semibold text-black mt-1">{DOCTOR_CONFIG.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-black bg-gray-100 px-3 py-1 rounded-sm inline-block border border-gray-300 shadow-sm">{DOCTOR_CONFIG.license}</p>
          <div className="mt-2 text-[11px] text-black">
             <p className="font-bold uppercase tracking-wider">{DOCTOR_CONFIG.clinicName}</p>
             <p>{DOCTOR_CONFIG.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

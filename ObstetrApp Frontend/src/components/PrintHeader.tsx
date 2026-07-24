import React from 'react';
import { DOCTOR_CONFIG } from '../lib/config';
import { useAuthStore } from '../data/stores/useAuthStore';

export function PrintHeader() {
  const { user } = useAuthStore();

  const doctorName = user && user.nombre && user.apellido
    ? `Dr. ${user.nombre} ${user.apellido}`
    : DOCTOR_CONFIG.name;

  const doctorSpecialty = user?.especialidad || DOCTOR_CONFIG.specialty;
  const doctorLicense = user?.registro_prof || DOCTOR_CONFIG.license;
  const clinicName = user?.nombre_clinica || DOCTOR_CONFIG.clinicName;
  const clinicLocation = user?.direccion || DOCTOR_CONFIG.location;

  return (
    <div className="hidden print:block mb-6 border-b-2 border-black pb-4 w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black leading-tight text-black">{doctorName}</h2>
          <p className="text-sm font-bold text-black uppercase tracking-wider mt-1">{doctorSpecialty}</p>
          <p className="text-xs font-semibold text-black mt-1">{DOCTOR_CONFIG.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-black bg-gray-100 px-3 py-1 rounded-sm inline-block border border-gray-300 shadow-sm">{doctorLicense}</p>
          <div className="mt-2 text-[11px] text-black">
             <p className="font-bold uppercase tracking-wider">{clinicName}</p>
             <p>{clinicLocation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

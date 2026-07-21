export interface DoctorProfile {
  name: string;
  sidebarName: string;
  specialty: string;
  subtitle: string;
  license: string;
  clinicName: string;
  location: string;
}

export const DOCTOR_CONFIG: DoctorProfile = {
  name: import.meta.env.VITE_DOCTOR_NAME || 'Dr. Obstetra',
  sidebarName: import.meta.env.VITE_DOCTOR_SIDEBAR_NAME || import.meta.env.VITE_DOCTOR_NAME || 'Dr. Obstetra',
  specialty: import.meta.env.VITE_DOCTOR_SPECIALTY || 'Ginecología y Obstetricia',
  subtitle: import.meta.env.VITE_DOCTOR_SUBTITLE || 'Especialista en Ecografía General, Ginecológica y Obstetricia',
  license: import.meta.env.VITE_DOCTOR_LICENSE || 'Rg. Prof. 00000',
  clinicName: import.meta.env.VITE_CLINIC_NAME || 'Atención Médica Integral',
  location: import.meta.env.VITE_CLINIC_LOCATION || 'Asunción, Paraguay',
};

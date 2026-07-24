import React, { createContext, useContext, useState, useEffect } from 'react';
import { Paciente } from '../domain/entities/Paciente';
import { Embarazo } from '../domain/entities/Embarazo';
import { repositories } from '../lib/di';
import { useAuthStore } from '../data/stores/useAuthStore';

export interface DoctorUser {
  id_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  especialidad?: string;
  registro_prof?: string | null;
  nombre_clinica?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  rol: 'MEDICO' | 'ADMIN';
  estado_suscripcion?: 'ACTIVO' | 'TRIAL' | 'PENDIENTE_PAGO' | 'SUSPENDIDO' | 'PERMANENTE';
  fecha_vencimiento?: string | null;
  plan?: 'PREMIUM' | 'BASICO' | 'ULTIMATE';
  monto_mensual?: number | null;
  notas_admin?: string | null;
}

export const MOCK_PATIENT_DEMO: Paciente = {
  cedula_id: '9999999-MOCK',
  nombre: 'María Elena (MOCK DE REFERENCIA)',
  apellido: 'Benítez',
  domicilio: 'Av. Mcal. López 1230, Asunción',
  telefono: '+595 981 000111',
  localidad: 'Asunción',
  fecha_nacimiento: '1995-04-12',
  edad: 31,
  etnia: 'mestiza',
  estudios_nivel: 'universitaria',
  estudios_alfabetiza: 1,
  estado_civil: 'casada',
  vive_sola: 0,
  menor_15_mayor_35: 0,
};

export const MOCK_EMBARAZO_DEMO: Embarazo = {
  id_embarazo: 'mock-emb-001',
  cedula_id: '9999999-MOCK',
  fum: '2026-01-15',
  fpp: '2026-10-22',
  dudas_fum: false,
  peso_anterior_kg: 60,
  talla_cm: 165,
  estado: 'activo',
  fumadora_activa_1tr: 0,
  fumadora_activa_2tr: 0,
  fumadora_activa_3tr: 0,
  fumadora_pasiva_1tr: 0,
  fumadora_pasiva_2tr: 0,
  fumadora_pasiva_3tr: 0,
  drogas_1tr: 0,
  drogas_2tr: 0,
  drogas_3tr: 0,
  alcohol_1tr: 0,
  alcohol_2tr: 0,
  alcohol_3tr: 0,
  violencia_1tr: 0,
  violencia_2tr: 0,
  violencia_3tr: 0,
  inm_antitetanica_vigente: 1,
  inm_antitetanica_dosis1: 1,
  inm_antitetanica_dosis2: 1,
  inm_examen_odontologico: 1,
  inm_examen_mamas: 1,
  inm_cervix_inspeccion: 'normal',
  inm_cervix_pap: 'normal',
  inm_cervix_colp: 'normal',
};

interface AppContextType {
  activePaciente: Paciente | null;
  setActivePaciente: (paciente: Paciente | null) => void;
  activeEmbarazo: Embarazo | null;
  refreshActiveEmbarazo: () => Promise<void>;
  selectedDoctorId: string | null;
  setSelectedDoctorId: (id: string | null) => void;
  medicosList: DoctorUser[];
  refreshMedicosList: () => Promise<void>;
  loadMockDemoPatient: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const [activePaciente, setActivePacienteState] = useState<Paciente | null>(null);
  const [activeEmbarazo, setActiveEmbarazo] = useState<Embarazo | null>(null);
  const [selectedDoctorId, setSelectedDoctorIdState] = useState<string | null>(() => {
    return sessionStorage.getItem('selectedDoctorId');
  });
  const [medicosList, setMedicosList] = useState<DoctorUser[]>([]);

  const setSelectedDoctorId = (id: string | null) => {
    setSelectedDoctorIdState(id);
    if (id) {
      sessionStorage.setItem('selectedDoctorId', id);
    } else {
      sessionStorage.removeItem('selectedDoctorId');
    }
  };

  const refreshMedicosList = async () => {
    if (!token || user?.rol !== 'ADMIN') {
      setMedicosList([]);
      return;
    }
    try {
      const apiBase = (import.meta.env.VITE_API_URL as string) || '/api';
      const res = await fetch(`${apiBase}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const users: DoctorUser[] = await res.json();
        const docs = users.filter(u => u.rol === 'MEDICO' || u.rol === 'ADMIN');
        setMedicosList(docs);
        if (docs.length > 0) {
          const valid = docs.some(d => d.id_usuario === selectedDoctorId && d.rol === 'MEDICO');
          if (!valid) {
            const defaultDoc = docs.find(d => d.rol === 'MEDICO');
            if (defaultDoc) setSelectedDoctorId(defaultDoc.id_usuario);
          }
        }
      }
    } catch (e) {
      console.error("Error al obtener lista de médicos en AppContext:", e);
    }
  };

  useEffect(() => {
    if (user?.rol === 'ADMIN') {
      refreshMedicosList();
    } else if (user?.rol === 'MEDICO') {
      setSelectedDoctorId(user.id_usuario);
    }
  }, [user, token]);

  const loadMockDemoPatient = () => {
    setActivePacienteState(MOCK_PATIENT_DEMO);
    setActiveEmbarazo(MOCK_EMBARAZO_DEMO);
  };

  const setActivePaciente = (paciente: Paciente | null) => {
    setActivePacienteState(paciente);
    if (!paciente) {
      setActiveEmbarazo(null);
    }
  };

  const refreshActiveEmbarazo = async () => {
    if (activePaciente) {
      if (activePaciente.cedula_id === MOCK_PATIENT_DEMO.cedula_id) {
        setActiveEmbarazo(MOCK_EMBARAZO_DEMO);
      } else {
        const embarazo = await repositories.embarazos.getActiveByCedulaId(activePaciente.cedula_id);
        setActiveEmbarazo(embarazo);
      }
    } else {
      setActiveEmbarazo(null);
    }
  };

  useEffect(() => {
    refreshActiveEmbarazo();
  }, [activePaciente]);

  // Load from session storage for persistence across reloads during dev
  useEffect(() => {
    const saved = sessionStorage.getItem('activePacienteCedula');
    if (saved) {
      if (saved === MOCK_PATIENT_DEMO.cedula_id) {
        setActivePacienteState(MOCK_PATIENT_DEMO);
      } else {
        repositories.pacientes.getById(saved).then((p) => {
          if (p) setActivePacienteState(p);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (activePaciente) {
      sessionStorage.setItem('activePacienteCedula', activePaciente.cedula_id);
    } else {
      sessionStorage.removeItem('activePacienteCedula');
    }
  }, [activePaciente]);

  return (
    <AppContext.Provider value={{ 
      activePaciente, 
      setActivePaciente, 
      activeEmbarazo, 
      refreshActiveEmbarazo,
      selectedDoctorId,
      setSelectedDoctorId,
      medicosList,
      refreshMedicosList,
      loadMockDemoPatient
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}


import React, { createContext, useContext, useState, useEffect } from 'react';
import { Paciente } from '../domain/entities/Paciente';
import { Embarazo } from '../domain/entities/Embarazo';
import { repositories } from '../lib/di';

interface AppContextType {
  activePaciente: Paciente | null;
  setActivePaciente: (paciente: Paciente | null) => void;
  activeEmbarazo: Embarazo | null;
  refreshActiveEmbarazo: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activePaciente, setActivePacienteState] = useState<Paciente | null>(null);
  const [activeEmbarazo, setActiveEmbarazo] = useState<Embarazo | null>(null);

  const setActivePaciente = (paciente: Paciente | null) => {
    setActivePacienteState(paciente);
    if (!paciente) {
      setActiveEmbarazo(null);
    }
  };

  const refreshActiveEmbarazo = async () => {
    if (activePaciente) {
      const embarazo = await repositories.embarazos.getActiveByCedulaId(activePaciente.cedula_id);
      setActiveEmbarazo(embarazo);
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
      repositories.pacientes.getById(saved).then((p) => {
        if (p) setActivePacienteState(p);
      });
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
    <AppContext.Provider value={{ activePaciente, setActivePaciente, activeEmbarazo, refreshActiveEmbarazo }}>
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

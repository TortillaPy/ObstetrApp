import { create } from 'zustand';

export interface UserProfile {
  id_usuario: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'MEDICO' | 'ADMIN';
  especialidad?: string;
  registro_prof?: string | null;
  nombre_clinica?: string | null;
  direccion?: string | null;
  telefono?: string | null;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: UserProfile, token: string) => {
    localStorage.setItem('obstetrapp_token', token);
    localStorage.setItem('obstetrapp_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('obstetrapp_token');
    localStorage.removeItem('obstetrapp_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  initAuth: async () => {
    try {
      const savedToken = localStorage.getItem('obstetrapp_token');
      const savedUserStr = localStorage.getItem('obstetrapp_user');

      if (savedToken) {
        if (savedUserStr) {
          const cachedUser = JSON.parse(savedUserStr);
          set({ user: cachedUser, token: savedToken, isAuthenticated: true, isLoading: false });
        }
        
        // Fetch latest profile from backend
        const apiBase = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api';
        const res = await fetch(`${apiBase}/auth/me`, {
          headers: { 'Authorization': `Bearer ${savedToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('obstetrapp_user', JSON.stringify(data.user));
          set({ user: data.user, token: savedToken, isAuthenticated: true, isLoading: false });
        } else {
          localStorage.removeItem('obstetrapp_token');
          localStorage.removeItem('obstetrapp_user');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Pacientes } from './pages/Pacientes';
import { Consultorio } from './pages/Consultorio';
import { HistoriaPerinatal } from './pages/HistoriaPerinatal';
import { Ginecologia } from './pages/Ginecologia';
import { Historial } from './pages/Historial';
import { AgendarCita } from './pages/AgendarCita';
import { Recetas } from './pages/Recetas';
import { Estudios } from './pages/Estudios';
import { Usuarios } from './pages/Usuarios';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './data/stores/useAuthStore';

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="consultorio" element={<Consultorio />} />
          <Route path="perinatal" element={<HistoriaPerinatal />} />
          <Route path="ginecologia" element={<Ginecologia />} />
          <Route path="historial" element={<Historial />} />
          <Route path="agendar" element={<AgendarCita />} />
          <Route path="recetas" element={<Recetas />} />
          <Route path="estudios" element={<Estudios />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

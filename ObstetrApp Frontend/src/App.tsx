/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="consultorio" element={<Consultorio />} />
          <Route path="perinatal" element={<HistoriaPerinatal />} />
          <Route path="ginecologia" element={<Ginecologia />} />
          <Route path="historial" element={<Historial />} />
          <Route path="agendar" element={<AgendarCita />} />
          <Route path="recetas" element={<Recetas />} />
          <Route path="estudios" element={<Estudios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

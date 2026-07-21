import React from 'react';
import { PerinatalForm } from '../components/consultorio/PerinatalForm';
import { useNavigate } from 'react-router-dom';

export function HistoriaPerinatal() {
  const navigate = useNavigate();
  return <PerinatalForm onCancel={() => navigate('/consultorio')} />;
}

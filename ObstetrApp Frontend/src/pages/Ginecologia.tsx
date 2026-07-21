import React from 'react';
import { GinecologiaForm } from '../components/consultorio/GinecologiaForm';
import { useNavigate } from 'react-router-dom';

export function Ginecologia() {
  const navigate = useNavigate();
  return <GinecologiaForm onCancel={() => navigate('/consultorio')} />;
}

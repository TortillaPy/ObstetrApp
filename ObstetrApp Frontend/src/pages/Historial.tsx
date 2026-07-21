import React, { useState, useEffect } from 'react';
import { useAppContext } from '../components/AppContext';
import { repositories } from '../lib/di';
import { Cita } from '../domain/entities/Cita';
import { Embarazo } from '../domain/entities/Embarazo';
import { Control } from '../domain/entities/Control';
import { Antecedentes } from '../domain/entities/Antecedentes';
import { Laboratorio } from '../domain/entities/Laboratorio';
import { SolicitudLaboratorio } from '../domain/entities/SolicitudLaboratorio';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { PrintHeader } from '../components/PrintHeader';
import { Printer } from 'lucide-react';

// Import split components
import { TabHistorialFicha } from '../components/historial/TabHistorialFicha';
import { TabHistorialConsultas } from '../components/historial/TabHistorialConsultas';
import { TabHistorialPerinatal } from '../components/historial/TabHistorialPerinatal';
import { TabHistorialEstudios } from '../components/historial/TabHistorialEstudios';
import { ModalConsultaDetails } from '../components/historial/ModalConsultaDetails';
import { ModalControlDetails } from '../components/historial/ModalControlDetails';
import { ModalPrintOptions } from '../components/historial/ModalPrintOptions';

export function Historial() {
  const { activePaciente } = useAppContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [citas, setCitas] = useState<Cita[]>([]);
  const [embarazos, setEmbarazos] = useState<Embarazo[]>([]);
  const [controles, setControles] = useState<Control[]>([]);
  const [antecedentes, setAntecedentes] = useState<Antecedentes | null>(null);
  const [laboratorio, setLaboratorio] = useState<Laboratorio | null>(null);
  const [solicitudesLab, setSolicitudesLab] = useState<SolicitudLaboratorio[]>([]);

  const [selectedConsulta, setSelectedConsulta] = useState<Cita | null>(null);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    consulta: true,
    ginecologia: true,
    perinatal: true,
    estudios: true,
  });

  const handleDeleteConsulta = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Está seguro de que desea eliminar este registro de consulta?')) {
        await repositories.citas.delete(id);
        setCitas(citas.filter(c => c.id_cita !== id));
    }
  };

  const handleDeleteControl = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Está seguro de que desea eliminar este control perinatal?')) {
        await repositories.controles.delete(id);
        setControles(controles.filter(c => c.id_control !== id));
    }
  };

  useEffect(() => {
    async function loadHistory() {
      if (!activePaciente) return;
      setLoading(true);
      try {
        const patientCitas = await repositories.citas.getByCedulaId(activePaciente.cedula_id);
        setCitas(patientCitas.sort((a,b) => new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime()));

        const patientEmbarazos = await repositories.embarazos.getByCedulaId(activePaciente.cedula_id);
        setEmbarazos(patientEmbarazos);

        const controlsPromises = patientEmbarazos.map(e => repositories.controles.getByEmbarazoId(e.id_embarazo));
        const controlsNested = await Promise.all(controlsPromises);
        const ptControles = controlsNested.flat().sort((a,b) => new Date(b.fecha_visita).getTime() - new Date(a.fecha_visita).getTime());
        setControles(ptControles);

        const ant = await repositories.antecedentes.getById(activePaciente.cedula_id);
        setAntecedentes(ant);

        const activePreg = patientEmbarazos.find(e => e.estado === 'activo');
        if (activePreg) {
          const lab = await repositories.laboratorios.getByEmbarazoId(activePreg.id_embarazo);
          setLaboratorio(lab);
        } else {
          setLaboratorio(null);
        }

        const patientSolicitudes = await repositories.solicitudesLaboratorio.getByCedulaId(activePaciente.cedula_id);
        setSolicitudesLab(patientSolicitudes.sort((a,b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime()));
      } catch (err) {
        console.error("Error al cargar historial clínico:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [activePaciente]);

  if (!activePaciente) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8">
        <p className="text-gray-500 mb-4">Debe seleccionar una paciente primero.</p>
        <button onClick={() => navigate('/pacientes')} className="px-4 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#172554] font-bold text-sm cursor-pointer shadow-sm">
          Ir al Directorio
        </button>
      </div>
    );
  }

  const embarazoActivo = embarazos.find(e => e.estado === 'activo');
  const proximaCita = citas.find(c => c.estado === 'pendiente' && new Date(c.fecha_cita).getTime() >= new Date().getTime());
  
  const consultasG = citas.filter(c => c.estado === 'realizada' && (!c.tipo || c.tipo === 'consulta'));
  const consultasSoap = consultasG.filter(c => c.motivo !== 'Consulta Ginecológica' && c.gyn_motivo == null);
  const consultasGyn = consultasG.filter(c => c.motivo === 'Consulta Ginecológica' || c.gyn_motivo != null);

  const ecografias = citas.filter(c => c.estado === 'realizada' && c.tipo === 'eco');
  const paps = citas.filter(c => c.estado === 'realizada' && c.tipo === 'pap');

  // Calculates Age
  const getEdad = (fn?: string) => {
    if (!fn) return 'N/A';
    const birth = new Date(fn);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' años';
  };

  const getUltimoPeso = () => {
    let lastWeight = null;
    let lastWeightDate = 0;

    // Check controls (controls are sorted descending by date in ptControles / controles)
    if (controles.length > 0) {
      const lastControl = controles[0];
      if (lastControl.peso_kg) {
        lastWeight = `${lastControl.peso_kg} kg`;
        lastWeightDate = new Date(lastControl.fecha_visita).getTime();
      }
    }

    // Check consultations (citas)
    const citaConPeso = citas.find(c => c.estado === 'realizada' && c.peso != null && c.peso !== '');
    if (citaConPeso) {
      const citaDate = new Date(citaConPeso.fecha_cita).getTime();
      if (citaDate > lastWeightDate) {
        lastWeight = `${citaConPeso.peso} kg`;
      }
    }

    return lastWeight || 'Sin registros';
  };

  const getEstudiosPendientes = () => {
    const pendientes: string[] = [];

    // 1. Check from plan text of last consultation (Ecos / PAPs)
    const lastConsulta = citas.find(c => c.estado === 'realizada' && (c.tipo === 'consulta' || !c.tipo));
    if (lastConsulta && lastConsulta.plan) {
      const planText = lastConsulta.plan.toLowerCase();
      const lastConsultaDate = new Date(lastConsulta.fecha_cita);

      if (planText.includes('eco') || planText.includes('ecografía') || planText.includes('ecografia') || planText.includes('ultrasonido')) {
        const hasEcoAfter = ecografias.some(e => new Date(e.fecha_cita) > lastConsultaDate);
        if (!hasEcoAfter) {
          pendientes.push('Ecografía Obstétrica / Ginecológica');
        }
      }

      if (planText.includes('pap') || planText.includes('papanicolaou') || planText.includes('colpo')) {
        const hasPapAfter = paps.some(p => new Date(p.fecha_cita) > lastConsultaDate);
        if (!hasPapAfter) {
          pendientes.push('Papanicolaou y Colposcopía');
        }
      }
    }

    // 2. Check from SolicitudLaboratorio
    if (solicitudesLab.length > 0) {
      const ultimaSolicitud = solicitudesLab[0];
      try {
        const estudios = JSON.parse(ultimaSolicitud.estudios_solicitados) as Record<string, boolean>;
        
        const labChecks: Record<string, { label: string; isFilled: () => boolean }> = {
          hemoglobina: {
            label: 'Hemograma / Hemoglobina',
            isFilled: () => !!(laboratorio?.hb_menor_20sem || laboratorio?.hb_mayor_20sem)
          },
          glucemia_ayunas: {
            label: 'Glucemia en Ayunas',
            isFilled: () => !!(laboratorio?.glucemia_menor_20sem || laboratorio?.glucemia_mayor_30sem)
          },
          ttgo: {
            label: 'TTGO (Tolerancia Glucosa)',
            isFilled: () => !!laboratorio?.ttgo_resultado_mg_dl
          },
          toxoplasmosis: {
            label: 'Toxoplasmosis (Serología)',
            isFilled: () => !!(laboratorio?.toxo_menor_20sem_igg || laboratorio?.toxo_mayor_20sem_igg || laboratorio?.toxo_primera_consulta_igm)
          },
          vih: {
            label: 'VIH (Test Rápido / ELISA)',
            isFilled: () => !!(laboratorio?.vih_menor_20sem_resultado || laboratorio?.vih_mayor_20sem_resultado)
          },
          sifilis: {
            label: 'Sífilis (VDRL)',
            isFilled: () => !!(laboratorio?.sifilis_vdrl_menor_20sem || laboratorio?.sifilis_vdrl_mayor_20sem)
          },
          hepatitis_b: {
            label: 'Hepatitis B (HBsAg)',
            isFilled: () => !!laboratorio?.hb_hepatitis_b
          },
          chagas: {
            label: 'Chagas (ELISA)',
            isFilled: () => !!laboratorio?.chagas
          },
          paludismo: {
            label: 'Paludismo / Malaria',
            isFilled: () => !!laboratorio?.paludismo_malaria
          },
          estreptococo_b: {
            label: 'Cultivo Estreptococo B',
            isFilled: () => !!laboratorio?.estreptococo_b
          },
          urocultivo: {
            label: 'Urocultivo / Orina Simple',
            isFilled: () => !!laboratorio?.bacteriuria_resultado
          },
          tsh: {
            label: 'TSH (Función Tiroidea)',
            isFilled: () => !!laboratorio?.tsh_valor
          }
        };

        Object.entries(estudios).forEach(([key, requested]) => {
          if (requested && labChecks[key]) {
            if (!labChecks[key].isFilled()) {
              pendientes.push(`Análisis de Laboratorio: ${labChecks[key].label}`);
            }
          }
        });
      } catch (e) {
        console.error("Error al parsear estudios solicitados:", e);
      }
    }

    return pendientes;
  };

  const handlePrintConfirm = (options: typeof printOptions) => {
    setPrintOptions(options);
    setIsPrintModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Filter consultations to print based on selected print choices
  const filteredConsultasToPrint = consultasG.filter(c => {
    const isGyn = c.motivo === 'Consulta Ginecológica' || c.gyn_motivo != null;
    if (isGyn) return printOptions.ginecologia;
    return printOptions.consulta;
  });

  const tabs = [
    { id: 0, title: 'Ficha y Antecedentes' },
    { id: 1, title: 'Consultas SOAP' },
    { id: 2, title: 'Consultas Ginecológicas' },
    { id: 3, title: 'Control Perinatal' },
    { id: 4, title: 'Estudios y Exámenes' },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent p-4 md:p-8 w-full max-w-7xl mx-auto overflow-y-auto custom-scrollbar print:h-auto print:overflow-visible print:block">
      
      {/* Header Panel */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#2C3333]">Historial Clínico</h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
            Paciente activa: <strong className="text-[#1E3A8A] text-lg">{activePaciente.nombre} {activePaciente.apellido}</strong> 
            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full font-semibold">CI: {activePaciente.cedula_id}</span>
          </p>
        </div>
        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="w-full sm:w-auto bg-[#0D9488] text-white border border-[#0F766E] px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#0F766E] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Imprimir Historial...
        </button>
      </div>

      <PrintHeader />

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E2E8F0] mb-6 overflow-x-auto hide-scrollbar print:hidden shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "text-[#1E3A8A] border-[#1E3A8A]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            )}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Interactive Tabs content */}
      <div className="flex-1 min-h-0 print:hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2563EB] mb-4"></div>
            <p className="text-sm font-semibold">Cargando Historial Clínico...</p>
          </div>
        ) : (
          <>
            {activeTab === 0 && (
              <TabHistorialFicha
                activePaciente={activePaciente}
                antecedentes={antecedentes}
                embarazoActivo={embarazoActivo}
                controles={controles}
                proximaCita={proximaCita}
                getEdad={getEdad}
                ultimoPeso={getUltimoPeso()}
                estudiosPendientes={getEstudiosPendientes()}
              />
            )}
            {activeTab === 1 && (
              <TabHistorialConsultas
                consultasG={consultasSoap}
                onSelectConsulta={setSelectedConsulta}
                onDeleteConsulta={handleDeleteConsulta}
                title="Consultas Normales (SOAP)"
                description="Historial de evoluciones clínicas generales estructuradas en formato SOAP."
                listTitle="Historial de Consultas SOAP"
              />
            )}
            {activeTab === 2 && (
              <TabHistorialConsultas
                consultasG={consultasGyn}
                onSelectConsulta={setSelectedConsulta}
                onDeleteConsulta={handleDeleteConsulta}
                title="Consultas Ginecológicas"
                description="Historial de evoluciones ginecológicas especializadas de la paciente."
                listTitle="Historial de Consultas de Ginecología"
              />
            )}
            {activeTab === 3 && (
              <TabHistorialPerinatal
                controles={controles}
                onSelectControl={setSelectedControl}
                onDeleteControl={handleDeleteControl}
              />
            )}
            {activeTab === 4 && (
              <TabHistorialEstudios
                ecografias={ecografias}
                paps={paps}
                laboratorio={laboratorio}
                onDeleteConsulta={handleDeleteConsulta}
              />
            )}
          </>
        )}
      </div>

      {/* ========================================= */}
      {/* ============= MODO IMPRESIÓN ============ */}
      {/* ========================================= */}
      <div className="hidden print:block w-full bg-white text-black mt-4">
        {/* Print-specific style overrides */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .print-section {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 24px !important;
            }
            .print-table th {
              background-color: #f8fafc !important;
              color: #1e293b !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-title-accent {
              border-left: 4px solid #1e3a8a !important;
              background-color: #f8fafc !important;
              padding-left: 12px !important;
              padding-top: 6px !important;
              padding-bottom: 6px !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-gpa-box {
              border: 1px solid #cbd5e1 !important;
              border-radius: 8px !important;
              background-color: #ffffff !important;
            }
            .print-gpa-cell {
              padding: 8px !important;
              text-align: center !important;
            }
          }
        `}} />

        <h3 className="font-bold text-2xl uppercase tracking-widest border-b-2 border-black pb-2 mb-6 text-black">
          Reporte de Historial Clínico
        </h3>
        
        {/* Section 1: Demographics (Always printed) */}
        <section className="print-section mb-6">
            <h4 className="font-bold text-sm bg-slate-50 border-l-4 border-[#1E3A8A] px-3 py-1.5 uppercase tracking-wider mb-4 text-[#1E3A8A] print-title-accent">1. Datos Demográficos</h4>
            <div className="grid grid-cols-3 gap-6 text-xs pl-2">
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Paciente</span>
                  <span className="font-black text-sm text-slate-800">{activePaciente.nombre} {activePaciente.apellido}</span>
                </div>
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Cédula de Identidad</span>
                  <span className="font-black text-sm text-slate-800">{activePaciente.cedula_id}</span>
                </div>
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Edad / F. Nacimiento</span>
                  <span className="font-semibold text-slate-800">{getEdad(activePaciente.fecha_nacimiento)} ({activePaciente.fecha_nacimiento ? new Date(activePaciente.fecha_nacimiento).toLocaleDateString('es-ES') : 'N/A'})</span>
                </div>
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Teléfono</span>
                  <span className="font-semibold text-slate-800">{activePaciente.telefono || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Dirección / Localidad</span>
                  <span className="font-semibold text-slate-800">{activePaciente.domicilio || 'N/A'} {activePaciente.localidad ? `• ${activePaciente.localidad}` : ''}</span>
                </div>
                <div>
                  <span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Grupo Sanguíneo y Rh</span>
                  <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-[10px] inline-block">{activePaciente.grupo_sanguineo || 'S/D'} {activePaciente.factor_rh || ''}</span>
                </div>
            </div>
        </section>

        {/* Section 2: Antecedentes Ginecobstétricos (Always printed as part of base Ficha) */}
        <section className="print-section mb-6">
            <h4 className="font-bold text-sm bg-slate-50 border-l-4 border-[#1E3A8A] px-3 py-1.5 uppercase tracking-wider mb-4 text-[#1E3A8A] print-title-accent">2. Antecedentes Ginecobstétricos</h4>
            
            <div className="grid grid-cols-4 border border-slate-300 rounded-xl overflow-hidden divide-x divide-slate-300 text-center max-w-md ml-2 mb-4 print-gpa-box">
                <div className="py-2.5 print-gpa-cell">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block mb-0.5">Gestas</span>
                  <span className="font-black text-xl text-slate-850">{antecedentes?.hist_gestas_previas ?? 0}</span>
                </div>
                <div className="py-2.5 print-gpa-cell">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block mb-0.5">Partos</span>
                  <span className="font-black text-xl text-slate-850">{antecedentes?.hist_partos ?? 0}</span>
                </div>
                <div className="py-2.5 print-gpa-cell">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block mb-0.5">Cesáreas</span>
                  <span className="font-black text-xl text-slate-850">{antecedentes?.hist_cesareas ?? 0}</span>
                </div>
                <div className="py-2.5 print-gpa-cell">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block mb-0.5">Abortos</span>
                  <span className="font-black text-xl text-slate-850">{antecedentes?.hist_abortos ?? 0}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-xs pl-2 border-t border-slate-200 pt-4 mt-3">
                <div><span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Fecha Última Menstruación (FUM)</span><span className="font-semibold text-slate-850">{activePaciente.fum ? new Date(activePaciente.fum).toLocaleDateString('es-ES') : 'N/A'}</span></div>
                <div><span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Menarca (Edad)</span><span className="font-semibold text-slate-850">{activePaciente.menarca ? `${activePaciente.menarca} años` : 'N/A'}</span></div>
                <div><span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">MAC en Uso</span><span className="font-semibold capitalize text-slate-850">{activePaciente.metodo_anticonceptivo || 'Ninguno'}</span></div>
            </div>
        </section>

        {/* Section 3: Embarazo Actual (Si existe y Perinatal está seleccionado) */}
        {printOptions.perinatal && embarazoActivo && (
            <section className="print-section mb-6">
                <h4 className="font-bold text-sm bg-slate-50 border-l-4 border-[#1E3A8A] px-3 py-1.5 uppercase tracking-wider mb-4 text-[#1E3A8A] print-title-accent">3. Estado del Embarazo Actual</h4>
                <div className="grid grid-cols-3 gap-6 text-xs pl-2">
                    <div><span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">FPP Estimada</span><span className="font-bold text-sm text-[#1E3A8A]">{embarazoActivo.fpp ? new Date(embarazoActivo.fpp).toLocaleDateString('es-ES') : 'N/A'}</span></div>
                    <div><span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Controles Realizados</span><span className="font-bold text-sm text-slate-850">{controles.length}</span></div>
                    <div><span className="font-bold uppercase text-[10px] text-gray-500 block mb-0.5">Semanas de Gestación Actual</span><span className="font-bold text-sm text-slate-850">{controles[0]?.eg_semanas || 'N/A'} semanas</span></div>
                </div>
            </section>
        )}

        {/* Section 4: Últimos Controles Evolutivos (Si Perinatal está seleccionado) */}
        {printOptions.perinatal && (
          <section className="print-section mb-6">
              <h4 className="font-bold text-sm bg-slate-50 border-l-4 border-[#1E3A8A] px-3 py-1.5 uppercase tracking-wider mb-4 text-[#1E3A8A] print-title-accent">4. Controles Prenatales</h4>
              {controles.length > 0 ? (
                  <table className="w-full text-xs text-left border-collapse mt-2 print-table">
                      <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                              <th className="py-2.5 px-3">Fecha</th>
                              <th className="py-2.5 px-3">EG (Sem)</th>
                              <th className="py-2.5 px-3">Peso (kg)</th>
                              <th className="py-2.5 px-3">P. Arterial</th>
                              <th className="py-2.5 px-3">Altura Ut.</th>
                              <th className="py-2.5 px-3">LCF (lpm)</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                          {controles.map(c => (
                              <tr key={c.id_control} className="text-slate-800 hover:bg-slate-50/20">
                                  <td className="py-2 px-3 font-semibold">{new Date(c.fecha_visita).toLocaleDateString('es-ES')}</td>
                                  <td className="py-2 px-3">{c.eg_semanas}</td>
                                  <td className="py-2 px-3">{c.peso_kg || '-'}</td>
                                  <td className="py-2 px-3">{c.pa_sistolica}/{c.pa_diastolica}</td>
                                  <td className="py-2 px-3">{c.altura_uterina_cm || '-'}</td>
                                  <td className="py-2 px-3">{c.lcf_lpm || '-'}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              ) : (
                  <p className="text-xs italic pl-2 text-gray-500">No se registran controles en este embarazo.</p>
              )}
          </section>
        )}

        {/* Section 5: Consultas Generales (SOAP y/o Ginecología) */}
        {(printOptions.consulta || printOptions.ginecologia) && (
          <section className="print-section mb-6">
              <h4 className="font-bold text-sm bg-slate-50 border-l-4 border-[#1E3A8A] px-3 py-1.5 uppercase tracking-wider mb-4 text-[#1E3A8A] print-title-accent">5. Registro de Consultas y Evoluciones</h4>
              {filteredConsultasToPrint.length > 0 ? (
                <table className="w-full text-xs text-left border-collapse mt-2 print-table">
                    <thead>
                        <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                            <th className="py-2.5 px-3 w-[150px]">Fecha y Hora</th>
                            <th className="py-2.5 px-3">Motivo / Detalles / Conducta</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredConsultasToPrint.map(c => {
                          const isGyn = c.motivo === 'Consulta Ginecológica' || c.gyn_motivo != null;
                          return (
                            <tr key={c.id_cita} className="text-slate-800 align-top">
                                <td className="py-2.5 px-3 font-semibold text-slate-700">{new Date(c.fecha_cita).toLocaleString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} hs</td>
                                <td className="py-2.5 px-3">
                                   <p className="font-bold text-xs text-[#1E3A8A] mb-1">{c.motivo || 'Motivo no especificado'}</p>
                                   {isGyn ? (
                                     <div className="space-y-1 text-slate-600 pl-1 border-l-2 border-slate-200 mt-1">
                                       {c.gyn_motivo && <p className="text-xs"><strong>Motivo: </strong> {c.gyn_motivo}</p>}
                                       {c.gyn_examen_mamario && <p className="text-xs"><strong>Ex. Mamario: </strong> {c.gyn_examen_mamario}</p>}
                                       {c.gyn_abdomen_pelvis && <p className="text-xs"><strong>Abd. & Pelvis: </strong> {c.gyn_abdomen_pelvis}</p>}
                                       {c.gyn_especuloscopia && <p className="text-xs"><strong>Especuloscopía: </strong> {c.gyn_especuloscopia}</p>}
                                       {c.gyn_tacto_vaginal && <p className="text-xs"><strong>Tacto Vaginal: </strong> {c.gyn_tacto_vaginal}</p>}
                                     </div>
                                   ) : (
                                     <div className="space-y-1 text-slate-600 pl-1 border-l-2 border-slate-200 mt-1">
                                       {c.sintomas && <p className="text-xs"><strong>S (Subjetivo): </strong> {c.sintomas}</p>}
                                       {c.examen_fisico && <p className="text-xs"><strong>O (Objetivo): </strong> {c.examen_fisico}</p>}
                                     </div>
                                   )}
                                   {c.diagnostico && <p className="text-xs mt-1.5"><strong>Diagnóstico: </strong> <span className="font-medium text-slate-800">{c.diagnostico}</span></p>}
                                   {c.plan && <p className="text-xs mt-0.5"><strong>Plan / Indicación: </strong> <span className="font-medium text-slate-800">{c.plan}</span></p>}
                                </td>
                            </tr>
                          );
                        })}
                    </tbody>
                </table>
            ) : (
                <p className="text-xs italic pl-2 text-gray-500">No hay atenciones clínicas registradas bajo estos filtros.</p>
            )}
          </section>
        )}

        {/* Section 6: Ecografías */}
        {printOptions.estudios && (
          <section className="print-section mb-6">
              <h4 className="font-bold text-sm bg-slate-50 border-l-4 border-[#1E3A8A] px-3 py-1.5 uppercase tracking-wider mb-4 text-[#1E3A8A] print-title-accent">6. Registro de Ecografías</h4>
              {ecografias.length > 0 ? (
                <table className="w-full text-xs text-left border-collapse mt-2 print-table">
                    <thead>
                        <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                            <th className="py-2.5 px-3">Fecha</th>
                            <th className="py-2.5 px-3">EG (Sem)</th>
                            <th className="py-2.5 px-3 w-1/2">Conclusión / Diagnóstico</th>
                            <th className="py-2.5 px-3">ILA</th>
                            <th className="py-2.5 px-3">PFE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {ecografias.map(e => (
                            <tr key={e.id_cita} className="text-slate-800">
                                <td className="py-2 px-3 font-semibold">{new Date(e.fecha_cita).toLocaleDateString('es-ES')}</td>
                                <td className="py-2 px-3">{e.eco_eg || '-'}</td>
                                <td className="py-2 px-3 font-medium text-slate-850">{e.eco_diagnostico || 'S/D'}</td>
                                <td className="py-2 px-3">{e.eco_ila || '-'}</td>
                                <td className="py-2 px-3">{e.eco_peso ? `${e.eco_peso}g` : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              ) : (
                  <p className="text-xs italic pl-2 text-gray-500">No hay ecografías registradas.</p>
              )}
          </section>
        )}

        {/* Section 7: PAPs */}
        {printOptions.estudios && (
          <section className="print-section mb-6">
              <h4 className="font-bold text-sm bg-slate-50 border-l-4 border-[#1E3A8A] px-3 py-1.5 uppercase tracking-wider mb-4 text-[#1E3A8A] print-title-accent">7. Registro de Papanicolaou y Colposcopia</h4>
              {paps.length > 0 ? (
                <table className="w-full text-xs text-left border-collapse mt-2 print-table">
                    <thead>
                        <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                            <th className="py-2.5 px-3 w-24">Fecha</th>
                            <th className="py-2.5 px-3 w-32">Aspecto C.U.</th>
                            <th className="py-2.5 px-3 w-1/3">Resultado (Bethesda)</th>
                            <th className="py-2.5 px-3 w-1/3">Observaciones Colposcópicas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paps.map(p => (
                            <tr key={p.id_cita} className="text-slate-800">
                                <td className="py-2 px-3 font-semibold">{new Date(p.fecha_cita).toLocaleDateString('es-ES')}</td>
                                <td className="py-2 px-3">{p.pap_aspecto || '-'}</td>
                                <td className="py-2 px-3 font-bold text-slate-900">{p.pap_resultado || '-'}</td>
                                <td className="py-2 px-3">{p.pap_observaciones || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              ) : (
                  <p className="text-xs italic pl-2 text-gray-500">No hay PAP registrados.</p>
              )}
          </section>
        )}

        {/* Section 8: Laboratorio gestacional */}
        {printOptions.estudios && laboratorio && (
          <section className="print-section mb-6">
              <h4 className="font-bold text-sm bg-slate-50 border-l-4 border-[#1E3A8A] px-3 py-1.5 uppercase tracking-wider mb-4 text-[#1E3A8A] print-title-accent">8. Resultados de Laboratorio Gestacional</h4>
              <div className="grid grid-cols-2 gap-4 text-xs pl-2">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-[#1E3A8A] uppercase text-[9px] tracking-wider block mb-1">Toxoplasmosis</span>
                  <p className="text-slate-800">IgG &lt;20s: <strong>{laboratorio.toxo_menor_20sem_igg || 'S/D'}</strong></p>
                  <p className="text-slate-800">IgG &ge;20s: <strong>{laboratorio.toxo_mayor_20sem_igg || 'S/D'}</strong></p>
                  <p className="text-slate-800">IgM: <strong>{laboratorio.toxo_primera_consulta_igm || 'S/D'}</strong></p>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-[#1E3A8A] uppercase text-[9px] tracking-wider block mb-1">Glucemia</span>
                  <p className="text-slate-800">&lt;20s: <strong>{laboratorio.glucemia_menor_20sem ? `${laboratorio.glucemia_menor_20sem} mg/dl` : 'S/D'}</strong></p>
                  <p className="text-slate-800">&ge;30s: <strong>{laboratorio.glucemia_mayor_30sem ? `${laboratorio.glucemia_mayor_30sem} mg/dl` : 'S/D'}</strong></p>
                  <p className="text-slate-800">TTGO: <strong>{laboratorio.ttgo_resultado_mg_dl ? `${laboratorio.ttgo_resultado_mg_dl} mg/dl` : 'S/D'}</strong></p>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-[#1E3A8A] uppercase text-[9px] tracking-wider block mb-1">Sífilis & VIH</span>
                  <p className="text-slate-800">VDRL &lt;20s: <strong>{laboratorio.sifilis_vdrl_menor_20sem || 'S/D'}</strong></p>
                  <p className="text-slate-800">VDRL &ge;20s: <strong>{laboratorio.sifilis_vdrl_mayor_20sem || 'S/D'}</strong></p>
                  <p className="text-slate-800">VIH: <strong>{laboratorio.vih_menor_20sem_resultado || 'S/D'}</strong></p>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="font-bold text-[#1E3A8A] uppercase text-[9px] tracking-wider block mb-1">Hemoglobina & Hormonas</span>
                  <p className="text-slate-800">Hb &lt;20s: <strong>{laboratorio.hb_menor_20sem ? `${laboratorio.hb_menor_20sem} g/dl` : 'S/D'}</strong></p>
                  <p className="text-slate-800">TSH: <strong>{laboratorio.tsh_valor ? `${laboratorio.tsh_valor} uUI/ml` : 'S/D'}</strong></p>
                  <p className="text-slate-800">Hepatitis B: <strong>{laboratorio.hb_hepatitis_b || 'S/D'}</strong></p>
                </div>
              </div>
          </section>
        )}

        <div className="mt-8 pt-6 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-600 uppercase tracking-widest break-inside-avoid font-bold">
            *** FIN DE LA IMPRESIÓN DEL HISTORIAL ***
        </div>

      </div>

      {/* Modal Configuración de Impresión */}
      {isPrintModalOpen && (
        <ModalPrintOptions
          onClose={() => setIsPrintModalOpen(false)}
          onPrint={handlePrintConfirm}
        />
      )}

      {/* Modal Detalles Consulta SOAP */}
      {selectedConsulta && (
        <ModalConsultaDetails
          selectedConsulta={selectedConsulta}
          onClose={() => setSelectedConsulta(null)}
        />
      )}

      {/* Modal Detalles Control Perinatal */}
      {selectedControl && (
        <ModalControlDetails
          selectedControl={selectedControl}
          onClose={() => setSelectedControl(null)}
        />
      )}

    </div>
  );
}

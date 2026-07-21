-- CreateTable
CREATE TABLE "Paciente" (
    "cedula_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "domicilio" TEXT,
    "telefono" TEXT,
    "localidad" TEXT,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "grupo_sanguineo" TEXT,
    "factor_rh" TEXT,
    "lugar_control_habitual" TEXT,
    "lugar_parto_aborto_previsto" TEXT,
    "identificacion_manual" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("cedula_id")
);

-- CreateTable
CREATE TABLE "InformacionSocial" (
    "id" TEXT NOT NULL,
    "etnia" TEXT NOT NULL,
    "estudios_nivel" TEXT NOT NULL,
    "estudios_alfabetiza" BOOLEAN NOT NULL,
    "estudios_anios_mayor_nivel" INTEGER,
    "estado_civil" TEXT NOT NULL,
    "vive_sola" BOOLEAN NOT NULL,
    "pacienteId" TEXT NOT NULL,

    CONSTRAINT "InformacionSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntecedentesGinecologicos" (
    "id" TEXT NOT NULL,
    "menarca" INTEGER,
    "fum" TIMESTAMP(3),
    "ritmo_menstrual" TEXT,
    "metodo_anticonceptivo" TEXT,
    "tiene_dismenorrea" BOOLEAN NOT NULL DEFAULT false,
    "tiene_dispareunia" BOOLEAN NOT NULL DEFAULT false,
    "tiene_sangrado_anormal" BOOLEAN NOT NULL DEFAULT false,
    "tiene_flujo_vaginal" BOOLEAN NOT NULL DEFAULT false,
    "pacienteId" TEXT NOT NULL,

    CONSTRAINT "AntecedentesGinecologicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntecedentesMedicos" (
    "id" TEXT NOT NULL,
    "ant_tbc" BOOLEAN NOT NULL DEFAULT false,
    "ant_diabetes" BOOLEAN NOT NULL DEFAULT false,
    "ant_hipertension" BOOLEAN NOT NULL DEFAULT false,
    "ant_preeclampsia" BOOLEAN NOT NULL DEFAULT false,
    "ant_eclampsia" BOOLEAN NOT NULL DEFAULT false,
    "ant_cardiopatia" BOOLEAN NOT NULL DEFAULT false,
    "ant_nefropatia" BOOLEAN NOT NULL DEFAULT false,
    "ant_infertilidad" BOOLEAN NOT NULL DEFAULT false,
    "ant_cirugia_genito_urinaria" BOOLEAN NOT NULL DEFAULT false,
    "ant_violencia" BOOLEAN NOT NULL DEFAULT false,
    "ant_otra_condicion_grave" BOOLEAN NOT NULL DEFAULT false,
    "ant_cirugias_especificas_texto" TEXT,
    "hist_gestas_previas" INTEGER NOT NULL DEFAULT 0,
    "hist_partos" INTEGER NOT NULL DEFAULT 0,
    "hist_vaginales" INTEGER NOT NULL DEFAULT 0,
    "hist_cesareas" INTEGER NOT NULL DEFAULT 0,
    "hist_abortos" INTEGER NOT NULL DEFAULT 0,
    "hist_nacidos_vivos" INTEGER NOT NULL DEFAULT 0,
    "hist_nacidos_muertos" INTEGER NOT NULL DEFAULT 0,
    "hist_viven" INTEGER NOT NULL DEFAULT 0,
    "hist_abortos_tres_espontaneos_consecutivos" BOOLEAN NOT NULL DEFAULT false,
    "hist_nacidos_vivos_muertos_1ra_semana" BOOLEAN NOT NULL DEFAULT false,
    "hist_nacidos_vivos_muertos_despues_1ra_sem" BOOLEAN NOT NULL DEFAULT false,
    "hist_fin_embarazo_anterior_fecha" TIMESTAMP(3),
    "hist_fin_embarazo_anterior_menos_de_1_anio" BOOLEAN NOT NULL DEFAULT false,
    "hist_embarazo_planeado" BOOLEAN NOT NULL DEFAULT false,
    "hist_fracaso_anticonceptivo" TEXT NOT NULL,
    "inm_antirubeola" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,

    CONSTRAINT "AntecedentesMedicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embarazo" (
    "id_embarazo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "peso_anterior_kg" DOUBLE PRECISION NOT NULL,
    "talla_cm" INTEGER NOT NULL,
    "fum" TIMESTAMP(3) NOT NULL,
    "fpp" TIMESTAMP(3) NOT NULL,
    "eg_confiable_por" TEXT,
    "dudas_fum" BOOLEAN NOT NULL DEFAULT false,
    "notas_parto" TEXT,
    "anotaciones_margen_superior" TEXT,
    "fumadora_activa_1tr" BOOLEAN NOT NULL DEFAULT false,
    "fumadora_activa_2tr" BOOLEAN NOT NULL DEFAULT false,
    "fumadora_activa_3tr" BOOLEAN NOT NULL DEFAULT false,
    "fumadora_pasiva_1tr" BOOLEAN NOT NULL DEFAULT false,
    "fumadora_pasiva_2tr" BOOLEAN NOT NULL DEFAULT false,
    "fumadora_pasiva_3tr" BOOLEAN NOT NULL DEFAULT false,
    "drogas_1tr" BOOLEAN NOT NULL DEFAULT false,
    "drogas_2tr" BOOLEAN NOT NULL DEFAULT false,
    "drogas_3tr" BOOLEAN NOT NULL DEFAULT false,
    "alcohol_1tr" BOOLEAN NOT NULL DEFAULT false,
    "alcohol_2tr" BOOLEAN NOT NULL DEFAULT false,
    "alcohol_3tr" BOOLEAN NOT NULL DEFAULT false,
    "violencia_1tr" BOOLEAN NOT NULL DEFAULT false,
    "violencia_2tr" BOOLEAN NOT NULL DEFAULT false,
    "violencia_3tr" BOOLEAN NOT NULL DEFAULT false,
    "inm_antitetanica_vigente" BOOLEAN NOT NULL DEFAULT false,
    "inm_antitetanica_dosis1" BOOLEAN NOT NULL DEFAULT false,
    "inm_antitetanica_dosis2" BOOLEAN NOT NULL DEFAULT false,
    "inm_antitetanica_dosis_1_m" INTEGER,
    "inm_antitetanica_dosis_2_m" INTEGER,
    "inm_antitetanica_dosis_3_m" INTEGER,
    "inm_examen_odontologico" BOOLEAN NOT NULL DEFAULT false,
    "inm_examen_mamas" BOOLEAN NOT NULL DEFAULT false,
    "inm_cervix_inspeccion" TEXT NOT NULL,
    "inm_cervix_pap" TEXT NOT NULL,
    "inm_cervix_colp" TEXT NOT NULL,
    "eval_trimestres_json" TEXT,
    "cedula_id" TEXT NOT NULL,

    CONSTRAINT "Embarazo_pkey" PRIMARY KEY ("id_embarazo")
);

-- CreateTable
CREATE TABLE "Laboratorio" (
    "id" TEXT NOT NULL,
    "isoinmunizacion_rh" BOOLEAN NOT NULL DEFAULT false,
    "chagas" TEXT,
    "paludismo_malaria" TEXT,
    "bacteriuria_resultado" TEXT,
    "bacteriuria_semanas" TEXT,
    "toxo_menor_20sem_igg" TEXT,
    "toxo_mayor_20sem_igg" TEXT,
    "toxo_primera_consulta_igm" TEXT,
    "vih_menor_20sem_solicitado" BOOLEAN NOT NULL DEFAULT false,
    "vih_menor_20sem_realizado" BOOLEAN NOT NULL DEFAULT false,
    "vih_menor_20sem_resultado" TEXT,
    "vih_mayor_20sem_solicitado" BOOLEAN NOT NULL DEFAULT false,
    "vih_mayor_20sem_realizado" BOOLEAN NOT NULL DEFAULT false,
    "vih_mayor_20sem_resultado" TEXT,
    "sifilis_vdrl_menor_20sem" TEXT,
    "sifilis_vdrl_mayor_20sem" TEXT,
    "sifilis_confirmada_fta" BOOLEAN NOT NULL DEFAULT false,
    "sifilis_tratamiento" TEXT,
    "hb_menor_20sem" DOUBLE PRECISION,
    "hb_mayor_20sem" DOUBLE PRECISION,
    "hierro_folatos_indicados" BOOLEAN NOT NULL DEFAULT false,
    "glucemia_menor_20sem" DOUBLE PRECISION,
    "glucemia_mayor_30sem" DOUBLE PRECISION,
    "estreptococo_b" TEXT,
    "preparacion_parto" BOOLEAN NOT NULL DEFAULT false,
    "consejeria_lactancia" BOOLEAN NOT NULL DEFAULT false,
    "tsh_valor" DOUBLE PRECISION,
    "hb_hepatitis_b" TEXT,
    "ttgo_resultado_mg_dl" DOUBLE PRECISION,
    "campo_secundario_valor" DOUBLE PRECISION,
    "embarazo_id" TEXT NOT NULL,

    CONSTRAINT "Laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id_control" TEXT NOT NULL,
    "fecha_visita" TIMESTAMP(3) NOT NULL,
    "eg_semanas" INTEGER NOT NULL,
    "peso_kg" DOUBLE PRECISION NOT NULL,
    "pa_sistolica" INTEGER,
    "pa_diastolica" INTEGER,
    "altura_uterina_cm" INTEGER,
    "presentacion_fetal" TEXT,
    "lcf_lpm" TEXT,
    "movimientos_fetales" TEXT,
    "proteinuria" TEXT,
    "signos_alarma_examenes_tratamientos" TEXT,
    "iniciales_tecnico" TEXT NOT NULL,
    "proxima_cita" TIMESTAMP(3) NOT NULL,
    "embarazo_id" TEXT NOT NULL,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id_control")
);

-- CreateTable
CREATE TABLE "Cita" (
    "id_cita" TEXT NOT NULL,
    "fecha_cita" TIMESTAMP(3) NOT NULL,
    "hora_cita" TEXT,
    "motivo" TEXT,
    "comentarios" TEXT,
    "diagnostico" TEXT,
    "plan" TEXT,
    "sintomas" TEXT,
    "examen_fisico" TEXT,
    "pa" TEXT,
    "fc" TEXT,
    "fr" TEXT,
    "sato2" TEXT,
    "glicemia" TEXT,
    "peso" TEXT,
    "estado" TEXT NOT NULL,
    "tipo" TEXT,
    "eco_eg" TEXT,
    "eco_peso" TEXT,
    "eco_ila" TEXT,
    "eco_diagnostico" TEXT,
    "pap_aspecto" TEXT,
    "pap_resultado" TEXT,
    "pap_observaciones" TEXT,
    "gyn_motivo" TEXT,
    "gyn_examen_mamario" TEXT,
    "gyn_abdomen_pelvis" TEXT,
    "gyn_especuloscopia" TEXT,
    "gyn_tacto_vaginal" TEXT,
    "cedula_id" TEXT NOT NULL,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id_cita")
);

-- CreateIndex
CREATE UNIQUE INDEX "InformacionSocial_pacienteId_key" ON "InformacionSocial"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "AntecedentesGinecologicos_pacienteId_key" ON "AntecedentesGinecologicos"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "AntecedentesMedicos_pacienteId_key" ON "AntecedentesMedicos"("pacienteId");

-- AddForeignKey
ALTER TABLE "InformacionSocial" ADD CONSTRAINT "InformacionSocial_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("cedula_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntecedentesGinecologicos" ADD CONSTRAINT "AntecedentesGinecologicos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("cedula_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntecedentesMedicos" ADD CONSTRAINT "AntecedentesMedicos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("cedula_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embarazo" ADD CONSTRAINT "Embarazo_cedula_id_fkey" FOREIGN KEY ("cedula_id") REFERENCES "Paciente"("cedula_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laboratorio" ADD CONSTRAINT "Laboratorio_embarazo_id_fkey" FOREIGN KEY ("embarazo_id") REFERENCES "Embarazo"("id_embarazo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_embarazo_id_fkey" FOREIGN KEY ("embarazo_id") REFERENCES "Embarazo"("id_embarazo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_cedula_id_fkey" FOREIGN KEY ("cedula_id") REFERENCES "Paciente"("cedula_id") ON DELETE CASCADE ON UPDATE CASCADE;

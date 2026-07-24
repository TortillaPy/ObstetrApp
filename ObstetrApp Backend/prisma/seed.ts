import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminCount = await prisma.usuario.count({ where: { rol: 'ADMIN' } });
  
  if (adminCount === 0) {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@obstetrapp.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin1234';
    const doctorEmail = process.env.INITIAL_DOCTOR_EMAIL || 'doctor@obstetrapp.com';
    const doctorPassword = process.env.INITIAL_DOCTOR_PASSWORD || 'doctor123';

    console.log('🌱 Sembrando base de datos inicial con cuentas desde variables de entorno...');
    const adminPassHash = await bcrypt.hash(adminPassword, 10);
    const doctorPassHash = await bcrypt.hash(doctorPassword, 10);

    await prisma.usuario.createMany({
      data: [
        {
          email: adminEmail,
          password_hash: adminPassHash,
          nombre: 'Administrador',
          apellido: 'Sistema',
          rol: 'ADMIN',
          especialidad: 'Administración Clínica',
          registro_prof: 'ADM-001',
          nombre_clinica: 'ObstetrApp Central',
          direccion: 'Asunción, Paraguay',
          telefono: '+595 985 944757',
          activo: true,
        },
        {
          email: doctorEmail,
          password_hash: doctorPassHash,
          nombre: 'Ana',
          apellido: 'Mendoza',
          rol: 'MEDICO',
          especialidad: 'Ginecología y Obstetricia',
          registro_prof: 'Rg. Prof. 12345',
          nombre_clinica: 'Atención Médica Integral',
          direccion: 'Av. España 1450 e/ Pitiantuta, Asunción',
          telefono: '+595 985 000000',
          activo: true,
        },
      ],
    });
    console.log(`✅ Base de datos sembrada correctamente con cuentas (${adminEmail} y ${doctorEmail}).`);
  } else {
    console.log('ℹ️ La base de datos ya cuenta con usuarios registrados. No se requiere siembra.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error durante la siembra de la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Obtener IDs de métodos de transporte existentes
  const transportMethods = await prisma.transportMethod.findMany({
    take: 2,
  });

  if (transportMethods.length === 0) {
    console.log('❌ No transport methods found. Skipping seed.');
    return;
  }

  // Obtener ID de zona de cobertura existente
  const coverageZones = await prisma.coverageZone.findMany({
    take: 1,
  });

  if (coverageZones.length === 0) {
    console.log('❌ No coverage zones found. Skipping seed.');
    return;
  }

  console.log(
    '✅ Transport methods and coverage zones found. Starting seed...',
  );

  // ===== SEED: Drivers =====
  console.log('🚗 Seeding drivers...');
  const drivers = await prisma.driver.createMany({
    data: [
      {
        employeeId: 'DRV-001',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@logistica.com',
        phone: '+54-11-1234-5678',
        licenseNumber: 'ARG123456789',
        licenseType: 'D',
        status: 'ACTIVE',
      },
      {
        employeeId: 'DRV-002',
        firstName: 'María',
        lastName: 'García',
        email: 'maria.garcia@logistica.com',
        phone: '+54-11-2234-5678',
        licenseNumber: 'ARG987654321',
        licenseType: 'C',
        status: 'ACTIVE',
      },
      {
        employeeId: 'DRV-003',
        firstName: 'Carlos',
        lastName: 'López',
        email: 'carlos.lopez@logistica.com',
        phone: '+54-11-3234-5678',
        licenseNumber: 'ARG456789123',
        licenseType: 'D',
        status: 'ACTIVE',
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Created ${drivers.count} drivers`);

  // Get driver IDs
  const createdDrivers = await prisma.driver.findMany({
    take: 3,
  });

  // ===== SEED: Vehicles =====
  console.log('🚛 Seeding vehicles...');
  const vehicles = await prisma.vehicle.createMany({
    data: [
      {
        licensePlate: 'AA-001-BB',
        make: 'Scania',
        model: 'R440',
        year: 2023,
        capacityKg: 25000,
        volumeM3: 80.5,
        fuelType: 'DIESEL',
        status: 'AVAILABLE',
        transportMethodId: transportMethods[0].id,
        driverId: createdDrivers[0]?.id,
      },
      {
        licensePlate: 'AA-002-BB',
        make: 'Volvo',
        model: 'FH16',
        year: 2022,
        capacityKg: 22000,
        volumeM3: 75.0,
        fuelType: 'DIESEL',
        status: 'AVAILABLE',
        transportMethodId: transportMethods[0].id,
        driverId: createdDrivers[1]?.id,
      },
      {
        licensePlate: 'AA-003-BB',
        make: 'Mercedes',
        model: 'Actros',
        year: 2021,
        capacityKg: 18000,
        volumeM3: 60.0,
        fuelType: 'DIESEL',
        status: 'AVAILABLE',
        transportMethodId: transportMethods[1].id,
        driverId: createdDrivers[2]?.id,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Created ${vehicles.count} vehicles`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

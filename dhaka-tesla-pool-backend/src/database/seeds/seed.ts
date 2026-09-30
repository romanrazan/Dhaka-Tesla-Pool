import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/domain.enums';
import dataSource from '../../data-source';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

async function seed() {
  await dataSource.initialize();
  await dataSource.runMigrations();
  const users = dataSource.getRepository(User);
  const vehicles = dataSource.getRepository(Vehicle);
  const passwordHash = await bcrypt.hash('Pool123!', 12);
  const cast = [
    {
      name: 'Jashim',
      email: 'jashim@dhakapool.local',
      phone: '+8801711000000',
      role: UserRole.DRIVER,
    },
    {
      name: 'Nusrat',
      email: 'nusrat@dhakapool.local',
      phone: '+8801711000001',
      role: UserRole.PASSENGER,
    },
    {
      name: 'Rafiq',
      email: 'rafiq@dhakapool.local',
      phone: '+8801711000002',
      role: UserRole.PASSENGER,
    },
    {
      name: 'Shirin',
      email: 'shirin@dhakapool.local',
      phone: '+8801711000003',
      role: UserRole.PASSENGER,
    },
  ];
  for (const person of cast) {
    const existing = await users.findOne({ where: { email: person.email } });
    if (existing) await users.save({ ...existing, ...person, passwordHash });
    else await users.save(users.create({ ...person, passwordHash }));
  }
  const jashim = await users.findOneByOrFail({
    email: 'jashim@dhakapool.local',
  });
  if (!(await vehicles.exists({ where: { driverId: jashim.id } }))) {
    await vehicles.save(
      vehicles.create({
        driverId: jashim.id,
        name: 'Bullet',
        registrationNumber: 'DHAKA-METRO-T-11-2026',
        capacity: 3,
        isOnline: false,
      }),
    );
  }
  await dataSource.destroy();
  process.stdout.write('Seeded Jashim, Bullet, Nusrat, Rafiq, and Shirin.\n');
}

seed().catch(async (error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.stack : String(error)}\n`,
  );
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});

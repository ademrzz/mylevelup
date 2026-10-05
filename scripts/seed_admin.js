const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@levelupdz.com' },
    update: {
      role: 'ADMIN',
      emailVerified: new Date(),
    },
    create: {
      name: 'Super Admin',
      email: 'admin@levelupdz.com',
      password: hash,
      role: 'ADMIN',
      wilaya: '16 - Alger',
      phone: '0550000000',
      emailVerified: new Date(),
    }
  });
  console.log('SUCCESS: Admin user ready ->', admin.email, 'Role:', admin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

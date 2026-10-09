const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@levelupdz.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    console.error('❌ Définis ADMIN_PASSWORD (12 caractères minimum).');
    console.error('   Exemple : ADMIN_PASSWORD="MonMotDePasse2026!" node scripts/seed_admin.js');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      emailVerified: new Date(),
      // ⚠️ Ne touche PAS au mot de passe si l'admin existe déjà
    },
    create: {
      name: 'Super Admin',
      email,
      password: hash,
      role: 'ADMIN',
      wilaya: '16 - Alger',
      phone: '0550000000',
      emailVerified: new Date(),
    },
  });

  console.log("SUCCESS: Admin prêt ->", admin.email, "(" + admin.role + ")");
  console.log("⚠️  Note : si l'admin existait déjà, le mot de passe n'a PAS été modifié.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
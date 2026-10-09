// Change le mot de passe du compte admin.
// Le nouveau mot de passe est lu dans la variable ADMIN_NEW_PASSWORD
// (il n'est écrit nulle part dans le code ni dans Git).
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_NEW_PASSWORD;

  if (!password || password.length < 12) {
    console.error("Définis ADMIN_NEW_PASSWORD (12 caractères minimum).");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const result = await prisma.user.updateMany({
    where: { email: "admin@levelupdz.com" },
    data: { password: hash },
  });

  console.log(`ADMIN_PASSWORD_UPDATED: ${result.count} compte(s)`);
}

main()
  .catch((error) => {
    console.error("ADMIN_PASSWORD_ERROR:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
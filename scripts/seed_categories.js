// Crée les catégories de base (peut être relancé sans risque : pas de doublons).
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ⚠️ Ces noms doivent rester IDENTIQUES à ceux de src/app/categories/page.tsx :
// le filtre du catalogue compare le nom exact de la catégorie.
const CATEGORIES = ["Lycée (BAC)", "CEM (BEM)", "Université", "Formation Pro"];

async function main() {
  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  const count = await prisma.category.count();
  console.log(`CATEGORIES_SEEDED_SUCCESS: ${count}`);
}

main()
  .catch((error) => {
    console.error("CATEGORIES_SEED_ERROR:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
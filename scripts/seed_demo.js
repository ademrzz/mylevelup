// Données de démonstration (formateur, étudiant, 2 cours). DÉVELOPPEMENT UNIQUEMENT.
// Usage : npm run seed:demo -- --yes
// Remplace l'ancienne route /api/debug/seed (qui était ouverte à tout le monde).
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

function targetHost() {
  try {
    return new URL(process.env.DATABASE_URL).hostname;
  } catch {
    return "(adresse illisible)";
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusé : ne jamais lancer ce script en production.");
    process.exit(1);
  }
  if (!process.argv.includes("--yes")) {
    console.log(`Ce script va ajouter des données de test dans : ${targetHost()}`);
    console.log("Relance avec : npm run seed:demo -- --yes");
    process.exit(0);
  }

  const levels = ["Lycée (BAC)", "CEM (BEM)", "Université", "Formation Pro"];
  for (const name of levels) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  const hashed = await bcrypt.hash(process.env.DEMO_PASSWORD || "password123", 10);

  const instructor = await prisma.user.upsert({
    where: { email: "ahmed@levelupdz.com" },
    update: {},
    create: {
      name: "Prof. Ahmed",
      email: "ahmed@levelupdz.com",
      role: "INSTRUCTOR",
      password: hashed,
      emailVerified: new Date(),
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@levelupdz.com" },
    update: {},
    create: {
      name: "Test Student",
      email: "student@levelupdz.com",
      role: "STUDENT",
      password: hashed,
      emailVerified: new Date(),
    },
  });

  const bac = await prisma.category.findUnique({ where: { name: "Lycée (BAC)" } });
  const uni = await prisma.category.findUnique({ where: { name: "Université" } });

  const courses = [
    {
      title: "Mathématiques - Terminale (Préparation BAC)",
      description:
        "Un cours complet pour maîtriser les fonctions, suites et probabilités pour le BAC.",
      imageUrl:
        "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=1000&auto=format&fit=crop",
      price: 2500,
      isPublished: true,
      status: "PUBLISHED",
      categoryId: bac.id,
      instructorId: instructor.id,
    },
    {
      title: "Introduction à la Programmation (Next.js)",
      description: "Apprenez à coder des applications web modernes de A à Z.",
      imageUrl:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop",
      price: 4000,
      isPublished: true,
      status: "PUBLISHED",
      categoryId: uni.id,
      instructorId: instructor.id,
    },
  ];

  for (const course of courses) {
    const existing = await prisma.course.findFirst({ where: { title: course.title } });
    if (existing) continue;

    const created = await prisma.course.create({ data: course });
    const chapter = await prisma.chapter.create({
      data: { title: "Chapitre 1 : Les bases", position: 1, courseId: created.id },
    });
    await prisma.lesson.create({
      data: {
        title: "Introduction",
        videoUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        position: 1,
        isFree: true,
        chapterId: chapter.id,
      },
    });
    await prisma.lesson.create({
      data: {
        title: "Installation et configuration",
        videoUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        position: 2,
        isFree: false,
        chapterId: chapter.id,
      },
    });
  }

  console.log("DEMO_SEED_SUCCESS (compte test : student@levelupdz.com / ahmed@levelupdz.com)");
}

main()
  .catch((error) => {
    console.error("DEMO_SEED_ERROR:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
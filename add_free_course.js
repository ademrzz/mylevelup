const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addFreeCourse() {
  console.log("Fetching a category and instructor...");
  const category = await prisma.category.findFirst();
  const instructor = await prisma.user.findFirst();

  if (!category || !instructor) {
    console.log("No category or instructor found. Please seed the database first.");
    return;
  }

  console.log("Creating a FREE course...");
  const freeCourse = await prisma.course.create({
    data: {
      title: "Les Bases de l'Anglais - Cours Gratuit",
      description: "Un cours d'introduction gratuit pour apprendre les bases de la grammaire et du vocabulaire anglais. Parfait pour les débutants.",
      imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1000&auto=format&fit=crop", // English learning image
      price: null, // THIS MAKES IT FREE
      isPublished: true,
      categoryId: category.id,
      instructorId: instructor.id,
      chapters: {
        create: [
          {
            title: "Chapitre 1: L'Alphabet et les Nombres",
            position: 1,
            lessons: {
              create: [
                { title: "L'alphabet anglais", videoUrl: "placeholder", position: 1, isFree: true },
                { title: "Les nombres de 1 à 100", videoUrl: "placeholder", position: 2, isFree: true }
              ]
            }
          }
        ]
      }
    }
  });

  console.log("Successfully created FREE course:", freeCourse.title);
}

addFreeCourse()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

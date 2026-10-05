const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.course.updateMany({
    where: {
      imageUrl: {
        contains: "1596495578065" // The ID of the woman image
      }
    },
    data: {
      imageUrl: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=1000&auto=format&fit=crop" // Abstract math chalkboard
    }
  });
  console.log("Woman image completely removed from database!");
}
run();

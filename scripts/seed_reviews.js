const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedReviews() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { enrollments: { include: { user: true } } }
  });

  const sampleReviews = [
    { rating: 5, comment: 'Explications claires, concises et parfaitement alignées avec le programme officiel ! Merci beaucoup pour cette formation de très haute qualité.' },
    { rating: 5, comment: 'Très bonne méthodologie pédagogique, les exercices d\'application m\'ont beaucoup aidé à assimiler chaque notion.' },
    { rating: 4, comment: 'Contenu riche et instructeur passionné. La plateforme vidéo est très réactive même avec une connexion 4G moyenne.' },
    { rating: 5, comment: 'Meilleure plateforme en Algérie ! Le support des enseignants et la clarté des cours font toute la différence.' }
  ];

  let added = 0;
  for (const c of courses) {
    if (c.enrollments.length > 0) {
      for (let i = 0; i < Math.min(c.enrollments.length, 2); i++) {
        const enr = c.enrollments[i];
        const sample = sampleReviews[(c.title.length + i) % sampleReviews.length];
        const id = 'rev_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substring(2, 7);
        try {
          await prisma.$executeRawUnsafe(
            'INSERT OR IGNORE INTO CourseReview (id, courseId, userId, rating, comment, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            id, c.id, enr.userId, sample.rating, sample.comment
          );
          added++;
        } catch(e) {
          console.error(e);
        }
      }
    }
  }
  console.log('REVIEWS_SEEDED_SUCCESS:', added);
}

seedReviews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initExtensions() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS PayoutRequest (
      id TEXT PRIMARY KEY,
      instructorId TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      accountDetails TEXT NOT NULL,
      accountName TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      txReference TEXT,
      rejectionReason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("TABLE_OK: PayoutRequest table created/verified.");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS CourseReview (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      userId TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(courseId, userId)
    );
  `);
  console.log("TABLE_OK: CourseReview table created/verified.");
}

initExtensions()
  .catch((e) => {
    console.error("DB_INIT_ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

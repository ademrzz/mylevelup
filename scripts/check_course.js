const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const c = await p.course.findUnique({
    where: { id: 'cms4lar2v0001b2kde6th3v8y' },
    include: {
      enrollments: {
        include: { user: true }
      },
      instructor: true
    }
  });
  console.log("COURSE_TITLE:", c?.title);
  console.log("INSTRUCTOR:", c?.instructor?.name, c?.instructor?.email);
  console.log("PRICE:", c?.price);
  console.log("ENROLLMENTS:", c?.enrollments.map(e => ({ name: e.user.name, email: e.user.email, role: e.user.role })));

  const allUsers = await p.user.findMany();
  console.log("ALL_USERS:", allUsers.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
}

main().finally(() => p.$disconnect());

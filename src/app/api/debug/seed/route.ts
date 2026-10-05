import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    // 1. Create Categories (Levels instead of subjects as requested)
    const levels = [
      { name: "Lycée (BAC)" },
      { name: "CEM (BEM)" },
      { name: "Université" },
      { name: "Formation Pro" }
    ];

    for (const level of levels) {
      await prisma.category.upsert({
        where: { name: level.name },
        update: {},
        create: { name: level.name }
      });
    }

    // 2. Ensure an Instructor and Student exist
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    let instructor = await prisma.user.findUnique({ where: { email: "ahmed@levelupdz.com" } });
    if (!instructor) {
      instructor = await prisma.user.create({
        data: {
          name: "Prof. Ahmed",
          email: "ahmed@levelupdz.com",
          role: "INSTRUCTOR",
          password: hashedPassword,
          emailVerified: new Date()
        }
      });
    }

    let student = await prisma.user.findUnique({ where: { email: "student@levelupdz.com" } });
    if (!student) {
      student = await prisma.user.create({
        data: {
          name: "Test Student",
          email: "student@levelupdz.com",
          role: "STUDENT",
          password: hashedPassword,
          emailVerified: new Date()
        }
      });
    }

    const bacCategory = await prisma.category.findUnique({ where: { name: "Lycée (BAC)" } });
    const uniCategory = await prisma.category.findUnique({ where: { name: "Université" } });

    if (!bacCategory || !uniCategory) throw new Error("Categories not found");

    // 3. Create Dummy Courses
    const coursesToCreate = [
      {
        title: "Mathématiques - Terminale (Préparation BAC)",
        description: "Un cours complet pour maîtriser les fonctions, suites et probabilités pour le BAC.",
        imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=1000&auto=format&fit=crop",
        price: 2500, // DZD
        isPublished: true,
        categoryId: bacCategory.id,
        instructorId: instructor.id,
      },
      {
        title: "Introduction à la Programmation (Next.js)",
        description: "Apprenez à coder des applications web modernes de A à Z.",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop",
        price: 4000,
        isPublished: true,
        categoryId: uniCategory.id,
        instructorId: instructor.id,
      }
    ];

    for (const course of coursesToCreate) {
      const existing = await prisma.course.findFirst({ where: { title: course.title } });
      if (!existing) {
        const createdCourse = await prisma.course.create({ data: course });

        // Add dummy chapters
        const chapter = await prisma.chapter.create({
          data: {
            title: "Chapitre 1 : Les bases",
            position: 1,
            courseId: createdCourse.id,
          }
        });

        // Add dummy lesson
        await prisma.lesson.create({
          data: {
            title: "Introduction",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            position: 1,
            isFree: true,
            chapterId: chapter.id
          }
        });
        // Add dummy lesson 2
        await prisma.lesson.create({
          data: {
            title: "Installation et configuration",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            position: 2,
            isFree: false,
            chapterId: chapter.id
          }
        });
      }
    }

    // 4. Enroll the dummy student in the Next.js course
    const nextjsCourse = await prisma.course.findFirst({ where: { title: "Introduction à la Programmation (Next.js)" } });
    if (nextjsCourse && student) {
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: student.id, courseId: nextjsCourse.id } }
      });
      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: student.id,
            courseId: nextjsCourse.id,
          }
        });
        
        // Add some progress (Completed lesson 1)
        const chapter1 = await prisma.chapter.findFirst({ where: { courseId: nextjsCourse.id } });
        if (chapter1) {
          const lesson1 = await prisma.lesson.findFirst({ where: { chapterId: chapter1.id, position: 1 } });
          if (lesson1) {
            await prisma.userProgress.create({
              data: {
                userId: student.id,
                lessonId: lesson1.id,
                isCompleted: true
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error) {
    console.error("SEED_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

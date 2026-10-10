"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function instructorDeleteCourse(courseId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;

  if (!userId) {
    throw new Error("Vous devez être connecté.");
  }

  // Find course and verify ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true, title: true },
  });

  if (!course) {
    throw new Error("Formation introuvable.");
  }

  // Security check: only course owner or admin can delete
  if (course.instructorId !== userId && userRole !== "ADMIN") {
    throw new Error("Vous n'avez pas l'autorisation de supprimer cette formation.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete associated CourseReviews
    await tx.courseReview.deleteMany({
      where: { courseId },
    });

    // 2. Find all chapters for this course
    const chapters = await tx.chapter.findMany({
      where: { courseId },
      select: { id: true },
    });
    const chapterIds = chapters.map((c) => c.id);

    if (chapterIds.length > 0) {
      // 3. Find lessons for these chapters
      const lessons = await tx.lesson.findMany({
        where: { chapterId: { in: chapterIds } },
        select: { id: true },
      });
      const lessonIds = lessons.map((l) => l.id);

      // 4. Delete user progress for these lessons
      if (lessonIds.length > 0) {
        await tx.userProgress.deleteMany({
          where: { lessonId: { in: lessonIds } },
        });
      }

      // 5. Delete lessons
      await tx.lesson.deleteMany({
        where: { chapterId: { in: chapterIds } },
      });

      // 6. Delete chapters
      await tx.chapter.deleteMany({
        where: { id: { in: chapterIds } },
      });
    }

    // 7. Delete enrollments
    await tx.enrollment.deleteMany({
      where: { courseId },
    });

    // 8. Delete the course
    await tx.course.delete({
      where: { id: courseId },
    });
  });

  revalidatePath("/instructor");
  revalidatePath("/instructor/courses");
  revalidatePath("/courses");
  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePath("/dashboard");

  return { success: true };
}

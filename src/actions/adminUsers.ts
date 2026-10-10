"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adminUpdateUserRole(targetUserId: string, newRole: string) {
  const session = await getServerSession(authOptions);
  const currentAdmin = session?.user as any;
  if (currentAdmin?.role !== "ADMIN") {
    throw new Error("Seul un administrateur peut modifier les rôles.");
  }

  if (targetUserId === currentAdmin?.id && newRole !== "ADMIN") {
    throw new Error("Vous ne pouvez pas rétrograder votre propre compte administrateur.");
  }

  if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(newRole)) {
    throw new Error("Rôle non valide.");
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteUser(targetUserId: string) {
  const session = await getServerSession(authOptions);
  const currentAdmin = session?.user as any;
  if (currentAdmin?.role !== "ADMIN") {
    throw new Error("Seul un administrateur peut supprimer des utilisateurs.");
  }

  if (targetUserId === currentAdmin?.id) {
    throw new Error("Impossible de supprimer votre propre compte administrateur.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete user progress
    await tx.userProgress.deleteMany({ where: { userId: targetUserId } });

    // 2. Delete user enrollments
    await tx.enrollment.deleteMany({ where: { userId: targetUserId } });

    // 3. Delete reviews written by user
    await tx.courseReview.deleteMany({ where: { userId: targetUserId } });

    // 4. If instructor, purge owned courses & related data
    const userCourses = await tx.course.findMany({
      where: { instructorId: targetUserId },
      select: { id: true },
    });

    if (userCourses.length > 0) {
      const courseIds = userCourses.map((c) => c.id);

      await tx.courseReview.deleteMany({ where: { courseId: { in: courseIds } } });
      await tx.enrollment.deleteMany({ where: { courseId: { in: courseIds } } });

      const chapters = await tx.chapter.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true },
      });
      const chapterIds = chapters.map((c) => c.id);

      if (chapterIds.length > 0) {
        const lessons = await tx.lesson.findMany({
          where: { chapterId: { in: chapterIds } },
          select: { id: true },
        });
        const lessonIds = lessons.map((l) => l.id);

        if (lessonIds.length > 0) {
          await tx.userProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
        }
        await tx.lesson.deleteMany({ where: { chapterId: { in: chapterIds } } });
        await tx.chapter.deleteMany({ where: { id: { in: chapterIds } } });
      }

      await tx.course.deleteMany({ where: { id: { in: courseIds } } });
    }

    // 5. Delete instructor application if any
    await tx.instructorApplication.deleteMany({ where: { userId: targetUserId } });

    // 6. Delete auth records
    await tx.twoFactorConfirmation.deleteMany({ where: { userId: targetUserId } });
    await tx.session.deleteMany({ where: { userId: targetUserId } });
    await tx.account.deleteMany({ where: { userId: targetUserId } });

    // 7. Delete the user record
    await tx.user.delete({ where: { id: targetUserId } });
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/finance");
  return { success: true };
}

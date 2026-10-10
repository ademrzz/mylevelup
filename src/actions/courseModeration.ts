"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { approveCourseReview, rejectCourseReview, unpublishCourse } from "@/lib/courseReview";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notifyCourseApproved, notifyCourseRejected } from "@/lib/notifications";

export async function adminApproveCourse(courseId: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    throw new Error("Seul un administrateur peut approuver un cours.");
  }

  await approveCourseReview(courseId);
  await notifyCourseApproved(courseId);
  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true };
}

export async function adminRejectCourse(courseId: string, reason: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    throw new Error("Seul un administrateur peut rejeter un cours.");
  }

  await rejectCourseReview(courseId, reason);
  await notifyCourseRejected(courseId);
  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePath("/courses");
  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true };
}

export async function adminUnpublishCourse(courseId: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    throw new Error("Seul un administrateur peut dépublier un cours.");
  }

  await unpublishCourse(courseId);

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePath("/courses");
  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true };
}

export async function adminDeleteMultipleCourses(courseIds: string[]) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    throw new Error("Seul un administrateur peut supprimer des formations.");
  }

  if (!courseIds || courseIds.length === 0) {
    return { success: true, count: 0 };
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete associated CourseReviews
    await tx.courseReview.deleteMany({
      where: { courseId: { in: courseIds } },
    });

    // 2. Find all chapters for these courses
    const chapters = await tx.chapter.findMany({
      where: { courseId: { in: courseIds } },
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
      where: { courseId: { in: courseIds } },
    });

    // 8. Delete the courses
    await tx.course.deleteMany({
      where: { id: { in: courseIds } },
    });
  });

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePath("/courses");
  revalidatePath("/instructor/courses");
  revalidatePath("/dashboard");

  return { success: true, count: courseIds.length };
}

export async function adminPublishMultipleCourses(courseIds: string[]) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    throw new Error("Seul un administrateur peut publier des formations.");
  }

  if (!courseIds || courseIds.length === 0) {
    return { success: true, count: 0 };
  }

  await prisma.course.updateMany({
    where: { id: { in: courseIds } },
    data: {
      isPublished: true,
      status: "PUBLISHED",
      rejectionReason: null,
    },
  });

  // Send notifications for approved courses
  for (const id of courseIds) {
    try {
      await notifyCourseApproved(id);
    } catch (e) {
      // Non-blocking notification
    }
  }

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePath("/courses");
  revalidatePath("/instructor/courses");
  revalidatePath("/dashboard");

  return { success: true, count: courseIds.length };
}

export async function adminUnpublishMultipleCourses(courseIds: string[]) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    throw new Error("Seul un administrateur peut dépublier des formations.");
  }

  if (!courseIds || courseIds.length === 0) {
    return { success: true, count: 0 };
  }

  await prisma.course.updateMany({
    where: { id: { in: courseIds } },
    data: {
      isPublished: false,
      status: "DRAFT",
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePath("/courses");
  revalidatePath("/instructor/courses");
  revalidatePath("/dashboard");

  return { success: true, count: courseIds.length };
}

export async function adminDeleteCourse(courseId: string) {
  return await adminDeleteMultipleCourses([courseId]);
}


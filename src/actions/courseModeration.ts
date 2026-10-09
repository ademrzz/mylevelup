"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { approveCourseReview, rejectCourseReview, unpublishCourse } from "@/lib/courseReview";
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

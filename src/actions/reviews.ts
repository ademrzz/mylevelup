"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { submitCourseReview, deleteCourseReview } from "@/lib/reviews";
import { revalidatePath } from "next/cache";

export async function submitReviewAction(courseId: string, rating: number, comment?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Vous devez être connecté pour laisser un avis." };
  }

  const userId = (session.user as any).id;
  const res = await submitCourseReview(courseId, userId, rating, comment);
  if (res.success) {
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/courses`);
  }
  return res;
}

export async function deleteReviewAction(reviewId: string, courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Non autorisé." };
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const isAdmin = role === "ADMIN";

  const res = await deleteCourseReview(reviewId, userId, isAdmin);
  if (res.success) {
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/courses`);
  }
  return res;
}

import { prisma } from "@/lib/prisma";

/**
 * Marks a course as submitted for admin review
 */
export async function submitCourseForReview(courseId: string) {
  await prisma.course.update({
    where: { id: courseId },
    data: {
      status: "PENDING",
      isPublished: false,
    },
  });

  // Clean legacy verification token if any exists
  await prisma.verificationToken.deleteMany({
    where: { identifier: `course_review_${courseId}` },
  });
}

/**
 * Cancels a review submission, returning course to draft
 */
export async function cancelCourseReview(courseId: string) {
  await prisma.course.update({
    where: { id: courseId },
    data: {
      status: "DRAFT",
      isPublished: false,
    },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: `course_review_${courseId}` },
  });
}

/**
 * Checks if a course is currently pending review
 */
export async function isCoursePendingReview(courseId: string): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { status: true },
  });
  return course?.status === "PENDING";
}

/**
 * Gets a set of course IDs that are currently pending review
 */
export async function getPendingCourseIds(): Promise<Set<string>> {
  const courses = await prisma.course.findMany({
    where: { status: "PENDING" },
    select: { id: true },
  });

  return new Set(courses.map((c) => c.id));
}

/**
 * Marks a course as approved by admin and sets it to published
 */
export async function approveCourseReview(courseId: string) {
  await prisma.course.update({
    where: { id: courseId },
    data: {
      status: "PUBLISHED",
      isPublished: true,
      rejectionReason: null,
    },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: `course_review_${courseId}` },
  });
}

/**
 * Marks a course as rejected by admin with a required or optional reason
 */
export async function rejectCourseReview(courseId: string, rejectionReason?: string) {
  await prisma.course.update({
    where: { id: courseId },
    data: {
      status: "REJECTED",
      isPublished: false,
      rejectionReason: rejectionReason || "Le contenu ne respecte pas les critères de qualité Level Up DZ.",
    },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: `course_review_${courseId}` },
  });
}

/**
 * Unpublishes a course back to draft
 */
export async function unpublishCourse(courseId: string) {
  await prisma.course.update({
    where: { id: courseId },
    data: {
      status: "DRAFT",
      isPublished: false,
    },
  });
}

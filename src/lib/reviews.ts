import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface ReviewItem {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userWilaya?: string;
  userImage?: string;
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Check if a student is enrolled in a given course
 */
export async function hasUserEnrolled(courseId: string, userId: string): Promise<boolean> {
  if (!userId || !courseId) return false;
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });
  return !!enrollment;
}

/**
 * Fetch user info map for a list of userIds (batch to avoid N+1)
 */
async function fetchUserMap(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueIds.length === 0) return new Map<string, any>();

  const users = await prisma.user.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, name: true, email: true, wilaya: true, image: true },
  });

  return new Map(users.map((u) => [u.id, u]));
}

/**
 * Get all reviews for a course joined with user details
 */
export async function getCourseReviews(courseId: string): Promise<ReviewItem[]> {
  try {
    const reviews = await prisma.courseReview.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
    });

    if (reviews.length === 0) return [];

    const userMap = await fetchUserMap(reviews.map((r) => r.userId));

    return reviews.map((r) => {
      const u = userMap.get(r.userId);
      return {
        id: r.id,
        courseId: r.courseId,
        userId: r.userId,
        rating: Number(r.rating) || 5,
        comment: r.comment || "",
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        userName: u?.name || "Étudiant vérifié",
        userWilaya: u?.wilaya || undefined,
        userImage: u?.image || undefined,
      };
    });
  } catch (error) {
    console.error("GET_COURSE_REVIEWS_ERROR:", error);
    return [];
  }
}

/**
 * Get review stats (average rating, count, distribution) for a course
 */
export async function getCourseRatingStats(courseId: string): Promise<RatingStats> {
  const defaultStats: RatingStats = {
    averageRating: 0,
    totalReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  try {
    const rows = await prisma.courseReview.groupBy({
      by: ["rating"],
      where: { courseId },
      _count: { _all: true },
    });

    let totalRatingSum = 0;
    let totalCount = 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    for (const r of rows) {
      const star = Math.min(5, Math.max(1, Number(r.rating)));
      const count = r._count._all || 0;
      if (star >= 1 && star <= 5) {
        breakdown[star as 1 | 2 | 3 | 4 | 5] = count;
      }
      totalRatingSum += star * count;
      totalCount += count;
    }

    const averageRating =
      totalCount > 0 ? Math.round((totalRatingSum / totalCount) * 10) / 10 : 0;

    return {
      averageRating,
      totalReviews: totalCount,
      breakdown,
    };
  } catch (error) {
    console.error("GET_RATING_STATS_ERROR:", error);
    return defaultStats;
  }
}

/**
 * Aggregates rating stats for all courses in a single query to eliminate N+1 queries in catalog
 */
export async function getAllCoursesRatingStats(): Promise<
  Record<string, { averageRating: number; totalReviews: number }>
> {
  try {
    const rows = await prisma.courseReview.groupBy({
      by: ["courseId"],
      _avg: { rating: true },
      _count: { _all: true },
    });

    const map: Record<string, { averageRating: number; totalReviews: number }> = {};
    for (const r of rows) {
      map[r.courseId] = {
        averageRating: Math.round(Number(r._avg.rating || 0) * 10) / 10,
        totalReviews: r._count._all || 0,
      };
    }
    return map;
  } catch (error) {
    console.error("GET_ALL_RATING_STATS_ERROR:", error);
    return {};
  }
}

/**
 * Get existing review by a user for a course
 */
export async function getUserReviewForCourse(
  courseId: string,
  userId: string
): Promise<ReviewItem | null> {
  try {
    const r = await prisma.courseReview.findFirst({
      where: { courseId, userId },
    });

    if (!r) return null;

    const u = await prisma.user.findUnique({
      where: { id: r.userId },
      select: { name: true, email: true, wilaya: true, image: true },
    });

    return {
      id: r.id,
      courseId: r.courseId,
      userId: r.userId,
      rating: Number(r.rating) || 5,
      comment: r.comment || "",
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
      userName: u?.name || "Étudiant",
      userWilaya: u?.wilaya || undefined,
      userImage: u?.image || undefined,
    };
  } catch (error) {
    console.error("GET_USER_REVIEW_ERROR:", error);
    return null;
  }
}

/**
 * Create or update a review
 */
export async function submitCourseReview(
  courseId: string,
  userId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate rating
    const safeRating = Math.min(5, Math.max(1, Math.round(rating)));

    // Ensure user has an enrollment record so their review is verified
    const isEnrolled = await hasUserEnrolled(courseId, userId);
    if (!isEnrolled) {
      try {
        await prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          create: {
            userId,
            courseId,
          },
          update: {},
        });
      } catch (enrollErr) {
        console.warn("AUTO_ENROLL_ON_REVIEW_NOTICE:", enrollErr);
      }
    }

    // Check if review exists
    const existing = await getUserReviewForCourse(courseId, userId);

    if (existing) {
      await prisma.courseReview.update({
        where: { id: existing.id },
        data: {
          rating: safeRating,
          comment: comment?.trim() || null,
        },
      });
    } else {
      const id = `review_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      await prisma.courseReview.create({
        data: {
          id,
          courseId,
          userId,
          rating: safeRating,
          comment: comment?.trim() || null,
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("SUBMIT_REVIEW_ERROR:", error);
    return { success: false, error: error?.message || "Impossible d'enregistrer votre avis." };
  }
}

/**
 * Delete review (by owner or admin)
 */
export async function deleteCourseReview(
  reviewId: string,
  userId: string,
  isAdmin = false
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isAdmin) {
      await prisma.courseReview.delete({ where: { id: reviewId } });
    } else {
      await prisma.courseReview.deleteMany({
        where: { id: reviewId, userId },
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error("DELETE_REVIEW_ERROR:", error);
    return { success: false, error: error?.message || "Erreur lors de la suppression." };
  }
}
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { getAllCoursesRatingStats } from "@/lib/reviews";
import { CourseCatalogFilter } from "@/components/CourseCatalogFilter";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const [courses, categories, ratingsMap] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        instructor: true,
        chapters: {
          include: {
            _count: {
              select: { lessons: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" }
    }),
    getAllCoursesRatingStats(),
  ]);

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>Explorez le Catalogue</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '42rem', margin: '0 auto' }}>
          Des formations et cours de haute qualité, conçus spécialement pour les élèves et étudiants algériens.
        </p>
      </div>

      <main style={{ flex: 1, marginTop: '2rem' }}>
        <Suspense fallback={<div style={{ height: '8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Chargement du catalogue...</div>}>
          <CourseCatalogFilter
            initialCourses={courses}
            categories={categories}
            ratingsMap={ratingsMap}
          />
        </Suspense>
      </main>
    </div>
  );
}

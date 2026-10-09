import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { DashboardCourseCard } from "@/components/DashboardCourseCard";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null; // Handled by layout redirect
  }

  // Fetch enrollments with course details
  const userId = (session.user as any).id;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          category: true,
          instructor: true,
          chapters: {
            include: {
              _count: {
                select: { lessons: true }
              },
              lessons: {
                select: { id: true }
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Fetch progress for this user
  const userProgress = await prisma.userProgress.findMany({
    where: { userId }
  });

  // Helper to check if a lesson is completed
  const completedLessonIds = new Set(
    userProgress.filter(p => p.isCompleted).map(p => p.lessonId)
  );

  return (
    <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
          Bonjour, {session.user.name} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
          Bienvenue sur votre tableau de bord. Reprenons là où vous vous êtes arrêté.
        </p>
      </header>

      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          Mes Cours en cours
        </h2>

        {enrollments.length === 0 ? (
          <div className="glass" style={{ padding: '3rem', borderRadius: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', marginBottom: '0.5rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Vous n'êtes inscrit à aucun cours</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '28rem', marginBottom: '1rem' }}>
              Découvrez notre catalogue pour trouver le cours parfait pour vous.
            </p>
            <Link href="/courses" className="btn btn-primary">
              Parcourir le catalogue
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {enrollments.map(enrollment => {
              const course = enrollment.course;

              // Calculate total lessons and completed lessons for this course
              let totalLessons = 0;
              let completedLessons = 0;

              course.chapters.forEach(chapter => {
                totalLessons += chapter._count.lessons;
                chapter.lessons.forEach(lesson => {
                  if (completedLessonIds.has(lesson.id)) {
                    completedLessons++;
                  }
                });
              });

              const progressPercentage = totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;

              return (
                <DashboardCourseCard
                  key={enrollment.id}
                  course={course}
                  progressPercentage={progressPercentage}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

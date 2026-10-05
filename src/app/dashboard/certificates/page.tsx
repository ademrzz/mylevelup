import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Fetch enrollments with full chapters and lessons count
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
    }
  });

  // Fetch user completed lessons
  const userProgress = await prisma.userProgress.findMany({
    where: { userId, isCompleted: true },
    select: { lessonId: true }
  });

  const completedLessonIds = new Set(userProgress.map(p => p.lessonId));

  // Compute status per course
  const completedCourses = [];
  const inProgressCourses = [];

  for (const enrollment of enrollments) {
    const course = enrollment.course;
    let totalLessons = 0;
    let completedCount = 0;

    course.chapters.forEach(ch => {
      totalLessons += ch._count.lessons;
      ch.lessons.forEach(l => {
        if (completedLessonIds.has(l.id)) {
          completedCount++;
        }
      });
    });

    const percent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    if (percent === 100 && totalLessons > 0) {
      completedCourses.push({
        course,
        totalLessons,
        enrollmentDate: enrollment.createdAt
      });
    } else {
      inProgressCourses.push({
        course,
        totalLessons,
        completedCount,
        percent: Math.round(percent)
      });
    }
  }

  return (
    <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
          Mes Certificats
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Validez vos compétences et téléchargez vos attestations officielles de réussite.
        </p>
      </header>

      {/* Section 1: Completed Certificates */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Certificats obtenus</span>
          <span style={{ fontSize: '0.85rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            {completedCourses.length}
          </span>
        </h2>

        {completedCourses.length === 0 ? (
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '1rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--text-muted)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>
              Aucun certificat obtenu pour le moment
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              Terminez 100% des leçons d'un cours pour débloquer automatiquement votre certificat officiel Level Up DZ.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {completedCourses.map(({ course, totalLessons, enrollmentDate }) => (
              <div 
                key={course.id} 
                className="glass" 
                style={{ 
                  borderRadius: '1rem', 
                  border: '1px solid rgba(52, 211, 153, 0.3)', 
                  background: 'linear-gradient(145deg, rgba(52, 211, 153, 0.05) 0%, rgba(18, 18, 20, 0.9) 100%)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: '0 8px 32px rgba(52, 211, 153, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Certificat Validé
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Level Up DZ
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Délivré à : <strong style={{ color: 'white' }}>{session.user?.name}</strong>
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {totalLessons} leçons complétées avec succès
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ID: {course.id.slice(-8).toUpperCase()}
                  </span>
                  <Link 
                    href={`/courses/${course.id}/learn`}
                    className="btn btn-outline" 
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                  >
                    Revoir le cours
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: In-progress Courses */}
      <section>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>En cours de validation</span>
          <span style={{ fontSize: '0.85rem', background: 'rgba(0, 160, 220, 0.15)', color: 'var(--brand-blue)', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(0, 160, 220, 0.3)' }}>
            {inProgressCourses.length}
          </span>
        </h2>

        {inProgressCourses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Aucun autre cours en cours.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {inProgressCourses.map(({ course, totalLessons, completedCount, percent }) => (
              <div 
                key={course.id} 
                className="glass"
                style={{ padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                    {course.title}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {completedCount} sur {totalLessons} leçons terminées ({totalLessons - completedCount} restantes)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--brand-blue)' }}>Progression</span>
                      <span style={{ color: 'white' }}>{percent}%</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percent}%`, background: 'var(--brand-blue)' }} />
                    </div>
                  </div>

                  <Link 
                    href={`/courses/${course.id}/learn`}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    Continuer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { getCourseReviews, getCourseRatingStats, getUserReviewForCourse } from "@/lib/reviews";
import { CourseReviewsSection } from "@/components/CourseReviewsSection";

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {
  const resolvedParams = await params;
  const course = await prisma.course.findUnique({
    where: { id: resolvedParams.courseId },
    include: {
      category: true,
      instructor: true,
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" }
          }
        }
      }
    }
  });

  if (!course || !course.isPublished) {
    return notFound();
  }

  const session = await getServerSession(authOptions);
  let isEnrolled = false;
  const currentUserId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;

  if (currentUserId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: currentUserId,
          courseId: course.id
        }
      }
    });
    if (enrollment) {
      isEnrolled = true;
    }
  }

  const [reviews, stats, userReview] = await Promise.all([
    getCourseReviews(course.id),
    getCourseRatingStats(course.id),
    currentUserId ? getUserReviewForCourse(course.id, currentUserId) : Promise.resolve(null),
  ]);

  const totalLessons = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Hero Header Section */}
      <div className="detail-hero">
        <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', background: 'rgba(0,160,220,0.1)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none', transform: 'translate(50%, -50%)' }}></div>
        
        {/* Background Image with Overlay */}
        {course.imageUrl && (
          <div className="detail-hero-bg">
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              style={{ objectFit: 'cover', opacity: 0.3 }}
            />
            <div className="detail-hero-overlay"></div>
          </div>
        )}

        <div className="detail-hero-content">
          {/* Left: Text Info */}
          <div className="detail-hero-text">
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {course.category && (
                <span style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(0,160,220,0.2)', color: 'var(--brand-blue)', border: '1px solid rgba(0,160,220,0.3)' }}>
                  {course.category.name}
                </span>
              )}
              {stats.totalReviews > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(250, 204, 21, 0.12)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.8125rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#facc15" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span style={{ fontWeight: 700, color: '#facc15' }}>{stats.averageRating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({stats.totalReviews} {stats.totalReviews > 1 ? "avis" : "avis"})</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  <span>⭐</span> Nouveau cours
                </div>
              )}
            </div>
            
            <h1 className="detail-title">
              {course.title}
            </h1>
            
            <p className="detail-desc">
              {course.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Créé par</span>
                <span style={{ fontWeight: 600, color: 'white' }}>{course.instructor.name}</span>
              </div>
            </div>
          </div>

          {/* Right: Sticky Action Card */}
          <div className="detail-sidebar">
            <div className="detail-sidebar-inner">
              <div className="detail-sidebar-img">
                {course.imageUrl ? (
                  <Image src={course.imageUrl} alt={course.title} fill />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>Aucune image</div>
                )}
                {/* Play Button Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  {course.price ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white' }}>{course.price.toLocaleString("fr-DZ")}</span>
                      <span style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DZD</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '1.875rem', fontWeight: 700, color: '#34d399' }}>Gratuit</span>
                  )}
                </div>

                {isEnrolled ? (
                  <Link href={`/courses/${course.id}/learn`} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginBottom: '1rem', background: 'var(--brand-green)', borderColor: 'var(--brand-green)' }}>
                    Continuer l'apprentissage
                  </Link>
                ) : (
                  <Link href={`/courses/${course.id}/enroll`} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginBottom: '1rem' }}>
                    S'inscrire maintenant
                  </Link>
                )}

                <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Garantie de satisfaction de 30 jours. Accès à vie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="detail-main">
        <div className="detail-main-content">
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'white' }}>Ce que vous allez apprendre</h2>
          
          {/* Quick Stats Box */}
          <div className="stats-box">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Leçons</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{totalLessons}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chapitres</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{course.chapters.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Niveau</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{course.category?.name || "Tous niveaux"}</span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'white' }}>Contenu du cours</h2>

          {/* Curriculum Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {course.chapters.map((chapter) => (
              <div key={chapter.id} className="chapter-card">
                <div className="chapter-header">
                  <h3 style={{ fontWeight: 600, fontSize: '1.125rem', color: 'white', margin: 0 }}>
                    {chapter.title}
                  </h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {chapter.lessons.length} leçons
                  </span>
                </div>
                
                <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  {chapter.lessons.map((lesson) => (
                    <div key={lesson.id} className="lesson-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: 'var(--brand-blue)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                            <line x1="7" y1="2" x2="7" y2="22"></line>
                            <line x1="17" y1="2" x2="17" y2="22"></line>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                          </svg>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db' }}>
                          {lesson.title}
                        </span>
                      </div>
                      
                      {lesson.isFree && (
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                          Aperçu gratuit
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Student Reviews & Ratings Section */}
          <CourseReviewsSection
            courseId={course.id}
            reviews={reviews}
            stats={stats}
            isEnrolled={isEnrolled}
            currentUserId={currentUserId}
            userRole={userRole}
            initialUserReview={userReview}
          />

        </div>
      </div>
    </div>
  );
}

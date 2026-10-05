import Image from "next/image";
import Link from "next/link";
import { Course, Category, User } from "@prisma/client";

interface DashboardCourseCardProps {
  course: Course & {
    category: Category | null;
    instructor: User;
    chapters: { _count: { lessons: number } }[];
  };
  progressPercentage: number;
}

export function DashboardCourseCard({ course, progressPercentage }: DashboardCourseCardProps) {
  const totalLessons = course.chapters.reduce((sum, chapter) => sum + chapter._count.lessons, 0);

  return (
    <div className="course-card-wrapper" style={{ padding: '1.25rem' }}>
      <div className="dashboard-course-card-inner">
        
        {/* Left: Small Picture */}
        <Link href={`/courses/${course.id}/learn`} className="course-card-image-container" style={{ width: '13rem', flexShrink: 0, margin: 0, display: 'block' }}>
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, 220px"
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
              Aucune image
            </div>
          )}
        </Link>

        {/* Right: Content Info & Progress */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              {course.category && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-blue)', textTransform: 'uppercase' }}>
                  {course.category.name}
                </span>
              )}
            </div>
            <Link href={`/courses/${course.id}/learn`} style={{ textDecoration: 'none' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.3, color: 'white', marginBottom: '0.25rem' }}>
                {course.title}
              </h3>
            </Link>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Instructeur: {course.instructor.name} • {totalLessons} leçons au total
            </span>
          </div>
          
          {/* Progress Bar & CTA Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', maxWidth: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ color: progressPercentage === 100 ? 'var(--brand-green)' : 'var(--brand-blue)' }}>
                  {progressPercentage === 100 ? '✓ Terminé' : 'En cours'}
                </span>
                <span style={{ color: 'white' }}>{Math.round(progressPercentage)}%</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${progressPercentage}%`, 
                    background: progressPercentage === 100 ? 'var(--brand-green)' : 'var(--brand-blue)',
                    transition: 'width 1s ease'
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link 
                href={`/courses/${course.id}/learn`} 
                className="btn btn-primary" 
                style={{ 
                  padding: '0.5rem 1.25rem', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: progressPercentage === 100 ? 'rgba(52, 211, 153, 0.15)' : 'var(--gradient-blue)',
                  color: progressPercentage === 100 ? '#34d399' : 'white',
                  border: progressPercentage === 100 ? '1px solid rgba(52, 211, 153, 0.3)' : 'none'
                }}
              >
                {progressPercentage === 100 ? 'Revoir le cours' : 'Continuer'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

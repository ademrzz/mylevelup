import Image from "next/image";
import Link from "next/link";
import { Course, Category, User } from "@prisma/client";

interface CourseCardProps {
  course: Course & {
    category: Category | null;
    instructor: User;
    chapters: { _count: { lessons: number } }[];
  };
  rating?: {
    averageRating: number;
    totalReviews: number;
  };
}

export function CourseCard({ course, rating }: CourseCardProps) {
  // Calculate total lessons
  const totalLessons = course.chapters.reduce((sum, chapter) => sum + chapter._count.lessons, 0);

  return (
    <Link href={`/courses/${course.id}`} className="course-card-wrapper">
      <div className="course-card-inner">
        {/* Left: Content Info */}
        <div className="course-card-left">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
            {course.category && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(0,160,220,0.1)', color: 'var(--brand-blue)', border: '1px solid rgba(0,160,220,0.2)' }}>
                {course.category.name}
              </span>
            )}
            
            {rating && rating.totalReviews > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#facc15', background: 'rgba(250,204,21,0.1)', padding: '0.2rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(250,204,21,0.2)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{rating.averageRating.toFixed(1)}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({rating.totalReviews})</span>
              </div>
            ) : null}
          </div>
          
          <h3 style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.2, color: 'white', marginBottom: '0.75rem' }}>
            {course.title}
          </h3>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '42rem' }}>
            {course.description}
          </p>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Instructeur</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e5e7eb' }}>
                {course.instructor.name}
              </span>
            </div>
            
            <div className="hidden-mobile" style={{ width: '1px', height: '2rem', background: 'var(--border)' }}></div>
            
            <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, background: 'rgba(255,255,255,0.05)', padding: '0.375rem 0.75rem', borderRadius: '0.375rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {totalLessons} leçons
            </div>
          </div>
        </div>

        {/* Right: Small Picture & Price */}
        <div className="course-card-right">
          <div className="course-card-image-container">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                Aucune image
              </div>
            )}
          </div>

          <div className="course-card-price-box">
            {course.price ? (
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', letterSpacing: '-0.025em' }}>
                {course.price.toLocaleString("fr-DZ")} <span style={{ fontSize: '0.875rem', color: 'var(--brand-blue)', fontWeight: 500 }}>DZD</span>
              </span>
            ) : (
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>
                Gratuit
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

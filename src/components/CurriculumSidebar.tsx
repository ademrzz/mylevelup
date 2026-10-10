"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Prisma } from "@prisma/client";

// Define the shape of the chapter with lessons
type ChapterWithLessons = Prisma.ChapterGetPayload<{
  include: { lessons: true }
}>;

interface CurriculumSidebarProps {
  courseId: string;
  chapters: ChapterWithLessons[];
  completedLessonIds: string[];
  hasFullAccess?: boolean;
  onSelectLesson?: () => void;
}

export function CurriculumSidebar({ courseId, chapters, completedLessonIds, hasFullAccess = true, onSelectLesson }: CurriculumSidebarProps) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {chapters.map((chapter, index) => (
        <div key={chapter.id} style={{ borderBottom: '1px solid var(--border)' }}>
          {/* Chapter Header */}
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb', margin: 0, display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Section {index + 1}:</span>
              {chapter.title}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {chapter.lessons.filter(l => completedLessonIds.includes(l.id)).length} / {chapter.lessons.length} {chapter.lessons.length > 1 ? 'leçons terminées' : 'leçon terminée'}
            </div>
          </div>

          {/* Lessons List */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {chapter.lessons.map((lesson, lessonIndex) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isActive = pathname === `/courses/${courseId}/learn/${lesson.id}`;
              // Leçon verrouillée : pas inscrit et pas en aperçu gratuit
              const isLocked = !hasFullAccess && !lesson.isFree;

              return (
                <Link 
                  key={lesson.id} 
                  href={isLocked ? `/courses/${courseId}/enroll` : `/courses/${courseId}/learn/${lesson.id}`}
                  onClick={onSelectLesson}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem', 
                    textDecoration: 'none',
                    background: isActive ? 'rgba(0,160,220,0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--brand-blue)' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  className="lesson-sidebar-link hover:bg-white/5"
                >
                  {/* Checkbox Icon */}
                  <div style={{ marginTop: '0.125rem' }}>
                    {isLocked ? (
                      <div style={{ color: 'var(--text-muted)' }} title="Réservé aux inscrits">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    ) : isCompleted ? (
                      <div style={{ color: 'var(--brand-green)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Lesson Text */}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'white' : '#d1d5db', lineHeight: 1.4 }}>
                      {lessonIndex + 1}. {lesson.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      <span>{(lesson as any).duration ? `${(lesson as any).duration} min` : "Vidéo"}</span>
                      {!hasFullAccess && lesson.isFree && (
                        <span style={{ color: '#34d399', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>Aperçu gratuit</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { CurriculumSidebar } from "@/components/CurriculumSidebar";

type ChapterWithLessons = Prisma.ChapterGetPayload<{
  include: { lessons: true }
}>;

interface LearnTheaterViewProps {
  courseId: string;
  courseTitle: string;
  chapters: ChapterWithLessons[];
  completedLessonIds: string[];
  children: React.ReactNode;
}

export function LearnTheaterView({
  courseId,
  courseTitle,
  chapters,
  completedLessonIds,
  children,
}: LearnTheaterViewProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div 
      className="learn-theater-container" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 'calc(100vh - 75px)', 
        width: '100%', 
        background: '#0a0a0c' 
      }}
    >
      {/* Theater Top Navigation Bar */}
      <header 
        style={{ 
          height: '60px', 
          flexShrink: 0, 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 1.5rem', 
          background: 'rgba(18, 18, 20, 0.95)', 
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 40 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
          <Link 
            href="/dashboard" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--text-muted)', 
              fontSize: '0.9rem', 
              fontWeight: 500,
              flexShrink: 0 
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span className="hidden-mobile">Tableau de bord</span>
          </Link>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
          <h1 
            style={{ 
              fontSize: '0.95rem', 
              fontWeight: 600, 
              color: 'white', 
              margin: 0, 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              maxWidth: '400px' 
            }}
          >
            {courseTitle}
          </h1>
        </div>
        
        {/* Right Side: Progress & Mobile Drawer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: progressPercent === 100 ? 'var(--brand-green)' : 'var(--brand-blue)', fontWeight: 600 }}>
              {completedCount}/{totalLessons} ({progressPercent}%)
            </span>
            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }} className="hidden-mobile">
              <div 
                style={{ 
                  height: '100%', 
                  width: `${progressPercent}%`, 
                  background: progressPercent === 100 ? 'var(--brand-green)' : 'var(--brand-blue)', 
                  transition: 'width 0.5s ease' 
                }} 
              />
            </div>
          </div>

          {/* Mobile Curriculum Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="show-mobile btn btn-secondary"
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem' 
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Programme
          </button>
        </div>
      </header>

      {/* Main Theater Body */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* Main Content Area (Video & Lesson description) */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {children}
        </main>

        {/* Desktop Curriculum Sidebar */}
        <aside 
          className="hidden-mobile"
          style={{ 
            width: '350px', 
            flexShrink: 0, 
            borderLeft: '1px solid var(--border)', 
            background: 'var(--surface)', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 135px)',
            position: 'sticky',
            top: '60px'
          }} 
        >
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white', margin: 0 }}>Contenu du cours</h2>
          </div>
          
          <CurriculumSidebar 
            courseId={courseId} 
            chapters={chapters} 
            completedLessonIds={completedLessonIds} 
          />
        </aside>

      </div>

      {/* Mobile Drawer Backdrop & Slide-over */}
      {isMobileDrawerOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100, 
            background: 'rgba(0,0,0,0.7)', 
            backdropFilter: 'blur(5px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            style={{ 
              background: '#161618', 
              borderTopLeftRadius: '1.25rem', 
              borderTopRightRadius: '1.25rem', 
              border: '1px solid var(--border)', 
              maxHeight: '80vh', 
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', margin: 0 }}>Programme du cours</h2>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)} 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              >
                Fermer
              </button>
            </div>

            <CurriculumSidebar 
              courseId={courseId} 
              chapters={chapters} 
              completedLessonIds={completedLessonIds} 
              onSelectLesson={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

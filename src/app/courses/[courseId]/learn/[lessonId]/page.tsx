import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { VideoPlayer } from "@/components/VideoPlayer";
import { resolveVideoSrc } from "@/lib/videoStorage";
import { revalidatePath } from "next/cache";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?callbackUrl=/courses/${courseId}/learn/${lessonId}`);
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect(`/login?callbackUrl=/courses/${courseId}/learn/${lessonId}`);
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: true
    }
  });

  // La leçon doit exister ET appartenir à ce cours
  if (!lesson || lesson.chapter.courseId !== courseId) {
    notFound();
  }

  // 🔒 Contrôle d'accès : inscrit, leçon gratuite, formateur du cours ou admin
  const [dbUser, enrollment, courseOwner] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    }),
    prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } }),
  ]);

  const hasAccess =
    !!enrollment ||
    lesson.isFree ||
    dbUser?.role === "ADMIN" ||
    courseOwner?.instructorId === userId;

  if (!hasAccess) {
    redirect(`/courses/${courseId}/enroll`);
  }

  // Check if completed
  const userProgress = await prisma.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId
      }
    }
  });

  const isCompleted = userProgress?.isCompleted || false;

  // Server Action to mark complete
  async function toggleProgress() {
    "use server";

    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: userId as string,
          lessonId
        }
      }
    });

    if (existingProgress) {
      await prisma.userProgress.update({
        where: { id: existingProgress.id },
        data: { isCompleted: !existingProgress.isCompleted }
      });
    } else {
      await prisma.userProgress.create({
        data: {
          userId: userId as string,
          lessonId,
          isCompleted: true
        }
      });
    }

    revalidatePath(`/courses/${courseId}/learn`);
    revalidatePath(`/dashboard`);
  }

  // Find all lessons in order to determine prev/next
  const courseWithLessons = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
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

  const allLessons = courseWithLessons?.chapters.flatMap(ch => ch.lessons) || [];
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const nextLesson = currentIndex !== -1 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;

  // Lien de lecture : temporaire pour les vidéos privées, direct pour les anciennes
  const resolvedSrc = await resolveVideoSrc(lesson.videoUrl);
  const videoUrl = resolvedSrc || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* Video Area */}
      <div style={{ padding: '1.5rem', flexShrink: 0, background: '#050505', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <VideoPlayer
            url={videoUrl}
            user={{
              name: session.user.name,
              email: session.user.email,
              phone: (session.user as { phone?: string }).phone || "0555000000"
            }}
          />
        </div>
      </div>

      {/* Lesson Details Area */}
      <div style={{ padding: '2rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>

          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Chapitre: {lesson.chapter.title}
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
              {lesson.title}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <form action={toggleProgress}>
              <button
                type="submit"
                className={`btn ${isCompleted ? 'btn-outline' : 'btn-primary'}`}
                style={{
                  background: isCompleted ? 'rgba(52, 211, 153, 0.1)' : 'var(--brand-green)',
                  color: isCompleted ? '#34d399' : 'white',
                  borderColor: isCompleted ? 'rgba(52, 211, 153, 0.3)' : 'var(--brand-green)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.9rem'
                }}
              >
                {isCompleted ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Complété
                  </>
                ) : (
                  <>Marquer comme terminé</>
                )}
              </button>
            </form>

            {nextLesson && (
              <a
                href={`/courses/${courseId}/learn/${nextLesson.id}`}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
              >
                Leçon suivante
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            )}
          </div>

        </div>

        {/* Lesson Description */}
        {lesson.description ? (
          <div style={{ color: '#d1d5db', lineHeight: 1.7, fontSize: '1.05rem', whiteSpace: 'pre-wrap', background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            {lesson.description}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px dashed var(--border)' }}>
            Aucune description additionnelle pour cette leçon. Regardez la vidéo ci-dessus pour suivre le cours.
          </div>
        )}

        {/* Prev / Next Bottom Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          {prevLesson ? (
            <a
              href={`/courses/${courseId}/learn/${prevLesson.id}`}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Précédent: {prevLesson.title}
            </a>
          ) : <div />}

          {nextLesson && (
            <a
              href={`/courses/${courseId}/learn/${nextLesson.id}`}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              Suivant: {nextLesson.title}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
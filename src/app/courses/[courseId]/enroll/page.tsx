import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EnrollmentForm } from "@/components/EnrollmentForm";

export default async function CourseEnrollPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?callbackUrl=/courses/${courseId}/enroll`);
  }

  const userId = (session.user as any).id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
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
    }
  });

  if (!course || !course.isPublished) {
    notFound();
  }

  // If already enrolled, send straight to classroom
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      }
    }
  });

  if (existingEnrollment) {
    redirect(`/courses/${courseId}/learn`);
  }

  const isFree = !course.price || course.price === 0;
  const totalLessons = course.chapters.reduce((sum, ch) => sum + ch._count.lessons, 0);

    // Inscription gratuite : tout est revérifié côté serveur
  async function handleEnrollFree() {
    "use server";

    const currentSession = await getServerSession(authOptions);
    const currentUserId = (currentSession?.user as { id?: string } | undefined)?.id;
    if (!currentUserId) {
      redirect(`/login?callbackUrl=/courses/${courseId}/enroll`);
    }

    const freshCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { price: true, isPublished: true },
    });

    if (!freshCourse || !freshCourse.isPublished) {
      throw new Error("Cours introuvable.");
    }
    if (freshCourse.price && freshCourse.price > 0) {
      throw new Error("Ce cours n'est pas gratuit.");
    }

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: currentUserId, courseId } },
      update: {},
      create: { userId: currentUserId, courseId },
    });

    redirect(`/courses/${courseId}/learn`);
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', maxWidth: '1100px' }}>
      
      {/* Breadcrumb / Back Link */}
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href={`/courses/${course.id}`} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Retour à la présentation du cours
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Order Summary */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            Récapitulatif de l'inscription
          </h2>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '90px', height: '60px', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.3)' }}>
              {course.imageUrl ? (
                <Image src={course.imageUrl} alt={course.title} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                  Cours
                </div>
              )}
            </div>

            <div>
              {course.category && (
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {course.category.name}
                </span>
              )}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: '0.1rem 0' }}>
                {course.title}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Par {course.instructor.name} • {totalLessons} leçons
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Accès</span>
              <span style={{ color: 'white', fontWeight: 500 }}>Illimité à vie</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Certificat de réussite</span>
              <span style={{ color: 'white', fontWeight: 500 }}>Inclus à 100%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Protection vidéo</span>
              <span style={{ color: 'white', fontWeight: 500 }}>Filigrane dynamique</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.25rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>Total</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: isFree ? '#34d399' : 'white' }}>
              {isFree ? "Gratuit" : `${course.price?.toLocaleString("fr-DZ")} DZD`}
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Chargily Checkout Form */}
        <div>
          <EnrollmentForm
            courseId={course.id}
            courseTitle={course.title}
            price={course.price}
            isFree={isFree}
            onEnrollFree={handleEnrollFree}
          />
        </div>

      </div>
    </div>
  );
}

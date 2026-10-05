import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function EnrollmentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ checkout_id?: string; simulated?: string }>;
}) {
  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?callbackUrl=/courses/${courseId}/learn`);
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
            select: { lessons: true },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Ensure enrollment is activated in database
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {},
    create: {
      userId,
      courseId,
    },
  });

  const totalLessons = course.chapters.reduce((sum, ch) => sum + ch._count.lessons, 0);

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 8rem 1.5rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div 
        className="glass animate-fade-up" 
        style={{ 
          padding: '3rem 2rem', 
          borderRadius: '1.5rem', 
          border: '1px solid rgba(52, 211, 153, 0.3)', 
          background: 'linear-gradient(180deg, rgba(52, 211, 153, 0.06) 0%, rgba(18, 18, 20, 0.95) 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}
      >
        {/* Animated Checkmark Circle */}
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'rgba(52, 211, 153, 0.15)', 
            color: '#34d399', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem auto',
            border: '2px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 0 30px rgba(52, 211, 153, 0.25)'
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Paiement Confirmé
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          Bienvenue dans votre formation !
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 2.5rem auto' }}>
          Votre paiement a été validé avec succès par <strong>Chargily Pay</strong>. Votre accès illimité et sécurisé est activé.
        </p>

        {/* Course Summary Card */}
        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            borderRadius: '1rem', 
            border: '1px solid var(--border)', 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.25rem', 
            textAlign: 'left',
            marginBottom: '2.5rem'
          }}
        >
          <div style={{ position: 'relative', width: '100px', height: '65px', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.4)' }}>
            {course.imageUrl ? (
              <Image src={course.imageUrl} alt={course.title} fill style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                Cours
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {course.category && (
              <span style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', fontWeight: 600, textTransform: 'uppercase' }}>
                {course.category.name}
              </span>
            )}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: '0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {course.title}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Instructeur: {course.instructor.name} • {totalLessons} leçons
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link 
            href={`/courses/${course.id}/learn`}
            className="btn btn-primary"
            style={{ 
              padding: '1.1rem 2rem', 
              fontSize: '1.1rem', 
              fontWeight: 700,
              background: 'var(--gradient-blue)',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            Accéder à ma formation maintenant →
          </Link>

          <Link 
            href="/dashboard"
            className="btn btn-secondary"
            style={{ padding: '0.85rem', fontSize: '0.95rem' }}
          >
            Voir mon tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}

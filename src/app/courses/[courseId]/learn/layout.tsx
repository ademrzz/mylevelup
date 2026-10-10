import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { LearnTheaterView } from "@/components/LearnTheaterView";

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  // Pas connecté : on laisse la page de la leçon rediriger vers /login,
  // car elle sait revenir directement sur la bonne leçon après la connexion.
  if (!session?.user) {
    return <>{children}</>;
  }

  const userId = (session.user as any).id;
  const courseId = resolvedParams.courseId;

  const [enrollment, dbUser, course] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
            },
          },
        },
      },
    }),
  ]);

  if (!course) {
    notFound();
  }

  // Accès complet : inscrit, formateur du cours ou admin
  const hasFullAccess =
    !!enrollment || dbUser?.role === "ADMIN" || course.instructorId === userId;

  if (!hasFullAccess) {
    // Un non-inscrit n'entre que pour voir les aperçus gratuits d'un cours publié.
    const hasFreeLesson = course.chapters.some((ch) => ch.lessons.some((l) => l.isFree));
    if (!course.isPublished || !hasFreeLesson) {
      redirect(`/courses/${courseId}`);
    }
  }

  // 🔒 Le panneau latéral est un composant « client » : tout ce qu'on lui passe est
  // visible dans le navigateur. On retire donc les liens vidéo et descriptions
  // (le lecteur les récupère côté serveur, uniquement si l'accès est autorisé).
  const safeChapters = course.chapters.map((ch) => ({
    ...ch,
    lessons: ch.lessons.map((l) => ({ ...l, videoUrl: null, description: null })),
  }));

  // Progression de l'utilisateur pour ce cours
  const progressRecords = await prisma.userProgress.findMany({
    where: {
      userId,
      lesson: {
        chapter: {
          courseId,
        },
      },
    },
  });

  const completedLessonIds = progressRecords.filter((p) => p.isCompleted).map((p) => p.lessonId);

  return (
    <LearnTheaterView
      courseId={course.id}
      courseTitle={course.title}
      chapters={safeChapters}
      completedLessonIds={completedLessonIds}
      hasFullAccess={hasFullAccess}
    >
      {children}
    </LearnTheaterView>
  );
}
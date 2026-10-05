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

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const courseId = resolvedParams.courseId;

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      }
    }
  });

  if (!enrollment) {
    redirect(`/courses/${courseId}`); // Kick them back to course marketing page if not enrolled
  }

  // Fetch course and curriculum
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // Fetch user progress for this course
  const progressRecords = await prisma.userProgress.findMany({
    where: {
      userId,
      lesson: {
        chapter: {
          courseId
        }
      }
    }
  });

  const completedLessonIds = progressRecords.filter(p => p.isCompleted).map(p => p.lessonId);

  return (
    <LearnTheaterView
      courseId={course.id}
      courseTitle={course.title}
      chapters={course.chapters}
      completedLessonIds={completedLessonIds}
    >
      {children}
    </LearnTheaterView>
  );
}

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function LearnRootPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = await params;
  
  // Find the first lesson of the course
  const course = await prisma.course.findUnique({
    where: { id: resolvedParams.courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            take: 1
          }
        },
        take: 1
      }
    }
  });

  if (!course || course.chapters.length === 0 || course.chapters[0].lessons.length === 0) {
    return (
      <div style={{ padding: '2rem', color: 'white' }}>
        <h2>Aucune leçon disponible</h2>
        <p>Ce cours n'a pas encore de contenu.</p>
      </div>
    );
  }

  const firstLessonId = course.chapters[0].lessons[0].id;
  
  // Redirect to the first lesson automatically
  redirect(`/courses/${course.id}/learn/${firstLessonId}`);
}

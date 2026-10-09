import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/mailer";

/**
 * Notifications d'événements de la plateforme.
 *
 * Règle d'or : un email qui échoue ne doit JAMAIS faire échouer l'action
 * métier (approbation d'un cours, validation d'un compte, etc.).
 * Toutes les fonctions ci-dessous attrapent donc leurs erreurs.
 */
async function safe(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (err) {
    console.error(`[NOTIF] ${label} :`, err instanceof Error ? err.message : "erreur inconnue");
  }
}

/* ----------------------------- Compte étudiant ---------------------------- */

export const notifyWelcome = (email: string, name?: string | null) =>
  safe("welcome", () =>
    sendNotificationEmail({
      to: email,
      subject: "Bienvenue sur Level Up DZ 🎉",
      title: `Bienvenue${name ? `, ${name}` : ""} !`,
      intro:
        "Votre adresse e-mail est confirmée et votre compte est actif. Vous pouvez dès maintenant parcourir le catalogue et commencer à apprendre.",
      cta: { label: "Découvrir les formations", path: "/courses" },
    })
  );

/* ------------------------------- Formateurs ------------------------------- */

export const notifyCourseApproved = (courseId: string) =>
  safe("course-approved", async () => {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, instructor: { select: { email: true, name: true } } },
    });
    if (!course?.instructor?.email) return;

    await sendNotificationEmail({
      to: course.instructor.email,
      subject: `Votre formation « ${course.title} » est en ligne`,
      title: "Formation approuvée ✅",
      color: "#34d399",
      intro: `Bonne nouvelle${course.instructor.name ? `, ${course.instructor.name}` : ""} : votre formation a été validée par notre équipe et est maintenant visible dans le catalogue.`,
      details: [`Formation : ${course.title}`],
      cta: { label: "Voir ma formation", path: `/courses/${courseId}` },
    });
  });

export const notifyCourseRejected = (courseId: string) =>
  safe("course-rejected", async () => {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        title: true,
        rejectionReason: true,
        instructor: { select: { email: true, name: true } },
      },
    });
    if (!course?.instructor?.email) return;

    await sendNotificationEmail({
      to: course.instructor.email,
      subject: `Votre formation « ${course.title} » nécessite des modifications`,
      title: "Formation non validée",
      color: "#ef4444",
      intro:
        "Notre équipe a examiné votre formation et ne peut pas la publier en l'état. Vous pouvez la corriger puis la soumettre de nouveau.",
      details: [
        `Formation : ${course.title}`,
        `Motif : ${course.rejectionReason || "Non précisé"}`,
      ],
      cta: { label: "Modifier ma formation", path: `/instructor/courses/${courseId}` },
    });
  });

export const notifyInstructorApplicationApproved = (userId: string) =>
  safe("instructor-approved", async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;

    await sendNotificationEmail({
      to: user.email,
      subject: "Votre candidature formateur est acceptée 🎓",
      title: "Vous êtes formateur !",
      color: "#34d399",
      intro: `Félicitations${user.name ? ` ${user.name}` : ""} ! Votre candidature a été validée. Vous pouvez dès maintenant créer votre première formation depuis votre espace formateur.`,
      cta: { label: "Ouvrir mon espace formateur", path: "/instructor" },
    });
  });

export const notifyInstructorApplicationRejected = (applicationId: string) =>
  safe("instructor-rejected", async () => {
    const app = await prisma.instructorApplication.findUnique({
      where: { id: applicationId },
      select: { rejectionReason: true, user: { select: { email: true, name: true } } },
    });
    if (!app?.user?.email) return;

    await sendNotificationEmail({
      to: app.user.email,
      subject: "Votre candidature formateur",
      title: "Candidature non retenue",
      color: "#ef4444",
      intro:
        "Après examen, nous ne pouvons pas valider votre candidature pour le moment. Vous pouvez la compléter et la soumettre de nouveau.",
      details: [`Motif : ${app.rejectionReason || "Non précisé"}`],
      cta: { label: "Mettre à jour ma candidature", path: "/dashboard/profile" },
    });
  });
  /* ----------------------------- Alertes pour l'admin ----------------------------- */

/** Prévient tous les admins qu'un formateur vient de soumettre un cours à valider. */
export const notifyAdminsCourseSubmitted = (courseId: string) =>
  safe("admin-course-submitted", async () => {
    const [course, admins] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, instructor: { select: { name: true, email: true } } },
      }),
      prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true },
      }),
    ]);
    if (!course) return;

    const instructorName = course.instructor?.name || course.instructor?.email || "Un formateur";

    for (const admin of admins) {
      if (!admin.email) continue;
      await sendNotificationEmail({
        to: admin.email,
        subject: `Nouvelle formation à valider : « ${course.title} »`,
        title: "Formation à valider 📚",
        intro: `${instructorName} vient de soumettre une formation. Elle attend votre validation avant d'être visible dans le catalogue.`,
        details: [`Formation : ${course.title}`, `Formateur : ${instructorName}`],
        cta: { label: "Examiner la formation", path: "/admin/courses" },
      });
    }
  });
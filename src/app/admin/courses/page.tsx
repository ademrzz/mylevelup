import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminCoursesTable, AdminCourseItem } from "@/components/AdminCoursesTable";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      instructor: true,
      category: true,
      chapters: {
        include: {
          lessons: { select: { id: true } },
        },
      },
      enrollments: {
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = courses.filter((c) => c.status === "PENDING").length;
  const publishedCount = courses.filter((c) => c.isPublished).length;
  const rejectedCount = courses.filter((c) => c.status === "REJECTED").length;

  // Serialize courses for client component
  const serializedCourses: AdminCourseItem[] = courses.map((c) => {
    const totalLessons = c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
    const subscribersList = c.enrollments.map((en) => ({
      id: en.user.id,
      name: en.user.name,
      email: en.user.email,
      phone: en.user.phone,
      wilaya: en.user.wilaya,
      enrolledAt: en.createdAt.toISOString(),
    }));

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      imageUrl: c.imageUrl,
      price: c.price,
      isPublished: c.isPublished,
      status: c.status,
      rejectionReason: c.rejectionReason,
      createdAt: c.createdAt.toISOString(),
      instructor: {
        id: c.instructor.id,
        name: c.instructor.name,
        email: c.instructor.email,
      },
      category: c.category
        ? {
            id: c.category.id,
            name: c.category.name,
          }
        : null,
      chaptersCount: c.chapters.length,
      lessonsCount: totalLessons,
      enrollments: subscribersList,
    };
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <Link href="/admin" style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Retour au tableau de bord</span>
            </Link>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
            Modération du Catalogue de Cours ({courses.length})
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Supervisez tous les cours créés par les formateurs, examinez les demandes de validation, supprimez les formations individuellement ou en lot.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: pendingCount > 0 ? "1px solid rgba(254,145,0,0.4)" : "1px solid var(--border)", background: pendingCount > 0 ? "rgba(254,145,0,0.06)" : undefined }}>
          <div style={{ color: "var(--brand-orange)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>En attente de validation</span>
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: pendingCount > 0 ? "var(--brand-orange)" : "white" }}>
            {pendingCount}
          </div>
        </div>

        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ color: "#34d399", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }}></span>
            <span>Formations en ligne</span>
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "white" }}>
            {publishedCount}
          </div>
        </div>

        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Formations refusées</span>
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "white" }}>
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* Pending Banner Alert if pending courses exist */}
      {pendingCount > 0 && (
        <div
          style={{
            background: "rgba(254,145,0,0.12)",
            border: "1px solid rgba(254,145,0,0.35)",
            borderRadius: "0.85rem",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{ fontSize: "0.9rem", color: "#fcd34d" }}>
            <strong>{pendingCount} cours</strong> sont actuellement en attente de modération. Vous pouvez approuver et publier ou rejeter avec des remarques détaillées.
          </div>
        </div>
      )}

      {/* Interactive Courses Moderation Table */}
      <AdminCoursesTable initialCourses={serializedCourses} />
    </div>
  );
}

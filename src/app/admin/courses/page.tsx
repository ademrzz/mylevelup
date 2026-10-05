import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { CourseSubscribersModal } from "@/components/CourseSubscribersModal";
import { AdminCourseModerationActions } from "@/components/AdminCourseModerationActions";

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

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <Link href="/admin" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              ← Retour au tableau de bord
            </Link>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
            Modération du Catalogue de Cours ({courses.length})
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Supervisez tous les cours créés par les formateurs, examinez les demandes de publication et inspectez la liste des étudiants inscrits.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: pendingCount > 0 ? "1px solid rgba(254,145,0,0.4)" : "1px solid var(--border)", background: pendingCount > 0 ? "rgba(254,145,0,0.06)" : undefined }}>
          <div style={{ color: "var(--brand-orange)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            ⏳ En attente de validation
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: pendingCount > 0 ? "var(--brand-orange)" : "white" }}>
            {pendingCount}
          </div>
        </div>

        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ color: "#34d399", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            ● Formations en ligne
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "white" }}>
            {publishedCount}
          </div>
        </div>

        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            ✕ Formations refusées
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
          <span style={{ fontSize: "1.3rem" }}>⚠️</span>
          <div style={{ fontSize: "0.9rem", color: "#fcd34d" }}>
            <strong>{pendingCount} cours</strong> sont actuellement en attente de modération. Vous pouvez approuver et publier ou rejeter avec des remarques détaillées.
          </div>
        </div>
      )}

      {/* Courses Moderation Table */}
      <div className="glass" style={{ borderRadius: "1.25rem", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "1150px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Formation</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Formateur</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Tarif</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Contenu</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600, minWidth: "130px", whiteSpace: "nowrap" }}>Inscrits</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600, minWidth: "175px", whiteSpace: "nowrap" }}>Statut</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600, textAlign: "right", minWidth: "220px", whiteSpace: "nowrap" }}>Modération</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => {
                const totalLessons = c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
                const isPending = c.status === "PENDING";
                const isRejected = c.status === "REJECTED";

                const subscribersList = c.enrollments.map((en) => ({
                  id: en.user.id,
                  name: en.user.name,
                  email: en.user.email,
                  phone: en.user.phone,
                  wilaya: en.user.wilaya,
                  enrolledAt: en.createdAt.toISOString(),
                }));

                return (
                  <tr 
                    key={c.id}
                    style={{ 
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: isPending ? "rgba(254,145,0,0.03)" : undefined,
                    }}
                  >
                    {/* Course cover & title */}
                    <td style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ position: "relative", width: "70px", height: "45px", borderRadius: "0.4rem", overflow: "hidden", flexShrink: 0, background: "#000" }}>
                          {c.imageUrl ? (
                            <Image src={c.imageUrl} alt={c.title} fill style={{ objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.7rem" }}>
                              Cours
                            </div>
                          )}
                        </div>
                        <div>
                          <Link 
                            href={`/courses/${c.id}`} 
                            target="_blank"
                            style={{ fontWeight: 600, color: "white", textDecoration: "none" }}
                            className="hover:underline"
                          >
                            {c.title} ↗
                          </Link>
                          <div style={{ fontSize: "0.78rem", color: "var(--brand-blue)" }}>
                            {c.category?.name || "Sans catégorie"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Instructor info */}
                    <td style={{ padding: "1.25rem" }}>
                      <div style={{ fontWeight: 600, color: "#e5e7eb", fontSize: "0.85rem" }}>
                        {c.instructor.name || "Inconnu"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {c.instructor.email}
                      </div>
                    </td>

                    {/* Price */}
                    <td style={{ padding: "1.25rem" }}>
                      <span style={{ fontWeight: 700, color: c.price ? "white" : "#34d399", fontSize: "0.88rem" }}>
                        {c.price ? `${c.price.toLocaleString("fr-DZ")} DZD` : "Gratuit"}
                      </span>
                    </td>

                    {/* Content breakdown */}
                    <td style={{ padding: "1.25rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {c.chapters.length} chapitres • {totalLessons} leçons
                    </td>

                    {/* Enrollments with Modal */}
                    <td style={{ padding: "1.25rem", whiteSpace: "nowrap" }}>
                      <CourseSubscribersModal 
                        courseTitle={c.title} 
                        subscribers={subscribersList} 
                      />
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "1.25rem" }}>
                      {c.isPublished ? (
                        <span 
                          style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: 700, 
                            padding: "0.25rem 0.65rem", 
                            borderRadius: "9999px",
                            background: "rgba(52,211,153,0.15)",
                            color: "#34d399",
                            border: "1px solid rgba(52,211,153,0.3)",
                            display: "inline-block",
                          }}
                        >
                          ● En ligne
                        </span>
                      ) : isPending ? (
                        <span 
                          style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: 700, 
                            padding: "0.25rem 0.65rem", 
                            borderRadius: "9999px",
                            background: "rgba(254,145,0,0.18)",
                            color: "var(--brand-orange)",
                            border: "1px solid rgba(254,145,0,0.4)",
                            display: "inline-block",
                          }}
                        >
                          ⏳ En attente validation
                        </span>
                      ) : isRejected ? (
                        <div>
                          <span 
                            style={{ 
                              fontSize: "0.75rem", 
                              fontWeight: 700, 
                              padding: "0.25rem 0.65rem", 
                              borderRadius: "9999px",
                              background: "rgba(239,68,68,0.15)",
                              color: "#ef4444",
                              border: "1px solid rgba(239,68,68,0.3)",
                              display: "inline-block",
                            }}
                          >
                            ✕ Refusé
                          </span>
                          {c.rejectionReason && (
                            <div style={{ fontSize: "0.75rem", color: "#fca5a5", marginTop: "0.3rem", maxWidth: "200px", lineHeight: 1.2 }}>
                              « {c.rejectionReason} »
                            </div>
                          )}
                        </div>
                      ) : (
                        <span 
                          style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: 700, 
                            padding: "0.25rem 0.65rem", 
                            borderRadius: "9999px",
                            background: "rgba(255,255,255,0.08)",
                            color: "var(--text-muted)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            display: "inline-block",
                          }}
                        >
                          ○ Brouillon
                        </span>
                      )}
                    </td>

                    {/* Moderation Actions */}
                    <td style={{ padding: "1.25rem", textAlign: "right" }}>
                      <AdminCourseModerationActions
                        courseId={c.id}
                        courseTitle={c.title}
                        isPublished={c.isPublished}
                        status={c.status}
                        rejectionReason={c.rejectionReason}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

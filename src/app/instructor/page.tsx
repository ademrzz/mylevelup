import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { InstructorCourseDeleteButton } from "@/components/InstructorCourseDeleteButton";

export default async function InstructorDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const courses = await prisma.course.findMany({
    where: { instructorId: userId },
    include: {
      category: true,
      chapters: {
        include: {
          lessons: true,
        },
      },
      enrollments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate statistics
  let totalStudents = 0;
  let publishedCount = 0;

  courses.forEach((c) => {
    const enrollmentsCount = c.enrollments.length;
    totalStudents += enrollmentsCount;
    if (c.isPublished) publishedCount++;
  });

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
            Tableau de Bord Enseignant
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
            Bienvenue, <strong>{session?.user?.name}</strong>. Gérez vos cours, vos leçons et suivez vos performances d'apprentissage.
          </p>
        </div>

        <Link 
          href="/instructor/courses/new" 
          className="btn btn-primary"
          style={{ 
            padding: "0.85rem 1.75rem", 
            fontSize: "1rem", 
            background: "var(--gradient-orange)",
            boxShadow: "0 6px 20px rgba(254,145,0,0.3)"
          }}
        >
          + Créer un nouveau cours
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3.5rem" }}>
        {/* Stat 1: Total Students */}
        <div className="glass" style={{ padding: "1.75rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Étudiants Inscrits
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,160,220,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-blue)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "white" }}>
            {totalStudents}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sur l'ensemble de vos formations</span>
        </div>

        {/* Stat 2: Total Enrollments / Sales */}
        <div className="glass" style={{ padding: "1.75rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Ventes Réalisées
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#34d399" }}>
            {totalStudents} <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-muted)" }}>ventes</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Inscriptions confirmées par vos élèves</span>
        </div>

        {/* Stat 3: Total Published Courses */}
        <div className="glass" style={{ padding: "1.75rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Formations Créées
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(254,145,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-orange)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "white" }}>
            {courses.length}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {publishedCount} en ligne • {courses.length - publishedCount} brouillon(s)
          </span>
        </div>
      </div>

      {/* Courses List Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "white", margin: 0 }}>
            Mes Cours ({courses.length})
          </h2>
        </div>

        {courses.length === 0 ? (
          <div className="glass" style={{ padding: "3.5rem 2rem", borderRadius: "1rem", textAlign: "center", border: "1px dashed var(--border)" }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem auto", color: "var(--text-muted)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              Vous n'avez pas encore créé de cours
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "420px", margin: "0 auto 1.5rem auto" }}>
              Partagez votre expertise avec des milliers d'étudiants en créant votre première formation dès aujourd'hui.
            </p>
            <Link href="/instructor/courses/new" className="btn btn-primary" style={{ background: "var(--gradient-orange)" }}>
              Créer mon premier cours
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {courses.map((course) => {
              const totalLessons = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

              return (
                <div 
                  key={course.id}
                  className="glass"
                  style={{ 
                    padding: "1.25rem 1.5rem", 
                    borderRadius: "1rem", 
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1.25rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                    <div style={{ position: "relative", width: "100px", height: "65px", borderRadius: "0.5rem", overflow: "hidden", flexShrink: 0, background: "rgba(0,0,0,0.4)" }}>
                      {course.imageUrl ? (
                        <Image src={course.imageUrl} alt={course.title} fill style={{ objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
                          Cours
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                        {course.category && (
                          <span style={{ fontSize: "0.75rem", color: "var(--brand-blue)", fontWeight: 600, textTransform: "uppercase" }}>
                            {course.category.name}
                          </span>
                        )}
                        <span 
                          style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: 700, 
                            padding: "0.15rem 0.5rem", 
                            borderRadius: "9999px",
                            background: course.isPublished 
                              ? "rgba(52,211,153,0.15)" 
                              : course.status === "PENDING"
                              ? "rgba(254,145,0,0.18)"
                              : course.status === "REJECTED"
                              ? "rgba(239,68,68,0.15)"
                              : "rgba(255,255,255,0.1)",
                            color: course.isPublished 
                              ? "#34d399" 
                              : course.status === "PENDING"
                              ? "var(--brand-orange)"
                              : course.status === "REJECTED"
                              ? "#ef4444"
                              : "var(--text-muted)",
                            border: `1px solid ${
                              course.isPublished 
                                ? "rgba(52,211,153,0.3)" 
                                : course.status === "PENDING"
                                ? "rgba(254,145,0,0.4)"
                                : course.status === "REJECTED"
                                ? "rgba(239,68,68,0.3)"
                                : "rgba(255,255,255,0.15)"
                            }`
                          }}
                        >
                          {course.isPublished ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#34d399" }}></span>
                              En ligne
                            </span>
                          ) : course.status === "PENDING" ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                              En attente validation
                            </span>
                          ) : course.status === "REJECTED" ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              Refusé
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--text-muted)" }}></span>
                              Brouillon
                            </span>
                          )}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", margin: "0.1rem 0" }}>
                        {course.title}
                      </h3>

                      {course.status === "REJECTED" && course.rejectionReason && (
                        <div style={{ fontSize: "0.78rem", color: "#fca5a5", marginTop: "0.2rem", background: "rgba(239,68,68,0.1)", padding: "0.25rem 0.5rem", borderRadius: "0.35rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                          <span>Motif du refus : {course.rejectionReason}</span>
                        </div>
                      )}

                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.3rem" }}>
                        <span>Prix: <strong style={{ color: "white" }}>{course.price ? `${course.price.toLocaleString("fr-DZ")} DZD` : "Gratuit"}</strong></span>
                        <span>•</span>
                        <span>{course.chapters.length} chapitres ({totalLessons} leçons)</span>
                        <span>•</span>
                        <span><strong style={{ color: "var(--brand-blue)" }}>{course.enrollments.length}</strong> étudiant(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    <Link 
                      href={`/courses/${course.id}`} 
                      className="btn btn-outline"
                      style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem" }}
                      target="_blank"
                    >
                      Aperçu public ↗
                    </Link>

                    <Link 
                      href={`/instructor/courses/${course.id}`} 
                      className="btn btn-primary"
                      style={{ 
                        fontSize: "0.82rem", 
                        padding: "0.45rem 1.1rem",
                        background: "var(--gradient-orange)"
                      }}
                    >
                      Gérer le cours →
                    </Link>

                    <InstructorCourseDeleteButton
                      courseId={course.id}
                      courseTitle={course.title}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

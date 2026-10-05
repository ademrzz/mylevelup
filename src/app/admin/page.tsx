import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function AdminDashboardPage() {
  // Fetch all required data in parallel
  const [
    users,
    courses,
    enrollments,
    applicationsPendingCount,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      include: {
        instructor: true,
        category: true,
        enrollments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      include: {
        course: {
          include: { instructor: true },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.instructorApplication.count({
      where: { status: "PENDING" },
    }),
  ]);

  const pendingApplicationsCount = applicationsPendingCount;

  // Statistics calculation
  const totalStudents = users.filter((u) => u.role === "STUDENT").length;
  const totalInstructors = users.filter((u) => u.role === "INSTRUCTOR").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;

  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const pendingCourses = courses.filter((c) => c.status === "PENDING").length;
  const draftCourses = courses.length - publishedCourses;

  // Calculate gross sales (GMV)
  let totalGrossVolume = 0;
  courses.forEach((c) => {
    const enrolls = c.enrollments.length;
    const price = c.price || 0;
    totalGrossVolume += enrolls * price;
  });

  // Commission split: 20% platform commission, 80% instructor net
  const platformCommissionRate = 0.20;
  const platformRevenue = totalGrossVolume * platformCommissionRate;
  const instructorsPayout = totalGrossVolume * (1 - platformCommissionRate);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
          Tableau de Bord Administrateur
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
          Supervision globale de Level Up DZ : transactions financières, commissions, modération des cours et comptes utilisateurs.
        </p>
      </div>

      {/* Admin Action Alerts */}
      {(pendingApplicationsCount > 0 || pendingCourses > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
          {pendingApplicationsCount > 0 && (
            <div
              style={{
                background: "rgba(254,145,0,0.12)",
                border: "1px solid rgba(254,145,0,0.35)",
                borderRadius: "0.85rem",
                padding: "1rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.3rem" }}>🎓</span>
                <span style={{ color: "#fcd34d", fontSize: "0.92rem", fontWeight: 600 }}>
                  {pendingApplicationsCount} candidature(s) de formateur en attente de validation
                </span>
              </div>
              <Link
                href="/admin/users"
                className="btn btn-primary"
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", background: "var(--brand-orange)" }}
              >
                Examiner les candidatures →
              </Link>
            </div>
          )}

          {pendingCourses > 0 && (
            <div
              style={{
                background: "rgba(0,160,220,0.12)",
                border: "1px solid rgba(0,160,220,0.35)",
                borderRadius: "0.85rem",
                padding: "1rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.3rem" }}>📚</span>
                <span style={{ color: "#7dd3fc", fontSize: "0.92rem", fontWeight: 600 }}>
                  {pendingCourses} cours soumis en attente de modération pédagogique
                </span>
              </div>
              <Link
                href="/admin/courses"
                className="btn btn-primary"
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", background: "var(--brand-blue)" }}
              >
                Examiner les cours →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Financial Overview Grid (3 Cards) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Card 1: Total Gross Sales */}
        <div 
          className="glass" 
          style={{ 
            padding: "1.75rem", 
            borderRadius: "1rem", 
            border: "1px solid rgba(52,211,153,0.3)",
            background: "linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(0,0,0,0.3) 100%)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Volume d'Affaires Brut (GMV)
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#34d399" }}>
            {totalGrossVolume.toLocaleString("fr-DZ")} <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>DZD</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Total des paiements EDAHABIA / CIB encaissés
          </span>
        </div>

        {/* Card 2: Platform Revenue (20% cut) */}
        <div 
          className="glass" 
          style={{ 
            padding: "1.75rem", 
            borderRadius: "1rem", 
            border: "1px solid rgba(168,85,247,0.3)",
            background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(0,0,0,0.3) 100%)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Commissions Plateforme (20%)
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(168,85,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#c084fc" }}>
            {platformRevenue.toLocaleString("fr-DZ")} <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>DZD</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Part nette conservée par Level Up DZ
          </span>
        </div>

        {/* Card 3: Instructors Net Share (80%) */}
        <div 
          className="glass" 
          style={{ 
            padding: "1.75rem", 
            borderRadius: "1rem", 
            border: "1px solid rgba(254,145,0,0.3)",
            background: "linear-gradient(135deg, rgba(254,145,0,0.06) 0%, rgba(0,0,0,0.3) 100%)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Part Enseignants (80%)
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(254,145,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-orange)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--brand-orange)" }}>
            {instructorsPayout.toLocaleString("fr-DZ")} <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>DZD</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Montant net dû aux formateurs et professeurs
          </span>
        </div>
      </div>

      {/* Operational Metrics Grid (3 Cards) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {/* Metric 1: Courses */}
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Formations Totales
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", margin: "0.4rem 0" }}>
            {courses.length}
          </div>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            <strong style={{ color: "#34d399" }}>{publishedCourses}</strong> en ligne • <strong style={{ color: "var(--text-muted)" }}>{draftCourses}</strong> brouillon(s)
          </span>
        </div>

        {/* Metric 2: Users Split */}
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Membres Inscrits
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", margin: "0.4rem 0" }}>
            {users.length}
          </div>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {totalStudents} étudiants • {totalInstructors} formateurs • {totalAdmins} admin(s)
          </span>
        </div>

        {/* Metric 3: Total Enrollments */}
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Inscriptions Effectuées
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", margin: "0.4rem 0" }}>
            {courses.reduce((sum, c) => sum + c.enrollments.length, 0)}
          </div>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Accès cours accordés aux apprenants
          </span>
        </div>
      </div>

      {/* Two Column Layout: Recent Enrollments & Quick Management */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
        {/* Recent Enrollments */}
        <div className="glass" style={{ padding: "1.75rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
              Dernières Inscriptions Enregistrées
            </h2>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              10 dernières
            </span>
          </div>

          {enrollments.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>
              Aucune inscription enregistrée pour l'instant.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {enrollments.map((e) => (
                <div 
                  key={e.id}
                  style={{ 
                    padding: "0.85rem 1rem", 
                    borderRadius: "0.75rem", 
                    background: "rgba(255,255,255,0.02)", 
                    border: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "white" }}>
                      {e.user.name || e.user.email}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {e.course.title}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: e.course.price ? "#34d399" : "var(--brand-blue)" }}>
                      {e.course.price ? `${e.course.price.toLocaleString("fr-DZ")} DZD` : "Gratuit"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {new Date(e.createdAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Management Shortlinks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass" style={{ padding: "1.75rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
              Outils d'Administration
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Link 
                href="/admin/users"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "1rem", 
                  borderRadius: "0.75rem", 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid var(--border)",
                  textDecoration: "none"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "white", fontSize: "0.95rem" }}>
                    👥 Gestion des Utilisateurs ({users.length})
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    Promouvoir un étudiant en formateur, nommer un administrateur.
                  </div>
                </div>
                <span style={{ color: "var(--brand-orange)", fontSize: "1.2rem" }}>→</span>
              </Link>

              <Link 
                href="/admin/courses"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "1rem", 
                  borderRadius: "0.75rem", 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid var(--border)",
                  textDecoration: "none"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "white", fontSize: "0.95rem" }}>
                    📚 Modération du Catalogue ({courses.length})
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    Inspecter les cours, valider ou dépublier les contenus inadéquats.
                  </div>
                </div>
                <span style={{ color: "var(--brand-orange)", fontSize: "1.2rem" }}>→</span>
              </Link>

              <Link 
                href="/admin/finance"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "1rem", 
                  borderRadius: "0.75rem", 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid var(--border)",
                  textDecoration: "none"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "white", fontSize: "0.95rem" }}>
                    💰 Détail Financier & Commissions (20% / 80%)
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    Consulter les montants bruts, la retenue plateforme et les nets enseignants.
                  </div>
                </div>
                <span style={{ color: "var(--brand-orange)", fontSize: "1.2rem" }}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { AdminApplicationActions } from "@/components/AdminApplicationActions";
import { AdminUsersTable, AdminUserItem } from "@/components/AdminUsersTable";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const currentAdminId = (session?.user as any)?.id || "";

  const [users, applications] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            courses: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.instructorApplication.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const pendingApplications = applications.filter((a) => a.status === "PENDING");

  const serializedUsers: AdminUserItem[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    wilaya: u.wilaya,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    enrollmentsCount: u._count.enrollments,
    coursesCount: u._count.courses,
  }));

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <Link href="/admin" style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              <span>Retour au tableau de bord</span>
            </Link>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
            Gestion des Utilisateurs ({users.length})
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Consultez les membres inscrits, traitez les candidatures de formateurs et gérez les privilèges.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: pendingApplications.length > 0 ? "1px solid rgba(254,145,0,0.4)" : "1px solid var(--border)", background: pendingApplications.length > 0 ? "rgba(254,145,0,0.06)" : undefined }}>
          <div style={{ color: "var(--brand-orange)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>Candidatures Formateur en attente</span>
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: pendingApplications.length > 0 ? "var(--brand-orange)" : "white" }}>
            {pendingApplications.length}
          </div>
        </div>

        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--brand-blue)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
            <span>Formateurs Officiels</span>
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "white" }}>
            {users.filter((u) => u.role === "INSTRUCTOR").length}
          </div>
        </div>

        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ color: "#34d399", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            <span>Total Étudiants</span>
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "white" }}>
            {users.filter((u) => u.role === "STUDENT").length}
          </div>
        </div>
      </div>

      {/* Pending Applications Section */}
      {pendingApplications.length > 0 && (
        <div 
          className="glass" 
          style={{ 
            borderRadius: "1.25rem", 
            border: "1px solid rgba(254,145,0,0.4)", 
            background: "linear-gradient(135deg, rgba(254,145,0,0.04) 0%, rgba(0,0,0,0.3) 100%)",
            overflow: "hidden", 
            marginBottom: "2.5rem" 
          }}
        >
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(254,145,0,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", margin: 0 }}>
                Candidatures de Formateurs à Valider ({pendingApplications.length})
              </h2>
            </div>
            <span style={{ fontSize: "0.78rem", color: "var(--brand-orange)", background: "rgba(254,145,0,0.15)", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontWeight: 700 }}>
              Action requise
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Candidat</th>
                  <th style={{ padding: "0.75rem 0.85rem", fontWeight: 600 }}>Spécialité</th>
                  <th style={{ padding: "0.75rem 0.85rem", fontWeight: 600 }}>Contact & Wilaya</th>
                  <th style={{ padding: "0.75rem 0.85rem", fontWeight: 600 }}>Bio & Portfolio</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "right" }}>Décision</th>
                </tr>
              </thead>
              <tbody>
                {pendingApplications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--brand-orange)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", overflow: "hidden", flexShrink: 0 }}>
                          {app.user.image ? (
                            <Image src={app.user.image} alt={app.user.name || ""} width={34} height={34} style={{ objectFit: "cover" }} />
                          ) : (
                            app.user.name?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "white", fontSize: "0.88rem" }}>{app.user.name || "Sans nom"}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{app.user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.75rem 0.85rem" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand-orange)", background: "rgba(254,145,0,0.12)", padding: "0.2rem 0.55rem", borderRadius: "0.4rem", border: "1px solid rgba(254,145,0,0.25)" }}>
                        {app.specialty}
                      </span>
                    </td>

                    <td style={{ padding: "0.75rem 0.85rem" }}>
                      <div style={{ fontWeight: 600, color: "#e5e7eb", fontSize: "0.82rem" }}>{app.phone}</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{app.wilaya || "Algérie"}</div>
                    </td>

                    <td style={{ padding: "0.75rem 0.85rem", maxWidth: "280px" }}>
                      <div style={{ fontSize: "0.8rem", color: "#d1d5db", lineHeight: 1.3, marginBottom: "0.2rem" }}>
                        « {app.bio} »
                      </div>
                      {app.portfolioUrl && (
                        <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--brand-blue)", textDecoration: "underline" }}>
                          Voir Portfolio / Profil ↗
                        </a>
                      )}
                    </td>

                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                      <AdminApplicationActions applicationId={app.id} userName={app.user.name || "l'utilisateur"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Table with Sorting, Pagination, and Search */}
      <AdminUsersTable users={serializedUsers} currentAdminId={currentAdminId} />
    </div>
  );
}

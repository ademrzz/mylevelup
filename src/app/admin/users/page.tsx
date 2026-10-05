import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { AdminApplicationActions } from "@/components/AdminApplicationActions";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const currentAdminId = (session?.user as any)?.id;

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
  const processedApplications = applications.filter((a) => a.status !== "PENDING");

  // Server action to update user role
  async function updateUserRole(formData: FormData) {
    "use server";
    const targetUserId = formData.get("userId") as string;
    const newRole = formData.get("role") as string;

    if (!targetUserId || !newRole) return;

    // Safety: prevent an admin from demoting themselves
    if (targetUserId === currentAdminId && newRole !== "ADMIN") {
      throw new Error("Vous ne pouvez pas rétrograder votre propre compte administrateur.");
    }

    if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(newRole)) {
      throw new Error("Rôle non valide.");
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
  }

  // Server action to delete user with full cascade cleanup
  async function deleteUser(formData: FormData) {
    "use server";
    const targetUserId = formData.get("userId") as string;
    if (!targetUserId) return;

    if (targetUserId === currentAdminId) {
      throw new Error("Impossible de supprimer votre propre compte administrateur.");
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete user progress
      await tx.userProgress.deleteMany({ where: { userId: targetUserId } });
      
      // 2. Delete user enrollments
      await tx.enrollment.deleteMany({ where: { userId: targetUserId } });

      // 3. If instructor, purge owned courses
      const userCourses = await tx.course.findMany({
        where: { instructorId: targetUserId },
        select: { id: true },
      });

      for (const c of userCourses) {
        await tx.enrollment.deleteMany({ where: { courseId: c.id } });

        const chapters = await tx.chapter.findMany({
          where: { courseId: c.id },
          select: { id: true },
        });

        for (const ch of chapters) {
          const lessons = await tx.lesson.findMany({
            where: { chapterId: ch.id },
            select: { id: true },
          });

          for (const l of lessons) {
            await tx.userProgress.deleteMany({ where: { lessonId: l.id } });
          }

          await tx.lesson.deleteMany({ where: { chapterId: ch.id } });
        }

        await tx.chapter.deleteMany({ where: { courseId: c.id } });
        await tx.course.delete({ where: { id: c.id } });
      }

      // 4. Delete auth records
      await tx.twoFactorConfirmation.deleteMany({ where: { userId: targetUserId } });
      await tx.session.deleteMany({ where: { userId: targetUserId } });
      await tx.account.deleteMany({ where: { userId: targetUserId } });

      // 5. Delete the user record
      await tx.user.delete({ where: { id: targetUserId } });
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/finance");
  }

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
          <div style={{ color: "var(--brand-orange)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            ⏳ Candidatures Formateur en attente
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: pendingApplications.length > 0 ? "var(--brand-orange)" : "white" }}>
            {pendingApplications.length}
          </div>
        </div>

        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--brand-blue)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            🎓 Formateurs Officiels
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "white" }}>
            {users.filter((u) => u.role === "INSTRUCTOR").length}
          </div>
        </div>

        <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <div style={{ color: "#34d399", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            👥 Total Étudiants
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
              <span style={{ fontSize: "1.25rem" }}>⏳</span>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", margin: 0 }}>
                Candidatures de Formateurs à Valider ({pendingApplications.length})
              </h2>
            </div>
            <span style={{ fontSize: "0.78rem", color: "var(--brand-orange)", background: "rgba(254,145,0,0.15)", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontWeight: 700 }}>
              Action requise
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "980px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600 }}>Candidat</th>
                  <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600 }}>Spécialité</th>
                  <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600 }}>Contact & Wilaya</th>
                  <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600 }}>Bio & Portfolio</th>
                  <th style={{ padding: "0.85rem 1.25rem", fontWeight: 600, textAlign: "right" }}>Décision</th>
                </tr>
              </thead>
              <tbody>
                {pendingApplications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--brand-orange)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", overflow: "hidden", flexShrink: 0 }}>
                          {app.user.image ? (
                            <Image src={app.user.image} alt={app.user.name || ""} width={36} height={36} style={{ objectFit: "cover" }} />
                          ) : (
                            app.user.name?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "white" }}>{app.user.name || "Sans nom"}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{app.user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand-orange)", background: "rgba(254,145,0,0.12)", padding: "0.25rem 0.6rem", borderRadius: "0.4rem", border: "1px solid rgba(254,145,0,0.25)" }}>
                        {app.specialty}
                      </span>
                    </td>

                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ fontWeight: 600, color: "#e5e7eb", fontSize: "0.85rem" }}>{app.phone}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{app.wilaya || "Algérie"}</div>
                    </td>

                    <td style={{ padding: "1rem 1.25rem", maxWidth: "320px" }}>
                      <div style={{ fontSize: "0.82rem", color: "#d1d5db", lineHeight: 1.3, marginBottom: "0.25rem" }}>
                        « {app.bio} »
                      </div>
                      {app.portfolioUrl && (
                        <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.78rem", color: "var(--brand-blue)", textDecoration: "underline" }}>
                          Voir Portfolio / Profil ↗
                        </a>
                      )}
                    </td>

                    <td style={{ padding: "1rem 1.25rem", textAlign: "right", whiteSpace: "nowrap" }}>
                      <AdminApplicationActions applicationId={app.id} userName={app.user.name || "l'utilisateur"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Table Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: 0 }}>
          Tous les Comptes ({users.length})
        </h2>
      </div>

      {/* Users Table */}
      <div className="glass" style={{ borderRadius: "1.25rem", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "980px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Utilisateur</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Wilaya / Contact</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Activité</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Rôle Actuel</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isCurrentAdmin = u.id === currentAdminId;

                const roleBadgeStyle = {
                  ADMIN: { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc", border: "rgba(168, 85, 247, 0.3)" },
                  INSTRUCTOR: { bg: "rgba(254, 145, 0, 0.15)", text: "var(--brand-orange)", border: "rgba(254, 145, 0, 0.3)" },
                  STUDENT: { bg: "rgba(0, 160, 220, 0.15)", text: "var(--brand-blue)", border: "rgba(0, 160, 220, 0.3)" },
                }[u.role as "ADMIN" | "INSTRUCTOR" | "STUDENT"] || { bg: "rgba(255,255,255,0.1)", text: "white", border: "rgba(255,255,255,0.2)" };

                return (
                  <tr 
                    key={u.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }}
                  >
                    {/* User info */}
                    <td style={{ padding: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div 
                          style={{ 
                            width: "38px", 
                            height: "38px", 
                            borderRadius: "50%", 
                            background: u.role === "ADMIN" ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" : "rgba(255,255,255,0.08)", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontWeight: 700, 
                            color: "white",
                            fontSize: "0.95rem",
                            flexShrink: 0
                          }}
                        >
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            {u.name || "Sans nom"}
                            {isCurrentAdmin && (
                              <span style={{ fontSize: "0.7rem", color: "#c084fc", background: "rgba(168,85,247,0.15)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                                Vous
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Wilaya & Contact */}
                    <td style={{ padding: "1.25rem" }}>
                      <div style={{ color: "#e5e7eb", fontSize: "0.85rem" }}>
                        {u.wilaya || "Wilaya non spécifiée"}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {u.phone || "Téléphone absent"}
                      </div>
                    </td>

                    {/* Activity */}
                    <td style={{ padding: "1.25rem" }}>
                      <div style={{ fontSize: "0.85rem", color: "#e5e7eb" }}>
                        <strong>{u._count.enrollments}</strong> cours suivi(s)
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        <strong>{u._count.courses}</strong> cours créé(s)
                      </div>
                    </td>

                    {/* Current Role Badge */}
                    <td style={{ padding: "1.25rem" }}>
                      <span 
                        style={{ 
                          fontSize: "0.75rem", 
                          fontWeight: 700, 
                          padding: "0.25rem 0.65rem", 
                          borderRadius: "9999px",
                          background: roleBadgeStyle.bg,
                          color: roleBadgeStyle.text,
                          border: `1px solid ${roleBadgeStyle.border}`
                        }}
                      >
                        {u.role === "ADMIN" ? "🛡️ Administrateur" : u.role === "INSTRUCTOR" ? "🎓 Enseignant" : "Étudiant"}
                      </span>
                    </td>

                    {/* Role Change & Delete Actions */}
                    <td style={{ padding: "1.25rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                        {/* Change Role Form */}
                        <form action={updateUserRole} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                          <input type="hidden" name="userId" value={u.id} />
                          
                          <select 
                            name="role" 
                            defaultValue={u.role}
                            disabled={isCurrentAdmin}
                            className="input-field"
                            style={{ 
                              fontSize: "0.8rem", 
                              padding: "0.35rem 0.5rem", 
                              cursor: isCurrentAdmin ? "not-allowed" : "pointer",
                              width: "125px",
                              opacity: isCurrentAdmin ? 0.6 : 1
                            }}
                          >
                            <option value="STUDENT" style={{ background: "#1c1c1e", color: "white" }}>Étudiant</option>
                            <option value="INSTRUCTOR" style={{ background: "#1c1c1e", color: "white" }}>Enseignant</option>
                            <option value="ADMIN" style={{ background: "#1c1c1e", color: "white" }}>Administrateur</option>
                          </select>

                          <button 
                            type="submit" 
                            disabled={isCurrentAdmin}
                            className="btn btn-outline"
                            style={{ 
                              fontSize: "0.75rem", 
                              padding: "0.35rem 0.65rem",
                              opacity: isCurrentAdmin ? 0.4 : 1,
                              cursor: isCurrentAdmin ? "not-allowed" : "pointer"
                            }}
                          >
                            Appliquer
                          </button>
                        </form>

                        {/* Delete User Form */}
                        <form action={deleteUser} style={{ display: "inline-block" }}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button
                            type="submit"
                            disabled={isCurrentAdmin}
                            style={{
                              background: "rgba(239, 68, 68, 0.12)",
                              border: "1px solid rgba(239, 68, 68, 0.35)",
                              color: "#ef4444",
                              padding: "0.35rem 0.65rem",
                              borderRadius: "0.35rem",
                              fontSize: "0.75rem",
                              cursor: isCurrentAdmin ? "not-allowed" : "pointer",
                              opacity: isCurrentAdmin ? 0.25 : 1,
                              fontWeight: 600,
                              whiteSpace: "nowrap"
                            }}
                            title={isCurrentAdmin ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer définitivement cet utilisateur"}
                          >
                            Supprimer
                          </button>
                        </form>
                      </div>
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


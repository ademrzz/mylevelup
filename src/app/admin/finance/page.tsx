import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { CommissionCalculator, CourseFinancialRow } from "@/components/CommissionCalculator";
import { getAllPayoutRequests, updatePayoutStatus } from "@/lib/payouts";

export default async function AdminFinancePage() {
  const [courses, payoutRequests] = await Promise.all([
    prisma.course.findMany({
      include: {
        instructor: true,
        enrollments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getAllPayoutRequests(),
  ]);

  const rows: CourseFinancialRow[] = courses.map((c) => {
    const enrollmentsCount = c.enrollments.length;
    const price = c.price || 0;
    const gross = enrollmentsCount * price;

    return {
      id: c.id,
      title: c.title,
      instructorName: c.instructor.name || "Inconnu",
      instructorEmail: c.instructor.email,
      price,
      enrollmentsCount,
      gross,
    };
  });

  async function handleApprovePayout(formData: FormData) {
    "use server";
    const payoutId = formData.get("payoutId") as string;
    const txReference = formData.get("txReference") as string;
    if (!payoutId) return;

    await updatePayoutStatus(payoutId, "PAID", txReference || "Virement exécuté");
    revalidatePath("/admin/finance");
    revalidatePath("/instructor/payouts");
  }

  async function handleRejectPayout(formData: FormData) {
    "use server";
    const payoutId = formData.get("payoutId") as string;
    const reason = formData.get("reason") as string;
    if (!payoutId) return;

    await updatePayoutStatus(payoutId, "REJECTED", undefined, reason || "Coordonnées bancaires invalides");
    revalidatePath("/admin/finance");
    revalidatePath("/instructor/payouts");
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
            Finances, Commissions & Virements
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Rapport comptable transparent : ajustez la commission de Level Up DZ et traitez les demandes de retraits CCP / BaridiMob des formateurs.
          </p>
        </div>
      </div>

      {/* Model explanation callout */}
      <div 
        className="glass"
        style={{
          padding: "1.25rem 1.75rem",
          borderRadius: "1rem",
          border: "1px solid rgba(0, 160, 220, 0.3)",
          background: "rgba(0, 160, 220, 0.05)",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          flexWrap: "wrap"
        }}
      >
        <div style={{ fontSize: "2rem" }}>💡</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem 0" }}>
            Principe de Répartition Variable
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
            Le taux de commission permet de couvrir les frais de serveur, de bande passante vidéo et les frais bancaires EDAHABIA / CIB. Vous pouvez tester et définir n'importe quel pourcentage ci-dessous.
          </p>
        </div>
      </div>

      {/* Interactive Variable Commission Calculator & Table */}
      <CommissionCalculator initialCourses={rows} defaultRate={20} />

      {/* Teacher Payout Requests Management Section */}
      <div style={{ marginTop: "3.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", margin: "0 0 0.25rem 0" }}>
              Demandes de Retraits Enseignants ({payoutRequests.length})
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              Validez les virements CCP et BaridiMob après avoir effectué le transfert sur Algérie Poste.
            </p>
          </div>
        </div>

        <div className="glass" style={{ borderRadius: "1.25rem", border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "1050px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Enseignant</th>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Montant</th>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Mode & Coordonnées</th>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 600, minWidth: "120px" }}>Statut</th>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 600, textAlign: "right", minWidth: "260px" }}>Traitement Virement</th>
                </tr>
              </thead>
              <tbody>
                {payoutRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                      Aucune demande de virement enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  payoutRequests.map((p) => {
                    const isPending = p.status === "PENDING";
                    const isPaid = p.status === "PAID";

                    return (
                      <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "1.1rem 1.25rem" }}>
                          <div style={{ fontWeight: 600, color: "white" }}>{p.instructorName}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{p.instructorEmail}</div>
                        </td>
                        <td style={{ padding: "1.1rem 1.25rem" }}>
                          <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#34d399" }}>
                            {p.amount.toLocaleString("fr-DZ")} DZD
                          </span>
                        </td>
                        <td style={{ padding: "1.1rem 1.25rem" }}>
                          <div style={{ fontSize: "0.85rem", color: "#e5e7eb" }}>
                            <strong>{p.method}</strong> : {p.accountDetails}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            Titulaire : {p.accountName}
                          </div>
                        </td>
                        <td style={{ padding: "1.1rem 1.25rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          {new Date(p.createdAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "1.1rem 1.25rem" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              padding: "0.2rem 0.6rem",
                              borderRadius: "9999px",
                              background: isPaid ? "rgba(52,211,153,0.15)" : isPending ? "rgba(254,145,0,0.15)" : "rgba(239,68,68,0.15)",
                              color: isPaid ? "#34d399" : isPending ? "var(--brand-orange)" : "#ef4444",
                              border: `1px solid ${isPaid ? "rgba(52,211,153,0.3)" : isPending ? "rgba(254,145,0,0.3)" : "rgba(239,68,68,0.3)"}`,
                            }}
                          >
                            {isPaid ? "✓ Viré" : isPending ? "⏳ En attente" : "✕ Rejeté"}
                          </span>
                        </td>
                        <td style={{ padding: "1.1rem 1.25rem", textAlign: "right" }}>
                          {isPending ? (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                              {/* Approve Form with Ref */}
                              <form action={handleApprovePayout} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                <input type="hidden" name="payoutId" value={p.id} />
                                <input
                                  type="text"
                                  name="txReference"
                                  placeholder="Réf. virement (ex: BaridiMob #123)"
                                  className="input-field"
                                  style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem", width: "160px" }}
                                />
                                <button
                                  type="submit"
                                  className="btn btn-primary"
                                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem", background: "var(--brand-green)" }}
                                >
                                  Valider
                                </button>
                              </form>

                              {/* Reject Form */}
                              <form action={handleRejectPayout} style={{ display: "inline-block" }}>
                                <input type="hidden" name="payoutId" value={p.id} />
                                <input type="hidden" name="reason" value="Coordonnées incorrectes" />
                                <button
                                  type="submit"
                                  style={{
                                    background: "rgba(239,68,68,0.12)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    color: "#ef4444",
                                    padding: "0.35rem 0.6rem",
                                    borderRadius: "0.35rem",
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                  title="Rejeter la demande"
                                >
                                  ✕
                                </button>
                              </form>
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.8rem", color: isPaid ? "#34d399" : "#ef4444" }}>
                              {isPaid ? (
                                <span>Réf : {p.txReference || "Confirmé"}</span>
                              ) : (
                                <span>Motif : {p.rejectionReason || "Rejeté"}</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}



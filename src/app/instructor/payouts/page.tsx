import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { getInstructorFinancials, getInstructorPayouts, createPayoutRequest } from "@/lib/payouts";

export default async function InstructorPayoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;

  if (!session?.user || (userRole !== "INSTRUCTOR" && userRole !== "ADMIN")) {
    redirect("/login");
  }

  const [financials, payouts] = await Promise.all([
    getInstructorFinancials(userId),
    getInstructorPayouts(userId),
  ]);

  async function handleRequestPayout(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    const instructorId = (session?.user as any)?.id;
    if (!instructorId) return;

    const amountStr = formData.get("amount") as string;
    const method = formData.get("method") as string;
    const accountDetails = formData.get("accountDetails") as string;
    const accountName = formData.get("accountName") as string;

    const amount = parseFloat(amountStr);

    if (!amount || amount < 1000) {
      throw new Error("Le montant minimum de retrait est de 1 000 DZD.");
    }

    if (!accountDetails || !accountName) {
      throw new Error("Veuillez renseigner les coordonnées bancaires complètes.");
    }

    // Check against available balance
    const currentFin = await getInstructorFinancials(instructorId);
    if (amount > currentFin.availableBalance) {
      throw new Error(`Solde insuffisant. Vous disposez de ${currentFin.availableBalance.toLocaleString("fr-DZ")} DZD retirables.`);
    }

    await createPayoutRequest(
      instructorId,
      amount,
      method || "BARIDIMOB",
      accountDetails.trim(),
      accountName.trim()
    );

    revalidatePath("/instructor/payouts");
    revalidatePath("/admin/finance");
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Link href="/instructor" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              ← Retour au Studio
            </Link>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
            Retrait des Gains & Payouts (CCP / BaridiMob)
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Consultez votre solde net retirable et demandez vos virements directs vers votre compte CCP ou carte EDAHABIA / BaridiMob.
          </p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {/* Available Balance Card */}
        <div 
          className="glass"
          style={{
            padding: "1.75rem",
            borderRadius: "1rem",
            border: "1px solid rgba(52,211,153,0.35)",
            background: "linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(0,0,0,0.4) 100%)",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Solde Disponible pour Retrait
          </span>
          <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#34d399", margin: "0.4rem 0" }}>
            {Math.round(financials.availableBalance).toLocaleString("fr-DZ")} <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>DZD</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Prêt à être viré sur votre compte
          </span>
        </div>

        {/* Total Net Earned */}
        <div className="glass" style={{ padding: "1.75rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Gains Nets Cumulés (80%)
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", margin: "0.4rem 0" }}>
            {Math.round(financials.teacherNetEarned).toLocaleString("fr-DZ")} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>DZD</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Sur {financials.totalPaidSales} inscription(s) payante(s)
          </span>
        </div>

        {/* Total Already Paid Out */}
        <div className="glass" style={{ padding: "1.75rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Déjà Viré sur CCP / BaridiMob
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--brand-blue)", margin: "0.4rem 0" }}>
            {Math.round(financials.totalPaidOut).toLocaleString("fr-DZ")} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>DZD</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {financials.totalPending > 0 ? `+ ${financials.totalPending.toLocaleString("fr-DZ")} DZD en cours` : "Tous les virements sont à jour"}
          </span>
        </div>
      </div>

      {/* Main Grid: Request Form on Left, History on Right */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "2.5rem", alignItems: "flex-start" }}>
        
        {/* Request Payout Form */}
        <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem" }}>💳</span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: 0 }}>
              Demander un Virement
            </h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.75rem" }}>
            Les virements sont exécutés par l'administration vers votre compte CCP ou BaridiMob sous 24h à 48h ouvrées.
          </p>

          <form action={handleRequestPayout} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
                Montant à retirer (DZD) *
              </label>
              <input 
                type="number" 
                name="amount" 
                required 
                min="1000" 
                max={Math.max(1000, Math.floor(financials.availableBalance))}
                defaultValue={financials.availableBalance >= 1000 ? Math.floor(financials.availableBalance) : ""}
                placeholder="Min. 1 000 DZD"
                className="input-field" 
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                Maximum disponible : <strong>{Math.round(financials.availableBalance).toLocaleString("fr-DZ")} DZD</strong>
              </span>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
                Mode de virement souhaité *
              </label>
              <select name="method" required className="input-field" style={{ cursor: "pointer" }}>
                <option value="BARIDIMOB" style={{ background: "#1c1c1e", color: "white" }}>
                  BaridiMob (RIP 20 chiffres) - Rapide
                </option>
                <option value="CCP" style={{ background: "#1c1c1e", color: "white" }}>
                  Compte CCP Algérie Poste (Numéro + Clé)
                </option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
                Numéro RIP (20 chiffres) ou Numéro CCP avec Clé *
              </label>
              <input 
                type="text" 
                name="accountDetails" 
                required 
                placeholder="Ex: 00799999000123456789 ou 0012345678 Clé 99"
                className="input-field" 
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
                Nom & Prénom exacts du titulaire du compte *
              </label>
              <input 
                type="text" 
                name="accountName" 
                required 
                defaultValue={session.user?.name || ""}
                placeholder="Ex: Mohamed Benali"
                className="input-field" 
              />
            </div>

            <button 
              type="submit" 
              disabled={financials.availableBalance < 1000}
              className="btn btn-primary"
              style={{ 
                marginTop: "0.5rem", 
                padding: "0.8rem", 
                background: financials.availableBalance >= 1000 ? "var(--gradient-orange)" : "rgba(255,255,255,0.1)",
                opacity: financials.availableBalance >= 1000 ? 1 : 0.5,
                cursor: financials.availableBalance >= 1000 ? "pointer" : "not-allowed"
              }}
            >
              {financials.availableBalance >= 1000 ? "🚀 Soumettre la demande de virement" : "Solde insuffisant (min. 1 000 DZD)"}
            </button>
          </form>
        </div>

        {/* Payouts History */}
        <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", marginBottom: "1.25rem" }}>
            Historique de vos Demandes ({payouts.length})
          </h2>

          {payouts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📜</div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                Vous n'avez pas encore effectué de demande de virement.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {payouts.map((p) => {
                const isPaid = p.status === "PAID";
                const isPending = p.status === "PENDING";
                const isRejected = p.status === "REJECTED";

                const badgeStyle = isPaid 
                  ? { bg: "rgba(52,211,153,0.15)", text: "#34d399", border: "rgba(52,211,153,0.3)", label: "✓ Viré / Payé" }
                  : isPending
                  ? { bg: "rgba(254,145,0,0.15)", text: "var(--brand-orange)", border: "rgba(254,145,0,0.3)", label: "⏳ En attente" }
                  : { bg: "rgba(239,68,68,0.15)", text: "#ef4444", border: "rgba(239,68,68,0.3)", label: "✕ Rejeté" };

                return (
                  <div 
                    key={p.id}
                    style={{
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "white" }}>
                        {p.amount.toLocaleString("fr-DZ")} DZD
                      </span>
                      <span 
                        style={{ 
                          fontSize: "0.75rem", 
                          fontWeight: 700, 
                          padding: "0.2rem 0.55rem", 
                          borderRadius: "9999px",
                          background: badgeStyle.bg,
                          color: badgeStyle.text,
                          border: `1px solid ${badgeStyle.border}`
                        }}
                      >
                        {badgeStyle.label}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      <span>Mode : <strong>{p.method}</strong> ({p.accountDetails})</span>
                      <br />
                      <span>Titulaire : {p.accountName}</span>
                    </div>

                    {p.txReference && (
                      <div style={{ fontSize: "0.8rem", color: "#34d399", background: "rgba(52,211,153,0.08)", padding: "0.4rem 0.6rem", borderRadius: "0.4rem", marginTop: "0.2rem" }}>
                        Réf. virement : <strong>{p.txReference}</strong>
                      </div>
                    )}

                    {p.rejectionReason && (
                      <div style={{ fontSize: "0.8rem", color: "#ef4444", background: "rgba(239,68,68,0.08)", padding: "0.4rem 0.6rem", borderRadius: "0.4rem", marginTop: "0.2rem" }}>
                        Motif : {p.rejectionReason}
                      </div>
                    )}

                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Demandé le {new Date(p.createdAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

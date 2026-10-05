"use client";

import { useState } from "react";
import { approveInstructorApplication, rejectInstructorApplication } from "@/actions/instructorApplication";

interface AdminApplicationActionsProps {
  applicationId: string;
  userName: string;
}

export function AdminApplicationActions({
  applicationId,
  userName,
}: AdminApplicationActionsProps) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const reasonPresets = [
    "Veuillez renseigner un profil LinkedIn ou portfolio avec des travaux vérifiables.",
    "Expérience pédagogique ou technique jugée insuffisante pour nos critères actuels.",
    "Numéro de téléphone ou coordonnées de contact non valides.",
    "La thématique proposée ne correspond pas à notre catalogue actuel.",
  ];

  async function handleApprove() {
    if (!confirm(`Confirmez-vous l'approbation de ${userName} en tant que Formateur officiel ?`)) {
      return;
    }
    setLoading(true);
    try {
      await approveInstructorApplication(applicationId);
    } catch (err: any) {
      alert(err?.message || "Erreur lors de l'approbation.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Veuillez indiquer un motif de refus.");
      return;
    }
    setLoading(true);
    try {
      await rejectInstructorApplication(applicationId, reason.trim());
      setIsRejectOpen(false);
      setReason("");
    } catch (err: any) {
      alert(err?.message || "Erreur lors du refus.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
        {/* Approve button */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading}
          className="btn"
          style={{
            fontSize: "0.78rem",
            padding: "0.4rem 0.85rem",
            background: "var(--brand-green)",
            color: "white",
            fontWeight: 700,
            borderRadius: "0.4rem",
            border: "none",
            cursor: "pointer",
          }}
          title="Approuver la candidature et attribuer le rôle Formateur"
        >
          {loading ? "..." : "✓ Approuver"}
        </button>

        {/* Reject button */}
        <button
          type="button"
          onClick={() => setIsRejectOpen(true)}
          disabled={loading}
          className="btn btn-outline"
          style={{
            fontSize: "0.78rem",
            padding: "0.4rem 0.85rem",
            borderColor: "rgba(239,68,68,0.4)",
            color: "#ef4444",
            borderRadius: "0.4rem",
            cursor: "pointer",
          }}
          title="Refuser la candidature avec un motif explicatif"
        >
          ✕ Refuser
        </button>
      </div>

      {/* Reject Modal */}
      {isRejectOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRejectOpen(false);
          }}
        >
          <div
            className="glass"
            style={{
              width: "100%",
              maxWidth: "520px",
              borderRadius: "1rem",
              border: "1px solid rgba(239,68,68,0.3)",
              background: "#121826",
              padding: "1.75rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
                  Refuser la candidature de {userName}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
                  L'utilisateur verra cette explication sur son profil et pourra corriger sa demande.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.25rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#9ca3af", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Motifs rapides fréquents :
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {reasonPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReason(preset)}
                    style={{
                      textAlign: "left",
                      fontSize: "0.78rem",
                      padding: "0.4rem 0.65rem",
                      borderRadius: "0.4rem",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: reason === preset ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.02)",
                      color: reason === preset ? "#fca5a5" : "#d1d5db",
                      cursor: "pointer",
                    }}
                  >
                    • {preset}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleReject}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", color: "white", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Motif du refus (visible par l'étudiant) :
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Expliquez pourquoi la candidature ne peut pas être acceptée..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "rgba(0,0,0,0.5)",
                    color: "white",
                    fontSize: "0.88rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(false)}
                  className="btn btn-outline"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason.trim()}
                  className="btn"
                  style={{
                    background: "#ef4444",
                    color: "white",
                    fontSize: "0.85rem",
                    padding: "0.5rem 1.25rem",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "0.4rem",
                    cursor: "pointer",
                  }}
                >
                  {loading ? "..." : "Confirmer le refus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

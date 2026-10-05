"use client";

import { useState } from "react";
import { adminApproveCourse, adminRejectCourse, adminUnpublishCourse } from "@/actions/courseModeration";

interface AdminCourseModerationActionsProps {
  courseId: string;
  courseTitle: string;
  isPublished: boolean;
  status: string; // DRAFT, PENDING, PUBLISHED, REJECTED
  rejectionReason?: string | null;
}

export function AdminCourseModerationActions({
  courseId,
  courseTitle,
  isPublished,
  status,
  rejectionReason,
}: AdminCourseModerationActionsProps) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const presets = [
    "Qualité vidéo ou audio insuffisante : veuillez réenregistrer avec un meilleur micro.",
    "Programme de formation incomplet : veuillez ajouter davantage de leçons ou chapitres.",
    "Description ou objectifs pédagogiques à clarifier pour les étudiants.",
    "Tarif inadapté par rapport au volume d'heures ou de chapitres proposés.",
  ];

  async function handleApprove() {
    if (!confirm(`Publier officiellement la formation "${courseTitle}" dans le catalogue ?`)) return;
    setLoading(true);
    try {
      await adminApproveCourse(courseId);
    } catch (err: any) {
      alert(err?.message || "Erreur lors de l'approbation.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnpublish() {
    if (!confirm(`Voulez-vous retirer "${courseTitle}" du catalogue public et le repasser en brouillon ?`)) return;
    setLoading(true);
    try {
      await adminUnpublishCourse(courseId);
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la dépublication.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Veuillez saisir un motif pour le refus.");
      return;
    }
    setLoading(true);
    try {
      await adminRejectCourse(courseId, reason.trim());
      setIsRejectOpen(false);
      setReason("");
    } catch (err: any) {
      alert(err?.message || "Erreur lors du rejet du cours.");
    } finally {
      setLoading(false);
    }
  }

  const isPending = status === "PENDING";

  return (
    <>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {isPublished ? (
          <button
            type="button"
            onClick={handleUnpublish}
            disabled={loading}
            className="btn btn-outline"
            style={{
              fontSize: "0.78rem",
              padding: "0.35rem 0.75rem",
              borderColor: "rgba(239,68,68,0.3)",
              color: "#ef4444",
              borderRadius: "0.4rem",
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Dépublier"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleApprove}
              disabled={loading}
              className="btn"
              style={{
                fontSize: "0.78rem",
                padding: "0.35rem 0.85rem",
                background: isPending ? "var(--brand-green)" : "rgba(52,211,153,0.15)",
                color: isPending ? "white" : "#34d399",
                border: isPending ? "none" : "1px solid rgba(52,211,153,0.3)",
                fontWeight: isPending ? 700 : 500,
                borderRadius: "0.4rem",
                cursor: "pointer",
              }}
              title="Valider et mettre en ligne ce cours"
            >
              {loading ? "..." : isPending ? "✓ Approuver & Publier" : "Publier"}
            </button>

            {isPending && (
              <button
                type="button"
                onClick={() => setIsRejectOpen(true)}
                disabled={loading}
                className="btn btn-outline"
                style={{
                  fontSize: "0.78rem",
                  padding: "0.35rem 0.75rem",
                  borderColor: "rgba(239,68,68,0.4)",
                  color: "#ef4444",
                  borderRadius: "0.4rem",
                  cursor: "pointer",
                }}
                title="Rejeter la publication avec des remarques"
              >
                ✕ Rejeter
              </button>
            )}
          </>
        )}
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
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
                  Rejeter la formation
                </h3>
                <p style={{ color: "#d1d5db", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
                  Cours : <strong>{courseTitle}</strong>
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.25rem 0 0 0" }}>
                  Le formateur verra ces remarques pour corriger son cours et le resoumettre.
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
                {presets.map((preset, idx) => (
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
                  Remarques de modération pour le formateur :
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Expliquez précisément ce que le formateur doit corriger avant que le cours ne soit validé..."
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
                  {loading ? "..." : "Confirmer le rejet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

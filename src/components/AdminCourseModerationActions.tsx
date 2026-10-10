"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  adminApproveCourse, 
  adminRejectCourse, 
  adminUnpublishCourse, 
  adminDeleteCourse 
} from "@/actions/courseModeration";

interface AdminCourseModerationActionsProps {
  courseId: string;
  courseTitle: string;
  isPublished: boolean;
  status: string; // DRAFT, PENDING, PUBLISHED, REJECTED
  rejectionReason?: string | null;
  onDeleted?: () => void;
}

export function AdminCourseModerationActions({
  courseId,
  courseTitle,
  isPublished,
  status,
  rejectionReason,
  onDeleted,
}: AdminCourseModerationActionsProps) {
  const router = useRouter();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      router.refresh();
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
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la dépublication.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement la formation "${courseTitle}" ?\n\nCette action est irréversible et supprimera également tous ses chapitres, leçons et inscriptions.`
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await adminDeleteCourse(courseId);
      if (onDeleted) onDeleted();
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la suppression de la formation.");
    } finally {
      setIsDeleting(false);
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
      router.refresh();
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
            disabled={loading || isDeleting}
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
              disabled={loading || isDeleting}
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
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              title="Valider et mettre en ligne ce cours"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{loading ? "..." : isPending ? "Approuver & Publier" : "Publier"}</span>
            </button>

            {isPending && (
              <button
                type="button"
                onClick={() => setIsRejectOpen(true)}
                disabled={loading || isDeleting}
                className="btn btn-outline"
                style={{
                  fontSize: "0.78rem",
                  padding: "0.35rem 0.75rem",
                  borderColor: "rgba(239,68,68,0.4)",
                  color: "#ef4444",
                  borderRadius: "0.4rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
                title="Rejeter la publication avec des remarques"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Rejeter</span>
              </button>
            )}
          </>
        )}

        {/* Delete button */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || isDeleting}
          className="btn btn-outline"
          style={{
            fontSize: "0.78rem",
            padding: "0.35rem 0.65rem",
            borderColor: "rgba(239,68,68,0.35)",
            color: "#f87171",
            background: "rgba(239,68,68,0.06)",
            borderRadius: "0.4rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            transition: "all 0.15s ease",
          }}
          title="Supprimer définitivement cette formation"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span>{isDeleting ? "..." : "Supprimer"}</span>
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

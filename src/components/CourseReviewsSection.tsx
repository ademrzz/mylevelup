"use client";

import { useState } from "react";
import { ReviewItem, RatingStats } from "@/lib/reviews";
import { submitReviewAction, deleteReviewAction } from "@/actions/reviews";
import Link from "next/link";

interface CourseReviewsSectionProps {
  courseId: string;
  reviews: ReviewItem[];
  stats: RatingStats;
  isEnrolled: boolean;
  currentUserId?: string;
  userRole?: string;
  initialUserReview?: ReviewItem | null;
}

export function CourseReviewsSection({
  courseId,
  reviews,
  stats,
  isEnrolled,
  currentUserId,
  userRole,
  initialUserReview,
}: CourseReviewsSectionProps) {
  const [userRating, setUserRating] = useState<number>(initialUserReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(initialUserReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const starLabels: Record<number, string> = {
    1: "Décevant (1/5)",
    2: "Moyen (2/5)",
    3: "Bien (3/5)",
    4: "Très bien (4/5)",
    5: "Excellent ! (5/5)",
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await submitReviewAction(courseId, userRating, comment);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: "Merci ! Votre avis a été enregistré avec succès." });
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Erreur lors de l'enregistrement." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Une erreur inattendue est survenue." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
    try {
      const res = await deleteReviewAction(reviewId, courseId);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: "Avis supprimé." });
      } else {
        alert(res.error || "Erreur lors de la suppression.");
      }
    } catch {
      alert("Erreur de connexion.");
    }
  };

  return (
    <div style={{ marginTop: "3.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", margin: 0 }}>
            Avis & Évaluations des Étudiants
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
            Retours d'expérience vérifiés d'élèves inscrits à cette formation
          </p>
        </div>
      </div>

      {/* Global Rating Score and Breakdown Card */}
      <div
        className="glass"
        style={{
          padding: "1.75rem",
          borderRadius: "1rem",
          marginBottom: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {/* Score Left Column */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "7rem",
              height: "7rem",
              borderRadius: "1rem",
              background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.05) 100%)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
            }}
          >
            <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#facc15", lineHeight: 1 }}>
              {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "—"}
            </span>
            <div style={{ display: "flex", gap: "2px", marginTop: "0.35rem" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill={s <= Math.round(stats.averageRating) ? "#facc15" : "rgba(255,255,255,0.15)"}
                  stroke="none"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>
              {stats.totalReviews > 0
                ? `${stats.averageRating.toFixed(1)} sur 5 étoiles`
                : "Aucune note pour le moment"}
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {stats.totalReviews} {stats.totalReviews > 1 ? "avis certifiés" : "avis certifié"}
            </div>
            {stats.totalReviews > 0 && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "#34d399",
                  background: "rgba(52, 211, 153, 0.1)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  border: "1px solid rgba(52, 211, 153, 0.2)",
                }}
              >
                <span>✓</span> 100% Inscrits réels
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Bars Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.breakdown[star as 1 | 2 | 3 | 4 | 5] || 0;
            const percentage = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;

            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.8125rem" }}>
                <span style={{ color: "#d1d5db", width: "3.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span>{star}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>

                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: star >= 4 ? "#facc15" : star === 3 ? "#fbbf24" : "#f87171",
                      borderRadius: "9999px",
                      transition: "width 0.4s ease-out",
                    }}
                  />
                </div>

                <span style={{ color: "var(--text-muted)", width: "2.5rem", textAlign: "right" }}>
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form / Notice */}
      {currentUserId ? (
        <div
          className="glass"
          style={{
            padding: "1.75rem",
            borderRadius: "1rem",
            marginBottom: "2.5rem",
            border: "1px solid rgba(0, 160, 220, 0.25)",
            background: "linear-gradient(180deg, rgba(0,160,220,0.06) 0%, rgba(28,28,30,0.85) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.25rem" }}>✍️</span>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "white", margin: 0 }}>
              {initialUserReview ? "Modifier votre avis" : "Donnez votre note et votre avis"}
            </h3>
          </div>

          <form onSubmit={handleRatingSubmit}>
            {/* Interactive Star Picker */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                Votre note sur 5 :
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = hoverRating ? star <= hoverRating : star <= userRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.25rem",
                          outline: "none",
                          transition: "transform 0.15s ease",
                          transform: hoverRating === star ? "scale(1.2)" : "scale(1)",
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill={active ? "#facc15" : "rgba(255,255,255,0.15)"}
                          stroke={active ? "#eab308" : "rgba(255,255,255,0.2)"}
                          strokeWidth="1.5"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#facc15", marginLeft: "0.5rem" }}>
                  {starLabels[hoverRating || userRating]}
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                Votre commentaire ou recommandation (facultatif) :
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Expliquez ce qui vous a plu, la clarté des explications, la qualité des exercices..."
                className="input-field"
                style={{
                  width: "100%",
                  resize: "vertical",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              />
            </div>

            {feedbackMsg && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  background: feedbackMsg.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${feedbackMsg.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: feedbackMsg.type === "success" ? "#34d399" : "#f87171",
                }}
              >
                {feedbackMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: "0.625rem 1.5rem", fontSize: "0.9375rem" }}
            >
              {isSubmitting ? "Enregistrement..." : initialUserReview ? "Mettre à jour mon avis" : "Publier mon avis"}
            </button>
          </form>
        </div>
      ) : (
        <div
          className="glass"
          style={{
            padding: "1.25rem 1.5rem",
            borderRadius: "0.75rem",
            marginBottom: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            border: "1px dashed rgba(255,255,255,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🔒</span>
            <div>
              <div style={{ fontWeight: 600, color: "white", fontSize: "0.9375rem" }}>
                Vous souhaitez évaluer cette formation ?
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                Connectez-vous à votre compte pour partager votre retour d'expérience.
              </div>
            </div>
          </div>
          <Link href={`/login?callbackUrl=/courses/${courseId}`} className="btn btn-secondary" style={{ fontSize: "0.875rem" }}>
            Se connecter
          </Link>
        </div>
      )}

      {/* Reviews List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {reviews.length === 0 ? (
          <div
            className="glass"
            style={{
              padding: "2.5rem",
              borderRadius: "0.75rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
            <div style={{ fontWeight: 600, color: "white", marginBottom: "0.25rem" }}>
              Aucun avis pour l'instant
            </div>
            <p style={{ fontSize: "0.875rem", maxWidth: "24rem", margin: "0 auto" }}>
              Soyez le premier étudiant à partager vos impressions sur ce cours et aider les autres apprenants.
            </p>
          </div>
        ) : (
          reviews.map((r) => {
            const isOwner = currentUserId === r.userId;
            const canDelete = isOwner || userRole === "ADMIN";

            return (
              <div
                key={r.id}
                className="glass"
                style={{
                  padding: "1.25rem 1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,160,220,0.15)",
                        border: "1px solid rgba(0,160,220,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--brand-blue)",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                      }}
                    >
                      {r.userName?.charAt(0).toUpperCase() || "E"}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 600, color: "white", fontSize: "0.9375rem" }}>
                          {r.userName}
                        </span>
                        {r.userWilaya && (
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--text-muted)",
                              background: "rgba(255,255,255,0.05)",
                              padding: "0.15rem 0.45rem",
                              borderRadius: "0.25rem",
                            }}
                          >
                            📍 {r.userWilaya}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            color: "#34d399",
                            background: "rgba(52,211,153,0.1)",
                            padding: "0.15rem 0.45rem",
                            borderRadius: "0.25rem",
                            fontWeight: 600,
                          }}
                        >
                          Acheteur vérifié
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg
                              key={s}
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill={s <= r.rating ? "#facc15" : "rgba(255,255,255,0.15)"}
                              stroke="none"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {new Date(r.createdAt).toLocaleDateString("fr-DZ", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      title="Supprimer cet avis"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "0.8125rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        opacity: 0.8,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                {r.comment && (
                  <p
                    style={{
                      marginTop: "0.875rem",
                      color: "#e5e7eb",
                      fontSize: "0.9375rem",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {r.comment}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

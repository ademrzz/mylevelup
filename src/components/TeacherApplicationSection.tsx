"use client";

import { useState } from "react";
import { ALGERIAN_WILAYAS } from "@/lib/constants";
import { submitInstructorApplication, cancelInstructorApplication } from "@/actions/instructorApplication";

interface TeacherApplicationSectionProps {
  initialApplication: {
    id: string;
    specialty: string;
    bio: string;
    phone: string;
    wilaya: string | null;
    portfolioUrl: string | null;
    status: string;
    rejectionReason: string | null;
    updatedAt: Date;
  } | null;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
    wilaya: string | null;
  };
}

export function TeacherApplicationSection({
  initialApplication,
  user,
}: TeacherApplicationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const application = initialApplication;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await submitInstructorApplication(formData);
      setSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Voulez-vous vraiment annuler votre demande de statut formateur ?")) return;
    setLoading(true);
    setError(null);
    try {
      await cancelInstructorApplication();
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'annulation.");
    } finally {
      setLoading(false);
    }
  }

  // 1. Pending Application View
  if (application?.status === "PENDING" && !isEditing) {
    return (
      <div 
        className="glass" 
        style={{ 
          padding: "1.75rem 2rem", 
          borderRadius: "1rem", 
          border: "1px solid rgba(254,145,0,0.4)", 
          background: "linear-gradient(135deg, rgba(254,145,0,0.08) 0%, rgba(0,0,0,0.4) 100%)",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem" }}>⏳</span>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
                Demande de statut Formateur en cours d'examen
              </h3>
              <p style={{ color: "var(--brand-orange)", fontSize: "0.85rem", margin: "0.2rem 0 0 0", fontWeight: 600 }}>
                Statut : En attente d'approbation administrateur
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setIsEditing(true)}
            className="btn btn-outline"
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
          >
            Modifier ma demande
          </button>
        </div>

        <p style={{ color: "#d1d5db", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 1.25rem 0" }}>
          Votre profil est actuellement entre les mains de notre équipe pédagogique Level Up DZ. Dès qu'un administrateur valide votre candidature, votre espace instructeur sera débloqué immédiatement et vous pourrez publier vos formations.
        </p>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "0.75rem", padding: "1rem 1.25rem", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.88rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", color: "var(--text-muted)" }}>
            <div>
              <strong style={{ color: "white" }}>Spécialité :</strong> {application.specialty}
            </div>
            <div>
              <strong style={{ color: "white" }}>Contact :</strong> {application.phone} ({application.wilaya || user.wilaya || "Algérie"})
            </div>
            {application.portfolioUrl && (
              <div>
                <strong style={{ color: "white" }}>Portfolio :</strong>{" "}
                <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand-blue)", textDecoration: "underline" }}>
                  Lien externe ↗
                </a>
              </div>
            )}
          </div>
          <div style={{ marginTop: "0.6rem", color: "#9ca3af", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem" }}>
            « {application.bio} »
          </div>
        </div>

        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
          >
            Annuler ma candidature
          </button>
        </div>
      </div>
    );
  }

  // 2. Rejected Application Notice
  const isRejected = application?.status === "REJECTED";

  return (
    <div 
      className="glass" 
      style={{ 
        padding: "2rem", 
        borderRadius: "1rem", 
        border: isRejected ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(254,145,0,0.3)", 
        background: isRejected 
          ? "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(0,0,0,0.5) 100%)" 
          : "linear-gradient(135deg, rgba(254,145,0,0.08) 0%, rgba(0,0,0,0.4) 100%)",
        marginBottom: "2rem",
      }}
    >
      {/* Top Banner / Heading */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: isEditing ? "1.5rem" : "0.5rem" }}>
        <div style={{ maxWidth: "580px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
            {isRejected ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            )}
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", margin: 0 }}>
              {isRejected 
                ? "Candidature Enseignant non retenue" 
                : "Vous souhaitez enseigner sur Level Up DZ ?"}
            </h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0, lineHeight: 1.4 }}>
            {isRejected
              ? "L'administration a examiné votre demande. Veuillez consulter le motif ci-dessous et mettre à jour votre profil pour renvoyer une candidature."
              : "Rejoignez notre réseau de formateurs en Algérie. Soumettez votre candidature pour examen par notre équipe administrative."}
          </p>
        </div>

        {!isEditing && (
          <button 
            type="button" 
            onClick={() => setIsEditing(true)}
            className="btn btn-primary"
            style={{ 
              background: "var(--gradient-orange)", 
              padding: "0.75rem 1.5rem",
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(254,145,0,0.3)"
            }}
          >
            {isRejected ? "Modifier et Resoumettre →" : "Demander l'accès Formateur →"}
          </button>
        )}
      </div>

      {/* If Rejected, show rejection feedback */}
      {isRejected && !isEditing && (
        <div 
          style={{ 
            marginTop: "1.25rem", 
            background: "rgba(239,68,68,0.12)", 
            border: "1px solid rgba(239,68,68,0.3)", 
            borderRadius: "0.75rem", 
            padding: "1rem 1.25rem" 
          }}
        >
          <div style={{ color: "#fca5a5", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.35rem" }}>
            Motif communiqué par l'administrateur :
          </div>
          <div style={{ color: "white", fontSize: "0.9rem" }}>
            « {application.rejectionReason || "Profil incomplet ou informations insuffisantes."} »
          </div>
        </div>
      )}

      {/* Application Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1.25rem", fontSize: "0.88rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
            {/* Specialty */}
            <div>
              <label style={{ display: "block", color: "white", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Spécialité / Domaine d'enseignement *
              </label>
              <input
                type="text"
                name="specialty"
                required
                defaultValue={application?.specialty || ""}
                placeholder="Ex: Next.js & React, Design UX, E-commerce, IA..."
                className="input-field"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "rgba(0,0,0,0.5)", color: "white" }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "block", color: "white", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Numéro de Téléphone (Algérie) *
              </label>
              <input
                type="tel"
                name="phone"
                required
                defaultValue={application?.phone || user.phone || ""}
                placeholder="0550 00 00 00"
                className="input-field"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "rgba(0,0,0,0.5)", color: "white" }}
              />
            </div>

            {/* Wilaya */}
            <div>
              <label style={{ display: "block", color: "white", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Wilaya de résidence
              </label>
              <select
                name="wilaya"
                defaultValue={application?.wilaya || user.wilaya || ""}
                className="input-field"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "#111827", color: "white" }}
              >
                <option value="">Sélectionnez votre Wilaya</option>
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Portfolio / Link */}
            <div>
              <label style={{ display: "block", color: "white", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Lien Portfolio / LinkedIn / GitHub / CV (Optionnel)
              </label>
              <input
                type="url"
                name="portfolioUrl"
                defaultValue={application?.portfolioUrl || ""}
                placeholder="https://linkedin.com/in/... ou https://monportfolio.dz"
                className="input-field"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "rgba(0,0,0,0.5)", color: "white" }}
              />
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "white", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              Biographie & Expérience Pédagogique *
            </label>
            <textarea
              name="bio"
              required
              rows={4}
              defaultValue={application?.bio || ""}
              placeholder="Présentez votre parcours, vos années d'expérience, vos certifications et pourquoi vous souhaitez former la communauté Level Up DZ..."
              className="input-field"
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "rgba(0,0,0,0.5)", color: "white", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-outline"
              disabled={loading}
              style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ background: "var(--gradient-orange)", padding: "0.75rem 1.75rem", fontSize: "0.9rem", fontWeight: 700 }}
            >
              {loading ? "Envoi en cours..." : "Soumettre ma candidature"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { instructorDeleteCourse } from "@/actions/instructorCourses";

interface InstructorCourseDeleteButtonProps {
  courseId: string;
  courseTitle: string;
  redirectTo?: string;
  variant?: "compact" | "danger-zone";
}

export function InstructorCourseDeleteButton({
  courseId,
  courseTitle,
  redirectTo,
  variant = "compact",
}: InstructorCourseDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const message = `Êtes-vous sûr de vouloir supprimer définitivement votre formation "${courseTitle}" ?\n\nCette action est irréversible et supprimera également tous les chapitres, leçons et inscriptions associés.`;
    if (!window.confirm(message)) return;

    setLoading(true);
    try {
      await instructorDeleteCourse(courseId);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la suppression de la formation.");
      setLoading(false);
    }
  }

  if (variant === "danger-zone") {
    return (
      <div 
        className="glass" 
        style={{ 
          padding: "1.5rem", 
          borderRadius: "1rem", 
          border: "1px solid rgba(239,68,68,0.3)", 
          background: "rgba(239,68,68,0.03)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h4 style={{ color: "#ef4444", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
            Zone de danger : Supprimer ce cours
          </h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0", maxWidth: "550px" }}>
            Une fois supprimé, ce cours ainsi que l'ensemble de ses vidéos, leçons et inscriptions seront définitivement effacés. Cette action ne peut pas être annulée.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleDelete}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.6rem 1.25rem",
            fontWeight: 700,
            fontSize: "0.88rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span>{loading ? "Suppression en cours..." : "Supprimer définitivement ce cours"}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleDelete}
      style={{
        background: "rgba(239,68,68,0.06)",
        border: "1px solid rgba(239,68,68,0.35)",
        color: "#f87171",
        borderRadius: "0.4rem",
        padding: "0.5rem 0.85rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        transition: "all 0.15s ease",
      }}
      title="Supprimer cette formation"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
      <span>{loading ? "..." : "Supprimer"}</span>
    </button>
  );
}

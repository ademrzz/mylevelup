"use client";

import { useState } from "react";

export interface Subscriber {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  wilaya: string | null;
  enrolledAt: string;
}

interface CourseSubscribersModalProps {
  courseTitle: string;
  subscribers: Subscriber[];
}

export function CourseSubscribersModal({
  courseTitle,
  subscribers,
}: CourseSubscribersModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--brand-blue)",
          cursor: "pointer",
          fontSize: "0.85rem",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.2rem 0.5rem",
          borderRadius: "0.4rem",
          transition: "background 0.2s",
        }}
        className="hover:bg-white/10"
        title="Cliquer pour voir la liste des étudiants inscrits"
      >
        <span>👥 {subscribers.length}</span>
        <span style={{ fontSize: "0.75rem", textDecoration: "underline", opacity: 0.85 }}>Voir</span>
      </button>

      {/* Modal overlay */}
      {isOpen && (
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
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass animate-fade-up"
            style={{
              maxWidth: "680px",
              width: "100%",
              maxHeight: "85vh",
              borderRadius: "1.25rem",
              border: "1px solid var(--border)",
              background: "#121214",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.75rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--brand-orange)", fontWeight: 700, textTransform: "uppercase" }}>
                  Liste des Apprenants Inscrits
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", margin: "0.2rem 0 0 0" }}>
                  {courseTitle}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "white",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Student List */}
            <div style={{ padding: "1.5rem 1.75rem", overflowY: "auto", flex: 1 }}>
              {subscribers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👥</div>
                  <p style={{ margin: 0, fontSize: "0.95rem" }}>
                    Aucun étudiant n'est encore inscrit à cette formation.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {subscribers.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      style={{
                        padding: "1rem 1.25rem",
                        borderRadius: "0.75rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            background: "var(--gradient-blue)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            flexShrink: 0,
                          }}
                        >
                          {sub.name ? sub.name.charAt(0).toUpperCase() : "E"}
                        </div>

                        <div>
                          <div style={{ fontWeight: 600, color: "white", fontSize: "0.92rem" }}>
                            {sub.name || "Étudiant"}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {sub.email}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", fontSize: "0.82rem" }}>
                        <div style={{ color: "#e5e7eb" }}>
                          {sub.wilaya || "Wilaya non renseignée"}
                        </div>
                        <div style={{ color: "var(--brand-orange)" }}>
                          {sub.phone || "Pas de numéro"}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                          Inscrit le {new Date(sub.enrolledAt).toLocaleDateString("fr-DZ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "1rem 1.75rem",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.02)",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              <span>Total : <strong style={{ color: "white" }}>{subscribers.length}</strong> étudiant(s)</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary"
                style={{ padding: "0.4rem 1.25rem", fontSize: "0.85rem" }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

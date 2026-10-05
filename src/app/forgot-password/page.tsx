"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [debugUrl, setDebugUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const resData = await res.json();

      if (res.ok) {
        setSubmitted(true);
        if (resData.debugResetUrl) {
          setDebugUrl(resData.debugResetUrl);
        }
      } else {
        setError(resData.message || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col" style={{ minHeight: "calc(100vh - 150px)", padding: "4rem 1rem" }}>
      <div 
        className="glass animate-fade-up" 
        style={{ 
          margin: "auto",
          maxWidth: "460px", 
          width: "100%", 
          padding: "3rem 2.25rem", 
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div 
            style={{ 
              width: "56px", 
              height: "56px", 
              borderRadius: "50%", 
              background: "rgba(254, 145, 0, 0.12)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 1.25rem auto",
              color: "var(--brand-orange)",
              fontSize: "1.5rem"
            }}
          >
            🔑
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
            Mot de passe oublié ?
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.5 }}>
            Saisissez l'adresse e-mail associée à votre compte Level Up DZ pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.88rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            {error}
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(52, 211, 153, 0.15)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto", fontSize: "1.4rem" }}>
              ✓
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              Demande envoyée !
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              Si un compte est associé à <strong>{email}</strong>, un e-mail a été envoyé avec les instructions de réinitialisation.
            </p>

            {debugUrl && (
              <div style={{ background: "rgba(0,160,220,0.08)", border: "1px solid rgba(0,160,220,0.3)", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--brand-blue)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
                  ⚡ Accès Direct (Mode Développement)
                </span>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.75rem 0" }}>
                  En local, si l'email n'arrive pas dans votre boîte, vous pouvez cliquer directement ci-dessous :
                </p>
                <Link 
                  href={debugUrl}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.6rem", fontSize: "0.85rem", textAlign: "center", display: "block", background: "var(--brand-blue)", borderColor: "var(--brand-blue)" }}
                >
                  Ouvrir le lien de réinitialisation →
                </Link>
              </div>
            )}

            <Link href="/login" className="btn btn-secondary w-full" style={{ display: "inline-block", textAlign: "center" }}>
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb" }}>Adresse e-mail</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="votre@email.com"
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !email} 
              className="btn btn-primary w-full mt-2"
              style={{ padding: "0.85rem", fontSize: "1rem", background: "var(--gradient-orange)" }}
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation →"}
            </button>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link href="/login" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }} className="hover:underline">
                ← Revenir à la page de connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

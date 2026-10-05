"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (!token || !email) {
      setError("Jeton ou adresse e-mail manquant dans le lien.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        const text = await res.text();
        setError(text || "Impossible de réinitialiser le mot de passe.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
          Lien invalide ou incomplet
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Ce lien de réinitialisation est incomplet. Veuillez refaire une demande depuis la page de connexion.
        </p>
        <Link href="/forgot-password" className="btn btn-primary" style={{ display: "inline-block" }}>
          Nouvelle demande
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
          Nouveau Mot de Passe
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Choisissez un nouveau mot de passe pour <strong>{email}</strong>.
        </p>
      </div>

      {error && (
        <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.88rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          {error}
        </div>
      )}

      {success ? (
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(52, 211, 153, 0.15)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto", fontSize: "1.4rem" }}>
            ✓
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
            Mot de passe mis à jour !
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Votre compte est désormais sécurisé avec votre nouveau mot de passe. Redirection vers la page de connexion...
          </p>
          <Link href="/login" className="btn btn-primary w-full" style={{ display: "inline-block", textAlign: "center" }}>
            Se connecter maintenant →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb" }}>
              Nouveau mot de passe (6 caractères min.)
            </label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb" }}>
              Confirmer le nouveau mot de passe
            </label>
            <input 
              type="password" 
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !password || !confirmPassword} 
            className="btn btn-primary w-full mt-2"
            style={{ padding: "0.85rem", fontSize: "1rem", background: "var(--gradient-orange)" }}
          >
            {loading ? "Mise à jour en cours..." : "Enregistrer le nouveau mot de passe →"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={<div style={{ textAlign: "center", color: "var(--text-muted)" }}>Chargement...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

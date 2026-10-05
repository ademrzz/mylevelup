"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        // Verification successful, redirect to login
        router.push("/login?verified=true");
      } else {
        const text = await res.text();
        setError(text || "Code invalide.");
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
        className="glass animate-fade-up flex flex-col items-center text-center" 
        style={{ 
          margin: "auto",
          maxWidth: "450px", 
          width: "100%", 
          padding: "3rem 2rem", 
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        <div className="mb-6 flex justify-center items-center" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(0, 160, 220, 0.15)", color: "var(--brand-blue)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Vérifiez votre e-mail</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          Nous avons envoyé un code de sécurité à 6 chiffres à <strong>{email}</strong>. Veuillez le saisir ci-dessous.
        </p>

        {error && (
          <div className="w-full" style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.9rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <input 
            type="text" 
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="000000"
            className="input-field text-center mb-4"
            style={{ fontSize: "2rem", letterSpacing: "0.5rem", fontWeight: 700, padding: "1rem" }}
            required
          />
          
          <button type="submit" disabled={loading || code.length !== 6} className="btn btn-primary w-full mt-2">
            {loading ? "Vérification..." : "Activer mon compte"}
          </button>
        </form>

        <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Vous n'avez pas reçu le code ? <button type="button" style={{ background: "transparent", border: "none", color: "var(--brand-blue)", fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}>Renvoyer</button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">Chargement...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

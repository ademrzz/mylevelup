"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "", code: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!showTwoFactor) {
      // Step 1: Pre-validate credentials and check if 2FA is needed
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.twoFactorRequired) {
            setShowTwoFactor(true);
            setLoading(false);
            return;
          }
        } else {
          const text = await res.text();
          setError(text || "Email ou mot de passe incorrect.");
          setLoading(false);
          return;
        }
      } catch (err) {
        setError("Erreur de connexion au serveur.");
        setLoading(false);
        return;
      }
    }

    // Step 2: Actually log in via NextAuth
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      code: showTwoFactor ? data.code : undefined,
      redirect: false,
    });

    if (res?.error) {
      setError(showTwoFactor ? "Le code 2FA est incorrect ou a expiré." : "Email ou mot de passe incorrect.");
      setLoading(false);
    } else if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="container flex flex-col" style={{ minHeight: "calc(100vh - 150px)", padding: "4rem 1rem" }}>
      <div 
        className="glass animate-fade-up" 
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
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Bienvenue</h1>
          <p style={{ color: "var(--text-muted)" }}>Connectez-vous à votre compte Level Up DZ.</p>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", background: "rgba(220, 38, 38, 0.1)", color: "#ef4444", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.9rem", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {showTwoFactor ? (
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Code de sécurité (2FA)</label>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Nous avons envoyé un code à 6 chiffres à <strong>{data.email}</strong>.
              </p>
              <input 
                type="text" 
                required
                maxLength={6}
                value={data.code}
                onChange={(e) => setData({ ...data, code: e.target.value.replace(/[^0-9]/g, "") })}
                className="input-field text-center mb-4"
                placeholder="000000"
                style={{ fontSize: "2rem", letterSpacing: "0.5rem", fontWeight: 700, padding: "1rem" }}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Email</label>
                <input 
                  type="email" 
                  required
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="input-field"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="flex flex-col gap-2 mb-2">
                <div className="flex justify-between items-center">
                  <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Mot de passe</label>
                  <Link href="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--brand-blue)" }}>Oublié ?</Link>
                </div>
                <input 
                  type="password" 
                  required
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading || (showTwoFactor && data.code.length !== 6)} className="btn btn-primary w-full mt-4">
            {loading ? "Chargement..." : showTwoFactor ? "Vérifier et se connecter" : "Se connecter"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.95rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Pas encore de compte ? </span>
          <Link href="/register" style={{ color: "var(--brand-orange)", fontWeight: 600 }}>
            Inscrivez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}

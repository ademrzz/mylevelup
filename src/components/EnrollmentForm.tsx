"use client";

import { useState } from "react";

interface EnrollmentFormProps {
  courseId: string;
  courseTitle: string;
  price: number | null;
  isFree: boolean;
  onEnrollFree: () => Promise<void>;
}

export function EnrollmentForm({
  courseId,
  courseTitle,
  price,
  isFree,
  onEnrollFree,
}: EnrollmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFreeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onEnrollFree();
    } catch (err: any) {
      setError("Une erreur est survenue lors de l'inscription gratuite.");
      setLoading(false);
    }
  };

  const handleChargilyPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout/chargily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Impossible de créer la session de paiement.");
      }

      const data = await res.json();
      if (data.checkoutUrl) {
        // Redirect to Chargily's secure checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("URL de paiement manquante.");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Erreur lors de l'initialisation du paiement.");
      setLoading(false);
    }
  };

  if (isFree) {
    return (
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '1.25rem', border: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#34d399' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
          Inscription 100% Gratuite
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          Ce cours est offert en libre accès. Cliquez ci-dessous pour activer votre inscription et commencer immédiatement.
        </p>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleFreeSubmit}>
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', maxWidth: '340px', padding: '1.1rem', fontSize: '1.05rem', background: 'var(--brand-green)', borderColor: 'var(--brand-green)' }}
          >
            {loading ? "Activation en cours..." : "Commencer le cours maintenant →"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="glass" style={{ padding: '2.25rem', borderRadius: '1.25rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header with Card Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'white', margin: 0 }}>
            Paiement Sécurisé en Ligne
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>
            Traitement officiel par <strong>Chargily Pay V2</strong>
          </p>
        </div>

        {/* Official Algerian Bank Card Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ background: '#005baa', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(0,91,170,0.3)' }}>
            EDAHABIA
          </div>
          <div style={{ background: '#00965e', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(0,150,94,0.3)' }}>
            CIB
          </div>
        </div>
      </div>

      {/* Security Advantages Box */}
      <div style={{ background: 'rgba(0, 160, 220, 0.05)', border: '1px solid rgba(0, 160, 220, 0.2)', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--brand-blue)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#e5e7eb', fontWeight: 600 }}>
            Confirmation Bancaire Instantanée par SMS (SATIM)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--brand-green)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.05.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.01-4.09l-2.6-1.53C15.93 17.81 14.07 19 12 19z"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#e5e7eb', fontWeight: 600 }}>
            Activation 100% Automatique 24h/24 (Aucun reçu à envoyer)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--brand-orange)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#e5e7eb', fontWeight: 600 }}>
            Cryptage bancaire SSL de bout en bout
          </span>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {/* Payment Action Button */}
      <button 
        type="button" 
        onClick={handleChargilyPayment}
        disabled={loading}
        className="btn btn-primary" 
        style={{ 
          width: '100%', 
          padding: '1.25rem', 
          fontSize: '1.15rem', 
          fontWeight: 700, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.75rem',
          boxShadow: 'var(--shadow-glow)' 
        }}
      >
        {loading ? (
          <>Redirection vers Chargily Pay...</>
        ) : (
          <>
            <span>Payer {price?.toLocaleString("fr-DZ")} DZD avec Chargily</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </>
        )}
      </button>

      <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
        En cliquant sur payer, vous serez redirigé vers la passerelle sécurisée de <strong>Chargily Pay</strong> pour saisir les identifiants de votre carte EDAHABIA ou CIB en toute sécurité.
      </p>

    </div>
  );
}

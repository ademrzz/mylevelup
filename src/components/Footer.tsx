import Link from "next/link";
import Image from "next/image";
import logoLong from "@/logo/logolong.png";

export default function Footer() {
  return (
    <footer 
      style={{ 
        backgroundColor: "#070a12", 
        borderTop: "1px solid var(--border)", 
        marginTop: "auto",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Ambient background glow */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "180px",
          background: "radial-gradient(circle, rgba(254,145,0,0.035) 0%, rgba(0,160,220,0.02) 60%, transparent 80%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1, padding: "3rem 1.5rem 2rem 1.5rem" }}>
        
        {/* Main Footer Row: Brand Info (Left) & Algerian Payments (Right) */}
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
            gap: "3rem", 
            alignItems: "start",
            marginBottom: "2.5rem" 
          }}
        >
          {/* Column 1: Brand & Contact Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "520px" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <Image 
                src={logoLong} 
                alt="Level Up DZ Logo" 
                width={150} 
                height={42} 
                style={{ height: "42px", width: "auto", objectFit: "contain" }}
              />
            </Link>

            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
              La plateforme e-learning de référence en Algérie. Formations professionnelles de haute qualité, accessibles à votre rythme à travers les 69 wilayas.
            </p>

            {/* Direct Contact info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.86rem", color: "#d1d5db" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>contact@levelup-dz.com</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+213 (0) 550 00 00 00</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Alger, Algérie (Couverture nationale 69 Wilayas)</span>
              </div>
            </div>

            {/* Social media icons */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", transition: "all 0.2s" }}
                aria-label="Instagram Level Up DZ"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", transition: "all 0.2s" }}
                aria-label="Facebook Level Up DZ"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", transition: "all 0.2s" }}
                aria-label="LinkedIn Level Up DZ"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", transition: "all 0.2s" }}
                aria-label="YouTube Level Up DZ"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Paiements Algérie Sécurisés */}
          <div style={{ maxWidth: "440px" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "0.85rem", fontSize: "0.95rem", color: "white", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Paiements en Algérie
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
              Réglez vos inscriptions en dinars algériens (DZD) facilement et en toute sécurité :
            </p>

            {/* Badges BaridiMob & EDAHABIA */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div 
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.65rem",
                  background: "rgba(254, 145, 0, 0.07)",
                  border: "1px solid rgba(254, 145, 0, 0.28)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem"
                }}
              >
                <div style={{ width: "30px", height: "30px", borderRadius: "0.4rem", background: "var(--brand-orange)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>
                  BM
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.86rem" }}>BaridiMob & CCP</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Algérie Poste — Virement instantané</div>
                </div>
              </div>

              <div 
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.65rem",
                  background: "rgba(52, 211, 153, 0.07)",
                  border: "1px solid rgba(52, 211, 153, 0.28)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem"
                }}
              >
                <div style={{ width: "30px", height: "30px", borderRadius: "0.4rem", background: "#059669", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>
                  CIB
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.86rem" }}>EDAHABIA / Carte CIB</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Paiement sécurisé en ligne 3D-Secure</div>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Protection SSL 256-bit & Contenu vidéo crypté</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div 
          style={{ 
            borderTop: "1px solid rgba(255,255,255,0.08)", 
            paddingTop: "1.75rem",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            flexWrap: "wrap",
            gap: "1.25rem",
            color: "var(--text-muted)", 
            fontSize: "0.85rem" 
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>© {new Date().getFullYear()} <strong>Level Up DZ</strong>. Tous droits réservés.</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <Link href="/cgu" style={{ color: "var(--text-muted)", textDecoration: "none" }} className="hover:underline">
              Conditions Générales (CGU)
            </Link>
            <Link href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "none" }} className="hover:underline">
              Confidentialité
            </Link>
            <Link href="/refund" style={{ color: "var(--text-muted)", textDecoration: "none" }} className="hover:underline">
              Politique de remboursement
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ color: "#d1d5db", fontWeight: 600 }}>Algérie (69 Wilayas)</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

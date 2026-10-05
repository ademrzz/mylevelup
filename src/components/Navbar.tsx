"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import logoLong from "@/logo/logolong.png";
import logoShort from "@/logo/logoshort.png";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav
      className="glass w-full"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="container flex items-center justify-between py-4">
        {/* Logo Area */}
        <Link href="/" className="flex items-center">
          {/* Desktop Logo (Long) */}
          <div className="hidden-mobile">
            <Image 
              src={logoLong} 
              alt="Level Up DZ Logo" 
              width={160} 
              height={45} 
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          {/* Mobile Logo (Short) */}
          <div className="show-mobile">
            <Image 
              src={logoShort} 
              alt="Level Up DZ Logo" 
              width={40} 
              height={40} 
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden-mobile items-center gap-8" style={{ fontSize: "0.95rem", fontWeight: 500 }}>
          <Link href="/courses" style={{ color: "var(--text-muted)" }}>
            Catalogue
          </Link>
          {session && (session.user as any)?.role === "STUDENT" && (
            <Link href="/dashboard/profile" style={{ color: "var(--brand-orange)", fontSize: "0.9rem", fontWeight: 600 }}>
              Devenir Enseignant
            </Link>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden-mobile items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500 }}>
                {session.user?.name || "Utilisateur"}
              </span>
              {(session.user as any)?.role === "ADMIN" && (
                <Link 
                  href="/admin" 
                  style={{ 
                    fontSize: "0.85rem", 
                    color: "#c084fc", 
                    fontWeight: 700,
                    background: "rgba(168, 85, 247, 0.12)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px"
                  }}
                >
                  🛡️ Admin
                </Link>
              )}
              {((session.user as any)?.role === "INSTRUCTOR" || (session.user as any)?.role === "ADMIN") && (
                <Link 
                  href="/instructor" 
                  style={{ 
                    fontSize: "0.85rem", 
                    color: "var(--brand-orange)", 
                    fontWeight: 700,
                    background: "rgba(254, 145, 0, 0.1)",
                    border: "1px solid rgba(254, 145, 0, 0.25)",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px"
                  }}
                >
                  Studio Instructeur
                </Link>
              )}
              <Link href="/dashboard" style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500 }}>
                Tableau de bord
              </Link>
              <button onClick={() => signOut()} className="btn btn-outline" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                Déconnexion
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                Connexion
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Button for Mobile */}
        <button 
          className="show-mobile flex-col justify-center gap-1"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.5rem" }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div style={{ width: "24px", height: "2px", background: "var(--foreground)", transition: "all 0.3s", transform: isMobileMenuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
          <div style={{ width: "24px", height: "2px", background: "var(--foreground)", transition: "all 0.3s", opacity: isMobileMenuOpen ? 0 : 1 }} />
          <div style={{ width: "24px", height: "2px", background: "var(--foreground)", transition: "all 0.3s", transform: isMobileMenuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu animate-fade-up">
          <Link href="/courses" style={{ fontWeight: 500, padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }} onClick={() => setIsMobileMenuOpen(false)}>
            Catalogue
          </Link>
          {session && (session.user as any)?.role === "STUDENT" && (
            <Link href="/dashboard/profile" style={{ color: "var(--brand-orange)", fontWeight: 600, padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }} onClick={() => setIsMobileMenuOpen(false)}>
              🎓 Devenir Enseignant
            </Link>
          )}
          <div className="flex flex-col gap-2 mt-2">
            {session ? (
              <>
                {(session.user as any)?.role === "ADMIN" && (
                  <Link 
                    href="/admin" 
                    className="btn btn-secondary w-full" 
                    style={{ color: "#c084fc", borderColor: "rgba(168,85,247,0.3)" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🛡️ Panneau Admin
                  </Link>
                )}
                {((session.user as any)?.role === "INSTRUCTOR" || (session.user as any)?.role === "ADMIN") && (
                  <Link 
                    href="/instructor" 
                    className="btn btn-secondary w-full" 
                    style={{ color: "var(--brand-orange)", borderColor: "rgba(254,145,0,0.3)" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Studio Instructeur
                  </Link>
                )}
                <Link href="/dashboard" className="btn btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Tableau de bord
                </Link>
                <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="btn btn-outline w-full">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Connexion
                </Link>
                <Link href="/register" className="btn btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
